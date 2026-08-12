// config.js
const CHATTEURS = {
  // MATIN (8h-14h)
  '1466760403462914111': { nom: 'Mialy',      shift: ['MATIN'],           salonPrive: '1456726270057382112' },
  '1480839559385448572': { nom: 'Sébastien',  shift: ['MATIN'],           salonPrive: '1482430724865786038' },
  '1436794235604041818': { nom: 'Michel',     shift: ['MATIN'],           salonPrive: '1500481974937190440' },
  '1156954051750150185': { nom: 'Jodel',      shift: ['MATIN'],           salonPrive: '1480201896575631525' },
  '1463233219875831829': { nom: 'Gael',       shift: ['MATIN'],           salonPrive: '1480838083023732899' },

  // APREM (14h-20h)
  '1365037992535658526': { nom: 'Tonny',      shift: ['APREM'],           salonPrive: '1420381853147332628' },
  '1379522886083285197': { nom: 'Oswald',     shift: ['APREM'],           salonPrive: '1420381918058385418' },
  '1471068722285383857': { nom: 'Nassah',     shift: ['APREM'],           salonPrive: '1483334260428374067' },
  '1525888679942557757': { nom: 'Anddy',      shift: ['APREM'],           salonPrive: '1533463090275024906' },

  // SOIR (20h-02h)
  '1445847814314922147': { nom: 'Fayaad',     shift: ['SOIR'],            salonPrive: '1455669674703585290' },
  '1516809712702853266': { nom: 'Mario',      shift: ['SOIR'],            salonPrive: '1521069517999050844' },
  '1463593178761531504': { nom: 'Hery',       shift: ['SOIR'],            salonPrive: '1468307030430322861' },
  '1432518781095383236': { nom: 'Benoit',     shift: ['SOIR'],            salonPrive: '1457689690315685888' },
  '1416861654083305664': { nom: 'Lindo',      shift: ['SOIR'],            salonPrive: '1459954888405553233' },
  '1387551497616625706': { nom: 'Aryel',      shift: ['SOIR'],            salonPrive: '1492063146007986236' },
  '778614571672928256': { nom: 'Cédric',      shift: ['SOIR'],            salonPrive: '1525776681132884119' },
  '1398614993070592052': { nom: 'Zoro',      shift: ['SOIR'],            salonPrive: '1526144897344606208' },
  
  // NUIT (02h-08h)
  '1347360565189939210': { nom: 'Geraldo',shift: ['NUIT'],            salonPrive: '1526130690683437188' },
  
  // APREM CAD (17h-00h)
  '1348599027989614613': { nom: 'Remen',      shift: ['APREM CAD'],       salonPrive: '1420381461780889602' },
  '1450180158882316308': { nom: 'Seedorf',     shift: ['APREM CAD'],       salonPrive: '1536889619713364089' },
  '1303698715621589086': { nom: 'Espoir',     shift: ['APREM CAD'],       salonPrive: '1526458398663508070' },
  
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
  primes:      '1480571097127714816',
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
