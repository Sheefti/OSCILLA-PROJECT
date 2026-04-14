import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  ClipPath,
  Polygon,
} from 'react-native-svg';
import { ASTEROIDS, AsteroidData } from '../../theme/asteroids';
import { computeOrbitalPosition } from '../../math/orbital';

interface Props {
  width:           number;
  height:          number;
  onAsteroidPress: (asteroid: AsteroidData) => void;
  selectedId:      number;
}

// ─────────────────────────────────────────────────────────────
// MESH 3D — icosphère déformée (identique maquette HTML)
// ─────────────────────────────────────────────────────────────
interface Mesh { verts: number[][]; faces: number[][]; }

function genAsteroidMesh(id: number): Mesh {
  const seed   = id * 1.37 + 0.5;
  const stacks = 7, slices = 9;
  const verts: number[][] = [];
  const faces: number[][] = [];

  for (let i = 0; i <= stacks; i++) {
    const phi = (i / stacks) * Math.PI;
    for (let j = 0; j <= slices; j++) {
      const theta = (j / slices) * Math.PI * 2;
      const noise = 1
        + 0.35 * Math.sin(phi * 3.1 + seed) * Math.cos(theta * 2.7 + seed * 1.3)
        + 0.15 * Math.sin(phi * 7 + theta * 5);
      verts.push([
        Math.sin(phi) * Math.cos(theta) * noise,
        Math.cos(phi) * noise,
        Math.sin(phi) * Math.sin(theta) * noise,
      ]);
    }
  }
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * (slices + 1) + j;
      faces.push([a, a+1, a+slices+2, a+slices+1]);
    }
  }
  return { verts, faces };
}

// Projection perspective (identique maquette, fov=3.5)
function project3D(v: number[], ax: number, ay: number, cx: number, cy: number, scale: number) {
  let x = v[0]*Math.cos(ay) - v[2]*Math.sin(ay);
  let z = v[0]*Math.sin(ay) + v[2]*Math.cos(ay);
  let y = v[1];
  const y2 = y*Math.cos(ax) - z*Math.sin(ax);
  const z2 = y*Math.sin(ax) + z*Math.cos(ax);
  const pz  = z2 + 3.5;
  return { sx: cx + (x/pz)*scale, sy: cy + (y2/pz)*scale, z2 };
}

// Rendu mesh → éléments SVG
function renderMesh(
  mesh: Mesh, ax: number, ay: number,
  cx: number, cy: number, scale: number, rgb: string,
): React.ReactNode[] {
  const proj = mesh.verts.map(v => project3D(v, ax, ay, cx, cy, scale));

  const sorted = mesh.faces
    .map(f => ({ f, avgZ: f.reduce((s, vi) => s + proj[vi].z2, 0) / f.length }))
    .sort((a, b) => a.avgZ - b.avgZ);

  const els: React.ReactNode[] = [];

  sorted.forEach(({ f, avgZ }, idx) => {
    const pts = f.map(vi => proj[vi]);
    // Back-face culling
    const ax2 = pts[1].sx - pts[0].sx, ay2 = pts[1].sy - pts[0].sy;
    const bx2 = pts[2].sx - pts[0].sx, by2 = pts[2].sy - pts[0].sy;
    if (ax2*by2 - ay2*bx2 > 0) return;

    const light = Math.max(0, Math.min(1, (avgZ + 2.5) / 3.5));
    const points = pts.map(p => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ');

    els.push(
      <Polygon key={`f${idx}`} points={points}
        fill={`rgba(${rgb},${(light*0.10 + 0.03).toFixed(3)})`}
        stroke={`rgba(${rgb},${(light*0.55 + 0.10).toFixed(3)})`}
        strokeWidth={0.45}
      />
    );
  });

  // Points sur sommets avant
  proj.forEach((p, vi) => {
    if (p.z2 > 0.5) {
      const a = Math.min(1, (p.z2 - 0.4) * 0.5).toFixed(3);
      els.push(<Circle key={`v${vi}`} cx={p.sx.toFixed(1)} cy={p.sy.toFixed(1)} r={0.9} fill={`rgba(${rgb},${a})`} />);
    }
  });

  return els;
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────
function buildOrbitPath(rx: number, ry: number, tilt: number, cx: number, cy: number): string {
  const tr = tilt * Math.PI / 180;
  let d = '';
  for (let i = 0; i <= 80; i++) {
    const a = (i/80)*Math.PI*2;
    const xW = rx*Math.cos(a)*Math.cos(tr) - ry*Math.sin(a)*Math.sin(tr);
    const yW = rx*Math.cos(a)*Math.sin(tr) + ry*Math.sin(a)*Math.cos(tr);
    d += i===0 ? `M ${cx+xW} ${cy+yW}` : ` L ${cx+xW} ${cy+yW}`;
  }
  return d + ' Z';
}

function buildStars(w: number, h: number, n: number) {
  let s = 1337;
  const r = () => { s=(Math.imul(s,1664525)+1013904223)|0; return (s>>>0)/0xffffffff; };
  return Array.from({length:n}, () => ({x:r()*w, y:r()*h, rv:0.35+r()*0.9, op:0.08+r()*0.45}));
}

function buildContinents(cx: number, cy: number, R: number): string[] {
  const f = (n:number)=>n.toFixed(1);
  return [
    `M${f(cx-R*.05)},${f(cy-R*.6)} l${f(R*.38)},${f(-R*.06)} l${f(R*.1)},${f(R*.2)} l${f(-R*.1)},${f(R*.22)} l${f(-R*.32)},${f(R*.04)} Z`,
    `M${f(cx-R*.65)},${f(cy-R*.32)} l${f(R*.2)},${f(-R*.08)} l${f(R*.06)},${f(R*.38)} l${f(-R*.06)},${f(R*.25)} l${f(-R*.16)},${f(-R*.1)} Z`,
    `M${f(cx+R*.08)},${f(cy+R*.0)} l${f(R*.2)},${f(-R*.06)} l${f(R*.08)},${f(R*.35)} l${f(-R*.1)},${f(R*.18)} l${f(-R*.2)},${f(-R*.2)} Z`,
    `M${f(cx+R*.48)},${f(cy+R*.28)} l${f(R*.16)},${f(R*.02)} l${f(R*.02)},${f(R*.13)} l${f(-R*.15)},${f(R*.03)} Z`,
  ];
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────
export default function OrbitalRadar({ width, height, onAsteroidPress, selectedId }: Props) {
  const CX = width/2, CY = height/2, EARTH_R = 32;

  const [tv, setTv] = useState(0);
  const tvRef     = useRef(0);
  const astPosRef = useRef<Array<{x:number;y:number;r:number}>>([]);

  useEffect(() => {
    const id = setInterval(() => { tvRef.current += 0.006; setTv(tvRef.current); }, 16);
    return () => clearInterval(id);
  }, []);

  const meshes     = useMemo(() => ASTEROIDS.map(a => genAsteroidMesh(a.id)), []);
  const orbitPaths = useRef(ASTEROIDS.map(a => buildOrbitPath(a.rx, a.ry, a.tilt, CX, CY))).current;
  const stars      = useRef(buildStars(width, height, 130)).current;
  const continents = useRef(buildContinents(CX, CY, EARTH_R)).current;

  const astFrames = ASTEROIDS.map(a => {
    const pos = computeOrbitalPosition(
      {id:a.id, rx:a.rx, ry:a.ry, tilt:a.tilt, speed:a.speed, phase:a.phase},
      tv, CX, CY
    );
    // Taille VISUELLE de l'astéroïde dans le radar — base généreuse
    const displayR = (15 + pos.depth * 14) * pos.scale;
    const pulse    = 0.78 + 0.22 * Math.sin(tv * 2.5 + a.id);
    const alpha    = Math.max(0.42, pos.depth);
    return { ...pos, displayR, pulse, alpha, asteroid: a };
  });

  astPosRef.current = astFrames.map(f => ({x:f.x, y:f.y, r:f.displayR}));
  const sorted = [...astFrames].sort((a,b) => a.depth - b.depth);

  const handleTouch = (e:any) => {
    const {locationX:mx, locationY:my} = e.nativeEvent;
    for (let i = astPosRef.current.length-1; i >= 0; i--) {
      const p = astPosRef.current[i];
      if (!p) continue;
      if (Math.sqrt((mx-p.x)**2+(my-p.y)**2) < p.r*1.8+14) {
        onAsteroidPress(ASTEROIDS[i]); return;
      }
    }
  };

  const ringAngle = (tv*12)%360;

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={{width, height}}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="earthCore" cx="38%" cy="35%" r="68%">
              <Stop offset="0%"   stopColor="#4fc3f7" stopOpacity="0.9"/>
              <Stop offset="25%"  stopColor="#2196f3" stopOpacity="1"/>
              <Stop offset="55%"  stopColor="#1565c0" stopOpacity="1"/>
              <Stop offset="80%"  stopColor="#0d3a7a" stopOpacity="1"/>
              <Stop offset="100%" stopColor="#020d20" stopOpacity="1"/>
            </RadialGradient>
            <RadialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="#1e88e5" stopOpacity="0.18"/>
              <Stop offset="55%"  stopColor="#1565c0" stopOpacity="0.07"/>
              <Stop offset="100%" stopColor="#1565c0" stopOpacity="0"/>
            </RadialGradient>
            <ClipPath id="earthClip">
              <Circle cx={CX} cy={CY} r={EARTH_R}/>
            </ClipPath>
          </Defs>

          {/* Étoiles */}
          {stars.map((s,i) => (
            <Circle key={`st${i}`} cx={s.x} cy={s.y} r={s.rv} fill={`rgba(200,225,255,${s.op.toFixed(2)})`}/>
          ))}

          {/* Grille radar */}
          {[45,85,125,168].map((r,i) => (
            <Circle key={`gr${r}`} cx={CX} cy={CY} r={r}
              stroke={`rgba(0,229,255,${(0.065-i*0.01).toFixed(3)})`} strokeWidth={0.5} fill="none"/>
          ))}
          <Line x1={CX-195} y1={CY} x2={CX+195} y2={CY} stroke="rgba(0,229,255,0.04)" strokeWidth={0.5}/>
          <Line x1={CX} y1={CY-195} x2={CX} y2={CY+195} stroke="rgba(0,229,255,0.04)" strokeWidth={0.5}/>

          {/* Orbites */}
          {ASTEROIDS.map((a,i) => {
            const isSel = a.id===selectedId;
            const rgb = a.id===3?'255,61,61':'0,229,255';
            // Position courante sur l'orbite pour le marqueur
            const frame = astFrames.find(f => f.asteroid.id === a.id);
            return (
              <G key={`orb${a.id}`}>
                <Path d={orbitPaths[i]}
                  stroke={`rgba(${rgb},${isSel?.28:.08})`}
                  strokeWidth={isSel?.9:.4} strokeDasharray={isSel?undefined:'3 8'} fill="none"/>
                {/* Petit losange sur la position courante si sélectionné */}
                {isSel && frame && (
                  <G>
                    <Circle cx={frame.x} cy={frame.y} r={3.5}
                      fill="none" stroke={`rgba(${rgb},0.8)`} strokeWidth={1}/>
                  </G>
                )}
              </G>
            );
          })}

          {/* Terre */}
          <Circle cx={CX} cy={CY} r={EARTH_R+35} fill="url(#earthGlow)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R+15} fill="rgba(30,130,255,0.04)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R+10} fill="rgba(30,140,255,0.06)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R+6}  fill="rgba(30,150,255,0.09)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R+3}  fill="rgba(30,160,255,0.12)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R} fill="url(#earthCore)"/>
          <G clipPath="url(#earthClip)">
            {continents.map((d,i) => <Path key={`ct${i}`} d={d} fill="rgba(33,150,243,0.5)"/>)}
            <Path d={`M${CX-EARTH_R*.65},${CY-EARTH_R*.08} q${EARTH_R*.3},${-EARTH_R*.14} ${EARTH_R*.58},${EARTH_R*.06}`}
              stroke="rgba(255,255,255,0.11)" strokeWidth={3} fill="none" strokeLinecap="round"/>
            <Path d={`M${CX+EARTH_R*.08},${CY+EARTH_R*.48} q${EARTH_R*.22},${-EARTH_R*.1} ${EARTH_R*.42},${EARTH_R*.06}`}
              stroke="rgba(255,255,255,0.07)" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
          </G>
          <Circle cx={CX-EARTH_R*.28} cy={CY-EARTH_R*.28} r={EARTH_R*.3} fill="rgba(255,255,255,0.09)"/>
          <Circle cx={CX} cy={CY} r={EARTH_R} stroke="rgba(100,200,255,0.22)" strokeWidth={1.5} fill="none"/>
          {[0,1,2].map(i => {
            const rr = EARTH_R+8+i*7;
            return <Ellipse key={`er${i}`} cx={CX} cy={CY} rx={rr} ry={rr*0.27}
              stroke={`rgba(0,229,255,${(0.18-i*0.045).toFixed(3)})`}
              strokeWidth={i===0?1:0.5} fill="none"/>;
          })}
          <G rotation={ringAngle} origin={`${CX},${CY}`}>
            <Ellipse cx={CX} cy={CY} rx={EARTH_R+2} ry={(EARTH_R+2)*0.28}
              stroke="rgba(0,229,255,0.08)" strokeWidth={0.5} strokeDasharray="2 5" fill="none"/>
          </G>
          <SvgText x={CX+EARTH_R+4} y={CY-EARTH_R-4}
            fontSize={6} fill="rgba(0,229,255,0.3)" fontFamily="monospace" letterSpacing={2}
          >TERRE</SvgText>

          {/* ── ASTÉROÏDES 3D WIREFRAME ── */}
          {sorted.map(({ x, y, displayR, pulse, alpha, asteroid }) => {
            const isSel  = asteroid.id === selectedId;
            const rgb    = asteroid.rgb;
            const col    = asteroid.color;
            const mesh   = meshes[asteroid.id];

            // Angles de rotation continus
            const ay = tv * (0.80 + asteroid.id * 0.15);
            const ax = tv * (0.28 + asteroid.id * 0.07);

            // Scale 3D = taille visuelle souhaitée dans le radar
            // displayR est le rayon "orbital" — on veut que le mesh soit bien visible
            const scale3D = displayR * 1.05;

            const lx = x + displayR * 1.4 + 4;
            const ly = y - displayR * 0.3;

            return (
              <G key={`ast${asteroid.id}`}>

                {/* ── WIREFRAME 3D — pas de halo ── */}
                <G>{renderMesh(mesh, ax, ay, x, y, scale3D, rgb)}</G>

                {/* Alerte */}
                {asteroid.alert && Math.sin(tv*4) > 0.3 && (
                  <Circle cx={x+displayR*0.9} cy={y-displayR*1.2} r={2.2} fill={col}/>
                )}

                {/* Label — position ancrée sur x,y courant */}
                <Line
                  x1={x+displayR*0.9} y1={y-displayR*0.2}
                  x2={lx-2} y2={ly-2}
                  stroke={`rgba(${rgb},${isSel?.55:.22})`} strokeWidth={0.5}/>
                <SvgText x={lx} y={ly}
                  fontSize={isSel?8:7}
                  fill={`rgba(${rgb},${isSel?1.0:.58})`}
                  fontFamily="monospace" letterSpacing={1}
                  fontWeight={isSel?'bold':'normal'}
                >{asteroid.name}</SvgText>
                {isSel && (
                  <SvgText x={lx} y={ly+10}
                    fontSize={6} fill={`rgba(${rgb},0.45)`}
                    fontFamily="monospace" letterSpacing={1}
                  >{asteroid.cls}</SvgText>
                )}

              </G>
            );
          })}

        </Svg>
      </View>
    </TouchableWithoutFeedback>
  );
}
