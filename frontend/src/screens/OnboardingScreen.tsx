import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ViewToken,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';



// ─────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────
const C = {
  bg: '#000000',
  w: '#ddddd5',
  wDim: 'rgba(221,221,213,0.65)',
  wGhost: 'rgba(221,221,213,0.12)',
  cyan: '#00c8d4',
  amber: '#e8a020',
  green: '#28c87a',
  blue: '#3a7bd5',
  purple: '#8860d0',
  red: '#b43228',
};

// ─────────────────────────────────────────────
// CANVAS HTML (orbital / wireframe / radar)
// ─────────────────────────────────────────────
const ORBITAL_HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:transparent;overflow:hidden}</style>
</head><body>
<canvas id="c" style="display:block"></canvas>
<script>
const cv=document.getElementById('c');
const oc=cv.getContext('2d');
cv.width=window.innerWidth; cv.height=window.innerHeight;
const W=cv.width,H=cv.height,CX=W*0.48,CY=H*0.52;
const AST=[{a:W*0.21,b:H*0.14,spd:.38,t:.3,sz:6,lbl:'2025 BX12',ci:0},{a:W*0.28,b:H*0.19,spd:.24,t:2.4,sz:4.5,lbl:'2024 YR4',ci:1},{a:W*0.35,b:H*0.24,spd:.16,t:4.8,sz:4,lbl:'APOPHIS',ci:2},{a:W*0.40,b:H*0.28,spd:.1,t:1.5,sz:3,lbl:'1994 PC4',ci:3}];
const COLS=['#e8a020','#c83228','#00c8d4','#8860d0'];
const ORBC=['rgba(232,160,32,0.35)','rgba(200,50,40,0.25)','rgba(0,200,212,0.22)','rgba(136,96,208,0.22)'];
let ot=0,er=0;
function hex(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return'rgba('+r+','+g+','+b+','+a+')';}
let stars=null;
function draw(){
  oc.clearRect(0,0,W,H);
  const tilt=-0.18;
  if(!stars){stars=[];for(let i=0;i<80;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*.9+.2,a:Math.random()*.7+.25});}
  stars.forEach(s=>{oc.beginPath();oc.arc(s.x,s.y,s.r,0,Math.PI*2);oc.fillStyle='rgba(221,221,213,'+s.a+')';oc.fill();});
  AST.forEach((a,i)=>{oc.save();oc.translate(CX,CY);oc.rotate(tilt);oc.beginPath();oc.ellipse(0,0,a.a,a.b,0,0,Math.PI*2);oc.strokeStyle=ORBC[a.ci];oc.lineWidth=1.2;oc.stroke();oc.restore();});
  const atm=oc.createRadialGradient(CX,CY,H*.09,CX,CY,H*.19);
  atm.addColorStop(0,'rgba(40,100,220,0.22)');atm.addColorStop(0.5,'rgba(20,60,180,0.08)');atm.addColorStop(1,'transparent');
  oc.beginPath();oc.arc(CX,CY,H*.19,0,Math.PI*2);oc.fillStyle=atm;oc.fill();
  oc.save();oc.translate(CX,CY);
  oc.beginPath();oc.arc(0,0,H*.103,0,Math.PI*2);
  const eg=oc.createRadialGradient(-8,-8,0,0,0,H*.103);
  eg.addColorStop(0,'#1a3a58');eg.addColorStop(.6,'#0c2038');eg.addColorStop(1,'#060e1a');
  oc.fillStyle=eg;oc.fill();oc.strokeStyle='rgba(80,160,255,0.3)';oc.lineWidth=.8;oc.stroke();
  oc.save();oc.rotate(er);oc.fillStyle='rgba(30,90,50,0.85)';
  [{x:-10,y:-5,rx:12,ry:7,r:.3},{x:12,y:3,rx:9,ry:5,r:-.2},{x:-4,y:13,rx:6,ry:4,r:.5},{x:7,y:-17,rx:4,ry:2.5,r:-.1}].forEach(c=>{oc.save();oc.rotate(c.r);oc.beginPath();oc.ellipse(c.x,c.y,c.rx,c.ry,0,0,Math.PI*2);oc.fill();oc.restore();});
  oc.fillStyle='rgba(200,220,255,0.55)';oc.beginPath();oc.ellipse(0,-H*.093,8,4,0,0,Math.PI*2);oc.fill();oc.beginPath();oc.ellipse(0,H*.093,6,3,0,0,Math.PI*2);oc.fill();
  oc.restore();oc.restore();
  AST.forEach(a=>{
    a.t+=a.spd*.007;
    const ax=CX+Math.cos(a.t)*a.a*Math.cos(tilt)-Math.sin(a.t)*a.b*Math.sin(tilt);
    const ay=CY+Math.cos(a.t)*a.a*Math.sin(tilt)+Math.sin(a.t)*a.b*Math.cos(tilt);
    const d=(Math.sin(a.t)+1)/2;
    oc.beginPath();oc.arc(ax,ay,a.sz*3,0,Math.PI*2);oc.fillStyle=hex(COLS[a.ci],.12*d);oc.fill();
    oc.save();oc.translate(ax,ay);oc.rotate(a.t*.45);oc.scale(.65+d*.35,.65+d*.35);
    oc.beginPath();
    for(let p=0;p<7;p++){const ang=p/7*Math.PI*2,r=a.sz*(.68+Math.sin(p*2.1+a.t*.5)*.32);p===0?oc.moveTo(Math.cos(ang)*r,Math.sin(ang)*r):oc.lineTo(Math.cos(ang)*r,Math.sin(ang)*r);}
    oc.closePath();oc.fillStyle=hex(COLS[a.ci],.7+d*.3);oc.fill();oc.strokeStyle=hex(COLS[a.ci],.9);oc.lineWidth=.5;oc.stroke();oc.restore();
  });
  er+=.0007;ot+=.01;requestAnimationFrame(draw);
}
draw();
</script></body></html>`;

const WIREFRAME_HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:transparent;overflow:hidden}</style>
</head><body>
<canvas id="c" style="display:block"></canvas>
<script>
const cv=document.getElementById('c');const wc=cv.getContext('2d');
cv.width=window.innerWidth;cv.height=window.innerHeight;
const W=cv.width,H=cv.height,CX=W/2,CY=H/2;
const verts=[[0,1.2,0],[0.9,0.3,0.6],[0.6,0.3,-0.8],[-0.7,0.3,-0.7],[-0.9,0.3,0.5],[0.7,-0.4,0.7],[0.5,-0.4,-0.8],[-0.6,-0.4,-0.7],[-0.8,-0.4,0.5],[0,-1.1,0]];
const faces=[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[1,5,6,2],[2,6,7,3],[3,7,8,4],[4,8,5,1],[9,5,6],[9,6,7],[9,7,8],[9,8,5]];
const FCOLS=['#00c8d4','#3a7bd5','#8860d0'];
let qt=0;
function hex(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return'rgba('+r+','+g+','+b+','+a+')';}
function mulQ(a,b){return[a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3],a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2],a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1],a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];}
function rotV(v,q){const p=[0,...v],qc=[q[0],-q[1],-q[2],-q[3]],r=mulQ(mulQ(q,p),qc);return[r[1],r[2],r[3]];}
function normQ(q){const n=Math.hypot(...q);return q.map(v=>v/n);}
let stars=null;
function draw(){
  wc.clearRect(0,0,W,H);
  if(!stars){stars=[];for(let i=0;i<60;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*.7+.2,a:Math.random()*.55+.15});}
  stars.forEach(s=>{wc.beginPath();wc.arc(s.x,s.y,s.r,0,Math.PI*2);wc.fillStyle='rgba(221,221,213,'+s.a+')';wc.fill();});
  qt+=.011;
  const ax=[0.5,.8,.3],an=Math.hypot(...ax),h=qt*.5;
  const q=normQ([Math.cos(h),Math.sin(h)*ax[0]/an,Math.sin(h)*ax[1]/an,Math.sin(h)*ax[2]/an]);
  const sc=Math.min(W,H)*.22;
  const proj=verts.map(v=>{const r=rotV(v,q);return{x:CX+r[0]*sc,y:CY-r[1]*sc,z:r[2]};});
  const fs=[...faces].map((f,i)=>({f,i,z:f.reduce((s,j)=>s+proj[j].z,0)/f.length})).sort((a,b)=>a.z-b.z);
  fs.forEach(({f,i,z})=>{
    const d=(z+1.5)/3,col=FCOLS[i%FCOLS.length];
    wc.beginPath();wc.moveTo(proj[f[0]].x,proj[f[0]].y);
    for(let k=1;k<f.length;k++)wc.lineTo(proj[f[k]].x,proj[f[k]].y);
    wc.closePath();wc.fillStyle=hex(col,d*.12);wc.fill();
    wc.strokeStyle=hex(col,.25+d*.7);wc.lineWidth=.9;wc.stroke();
  });
  [[1,0,0,'#c83228'],[0,1,0,'#28c87a'],[0,0,1,'#3a7bd5']].forEach(([x,y,z,col])=>{
    const r=rotV([x*1.1,y*1.1,z*1.1],q);
    wc.beginPath();wc.moveTo(CX,CY);wc.lineTo(CX+r[0]*sc*.85,CY-r[1]*sc*.85);
    wc.strokeStyle=col+'88';wc.lineWidth=.8;wc.setLineDash([2,3]);wc.stroke();wc.setLineDash([]);
  });
  const glw=wc.createRadialGradient(CX,CY,0,CX,CY,sc*1.3);
  glw.addColorStop(0,'rgba(0,200,212,0.04)');glw.addColorStop(1,'transparent');
  wc.beginPath();wc.arc(CX,CY,sc*1.3,0,Math.PI*2);wc.fillStyle=glw;wc.fill();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`;

const RADAR_HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:transparent;overflow:hidden}</style>
</head><body>
<canvas id="c" style="display:block"></canvas>
<script>
const cv=document.getElementById('c');const rc=cv.getContext('2d');
cv.width=window.innerWidth;cv.height=window.innerHeight;
const W=cv.width,H=cv.height,CX=W/2,CY=H/2;
const R=Math.min(W,H)*.42;
const BCOLS=['#e8a020','#c83228','#00c8d4','#8860d0'];
const blips=[{r:R*.55,a:.9,ci:0},{r:R*.8,a:3.1,ci:1},{r:R*.38,a:4.8,ci:2},{r:R*.95,a:2.0,ci:3}];
let rt=0;
function hex(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return'rgba('+r+','+g+','+b+','+a+')';}
let stars=null;
function draw(){
  rc.clearRect(0,0,W,H);
  if(!stars){stars=[];for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*.8+.2,a:Math.random()*.6+.15});}
  stars.forEach(s=>{rc.beginPath();rc.arc(s.x,s.y,s.r,0,Math.PI*2);rc.fillStyle='rgba(221,221,213,'+s.a+')';rc.fill();});
  [R,R*.72,R*.5,R*.3,R*.14].forEach((r,i)=>{
    rc.beginPath();rc.arc(CX,CY,r,0,Math.PI*2);
    rc.strokeStyle='rgba(221,221,213,'+(0.07+i*.04)+')';rc.lineWidth=.6;
    if(i===2)rc.setLineDash([3,4]);else rc.setLineDash([]);
    rc.stroke();rc.setLineDash([]);
  });
  [0,Math.PI/4,Math.PI/2,Math.PI*3/4].forEach(a=>{
    rc.beginPath();rc.moveTo(CX+Math.cos(a)*R*.14,CY+Math.sin(a)*R*.14);
    rc.lineTo(CX+Math.cos(a)*R,CY+Math.sin(a)*R);
    rc.strokeStyle='rgba(221,221,213,0.08)';rc.lineWidth=.5;rc.stroke();
  });
  rc.save();rc.translate(CX,CY);rc.rotate(rt);
  rc.beginPath();rc.moveTo(0,0);rc.arc(0,0,R,-.18,.18);rc.closePath();
  rc.fillStyle='rgba(0,200,212,0.1)';rc.fill();
  rc.beginPath();rc.moveTo(0,0);rc.lineTo(R,0);
  rc.strokeStyle='rgba(0,200,212,0.75)';rc.lineWidth=1.2;rc.stroke();
  rc.restore();
  blips.forEach(b=>{
    const fade=Math.max(0,1-((rt-b.a+Math.PI*8)%(Math.PI*2))/(Math.PI*2));
    if(fade>.01){
      const bx=CX+Math.cos(b.a)*b.r,by=CY+Math.sin(b.a)*b.r,col=BCOLS[b.ci];
      rc.beginPath();rc.arc(bx,by,5*fade,0,Math.PI*2);rc.fillStyle=hex(col,.2*fade);rc.fill();
      rc.beginPath();rc.arc(bx,by,2,0,Math.PI*2);rc.fillStyle=hex(col,fade*.95);rc.fill();
    }
  });
  rc.beginPath();rc.arc(CX,CY,4,0,Math.PI*2);
  const cg=rc.createRadialGradient(CX,CY,0,CX,CY,4);
  cg.addColorStop(0,'rgba(0,200,212,0.9)');cg.addColorStop(1,'rgba(0,200,212,0.1)');
  rc.fillStyle=cg;rc.fill();
  rt+=.018;requestAnimationFrame(draw);
}
draw();
</script></body></html>`;

// ─────────────────────────────────────────────
// SLIDE DATA
// ─────────────────────────────────────────────
interface SlideData {
  id: string;
  index: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
  tags?: { label: string; color: string; borderColor: string }[];
  qgrid?: { label: string; key: string }[];
  mlist?: { name: string; status: string; statusColor: string }[];
  cta?: string;
  html: string;
  accentColor: string;
}

const SLIDES: SlideData[] = [
  {
    id: 's0',
    index: '01 / 03 · SYSTÈME ORBITAL',
    titleLine1: 'RADAR',
    titleLine2: 'ORBITAL 3D',
    desc: 'Objets géocroiseurs en temps réel.\nTrajectoires calculées via équations\nsinusoïdales — profondeur 3D précise.',
    tags: [
      { label: 'NASA · NEOWS', color: 'rgba(0,200,212,0.6)', borderColor: 'rgba(0,200,212,0.25)' },
      { label: 'LIVE DATA', color: 'rgba(232,160,32,0.55)', borderColor: 'rgba(232,160,32,0.25)' },
      { label: 'SIN / COS', color: 'rgba(40,200,122,0.55)', borderColor: 'rgba(40,200,122,0.25)' },
    ],
    html: ORBITAL_HTML,
    accentColor: C.amber,
  },
  {
    id: 's1',
    index: '02 / 03 · CINÉMATIQUE',
    titleLine1: 'MOTEUR',
    titleLine2: 'QUATERNION',
    desc: 'Rotation 3D sans Gimbal Lock.\nW, X, Y, Z — interpolation SLERP\nentre états rotationnels.',
    qgrid: [
      { label: 'W', key: '0.7071' },
      { label: 'X', key: '0.0000' },
      { label: 'Y', key: '0.7071' },
      { label: 'Z', key: '0.0000' },
    ],
    html: WIREFRAME_HTML,
    accentColor: C.cyan,
  },
  {
    id: 's2',
    index: '03 / 03 · INITIALISATION',
    titleLine1: 'SYSTÈMES',
    titleLine2: 'NOMINAUX',
    desc: 'Tous les modules sont prêts.\nBienvenue dans votre centre\nde contrôle aérospatial.',
    mlist: [
      { name: 'BACKEND · NODE.JS', status: '● ONLINE', statusColor: C.green },
      { name: 'RADAR ORBITAL', status: '● READY', statusColor: C.cyan },
      { name: 'MOTEUR QUATERNION', status: '○ INIT', statusColor: 'rgba(221,221,213,0.3)' },
    ],
    cta: 'LANCER OSCILLA ▶',
    html: RADAR_HTML,
    accentColor: C.green,
  },
];

// ─────────────────────────────────────────────
// ANIMATED TEXT BLOCK
// ─────────────────────────────────────────────
const AnimText = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(450).easing(Easing.out(Easing.quad))}>
    <Text style={style}>{children}</Text>
  </Animated.View>
);

// ─────────────────────────────────────────────
// SINGLE SLIDE
// ─────────────────────────────────────────────
const SlideItem = React.memo(({ item, isActive, onFinish, screenW, screenH }: {
  item: SlideData;
  isActive: boolean;
  onFinish?: () => void;
  screenW: number;
  screenH: number;
}) => {
  const TOPBAR_H = 30;
  const BOTBAR_H = 24;
  const NAV_H    = 40;
  const slideH   = screenH - TOPBAR_H - BOTBAR_H - NAV_H;
  const key = isActive ? `active-${item.id}` : item.id;
  return (
    <View style={[s.slide, { width: screenW, height: slideH }]}>
      {/* Visual half */}
      <View style={[s.visualCol, { width: screenW * 0.48 }]}>
        <WebView
          key={item.id}
          source={{ html: item.html }}
          style={s.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          androidHardwareAccelerationDisabled={false}
          backgroundColor="transparent"
          containerStyle={{ backgroundColor: 'transparent' }}
        />
        {/* Vignette overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(7,8,10,0.25)', C.bg]}
          locations={[0, 0.75, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Text half */}
      <View style={s.textCol} key={key}>
        <AnimText delay={80} style={s.slideNum}>{item.index}</AnimText>

        <Animated.View entering={FadeInDown.delay(160).duration(450)}>
          <Text style={s.titleMain}>{item.titleLine1}</Text>
          <Text style={s.titleDim}>{item.titleLine2}</Text>
        </Animated.View>

        <AnimText delay={240} style={s.desc}>{item.desc}</AnimText>

        {/* Tags */}
        {item.tags && (
          <Animated.View entering={FadeInDown.delay(320).duration(450)} style={s.tags}>
            {item.tags.map((t) => (
              <View key={t.label} style={[s.tag, { borderColor: t.borderColor }]}>
                <Text style={[s.tagText, { color: t.color }]}>{t.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Quaternion grid */}
        {item.qgrid && (
          <Animated.View entering={FadeInDown.delay(320).duration(450)} style={s.qgrid}>
            {item.qgrid.map((q) => (
              <View key={q.label} style={s.qcell}>
                <Text style={s.qlabel}>{q.label}</Text>
                <Text style={s.qval}>{q.key}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Module list */}
        {item.mlist && (
          <Animated.View entering={FadeInDown.delay(320).duration(450)} style={s.mlist}>
            {item.mlist.map((m, i) => (
              <View key={m.name} style={[s.mrow, i === item.mlist!.length - 1 && s.mrowLast]}>
                <Text style={s.mname}>{m.name}</Text>
                <Text style={[s.mstatus, { color: m.statusColor }]}>{m.status}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* CTA */}
        {item.cta && (
          <Animated.View entering={FadeInDown.delay(400).duration(450)}>
            <TouchableOpacity style={s.cta} activeOpacity={0.7} onPress={onFinish}>
              <Text style={s.ctaText}>{item.cta}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  // UTC clock
  const [utc, setUtc] = useState('--:--:--');
  React.useEffect(() => {
    const tick = () => {
      const n = new Date();
      setUtc([n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()].map(v => String(v).padStart(2, '0')).join(':'));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const goTo = (i: number) => {
    if (i < 0 || i >= SLIDES.length) return;
    flatRef.current?.scrollToIndex({ index: i, animated: true });
  };

  const renderItem = useCallback(({ item, index }: { item: SlideData; index: number }) => (
    <SlideItem item={item} isActive={index === activeIndex} onFinish={onFinish} screenW={screenW} screenH={screenH} />
  ), [activeIndex, onFinish, screenW, screenH]);

  const keyExtractor = (item: SlideData) => item.id;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Background grid */}
      <View style={s.grid} pointerEvents="none" />
      {/* Scanlines */}
      <View style={s.scan} pointerEvents="none" />
      {/* Vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        pointerEvents="none"
      />


      {/* TOP BAR */}
      <View style={s.topbar}>
        <Animated.View entering={ZoomIn.duration(600)} style={s.sDot} />
        <Text style={s.topLabel}>OSCILLA · SYSTÈME OPÉRATIONNEL</Text>
        <View style={s.topRight}>
          <Text style={s.topStat}>UTC <Text style={s.topVal}>{utc}</Text></Text>
          <Text style={s.topStat}>MODE <Text style={s.topVal}>ONBOARDING</Text></Text>
        </View>
      </View>

      {/* FLATLIST SLIDES */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        snapToInterval={screenW}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={s.flatlist}
        contentContainerStyle={{ alignItems: 'stretch' }}
        getItemLayout={(_, index) => ({ length: screenW, offset: screenW * index, index })}
      />

      {/* NAVIGATION */}
      <View style={s.nav}>
        <TouchableOpacity
          style={[s.navBtn, activeIndex === 0 && s.navBtnDisabled]}
          onPress={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
        >
          <Text style={s.navBtnText}>◀</Text>
        </TouchableOpacity>

        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)} style={[s.pip, i === activeIndex && s.pipActive]} />
        ))}

        <TouchableOpacity
          style={[s.navBtn, activeIndex === SLIDES.length - 1 && s.navBtnDisabled]}
          onPress={() => {
            if (activeIndex === SLIDES.length - 1) {
              onFinish?.();
            } else {
              goTo(activeIndex + 1);
            }
          }}
        >
          <Text style={s.navBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM BAR */}
      <View style={s.botbar}>
        <Text style={s.botText}>OSCILLA v1.0.0 · CINÉMATIQUE ORBITALE</Text>
        <Text style={s.botRight}>JPL · CNEOS · ESA · TEMPS RÉEL</Text>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const TOPBAR_H = 30;
const BOTBAR_H = 24;
const NAV_H    = 40;
// Note: SLIDE_H est maintenant calculé dynamiquement dans SlideItem
// en fonction des dimensions réelles de l'écran (réactif aux rotations).

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },

  // BG
  grid: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    // Simulated with a repeating pattern — actual grid lines via SVG or custom drawing
    // Here we use a subtle opacity bg
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  scan: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },

  // CORNERS
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    zIndex: 20,
  },
  cTL: { top: TOPBAR_H + 8, left: 10, borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.wDim },
  cTR: { top: TOPBAR_H + 8, right: 10, borderTopWidth: 1, borderRightWidth: 1, borderColor: C.wDim },
  cBL: { bottom: BOTBAR_H + NAV_H + 8, left: 10, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: C.wDim },
  cBR: { bottom: BOTBAR_H + NAV_H + 8, right: 10, borderBottomWidth: 1, borderRightWidth: 1, borderColor: C.wDim },

  // TOP BAR
  topbar: {
    height: TOPBAR_H,
    borderBottomWidth: 1,
    borderBottomColor: C.wGhost,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    zIndex: 30,
  },
  sDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.cyan,
    marginRight: 6,
    shadowColor: C.cyan,
    shadowRadius: 5,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  topLabel: {
    fontSize: 7,
    letterSpacing: 2.5,
    color: C.wDim,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  topRight: { marginLeft: 'auto', flexDirection: 'row', gap: 12 },
  topStat: {
    fontSize: 7,
    letterSpacing: 2,
    color: C.wDim,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  topVal: { color: C.w },

  // FLATLIST
  flatlist: {
    flex: 1,
    zIndex: 5,
  },

  // SLIDE — width et height passés en inline style depuis SlideItem (dynamiques)
  slide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  // VISUAL — width passé en inline style depuis SlideItem (screenW * 0.48)
  visualCol: {
    position: 'relative',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // DIVIDER
  divider: {
    width: 1,
    backgroundColor: C.wGhost,
    marginVertical: 20,
  },

  textCol: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 0,
  },
  slideNum: {
    fontSize: 7,
    letterSpacing: 4,
    color: 'rgba(221,221,213,0.45)',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 10,
  },
  titleMain: {
    fontSize: 32,
    fontWeight: '700',
    color: C.w,
    letterSpacing: 3,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif-condensed',
  },
  titleDim: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(221,221,213,0.45)',
    letterSpacing: 3,
    lineHeight: 30,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif-condensed',
  },
  desc: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.wDim,
    lineHeight: 15,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // TAGS
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  tagText: {
    fontSize: 7,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // QGRID
  qgrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    marginTop: 8,
  },
  qcell: {
    width: '49%',
    padding: 7,
    backgroundColor: C.wGhost,
  },
  qlabel: {
    fontSize: 6,
    letterSpacing: 2,
    color: 'rgba(221,221,213,0.5)',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  qval: {
    fontSize: 13,
    fontWeight: '600',
    color: C.w,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif-condensed',
  },

  // MODULE LIST
  mlist: { marginTop: 4, gap: 0 },
  mrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.wGhost,
  },
  mrowLast: { borderBottomWidth: 0 },
  mname: {
    fontSize: 7,
    letterSpacing: 2,
    color: C.wDim,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  mstatus: {
    fontSize: 7,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // CTA
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: C.wDim,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  ctaText: {
    fontSize: 8,
    letterSpacing: 3,
    color: C.w,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // NAV
  nav: {
    height: NAV_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    zIndex: 30,
  },
  pip: {
    width: 18,
    height: 2,
    backgroundColor: C.wGhost,
  },
  pipActive: {
    width: 28,
    backgroundColor: C.wDim,
  },
  navBtn: {
    borderWidth: 1,
    borderColor: C.wGhost,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.15 },
  navBtnText: {
    color: C.wDim,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // BOTTOM BAR
  botbar: {
    height: BOTBAR_H,
    borderTopWidth: 1,
    borderTopColor: C.wGhost,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    zIndex: 30,
  },
  botText: {
    fontSize: 7,
    letterSpacing: 2,
    color: 'rgba(221,221,213,0.38)',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  botRight: {
    marginLeft: 'auto',
    fontSize: 7,
    letterSpacing: 2,
    color: 'rgba(221,221,213,0.38)',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
