// config.js
const CHATTEURS = {
  // MATIN (8h-14h)
  '1466760403462914111': { nom: 'Mialy',      shift: ['MATIN'],           salonPrive: '1456726270057382112' },
  '1480839559385448572': { nom: 'Sébastien',  shift: ['MATIN'],           salonPrive: '1482430724865786038' },
  '1436794235604041818': { nom: 'Michel',     shift: ['MATIN'],           salonPrive: '1500481974937190440' },
  '1430813268972277771': { nom: 'Kevin',      shift: ['MATIN'],           salonPrive: '1504168415504502865' },
  '1403416949689552980': { nom: 'Max',        shift: ['MATIN'],           salonPrive: '1511351245380784178' },
  '1156954051750150185': { nom: 'Jodel',      shift: ['MATIN'],           salonPrive: '1480201896575631525' },
  '1463233219875831829': { nom: 'Gael',       shift: ['MATIN'],           salonPrive: '1480838083023732899' },

  // APREM (14h-20h)
  '1365037992535658526': { nom: 'Tonny',      shift: ['APREM'],           salonPrive: '1420381853147332628' },
  '1379522886083285197': { nom: 'Oswald',     shift: ['APREM'],           salonPrive: '1420381918058385418' },
  '1471068722285383857': { nom: 'Nassah',     shift: ['APREM'],           salonPrive: '1483334260428374067' },
  '1292089597395865600': { nom: 'Judes',      shift: ['APREM'],           salonPrive: '1505903643478593556' },
  '1393282604970672129': { nom: 'Josepha',    shift: ['APREM'],           salonPrive: '1514595724619284530' },

  // SOIR (20h-02h)
  '778614571672928256':  { nom: 'Cédric',     shift: ['SOIR'],            salonPrive: '1466932790443507752' },
  '1453452626078335094': { nom: 'Fayaad',     shift: ['SOIR'],            salonPrive: '1455669674703585290' },
  '1485373755042824455': { nom: 'Johan',      shift: ['SOIR'],            salonPrive: '1487343306450145290' },
  '1463593178761531504': { nom: 'Hery',       shift: ['SOIR'],            salonPrive: '1468307030430322861' },
  '1432518781095383236': { nom: 'Benoit',     shift: ['SOIR'],            salonPrive: '1457689690315685888' },
  '1416861654083305664': { nom: 'Lindo',      shift: ['SOIR'],            salonPrive: '1459954888405553233' },
  '1387551497616625706': { nom: 'Aryel',      shift: ['SOIR'],            salonPrive: '1492063146007986236' },
  '1494678136535646270': { nom: 'Christopher',shift: ['SOIR', 'NUIT'],    salonPrive: '1492275867404079329' },

  // NUIT (02h-08h)
  '1371927669460959302': { nom: 'Kolvis',     shift: ['NUIT'],            salonPrive: '1509517530451017809' },

  // APREM CAD (17h-00h)
  '1348599027989614613': { nom: 'Remen',      shift: ['APREM CAD'],       salonPrive: '1420381461780889602' },
  '1275411640216457269': { nom: 'Josuah',     shift: ['APREM CAD'],       salonPrive: '1514215113744453752' },
  '1393871746389643327': { nom: 'Thatel',     shift: ['APREM CAD'],       salonPrive: '1494237742047952958' },
  '1472163720305311959': { nom: 'Keonii',     shift: ['APREM CAD'],       salonPrive: '1514271639653716069' },

  // NUIT CAD (00h-08h)
  '1351209868790464663': { nom: 'Lucius',     shift: ['NUIT CAD'],        salonPrive: '1447921828675719270' },
  '1426453755410386994': { nom: 'Kenny',      shift: ['NUIT CAD'],        salonPrive: '1486392515559952514' },
  '899395182640898048':  { nom: 'Merveil',    shift: ['NUIT CAD'],        salonPrive: '1463478278797918313' },
  '1166059251832197180': { nom: 'Seramen',    shift: ['NUIT CAD'],        salonPrive: '1471436764945059972' },
};

// Notif 10 min AVANT le début (donc cron à debut-10min)
const SHIFTS = [
  { nom: 'MATIN',     debut: 8,  fin: 14, cron: '50 7 * * *'   },
  { nom: 'APREM',     debut: 14, fin: 20, cron: '50 13 * * *'  },
  { nom: 'APREM CAD', debut: 17, fin: 0,  cron: '50 16 * * *'  },
  { nom: 'SOIR',      debut: 20, fin: 2,  cron: '50 19 * * *'  },
  { nom: 'NUIT CAD',  debut: 0,  fin: 8,  cron: '50 23 * * *'  }, // Notif à 23h50 (veille)
  { nom: 'NUIT',      debut: 2,  fin: 8,  cron: '50 1 * * *'   },
];

const MODELES = [
  'Anna', 'Anais', 'Aurélie', 'Alice', 'Lola', 'Sarah',
  'Ely', 'Ely FREE',
  'Gabriele', 'Gabriele FREE',
  'Melina', 'Melina FREE',
  'Xoklau VIP', 'Xoklau FREE'
];

const SALONS = {
  clocking:    '1514604869162373140',
  alerteShift: '1514604981645217932',
  primes:      '1514610500426666116',
};

const MODELES_GROUPE_A = ['Anna', 'Anais', 'Aurélie', 'Alice', 'Lola', 'Sarah'];
const MODELES_GROUPE_B = [
  'Ely', 'Ely FREE',
  'Gabriele', 'Gabriele FREE',
  'Melina', 'Melina FREE',
  'Xoklau VIP', 'Xoklau FREE'
];

function getGroupeModele(modele) {
  if (MODELES_GROUPE_A.some(m => m.toLowerCase() === modele.toLowerCase())) return 'A';
  if (MODELES_GROUPE_B.some(m => m.toLowerCase() === modele.toLowerCase())) return 'B';
  return null;
}

function parserVentes(text) {
  if (!text || typeof text !== 'string') return 0;
  const regex = /(\d+(?:[.,]\d{2})?)/g;
  const matches = text.match(regex);
  if (!matches || matches.length === 0) return 0;
  const total = matches.reduce((sum, match) => {
    const num = parseFloat(match.replace(',', '.'));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  return Math.round(total * 100) / 100;
}

function calculerPrime(ventes, modeles) {
  if (!ventes || ventes <= 0 || !modeles || modeles.length === 0) return 0;
  const groupe = getGroupeModele(modeles[0]);
  if (groupe === 'A') {
    if (ventes <= 115) return 0;
    if (ventes <= 294) return 3;
    if (ventes <= 494) return 6;
    if (ventes <= 994) return 9;
    if (ventes <= 1494) return 15;
    return 20;
  }
  if (groupe === 'B') {
    if (ventes <= 294) return 0;
    if (ventes <= 494) return 3;
    if (ventes <= 994) return 6;
    if (ventes <= 1494) return 10;
    return 20;
  }
  return 0;
}

module.exports = {
  CHATTEURS, SHIFTS, MODELES, SALONS,
  MODELES_GROUPE_A, MODELES_GROUPE_B,
  getGroupeModele, parserVentes, calculerPrime,
};
