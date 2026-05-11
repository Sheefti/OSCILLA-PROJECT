import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Svg, {
  Circle, Ellipse, Line, Path, G,
  Text as SvgText, Defs, RadialGradient, Stop, ClipPath, Polygon,
} from 'react-native-svg';
import { PlanetAsteroidData } from '../../theme/planets';
import { computeOrbitalPosition } from '../../math/orbital';

interface Props {
  width:           number;
  height:          number;
  onAsteroidPress: (asteroid: PlanetAsteroidData) => void;
  selectedId:      number;
  // Données dynamiques injectées par le Dashboard
  asteroids:       PlanetAsteroidData[];
  planetColors:    [string, string, string]; // [col1, col2, col3] gradient planète
  accentRgb:       string;                  // ex: "0,229,255"
  planetKey?:      string;                  // ex: "terre", "mars"
}

// ─── MESH 3D — icosphère déformée ────────────────────────────────────────────
interface Mesh { verts: number[][]; faces: number[][]; }

function genAsteroidMesh(id: number): Mesh {
  const seed = id * 1.37 + 0.5;
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

function project3D(v: number[], ax: number, ay: number, cx: number, cy: number, scale: number) {
  let x = v[0]*Math.cos(ay) - v[2]*Math.sin(ay);
  let z = v[0]*Math.sin(ay) + v[2]*Math.cos(ay);
  const y = v[1];
  const y2 = y*Math.cos(ax) - z*Math.sin(ax);
  const z2 = y*Math.sin(ax) + z*Math.cos(ax);
  const pz = z2 + 3.5;
  return { sx: cx + (x/pz)*scale, sy: cy + (y2/pz)*scale, z2 };
}

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
  proj.forEach((p, vi) => {
    if (p.z2 > 0.5) {
      const a = Math.min(1, (p.z2 - 0.4) * 0.5).toFixed(3);
      els.push(<Circle key={`v${vi}`} cx={p.sx.toFixed(1)} cy={p.sy.toFixed(1)} r={0.9} fill={`rgba(${rgb},${a})`} />);
    }
  });
  return els;
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

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

// ─── Composant ───────────────────────────────────────────────────────────────

export default function OrbitalRadar({
  width, height, onAsteroidPress, selectedId,
  asteroids, planetColors, accentRgb, planetKey = 'terre',
}: Props) {
  const CX = width/2, CY = height/2, PLANET_R = 32;

  const [tv, setTv] = useState(0);
  const tvRef     = useRef(0);
  const astPosRef = useRef<Array<{x:number;y:number;r:number}>>([]);

  useEffect(() => {
    const id = setInterval(() => { tvRef.current += 0.006; setTv(tvRef.current); }, 16);
    return () => clearInterval(id);
  }, []);

  // Remesh quand les astéroïdes changent (nouvelle planète)
  const meshes = useMemo(
    () => asteroids.map(a => genAsteroidMesh(a.id)),
    [asteroids]
  );

  const orbitPaths = useMemo(
    () => asteroids.map(a => buildOrbitPath(a.rx, a.ry, a.tilt, CX, CY)),
    [asteroids, CX, CY]
  );

  const stars      = useRef(buildStars(width, height, 130)).current;
  const continents = useRef(buildContinents(CX, CY, PLANET_R)).current;

  const astFrames = asteroids.map(a => {
    const pos = computeOrbitalPosition(
      { id: a.id, rx: a.rx, ry: a.ry, tilt: a.tilt, speed: a.speed, phase: a.phase },
      tv, CX, CY
    );
    const displayR = (15 + pos.depth * 14) * pos.scale;
    const pulse    = 0.78 + 0.22 * Math.sin(tv * 2.5 + a.id);
    const alpha    = Math.max(0.42, pos.depth);
    return { ...pos, displayR, pulse, alpha, asteroid: a };
  });

  astPosRef.current = astFrames.map(f => ({ x: f.x, y: f.y, r: f.displayR }));
  const sorted = [...astFrames].sort((a, b) => a.depth - b.depth);

  const handleTouch = (e: any) => {
    const { locationX: mx, locationY: my } = e.nativeEvent;
    for (let i = astPosRef.current.length - 1; i >= 0; i--) {
      const p = astPosRef.current[i];
      if (!p) continue;
      if (Math.sqrt((mx-p.x)**2 + (my-p.y)**2) < p.r*1.8+14) {
        onAsteroidPress(asteroids[i]); return;
      }
    }
  };

  const ringAngle = (tv*12)%360;

  // Couleurs planète dynamiques
  const [pCol1, pCol2, pCol3] = planetColors;

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            {planetKey === 'terre' ? (
              <>
                <RadialGradient id="planetCore" cx="35%" cy="30%" r="70%">
                  <Stop offset="0%"   stopColor="#6ec6f5" stopOpacity="1"/>
                  <Stop offset="30%"  stopColor="#1e78d4" stopOpacity="1"/>
                  <Stop offset="70%"  stopColor="#0d3f8a" stopOpacity="1"/>
                  <Stop offset="100%" stopColor="#071e4a" stopOpacity="1"/>
                </RadialGradient>
                <RadialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%"   stopColor="#4aa8ff" stopOpacity="0.14"/>
                  <Stop offset="60%"  stopColor="#1a5bbf" stopOpacity="0.05"/>
                  <Stop offset="100%" stopColor="#0a2050" stopOpacity="0"/>
                </RadialGradient>
              </>
            ) : (
              <>
                <RadialGradient id="planetCore" cx="38%" cy="35%" r="68%">
                  <Stop offset="0%"   stopColor={pCol1} stopOpacity="0.9"/>
                  <Stop offset="40%"  stopColor={pCol2} stopOpacity="1"/>
                  <Stop offset="100%" stopColor={pCol3} stopOpacity="1"/>
                </RadialGradient>
                <RadialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%"   stopColor={pCol1} stopOpacity="0.18"/>
                  <Stop offset="55%"  stopColor={pCol2} stopOpacity="0.07"/>
                  <Stop offset="100%" stopColor={pCol3} stopOpacity="0"/>
                </RadialGradient>
              </>
            )}
            <ClipPath id="planetClip">
              <Circle cx={CX} cy={CY} r={PLANET_R}/>
            </ClipPath>
          </Defs>

          {/* Étoiles */}
          {stars.map((s, i) => (
            <Circle key={`st${i}`} cx={s.x} cy={s.y} r={s.rv}
              fill={`rgba(200,225,255,${s.op.toFixed(2)})`}/>
          ))}



          {/* Orbites */}
          {asteroids.map((a, i) => {
            const isSel  = a.id === selectedId;
            const rgb    = a.rgb;
            const frame  = astFrames.find(f => f.asteroid.id === a.id);
            return (
              <G key={`orb${a.id}`}>
                <Path d={orbitPaths[i]}
                  stroke={`rgba(${rgb},${isSel ? .28 : .08})`}
                  strokeWidth={isSel ? .9 : .4}
                  strokeDasharray={isSel ? undefined : '3 8'}
                  fill="none"/>
                {isSel && frame && (
                  <Circle cx={frame.x} cy={frame.y} r={3.5}
                    fill="none" stroke={`rgba(${rgb},0.8)`} strokeWidth={1}/>
                )}
              </G>
            );
          })}

          {/* Planète centrale */}
          <Circle cx={CX} cy={CY} r={PLANET_R+35} fill="url(#planetGlow)"/>
          {planetKey === 'terre' ? (
            <>
              {/* Halo atmosphérique subtil */}
              <Circle cx={CX} cy={CY} r={PLANET_R+8} fill="rgba(30,90,200,0.04)"/>
              <Circle cx={CX} cy={CY} r={PLANET_R+4} fill="rgba(50,120,220,0.07)"/>
              <Circle cx={CX} cy={CY} r={PLANET_R+1.5} fill="rgba(80,150,240,0.12)"/>

              {/* Corps — océan bleu profond */}
              <Circle cx={CX} cy={CY} r={PLANET_R} fill="url(#planetCore)"/>

              <G clipPath="url(#planetClip)">
                {/* Ombre nuit — côté droit */}
                <Circle cx={CX+PLANET_R*0.68} cy={CY} r={PLANET_R}
                  fill="rgba(0,4,18,0.42)"/>

                {/* — CONTINENTS petits et précis — */}

                {/* Europe / Asie ouest (petit bloc nord) */}
                <Path d={`
                  M${CX+PLANET_R*.04},${CY-PLANET_R*.50}
                  c${PLANET_R*.10},${-PLANET_R*.04} ${PLANET_R*.22},${-PLANET_R*.02} ${PLANET_R*.26},${PLANET_R*.06}
                  c${PLANET_R*.04},${PLANET_R*.08} ${-PLANET_R*.02},${PLANET_R*.14} ${-PLANET_R*.10},${PLANET_R*.16}
                  c${-PLANET_R*.10},${PLANET_R*.02} ${-PLANET_R*.20},${-PLANET_R*.04} ${-PLANET_R*.22},${-PLANET_R*.12}
                  c${-PLANET_R*.02},${-PLANET_R*.06} ${PLANET_R*.06},${-PLANET_R*.10} ${PLANET_R*.06},${-PLANET_R*.10} Z
                `} fill="rgba(48,95,52,0.92)"/>

                {/* Asie centrale / est */}
                <Path d={`
                  M${CX+PLANET_R*.26},${CY-PLANET_R*.48}
                  c${PLANET_R*.14},${-PLANET_R*.06} ${PLANET_R*.28},${PLANET_R*.00} ${PLANET_R*.28},${PLANET_R*.10}
                  c${PLANET_R*.00},${PLANET_R*.10} ${-PLANET_R*.10},${PLANET_R*.16} ${-PLANET_R*.22},${PLANET_R*.14}
                  c${-PLANET_R*.12},${-PLANET_R*.02} ${-PLANET_R*.18},${-PLANET_R*.10} ${-PLANET_R*.14},${-PLANET_R*.18}
                  c${PLANET_R*.04},${-PLANET_R*.06} ${PLANET_R*.08},${-PLANET_R*.06} ${PLANET_R*.08},${-PLANET_R*.06} Z
                `} fill="rgba(44,88,48,0.88)"/>

                {/* Afrique — forme effilée vers le bas */}
                <Path d={`
                  M${CX+PLANET_R*.10},${CY-PLANET_R*.08}
                  c${PLANET_R*.08},${-PLANET_R*.04} ${PLANET_R*.16},${PLANET_R*.00} ${PLANET_R*.16},${PLANET_R*.10}
                  c${PLANET_R*.00},${PLANET_R*.12} ${-PLANET_R*.04},${PLANET_R*.24} ${-PLANET_R*.10},${PLANET_R*.32}
                  c${-PLANET_R*.04},${PLANET_R*.06} ${-PLANET_R*.10},${PLANET_R*.06} ${-PLANET_R*.14},${PLANET_R*.00}
                  c${-PLANET_R*.06},${-PLANET_R*.10} ${-PLANET_R*.06},${-PLANET_R*.24} ${-PLANET_R*.02},${-PLANET_R*.34}
                  c${PLANET_R*.04},${-PLANET_R*.08} ${PLANET_R*.10},${-PLANET_R*.08} ${PLANET_R*.10},${-PLANET_R*.08} Z
                `} fill="rgba(56,104,46,0.85)"/>

                {/* Amérique du Nord — compact */}
                <Path d={`
                  M${CX-PLANET_R*.48},${CY-PLANET_R*.38}
                  c${PLANET_R*.08},${-PLANET_R*.08} ${PLANET_R*.18},${-PLANET_R*.06} ${PLANET_R*.20},${PLANET_R*.04}
                  c${PLANET_R*.02},${PLANET_R*.10} ${-PLANET_R*.02},${PLANET_R*.22} ${-PLANET_R*.08},${PLANET_R*.28}
                  c${-PLANET_R*.08},${PLANET_R*.08} ${-PLANET_R*.18},${PLANET_R*.06} ${-PLANET_R*.20},${-PLANET_R*.04}
                  c${-PLANET_R*.04},${-PLANET_R*.12} ${PLANET_R*.00},${-PLANET_R*.24} ${PLANET_R*.08},${-PLANET_R*.28} Z
                `} fill="rgba(52,100,50,0.83)"/>

                {/* Amérique du Sud */}
                <Path d={`
                  M${CX-PLANET_R*.34},${CY+PLANET_R*.10}
                  c${PLANET_R*.08},${-PLANET_R*.04} ${PLANET_R*.14},${PLANET_R*.02} ${PLANET_R*.12},${PLANET_R*.14}
                  c${-PLANET_R*.02},${PLANET_R*.14} ${-PLANET_R*.08},${PLANET_R*.24} ${-PLANET_R*.14},${PLANET_R*.22}
                  c${-PLANET_R*.08},${-PLANET_R*.02} ${-PLANET_R*.10},${-PLANET_R*.14} ${-PLANET_R*.08},${-PLANET_R*.26}
                  c${PLANET_R*.02},${-PLANET_R*.10} ${PLANET_R*.10},${-PLANET_R*.10} ${PLANET_R*.10},${-PLANET_R*.10} Z
                `} fill="rgba(48,96,46,0.80)"/>

                {/* Australie — petit bloc */}
                <Path d={`
                  M${CX+PLANET_R*.40},${CY+PLANET_R*.26}
                  c${PLANET_R*.08},${-PLANET_R*.02} ${PLANET_R*.14},${PLANET_R*.04} ${PLANET_R*.12},${PLANET_R*.12}
                  c${-PLANET_R*.02},${PLANET_R*.08} ${-PLANET_R*.10},${PLANET_R*.10} ${-PLANET_R*.16},${PLANET_R*.06}
                  c${-PLANET_R*.06},${-PLANET_R*.06} ${-PLANET_R*.04},${-PLANET_R*.14} ${PLANET_R*.04},${-PLANET_R*.18} Z
                `} fill="rgba(60,106,44,0.78)"/>


              </G>



              {/* Anneau atmosphérique — très fin */}
              <Circle cx={CX} cy={CY} r={PLANET_R}
                stroke="rgba(140,210,255,0.40)" strokeWidth={1} fill="none"/>
              <Circle cx={CX} cy={CY} r={PLANET_R+2.5}
                stroke="rgba(100,175,255,0.16)" strokeWidth={1.5} fill="none"/>
              <Circle cx={CX} cy={CY} r={PLANET_R+5}
                stroke="rgba(70,140,230,0.07)" strokeWidth={2} fill="none"/>
            </>
          ) : (
            <>
              <Circle cx={CX} cy={CY} r={PLANET_R+10} fill={`rgba(${accentRgb},0.06)`}/>
              <Circle cx={CX} cy={CY} r={PLANET_R+6}  fill={`rgba(${accentRgb},0.09)`}/>
              <Circle cx={CX} cy={CY} r={PLANET_R+3}  fill={`rgba(${accentRgb},0.12)`}/>
              <Circle cx={CX} cy={CY} r={PLANET_R} fill="url(#planetCore)"/>
              <G clipPath="url(#planetClip)">
                {continents.map((d, i) => (
                  <Path key={`ct${i}`} d={d} fill={`rgba(${accentRgb},0.28)`}/>
                ))}
                <Path
                  d={`M${CX-PLANET_R*.65},${CY-PLANET_R*.08} q${PLANET_R*.3},${-PLANET_R*.14} ${PLANET_R*.58},${PLANET_R*.06}`}
                  stroke="rgba(255,255,255,0.11)" strokeWidth={3} fill="none" strokeLinecap="round"/>
              </G>
              <Circle cx={CX-PLANET_R*.28} cy={CY-PLANET_R*.28} r={PLANET_R*.3}
                fill="rgba(255,255,255,0.09)"/>
              <Circle cx={CX} cy={CY} r={PLANET_R}
                stroke={`rgba(${accentRgb},0.22)`} strokeWidth={1.5} fill="none"/>
            </>
          )}

          {/* Anneaux orbitaux */}
          {[0,1,2].map(i => {
            const rr = PLANET_R+8+i*7;
            return <Ellipse key={`er${i}`} cx={CX} cy={CY} rx={rr} ry={rr*0.27}
              stroke={`rgba(${accentRgb},${(0.18-i*0.045).toFixed(3)})`}
              strokeWidth={i===0?1:0.5} fill="none"/>;
          })}
          <G rotation={ringAngle} origin={`${CX},${CY}`}>
            <Ellipse cx={CX} cy={CY} rx={PLANET_R+2} ry={(PLANET_R+2)*0.28}
              stroke={`rgba(${accentRgb},0.08)`} strokeWidth={0.5}
              strokeDasharray="2 5" fill="none"/>
          </G>

          {/* Label planète */}
          <SvgText x={CX+PLANET_R+4} y={CY-PLANET_R-4}
            fontSize={6} fill={`rgba(${accentRgb},0.3)`}
            fontFamily="monospace" letterSpacing={2}
          >{asteroids.length > 0 ? '' : 'CHARGEMENT'}</SvgText>

          {/* Astéroïdes 3D Wireframe */}
          {sorted.map(({ x, y, displayR, asteroid }, frameIdx) => {
            const isSel  = asteroid.id === selectedId;
            const rgb    = asteroid.rgb;
            const mesh   = meshes[frameIdx] ?? meshes[0];
            if (!mesh) return null;

            const ay = tv * (0.80 + asteroid.id * 0.15);
            const ax = tv * (0.28 + asteroid.id * 0.07);
            const scale3D = displayR * 1.05;
            const lx = x + displayR * 1.4 + 4;
            const ly = y - displayR * 0.3;

            return (
              <G key={`ast${asteroid.id}_${asteroid.name}`}>
                <G>{renderMesh(mesh, ax, ay, x, y, scale3D, rgb)}</G>

                {asteroid.alert && Math.sin(tv*4) > 0.3 && (
                  <Circle cx={x+displayR*0.9} cy={y-displayR*1.2} r={2.2} fill={asteroid.color}/>
                )}

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