// bot.js
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } = require('discord.js');
const cron = require('node-cron');
const { CHATTEURS, SHIFTS, MODELES, SALONS, parserVentes, calculerPrime } = require('./config');

process.env.TZ = 'Europe/Paris';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const clockInData = {};

// ===== ENREGISTREMENT DES SLASH COMMANDS =====
const commands = [
  {
    name: 'panel',
    description: 'Affiche le panel de clocking',
  },
  {
    name: 'status',
    description: 'Affiche ton status actuel',
  },
  {
    name: 'help',
    description: 'Aide du bot',
  },
];

async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    console.log('🔄 Enregistrement des slash commands...');
    
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    
    console.log('✅ Slash commands enregistrées !');
  } catch (error) {
    console.error('❌ Erreur enregistrement:', error);
  }
}

// ===== HELPERS =====
function getChatteursByShift(shiftNom) {
  return Object.entries(CHATTEURS)
    .filter(([_, data]) => data.shift.includes(shiftNom))
    .map(([id, data]) => ({ id, ...data }));
}

function getHeureActuelle() {
  return new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
}

function calculerRetard(shiftNom, heureArrivee) {
  const shift = SHIFTS.find(s => s.nom === shiftNom);
  const [heure, min] = heureArrivee.split(':').map(Number);
  let diff = (heure * 60 + min) - shift.debut * 60;
  if (diff > 12 * 60) diff -= 24 * 60;
  if (diff < -12 * 60) diff += 24 * 60;
  if (diff < 0) return `${Math.abs(diff)} min en avance`;
  if (diff === 0) return "À l'heure";
  return `${diff} min de retard`;
}

function calculerDuree(heureIN, heureOUT) {
  const [hIN, minIN] = heureIN.split(':').map(Number);
  const [hOUT, minOUT] = heureOUT.split(':').map(Number);
  let diff = (hOUT * 60 + minOUT) - (hIN * 60 + minIN);
  if (diff < 0) diff += 24 * 60;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

// ===== EMBEDS =====
function creerEmbedClockIn(chatteur, timeIN, modeles, shift) {
  const retard = calculerRetard(shift, timeIN);
  const emoji = retard.includes('retard') ? '🟠' : '🟢';
  return new EmbedBuilder()
    .setTitle(`${emoji} CLOCK IN - ${chatteur.nom}`)
    .setColor(retard.includes('retard') ? 0xFFA500 : 0x00FF00)
    .addFields(
      { name: '📊 Shift', value: shift, inline: false },
      { name: '🕑 Heure arrivée', value: `${timeIN} (${retard})`, inline: false },
      { name: '👥 Modèles', value: modeles.join(', '), inline: false }
    )
    .setTimestamp();
}

function creerEmbedClockOut(chatteur, timeIN, timeOUT, modeles, shift, ventes) {
  const duree = calculerDuree(timeIN, timeOUT);
  const prime = calculerPrime(ventes, modeles);
  return new EmbedBuilder()
    .setTitle(`⛔ SHIFT TERMINÉ - ${chatteur.nom}`)
    .setColor(0xFF0000)
    .addFields(
      { name: '📊 Shift', value: shift, inline: false },
      { name: '🕐 Arrivée', value: timeIN, inline: true },
      { name: '🕑 Départ', value: timeOUT, inline: true },
      { name: '⏱️ Durée', value: duree, inline: true },
      { name: '👥 Modèles', value: modeles.join(', '), inline: false },
      { name: '💰 Ventes', value: `${ventes}$`, inline: true },
      { name: '🎉 Prime', value: `${prime}$`, inline: true }
    )
    .setTimestamp();
}

function creerPanelClocking(chatteur) {
  return new EmbedBuilder()
    .setTitle(`📊 Panel Clocking - ${chatteur.nom}`)
    .setColor(0x5865F2)
    .addFields(
      { name: '📋 Shift', value: chatteur.shift.join(', '), inline: false },
      { name: '👥 Modèles disponibles', value: MODELES.join(', '), inline: false },
      { name: '⏱️ Status', value: clockInData[chatteur.id] ? '✅ Clock IN actif' : '❌ Non commencé', inline: false }
    )
    .setTimestamp();
}

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  registerCommands();
  planifierNotifications();
});

// ===== INTERACTIONS =====
client.on('interactionCreate', async interaction => {
  try {
    const userId = interaction.user.id;
    const chatteur = CHATTEURS[userId];

    // SLASH COMMANDS
    if (interaction.isCommand()) {
      if (interaction.commandName === 'panel') {
        if (!chatteur) {
          await interaction.reply({ content: "❌ Tu n'es pas enregistré comme chatteur.", ephemeral: true });
          return;
        }
        const panelEmbed = creerPanelClocking(chatteur);
        const btnClockIn = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_clock_in').setLabel('Clock In').setEmoji('✅').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ embeds: [panelEmbed], components: [btnClockIn], ephemeral: false });
        return;
      }

      if (interaction.commandName === 'status') {
        if (!chatteur) {
          await interaction.reply({ content: "❌ Tu n'es pas enregistré comme chatteur.", ephemeral: true });
          return;
        }
        const statusMsg = clockInData[userId] 
          ? `✅ Tu es en Clock IN depuis ${clockInData[userId].timeIN}\nShift: ${clockInData[userId].shift}\nModèles: ${clockInData[userId].modeles.join(', ')}`
          : '❌ Tu n\'es pas en Clock IN';
        await interaction.reply({ content: statusMsg, ephemeral: true });
        return;
      }

      if (interaction.commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
          .setTitle('📖 Aide du Bot Clocking')
          .setColor(0x5865F2)
          .addFields(
            { name: '/panel', value: 'Affiche ton panel de clocking', inline: false },
            { name: '/status', value: 'Affiche ton status actuel', inline: false },
            { name: '/help', value: 'Affiche cette aide', inline: false },
            { name: 'Clock In', value: 'Clique sur le bouton et sélectionne 1 à 3 modèles', inline: false },
            { name: 'Clock Out', value: 'Clique sur le bouton et rentre tes ventes', inline: false }
          )
          .setTimestamp();
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
        return;
      }
    }

    // BUTTONS & SELECT MENUS
    if (!chatteur) {
      if (interaction.isRepliable()) {
        await interaction.reply({ content: "❌ Tu n'es pas enregistré comme chatteur.", ephemeral: true });
      }
      return;
    }

    // CLOCK IN → select modèles (1-3 MAX) + BOUTON VALIDER
    if (interaction.isButton() && interaction.customId === 'btn_clock_in') {
      const selectModeles = new StringSelectMenuBuilder()
        .setCustomId('select_modeles')
        .setPlaceholder('Sélectionne tes modèles (1-3)')
        .setMinValues(1)
        .setMaxValues(3) // ✅ MAX 3 MODÈLES
        .addOptions(MODELES.map(m => ({ label: m, value: m })));
      
      const btnValider = new ButtonBuilder()
        .setCustomId('btn_valider_modeles')
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success);

      const row1 = new ActionRowBuilder().addComponents(selectModeles);
      const row2 = new ActionRowBuilder().addComponents(btnValider);
      
      await interaction.reply({ 
        content: '📌 Sélectionne tes modèles (1 à 3) puis clique sur Valider :', 
        components: [row1, row2], 
        ephemeral: true 
      });
      return;
    }

    // SELECT modèles → stocke temporairement
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_modeles') {
      clockInData[userId] = { modeles: interaction.values };
      await interaction.deferUpdate();
      return;
    }

    // VALIDER MODELES → enregistre clock in
    if (interaction.isButton() && interaction.customId === 'btn_valider_modeles') {
      const data = clockInData[userId];
      
      if (!data || !data.modeles || data.modeles.length === 0) {
        await interaction.reply({ content: '❌ Tu dois d\'abord sélectionner des modèles !', ephemeral: true });
        return;
      }

      const modeles = data.modeles;
      const shift = chatteur.shift[0];
      const timeIN = getHeureActuelle();

      clockInData[userId] = { shift, modeles, timeIN, chatteur: chatteur.nom };

      const salonClocking = await client.channels.fetch(SALONS.clocking);
      await salonClocking.send({
        content: `<@${userId}> CLOCK IN ✅ ${timeIN} | Shift ${shift} | Modèle(s) : ${modeles.join(', ')}`
      });

      const salonPrive = await client.channels.fetch(chatteur.salonPrive);
      const embedClockIn = creerEmbedClockIn(chatteur, timeIN, modeles, shift);
      const btnClockOut = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_clock_out').setLabel('Clock Out').setStyle(ButtonStyle.Danger)
      );
      const msgPrive = await salonPrive.send({ embeds: [embedClockIn], components: [btnClockOut] });
      clockInData[userId].messageId = msgPrive.id;

      await interaction.update({ content: '✅ Clock IN validé !', components: [] });
      return;
    }

    // CLOCK OUT → modal ventes
    if (interaction.isButton() && interaction.customId === 'btn_clock_out') {
      if (!clockInData[userId]) {
        await interaction.reply({ content: '❌ Aucun clock IN trouvé.', ephemeral: true });
        return;
      }
      const modal = new ModalBuilder()
        .setCustomId('modal_ventes')
        .setTitle('Rentre tes ventes')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('input_ventes')
              .setLabel('Total ventes (ex: 250, 250.68)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
      return;
    }

    // MODAL ventes → clock out final
    if (interaction.isModalSubmit() && interaction.customId === 'modal_ventes') {
      const data = clockInData[userId];
      if (!data) {
        await interaction.reply({ content: '❌ Aucun clock IN trouvé.', ephemeral: true });
        return;
      }
      const ventes = parserVentes(interaction.fields.getTextInputValue('input_ventes'));
      const timeOUT = getHeureActuelle();

      const salonClocking = await client.channels.fetch(SALONS.clocking);
      await salonClocking.send({
        content: `<@${userId}> CLOCK OUT 🔴 ${timeOUT} | Shift ${data.shift} | Modèle(s) : ${data.modeles.join(', ')}`
      });

      const salonPrive = await client.channels.fetch(chatteur.salonPrive);
      const embedClockOut = creerEmbedClockOut(chatteur, data.timeIN, timeOUT, data.modeles, data.shift, ventes);
      try {
        const msg = await salonPrive.messages.fetch(data.messageId);
        await msg.edit({ embeds: [embedClockOut], components: [] });
      } catch (e) {
        await salonPrive.send({ embeds: [embedClockOut] });
      }

      const prime = calculerPrime(ventes, data.modeles);
      if (prime > 0) {
        const salonPrimes = await client.channels.fetch(SALONS.primes);
        await salonPrimes.send({ content: `<@${userId}> Bien joué ! 🎉 Prime de **${prime}$**` });
      }

      delete clockInData[userId];
      await interaction.reply({ content: `✅ Clock OUT validé ! Ventes : ${ventes}$`, ephemeral: true });
      return;
    }

  } catch (error) {
    console.error('❌ Erreur interaction:', error);
  }
});

// ===== NOTIFICATIONS 10 MIN AVANT =====
function planifierNotifications() {
  SHIFTS.forEach(shift => {
    cron.schedule(shift.cron, async () => {
      try {
        const chatteurs = getChatteursByShift(shift.nom);
        if (chatteurs.length === 0) return;
        const mentions = chatteurs.map(c => `<@${c.id}>`).join(' ');
        const salonClocking = await client.channels.fetch(SALONS.clocking);
        const btnClockIn = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_clock_in').setLabel('Clock In').setEmoji('✅').setStyle(ButtonStyle.Success)
        );
        await salonClocking.send({
          content: `🔔 **Début du shift ${shift.nom} dans 10 minutes**\n${mentions}\nPensez à clock in !`,
          components: [btnClockIn]
        });
      } catch (error) {
        console.error('❌ Erreur notification:', error);
      }
    }, { timezone: 'Europe/Paris' });
  });
  console.log('⏰ Notifications planifiées');
}

client.login(TOKEN);
