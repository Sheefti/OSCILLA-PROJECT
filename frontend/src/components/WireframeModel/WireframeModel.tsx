/**
 * WireframeModel
 *
 * Icosphère procédurale déformée rendue en SVG via react-native-svg.
 * Rotation temps réel sans Gimbal Lock grâce aux quaternions purs.
 *
 * Algorithme :
 *  1. Génération d'une icosphère de subdivision niveau 2
 *  2. Déformation radiale aléatoire (seed basé sur l'ID) → aspect rocheux
 *  3. Projection perspective simple (focal distance)
 *  4. Tri des faces par profondeur (painter's algorithm)
 *  5. Rendu SVG : faces + arêtes + glow occulté par la profondeur
 */

import React, { useMemo } from 'react';
import Svg, { Line, Polygon, Circle, Text as SvgText } from 'react-native-svg';

import { rotateVec3, Vec3 } from '../../math/quaternion';
import type { QuaternionState } from '../../hooks/useQuaternion';
import { Colors } from '../../theme/colors';

// ─────────────────────────────────────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────────────────────────────────────

type TriFace = [number, number, number]; // indices dans le tableau de sommets

interface ProjectedVertex {
  sx: number; // screen x
  sy: number; // screen y
  depth: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Génération de l'icosphère (procédural, ∅ dépendance externe)
// ─────────────────────────────────────────────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2;

/** 12 sommets du dodécaèdre régulier normalisés → base icosphère niveau 1 */
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

/** 20 faces de l'icosaèdre de base (indices dans le tableau de sommets) */
const BASE_FACES: TriFace[] = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
];

/** Subdivise une fois : chaque triangle → 4 triangles */
function subdivide(verts: Vec3[], faces: TriFace[]): { verts: Vec3[]; faces: TriFace[] } {
  const midCache = new Map<string, number>();
  const newVerts = [...verts];

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

/** LCG pseudo-aléatoire déterministe (seed entier) → float [0,1] */
function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Construit l'icosphère finale avec déformation radiale.
 * `subdivLevel` : 0 = ico 20 faces · 1 = 80 faces · 2 = 320 faces
 */
function buildAsteroid(
  seed: number,
  subdivLevel = 2,
  deformAmp = 0.22,
): { verts: Vec3[]; faces: TriFace[] } {
  let verts = baseIcosahedronVertices();
  let faces = BASE_FACES;
  for (let i = 0; i < subdivLevel; i++) {
    ({ verts, faces } = subdivide(verts, faces));
  }

  const rand = lcg(seed);
  // Déformation radiale unique par sommet — même seed → même forme
  const deformed: Vec3[] = verts.map((v) => {
    const noise = 1 + (rand() - 0.5) * 2 * deformAmp;
    return [v[0] * noise, v[1] * noise, v[2] * noise];
  });

  return { verts: deformed, faces };
}

// ─────────────────────────────────────────────────────────────────────────────
// Projection perspective
// ─────────────────────────────────────────────────────────────────────────────

const FOCAL = 3.2; // distance focale (unités de l'objet)

function project(v: Vec3, cx: number, cy: number, scale: number): ProjectedVertex {
  const z = v[2] + FOCAL;
  const f = (z > 0.01 ? FOCAL / z : 1) * scale;
  return {
    sx:    cx + v[0] * f,
    sy:    cy - v[1] * f, // y inversé (SVG haut = 0)
    depth: v[2],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props & Composant
// ─────────────────────────────────────────────────────────────────────────────

interface WireframeModelProps {
  /** ID de l'astéroïde — seed de la déformation */
  asteroidId: number;
  /** Quaternion courant issu du hook useQuaternion */
  rotation: QuaternionState;
  /** Couleur principale (amber, red ou cyan selon alerte) */
  color: string;
  /** Dimensions du canvas SVG */
  width: number;
  height: number;
  /** Rayon de l'objet en pixels (avant projection) */
  radius?: number;
}

const WireframeModel: React.FC<WireframeModelProps> = ({
  asteroidId,
  rotation,
  color,
  width,
  height,
  radius = Math.min(width, height) * 0.36,
}) => {
  const cx = width  / 2;
  const cy = height / 2;

  // Géométrie (re-générée uniquement si l'ID change)
  const { verts: baseVerts, faces } = useMemo(
    () => buildAsteroid(asteroidId, 2, 0.22),
    [asteroidId],
  );

  // ── Rotation + projection ─────────────────────────────────────────────────
  const rotated: Vec3[]           = baseVerts.map((v) => rotateVec3(v, rotation.q));
  const projected: ProjectedVertex[] = rotated.map((v) => project(v, cx, cy, radius));

  // ── Calcul de la normale de chaque face (éclairage + painter's algo) ──────
  interface FaceInfo {
    face: TriFace;
    depth: number;         // profondeur moyenne
    dotLight: number;      // produit scalaire avec source lumineuse
  }

  const LIGHT: Vec3 = normalize3([-0.6, 0.8, 0.5]); // direction lumineuse

  const faceInfos: FaceInfo[] = faces.map((face) => {
    const [ia, ib, ic] = face;
    const ra = rotated[ia], rb = rotated[ib], rc = rotated[ic];

    // Vecteurs des arêtes
    const ab: Vec3 = [rb[0]-ra[0], rb[1]-ra[1], rb[2]-ra[2]];
    const ac: Vec3 = [rc[0]-ra[0], rc[1]-ra[1], rc[2]-ra[2]];

    // Normale (produit vectoriel)
    const nx = ab[1]*ac[2] - ab[2]*ac[1];
    const ny = ab[2]*ac[0] - ab[0]*ac[2];
    const nz = ab[0]*ac[1] - ab[1]*ac[0];
    const nl = Math.sqrt(nx**2 + ny**2 + nz**2) || 1;
    const n: Vec3 = [nx/nl, ny/nl, nz/nl];

    const dotLight = Math.max(0, n[0]*LIGHT[0] + n[1]*LIGHT[1] + n[2]*LIGHT[2]);
    const depth    = (ra[2] + rb[2] + rc[2]) / 3;

    return { face, depth, dotLight };
  });

  // Tri back-to-front (painter's algorithm)
  faceInfos.sort((a, b) => a.depth - b.depth);

  // ── Parse couleur principale → rgb ───────────────────────────────────────
  // Valeurs de fallback par couleur connue
  const colorRgb =
    color === Colors.red   ? '255,61,61'   :
    color === Colors.amber ? '255,171,0'   :
                             '0,229,255';

  // ── Euler pour l'overlay HUD ─────────────────────────────────────────────
  const { roll, pitch, yaw } = rotation.euler;

  // ── Rendu ────────────────────────────────────────────────────────────────
  return (
    <Svg width={width} height={height}>

      {/* Grille de fond — effet holographique */}
      {Array.from({ length: 9 }, (_, i) => (
        <Line
          key={`hg-${i}`}
          x1={cx - radius * 1.5 + i * (radius * 3 / 8)}
          y1={cy - radius * 1.5}
          x2={cx - radius * 1.5 + i * (radius * 3 / 8)}
          y2={cy + radius * 1.5}
          stroke={`rgba(${colorRgb},0.04)`}
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Line
          key={`hv-${i}`}
          x1={cx - radius * 1.5}
          y1={cy - radius * 1.5 + i * (radius * 3 / 8)}
          x2={cx + radius * 1.5}
          y2={cy - radius * 1.5 + i * (radius * 3 / 8)}
          stroke={`rgba(${colorRgb},0.04)`}
          strokeWidth={0.5}
        />
      ))}

      {/* Cercle équatorial de référence */}
      <Circle
        cx={cx} cy={cy}
        r={radius * 1.05}
        fill="none"
        stroke={`rgba(${colorRgb},0.07)`}
        strokeWidth={0.8}
        strokeDasharray="4 6"
      />

      {/* ── Faces (painter's algo, arrière → avant) ── */}
      {faceInfos.map(({ face, depth, dotLight }, i) => {
        const [ia, ib, ic] = face;
        const pa = projected[ia], pb = projected[ib], pc = projected[ic];

        // Face visible uniquement si elle fait face à la caméra (z culling léger)
        const isBack = depth < -0.85;

        // Opacité face : ambiant + diffus directionnel
        const ambient = 0.04;
        const faceOpacity = isBack ? 0 : Math.min(ambient + dotLight * 0.13, 0.18);

        // Opacité arête : moins visible à l'arrière
        const edgeOpacity = isBack ? 0.04 : 0.12 + dotLight * 0.22;

        const points = `${pa.sx},${pa.sy} ${pb.sx},${pb.sy} ${pc.sx},${pc.sy}`;

        return (
          <React.Fragment key={i}>
            {/* Remplissage face */}
            <Polygon
              points={points}
              fill={`rgba(${colorRgb},${faceOpacity.toFixed(3)})`}
              stroke="none"
            />
            {/* Arête (wireframe) */}
            <Polygon
              points={points}
              fill="none"
              stroke={`rgba(${colorRgb},${edgeOpacity.toFixed(3)})`}
              strokeWidth={0.6}
              strokeLinejoin="round"
            />
          </React.Fragment>
        );
      })}

      {/* ── Glow central (halo holographique) ── */}
      <Circle
        cx={cx} cy={cy}
        r={radius * 0.18}
        fill={`rgba(${colorRgb},0.12)`}
      />
      <Circle
        cx={cx} cy={cy}
        r={radius * 0.08}
        fill={`rgba(${colorRgb},0.3)`}
      />

      {/* ── Réticule de ciblage ── */}
      {/* Horizontal */}
      <Line
        x1={cx - radius * 0.22} y1={cy}
        x2={cx - radius * 0.08} y2={cy}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}
      />
      <Line
        x1={cx + radius * 0.08} y1={cy}
        x2={cx + radius * 0.22} y2={cy}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}
      />
      {/* Vertical */}
      <Line
        x1={cx} y1={cy - radius * 0.22}
        x2={cx} y2={cy - radius * 0.08}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}
      />
      <Line
        x1={cx} y1={cy + radius * 0.08}
        x2={cx} y2={cy + radius * 0.22}
        stroke={`rgba(${colorRgb},0.5)`} strokeWidth={0.8}
      />

      {/* ── Overlay HUD — angles quaternion (affichage uniquement) ── */}
      <SvgText
        x={cx - radius * 1.4} y={cy + radius * 1.38}
        fontSize={8} fontFamily="monospace" letterSpacing={1.5}
        fill={`rgba(${colorRgb},0.35)`}
      >
        {`ROLL ${roll.toFixed(1)}°  PITCH ${pitch.toFixed(1)}°  YAW ${yaw.toFixed(1)}°`}
      </SvgText>

      {/* Label résolution */}
      <SvgText
        x={cx + radius * 0.6} y={cy - radius * 1.38}
        fontSize={7} fontFamily="monospace" letterSpacing={1}
        fill={`rgba(${colorRgb},0.25)`}
      >
        {`Q-VEC · ${baseVerts.length}V · ${faces.length}F`}
      </SvgText>
    </Svg>
  );
};

export default WireframeModel;
