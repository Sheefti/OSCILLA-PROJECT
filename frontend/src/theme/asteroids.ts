export interface AsteroidData {
  id:      number;
  name:    string;
  cls:     string;
  rx:      number;
  ry:      number;
  tilt:    number;
  speed:   number;
  phase:   number;
  color:   string;
  rgb:     string;
  alert:   boolean;
  diam:    string;
  mag:     string;
  vel:     string;
  dist:    string;
}

export const ASTEROIDS: AsteroidData[] = [
  { id:0, name:'2024 YR4',  cls:'CLASSE APOLLO · PHO',    rx:110, ry:48, tilt:-20, speed:.40, phase:0,             color:'#ffab00', rgb:'255,171,0', alert:true,  diam:'~50m',   mag:'24.5', vel:'28.74', dist:'0.0034' },
  { id:1, name:'2025 BX12', cls:'CLASSE ATEN · NEO',      rx:145, ry:65, tilt: 25, speed:.23, phase:Math.PI*.55,   color:'#00e5ff', rgb:'0,229,255', alert:false, diam:'~120m',  mag:'18.7', vel:'22.31', dist:'0.0180' },
  { id:2, name:'1994 PC1',  cls:'CLASSE APOLLO · NEO',    rx: 90, ry:40, tilt:-38, speed:.60, phase:Math.PI,       color:'#00e5ff', rgb:'0,229,255', alert:false, diam:'~1.1km', mag:'17.2', vel:'19.56', dist:'0.0130' },
  { id:3, name:'APOPHIS',   cls:'CLASSE ATEN · CRITIQUE', rx:178, ry:80, tilt: 14, speed:.16, phase:Math.PI*1.5,   color:'#ff3d3d', rgb:'255,61,61', alert:true,  diam:'~340m',  mag:'19.7', vel:'30.73', dist:'0.0009' },
];