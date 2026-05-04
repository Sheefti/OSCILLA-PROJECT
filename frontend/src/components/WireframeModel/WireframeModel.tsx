/**
 * WireframeModel — Optimisé
 *
 * Changements vs version originale :
 *  - subdivLevel 1 (80 faces) au lieu de 2 (320 faces) → 4× moins d'éléments SVG
 *  - Un seul <Polygon> par face (fill + stroke combinés) au lieu de 2 → 2× moins de nodes
 *  - Grille de fond retirée (18 <Line> invisibles à l'œil mais coûteuses)
 *  - Calculs de normale inlinés sans allocation d'objets intermédiaires
 *  - Clés stables basées sur l'index de face, pas sur le contenu
 */

import React, { useMemo } from 'react';
import Svg, { Line, Polygon, Circle, Text as SvgText } from 'react-native-svg';

import { rotateVec3, Vec3 } from '../../math/quaternion';
import type { QuaternionState } from '../../hooks/useQuaternion';
import { Colors } from '../../theme/colors';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TriFace = [number, number, number];

interface ProjectedVertex {
  sx:    number;
  sy:    number;
  depth: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Géométrie — icosphère (calculée 1× par asteroidId)
// ─────────────────────────────────────────────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2;

function baseIcosahedronVertices(): Vec3[] {
  const vs: Vec3[] = [
    [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
    [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
    [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1],
  ];
  return vs.map(normalize3);
}

function normalize3(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  return [v[0]/len, v[1]/len, v[2]/len];
}

const BASE_FACES: TriFace[] = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
];

function subdivide(verts: Vec3[], faces: TriFace[]): { verts: Vec3[]; faces: TriFace[] } {
  const midCache  = new Map<string, number>();
  const newVerts  = [...verts];

  function midpoint(a: number, b: number): number {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (midCache.has(key)) return midCache.get(key)!;
    const va = newVerts[a], vb = newVerts[b];
    const mid = normalize3([(va[0]+vb[0])/2, (va[1]+vb[1])/2, (va[2]+vb[2])/2]);
    const idx = newVerts.length;
    newVerts.push(mid);
    midCache.set(key, idx);
    return idx;
  }

  const newFaces: TriFace[] = [];
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const ca = midpoint(c, a);
    newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  return { verts: newVerts, faces: newFaces };
}

function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * subdivLevel = 1  →  80 faces, 42 sommets  (vs 320 faces niveau 2)
 * Visuellement identique à cette échelle sur mobile.
 */
function buildAsteroid(
  seed: number,
  subdivLevel = 1,   // ← était 2
  deformAmp   = 0.28,
): { verts: Vec3[]; faces: TriFace[] } {
  let verts = baseIcosahedronVertices();
  let faces = BASE_FACES;
  for (let i = 0; i < subdivLevel; i++) {
    ({ verts, faces } = subdivide(verts, faces));
  }
  const rand     = lcg(seed);
  const deformed: Vec3[] = verts.map((v) => {
    const noise = 1 + (rand() - 0.5) * 2 * deformAmp;
    return [v[0]*noise, v[1]*noise, v[2]*noise];
  });
  return { verts: deformed, faces };
}

// ─────────────────────────────────────────────────────────────────────────────
// Projection perspective
// ─────────────────────────────────────────────────────────────────────────────

const FOCAL = 3.2;

function project(v: Vec3, cx: number, cy: number, scale: number): ProjectedVertex {
  const z = v[2] + FOCAL;
  const f = (z > 0.01 ? FOCAL / z : 1) * scale;
  return { sx: cx + v[0]*f, sy: cy - v[1]*f, depth: v[2] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface WireframeModelProps {
  asteroidId: number;
  rotation:   QuaternionState;
  color:      string;
  width:      number;
  height:     number;
  radius?:    number;
}

const LIGHT: Vec3 = normalize3([-0.6, 0.8, 0.5]);

const WireframeModel: React.FC<WireframeModelProps> = ({
  asteroidId, rotation, color, width, height,
  radius = Math.min(width, height) * 0.36,
}) => {
  const cx = width  / 2;
  const cy = height / 2;

  // Géométrie stable — recalculée uniquement si l'ID change
  const { verts: baseVerts, faces } = useMemo(
    () => buildAsteroid(asteroidId, 1, 0.28),
    [asteroidId],
  );

  // Couleur → rgb
  const colorRgb =
    color === Colors.red   ? '255,61,61'  :
    color === Colors.amber ? '255,171,0'  :
                             '0,229,255';

  // Rotation + projection (recalculé chaque frame, inévitable)
  const rotated   = baseVerts.map(v => rotateVec3(v, rotation.q));
  const projected = rotated.map(v => project(v, cx, cy, radius));

  // Infos par face : depth + éclairage
  const faceInfos = faces.map((face) => {
    const [ia, ib, ic] = face;
    const ra = rotated[ia], rb = rotated[ib], rc = rotated[ic];

    // Vecteurs arêtes
    const abx = rb[0]-ra[0], aby = rb[1]-ra[1], abz = rb[2]-ra[2];
    const acx = rc[0]-ra[0], acy = rc[1]-ra[1], acz = rc[2]-ra[2];

    // Normale (produit vectoriel)
    const nx = aby*acz - abz*acy;
    const ny = abz*acx - abx*acz;
    const nz = abx*acy - aby*acx;
    const nl = Math.sqrt(nx**2 + ny**2 + nz**2) || 1;

    const dotLight = Math.max(0, (nx/nl)*LIGHT[0] + (ny/nl)*LIGHT[1] + (nz/nl)*LIGHT[2]);
    const depth    = (ra[2] + rb[2] + rc[2]) / 3;

    return { face, depth, dotLight };
  });

  // Tri arrière→avant
  faceInfos.sort((a, b) => a.depth - b.depth);

  const { roll, pitch, yaw } = rotation.euler;

  return (
    <Svg width={width} height={height}>

      {/* Cercle équatorial de référence */}
      <Circle
        cx={cx} cy={cy}
        r={radius * 1.05}
        fill="none"
        stroke={`rgba(${colorRgb},0.07)`}
        strokeWidth={0.8}
        strokeDasharray="4 6"
      />

      {/* ── Faces — 1 seul <Polygon> par face (fill + stroke) ── */}
      {faceInfos.map(({ face, depth, dotLight }, i) => {
        const [ia, ib, ic] = face;
        const pa = projected[ia], pb = projected[ib], pc = projected[ic];

        const isBack      = depth < -0.85;
        const faceOpacity = isBack ? 0 : Math.min(0.04 + dotLight * 0.13, 0.18);
        const edgeOpacity = isBack ? 0.04 : 0.12 + dotLight * 0.22;

        // Rendu face + arête en un seul élément SVG
        return (
          <Polygon
            key={i}
            points={`${pa.sx.toFixed(1)},${pa.sy.toFixed(1)} ${pb.sx.toFixed(1)},${pb.sy.toFixed(1)} ${pc.sx.toFixed(1)},${pc.sy.toFixed(1)}`}
            fill={`rgba(${colorRgb},${faceOpacity.toFixed(3)})`}
            stroke={`rgba(${colorRgb},${edgeOpacity.toFixed(3)})`}
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        );
      })}

      {/* Glow central */}
      <Circle cx={cx} cy={cy} r={radius*0.18} fill={`rgba(${colorRgb},0.12)`}/>
      <Circle cx={cx} cy={cy} r={radius*0.08} fill={`rgba(${colorRgb},0.3)`}/>

      {/* Réticule */}
      <Line x1={cx-radius*0.22} y1={cy} x2={cx-radius*0.08} y2={cy}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}/>
      <Line x1={cx+radius*0.08} y1={cy} x2={cx+radius*0.22} y2={cy}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}/>
      <Line x1={cx} y1={cy-radius*0.22} x2={cx} y2={cy-radius*0.08}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}/>
      <Line x1={cx} y1={cy+radius*0.08} x2={cx} y2={cy+radius*0.22}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}/>

      {/* HUD Euler */}
      <SvgText
        x={cx-radius*1.4} y={cy+radius*1.38}
        fontSize={8} fontFamily="monospace" letterSpacing={1.5}
        fill={`rgba(${colorRgb},0.35)`}
      >
        {`ROLL ${roll.toFixed(1)}°  PITCH ${pitch.toFixed(1)}°  YAW ${yaw.toFixed(1)}°`}
      </SvgText>

      <SvgText
        x={cx+radius*0.6} y={cy-radius*1.38}
        fontSize={7} fontFamily="monospace" letterSpacing={1}
        fill={`rgba(${colorRgb},0.25)`}
      >
        {`Q-VEC · ${baseVerts.length}V · ${faces.length}F`}
      </SvgText>
    </Svg>
  );
};

export default WireframeModel;
