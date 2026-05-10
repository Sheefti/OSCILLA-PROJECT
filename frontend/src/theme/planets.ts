/**
 * src/theme/planets.ts
 * Données de toutes les planètes du système solaire pour Oscilla.
 *
 * Chaque planète contient :
 *  - accentCol / accentRgb : couleur thématique (pour la nav bar et le radar)
 *  - nasaBody              : clé utilisée par notre backend /api/neo/by-body
 *  - systemLabel           : label affiché dans la Topbar
 *  - planetColor           : [col1, col2, col3] pour le gradient de la planète dans le radar
 *  - fallbackAsteroids     : données statiques utilisées pendant le chargement API
 */

export interface PlanetAsteroidData {
  id:    number;
  name:  string;
  cls:   string;
  rx:    number;
  ry:    number;
  tilt:  number;
  speed: number;
  phase: number;
  color: string;
  rgb:   string;
  alert: boolean;
  diam:  string;
  mag:   string;
  vel:   string;
  dist:  string;
}

export interface PlanetConfig {
  key:         string;
  name:        string;
  code:        string;         // label court dans la nav (ex: "MARS")
  accentCol:   string;
  accentRgb:   string;
  nasaBody:    string;         // param pour /api/neo/by-body
  systemLabel: string;
  planetColor: [string, string, string];
  hasRing?:    boolean;
  fallbackAsteroids: PlanetAsteroidData[];
}

export const PLANETS: Record<string, PlanetConfig> = {
  mercure: {
    key: 'mercure', name: 'MERCURE', code: 'MERC',
    accentCol: '#b0b0c8', accentRgb: '176,176,200',
    nasaBody: 'mercury',
    systemLabel: 'SYSTÈME SOLAIRE INTERNE · SECTEUR MERCURE',
    planetColor: ['#c8c8d8', '#8c8ca0', '#1a1a26'],
    fallbackAsteroids: [
      { id:0, name:'2006 KZ39',  cls:'CLASSE APOLLON · MCA', rx:105, ry:44, tilt:-14, speed:.44, phase:0,    color:'#b0b0c8', rgb:'176,176,200', alert:false, diam:'~220m',  mag:'19.2', vel:'48.50', dist:'0.0420' },
      { id:1, name:'2019 AQ3',   cls:'CLASSE ATIRA · IEO',   rx:140, ry:60, tilt: 22, speed:.26, phase:2.10, color:'#9090a8', rgb:'144,144,168', alert:false, diam:'~3km',   mag:'16.0', vel:'42.10', dist:'0.3900' },
      { id:2, name:'2020 AV2',   cls:'CLASSE VATIRA · IEO',  rx: 82, ry:35, tilt:-30, speed:.60, phase:3.14, color:'#b0b0c8', rgb:'176,176,200', alert:true,  diam:'~1km',   mag:'17.8', vel:'37.80', dist:'0.2600' },
      { id:3, name:'2021 PH27',  cls:'CLASSE ATIRA · IEO',   rx:168, ry:74, tilt: 18, speed:.17, phase:4.20, color:'#808098', rgb:'128,128,152', alert:false, diam:'~1km',   mag:'17.5', vel:'55.20', dist:'0.5100' },
    ],
  },

  venus: {
    key: 'venus', name: 'VÉNUS', code: 'VÉNUS',
    accentCol: '#e8c97a', accentRgb: '232,201,122',
    nasaBody: 'venus',
    systemLabel: 'SYSTÈME SOLAIRE INTERNE · SECTEUR VÉNUS',
    planetColor: ['#d4a843', '#a07018', '#3a2208'],
    fallbackAsteroids: [
      { id:0, name:'2002 VE68',  cls:'QUASI-SATELLITE VÉNUS', rx:105, ry:44, tilt:-14, speed:.45, phase:0,    color:'#e8c97a', rgb:'232,201,122', alert:false, diam:'~180m',  mag:'18.9', vel:'35.02', dist:'0.0190' },
      { id:1, name:'2012 XE133', cls:'CLASSE AMOR · VCA',     rx:142, ry:61, tilt: 28, speed:.25, phase:2.10, color:'#c8a840', rgb:'200,168,64',  alert:false, diam:'~60m',   mag:'22.3', vel:'29.80', dist:'0.0350' },
      { id:2, name:'ZOOZVE',     cls:'QUASI-SATELLITE',        rx: 82, ry:35, tilt:-35, speed:.65, phase:3.14, color:'#e8c97a', rgb:'232,201,122', alert:true,  diam:'~100m',  mag:'20.5', vel:'31.60', dist:'0.0042' },
      { id:3, name:'2013 ND15',  cls:'CLASSE APOHELE · VCA',  rx:170, ry:75, tilt: 18, speed:.17, phase:4.20, color:'#a08030', rgb:'160,128,48',  alert:false, diam:'~140m',  mag:'19.8', vel:'27.40', dist:'0.0510' },
    ],
  },

  terre: {
    key: 'terre', name: 'TERRE', code: 'TERRE',
    accentCol: '#c8c8c8', accentRgb: '200,200,200',
    nasaBody: 'earth',
    systemLabel: 'SYSTÈME SOLAIRE INTERNE · SECTEUR TERRE',
    planetColor: ['#0d2e1a', '#071a0e', '#020a05'],
    fallbackAsteroids: [
      { id:0, name:'2024 YR4',   cls:'CLASSE APOLLO · PHO',    rx:110, ry:48,  tilt:-20, speed:.40, phase:0,            color:'#ffab00', rgb:'255,171,0',  alert:true,  diam:'~50m',   mag:'24.5', vel:'28.74', dist:'0.0034' },
      { id:1, name:'2025 BX12',  cls:'CLASSE ATEN · NEO',      rx:145, ry:65,  tilt: 25, speed:.23, phase:1.72,         color:'#c8c8c8', rgb:'200,200,200', alert:false, diam:'~120m',  mag:'18.7', vel:'22.31', dist:'0.0180' },
      { id:2, name:'1994 PC1',   cls:'CLASSE APOLLO · NEO',    rx: 90, ry:40,  tilt:-38, speed:.60, phase:3.14,         color:'#c8c8c8', rgb:'200,200,200', alert:false, diam:'~1.1km', mag:'17.2', vel:'19.56', dist:'0.0130' },
      { id:3, name:'APOPHIS',    cls:'CLASSE ATEN · CRITIQUE',  rx:178, ry:80,  tilt: 14, speed:.16, phase:4.71,         color:'#ff3d3d', rgb:'255,61,61',   alert:true,  diam:'~340m',  mag:'19.7', vel:'30.73', dist:'0.0009' },
    ],
  },

  mars: {
    key: 'mars', name: 'MARS', code: 'MARS',
    accentCol: '#ff6d3a', accentRgb: '255,109,58',
    nasaBody: 'mars',
    systemLabel: 'SYSTÈME SOLAIRE INTERNE · SECTEUR MARS',
    planetColor: ['#e64a19', '#bf360c', '#3e0c00'],
    fallbackAsteroids: [
      { id:0, name:'2020 MT1',   cls:'CLASSE AMOR · MCA',     rx:105, ry:45, tilt:-15, speed:.35, phase:0,    color:'#ff6d3a', rgb:'255,109,58', alert:false, diam:'~80m',   mag:'22.1', vel:'24.50', dist:'0.0520' },
      { id:1, name:'1998 KY26',  cls:'CLASSE APOLLO · MCA',   rx:140, ry:60, tilt: 30, speed:.20, phase:2.09, color:'#ffab00', rgb:'255,171,0',  alert:true,  diam:'~30m',   mag:'25.2', vel:'18.90', dist:'0.0310' },
      { id:2, name:'PHOBOS',     cls:'LUNE DE MARS',           rx: 80, ry:30, tilt: -8, speed:.80, phase:1.05, color:'#ff6d3a', rgb:'255,109,58', alert:false, diam:'~22km',  mag:'11.3', vel:'21.40', dist:'0.0001' },
      { id:3, name:'DEIMOS',     cls:'LUNE DE MARS',           rx:165, ry:72, tilt:  5, speed:.18, phase:3.66, color:'#ffab00', rgb:'255,171,0',  alert:false, diam:'~12km',  mag:'12.4', vel:'14.50', dist:'0.0002' },
    ],
  },

  jupiter: {
    key: 'jupiter', name: 'JUPITER', code: 'JPTR',
    accentCol: '#ffab00', accentRgb: '255,171,0',
    nasaBody: 'jupiter',
    systemLabel: 'SYSTÈME JOVIEN · CEINTURE ASTÉROÏDES',
    planetColor: ['#f57c00', '#e65100', '#3e1a00'],
    fallbackAsteroids: [
      { id:0, name:'IO',            cls:'LUNE GALILÉENNE · JO',  rx:100, ry:42, tilt:-10, speed:.50, phase:0,    color:'#ffab00', rgb:'255,171,0',  alert:false, diam:'3643km', mag:'5.0',  vel:'17.33', dist:'0.0028' },
      { id:1, name:'EUROPA',        cls:'LUNE GALILÉENNE · JE',  rx:135, ry:58, tilt: 18, speed:.28, phase:1.57, color:'#c8c8c8', rgb:'200,200,200', alert:false, diam:'3122km', mag:'5.3',  vel:'13.74', dist:'0.0045' },
      { id:2, name:'2019 LD2',      cls:'TROYEN JUPITER · L4',   rx: 88, ry:38, tilt:-32, speed:.65, phase:3.14, color:'#ffab00', rgb:'255,171,0',  alert:true,  diam:'~3km',   mag:'19.4', vel:'12.60', dist:'0.2340' },
      { id:3, name:'617 PATROCLUS', cls:'TROYEN JUPITER',         rx:172, ry:76, tilt: 20, speed:.14, phase:4.19, color:'#ff3d3d', rgb:'255,61,61',  alert:false, diam:'~140km', mag:'15.8', vel:'11.22', dist:'0.4800' },
    ],
  },

  saturne: {
    key: 'saturne', name: 'SATURNE', code: 'SATRN',
    accentCol: '#e8d5a0', accentRgb: '232,213,160',
    nasaBody: 'saturn',
    systemLabel: 'SYSTÈME SATURNIEN · CEINTURE DE GLACE',
    planetColor: ['#c8a84b', '#8c6e1a', '#2e2005'],
    hasRing: true,
    fallbackAsteroids: [
      { id:0, name:'TITAN',      cls:'LUNE TITAN · TYPE-IB',     rx:108, ry:46, tilt:-12, speed:.44, phase:0,    color:'#e8c060', rgb:'232,192,96',  alert:false, diam:'5150km', mag:'8.3',  vel:'5.57',  dist:'0.0082' },
      { id:1, name:'ENCELADE',   cls:'LUNE GLACÉE · JET ACTIF',  rx:138, ry:58, tilt: 20, speed:.26, phase:1.80, color:'#e8d5a0', rgb:'232,213,160', alert:true,  diam:'504km',  mag:'11.7', vel:'12.64', dist:'0.0016' },
      { id:2, name:'2004 EW95',  cls:'TROYEN SATURNE',            rx: 82, ry:34, tilt:-28, speed:.62, phase:3.14, color:'#c8a84b', rgb:'200,168,75',  alert:false, diam:'~200km', mag:'18.2', vel:'9.10',  dist:'0.6200' },
      { id:3, name:'JANUS',      cls:'LUNE CO-ORBITALE',          rx:168, ry:72, tilt: 16, speed:.15, phase:4.00, color:'#a09060', rgb:'160,144,96',  alert:false, diam:'180km',  mag:'14.5', vel:'16.80', dist:'0.0009' },
    ],
  },

  uranus: {
    key: 'uranus', name: 'URANUS', code: 'URAN',
    accentCol: '#7de8e8', accentRgb: '125,232,232',
    nasaBody: 'uranus',
    systemLabel: 'SYSTÈME OURANIEN · ROTATION AXIALE',
    planetColor: ['#7de8e8', '#2ab8b8', '#053838'],
    hasRing: true,
    fallbackAsteroids: [
      { id:0, name:'TITANIA',    cls:'GRANDE LUNE · UT',      rx:100, ry:42, tilt:-15, speed:.40, phase:0,    color:'#7de8e8', rgb:'125,232,232', alert:false, diam:'1578km', mag:'13.9', vel:'3.64',  dist:'0.0029' },
      { id:1, name:'MIRANDA',    cls:'LUNE GÉOLOGIQUE',        rx:132, ry:56, tilt: 24, speed:.22, phase:1.60, color:'#50c0c0', rgb:'80,192,192',  alert:false, diam:'472km',  mag:'15.8', vel:'6.68',  dist:'0.0009' },
      { id:2, name:'2003 QX113', cls:'CENTAURE · URANUS',      rx: 78, ry:32, tilt:-38, speed:.58, phase:3.14, color:'#7de8e8', rgb:'125,232,232', alert:true,  diam:'~120km', mag:'19.0', vel:'6.81',  dist:'1.2800' },
      { id:3, name:'OBERON',     cls:'GRANDE LUNE · UO',       rx:165, ry:70, tilt: 12, speed:.14, phase:4.30, color:'#60a8a8', rgb:'96,168,168',  alert:false, diam:'1522km', mag:'14.1', vel:'3.15',  dist:'0.0039' },
    ],
  },

  neptune: {
    key: 'neptune', name: 'NEPTUNE', code: 'NEPT',
    accentCol: '#4080ff', accentRgb: '64,128,255',
    nasaBody: 'neptune',
    systemLabel: 'SYSTÈME NEPTUNIEN · CEINTURE DE KUIPER',
    planetColor: ['#2060e0', '#0c2880', '#020a28'],
    fallbackAsteroids: [
      { id:0, name:'TRITON',     cls:'GRANDE LUNE · RÉTROGRADE', rx:105, ry:44, tilt:-20, speed:.38, phase:0,    color:'#4080ff', rgb:'64,128,255', alert:false, diam:'2707km', mag:'13.5', vel:'4.39',  dist:'0.0024' },
      { id:1, name:'2015 RR245', cls:'TNO · CEINTURE KUIPER',    rx:140, ry:60, tilt: 26, speed:.20, phase:1.90, color:'#6090ff', rgb:'96,144,255', alert:false, diam:'~670km', mag:'21.5', vel:'3.82',  dist:'34.100' },
      { id:2, name:'NEREID',     cls:'LUNE IRRÉGULIÈRE · NN',    rx: 82, ry:34, tilt:-32, speed:.55, phase:3.14, color:'#4080ff', rgb:'64,128,255', alert:false, diam:'340km',  mag:'18.7', vel:'0.93',  dist:'0.0370' },
      { id:3, name:'ARROKOTH',   cls:'OBJ TRANS-NEPTUNIEN',      rx:170, ry:74, tilt: 18, speed:.13, phase:4.10, color:'#2050d0', rgb:'32,80,208',  alert:true,  diam:'~36km',  mag:'26.8', vel:'4.25',  dist:'44.600' },
    ],
  },
};

export const PLANET_ORDER = [
  'mercure', 'venus', 'terre', 'mars',
  'jupiter', 'saturne', 'uranus', 'neptune',
];

export const INNER_PLANETS = ['mercure', 'venus', 'terre', 'mars'];
export const OUTER_PLANETS  = ['jupiter', 'saturne', 'uranus', 'neptune'];