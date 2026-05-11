/**
 * WireframeModel.tsx
 *
 * Rendu 3D haute performance de l'astéroïde via @react-three/fiber/native.
 *
 * Corrections v2 :
 *  - Imports nommés Three.js  → corrige ts(7016) "implicitly has any type"
 *    (plus besoin de `import * as THREE from 'three'`)
 *  - `rotation` retiré des props internes de AsteroidMesh — la boucle R3F
 *    (useFrame) est indépendante du hook useQuaternion React Native.
 *    Le prop `rotation: QuaternionState` est conservé sur WireframeModelProps
 *    pour compatibilité de signature avec AsteroidInspector, mais n'est pas
 *    transmis au Canvas (les angles Euler sont affichés dans le HUD natif).
 *
 * Install :
 *   npx expo install three @react-three/fiber
 *   npm i --save-dev @types/three          ← résout définitivement ts(7016)
 */

import React, { useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import {
  IcosahedronGeometry,
  SphereGeometry,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  MeshBasicMaterial,
  MeshLambertMaterial,
  LineBasicMaterial,
  Color,
  Quaternion as ThreeQuaternion,
  Vector3,
  FrontSide,
  BackSide,
  PerspectiveCamera,
  Mesh,
  PointsMaterial,
  Points,
} from 'three';

import type { QuaternionState } from '../../hooks/useQuaternion';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface WireframeModelProps {
  /** Seed de déformation → forme unique et déterministe par astéroïde */
  asteroidId: number;
  /**
   * Quaternion issu du hook useQuaternion (RN side).
   * Reçu pour compatibilité de signature — la rotation 3D est gérée par
   * useFrame à l'intérieur du Canvas (60 fps natifs, sans re-render React).
   * Les euler angles sont affichés dans le HUD natif de AsteroidInspector.
   */
  rotation:   QuaternionState;
  /** Couleur hex : '#c8a84b' (amber) | '#cc3333' (red) | '#ffffff' */
  color:      string;
  width:      number;
  height:     number;
}

function buildDeformedGeometry(seed: number): BufferGeometry {
  // LCG (Random Number Generator)
  const rng = (s: number) => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return s;
  };

  let s = seed | 0;
  const numVerts = 52;
  const verts: number[][] = [];

  for (let i = 0; i < numVerts; i++) {
    s = rng(s + i * 1337);
    const theta = ((s % 1000) / 1000) * Math.PI * 2;
    s = rng(s);
    const phi = Math.acos(2 * ((s % 1000) / 1000) - 1);
    s = rng(s);
    const r = 0.7 + ((s % 1000) / 1000) * 0.65;
    // Low-frequency deformation for cratered look
    const lf = 1.0 + 0.35 * Math.sin(theta * 2.1 + phi * 1.7) + 0.18 * Math.sin(theta * 4.3 - phi * 3.1);
    
    verts.push([
      Math.sin(phi) * Math.cos(theta) * r * lf,
      Math.sin(phi) * Math.sin(theta) * r * lf,
      Math.cos(phi) * r * lf,
    ]);
  }

  // Build edges
  const edges = new Set<string>();
  for (let i = 0; i < verts.length; i++) {
    const dists = verts.map((v, j) => ({
      j,
      d: Math.hypot(verts[i][0] - v[0], verts[i][1] - v[1], verts[i][2] - v[2])
    })).filter(x => x.j !== i).sort((a, b) => a.d - b.d);
    
    for (let k = 0; k < Math.min(5, dists.length); k++) {
      const key = [i, dists[k].j].sort((a, b) => a - b).join('-');
      edges.add(key);
    }
  }
  const edgeList = Array.from(edges).map(e => e.split('-').map(Number));

  // Build faces
  const adj: Record<number, Set<number>> = {};
  for (const [a, b] of edgeList) {
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  }

  const faces: number[][] = [];
  for (const [a, b] of edgeList) {
    for (const c of adj[a]) {
      if (c !== b && adj[b].has(c)) {
        faces.push([a, b, c]);
      }
    }
  }

  // Dedupe faces
  const seen = new Set<string>();
  const finalFaces = faces.filter(f => {
    const k = f.slice().sort((a, b) => a - b).join('-');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Construct BufferGeometry
  const geom = new BufferGeometry();
  
  const positions = new Float32Array(verts.length * 3);
  for (let i = 0; i < verts.length; i++) {
    positions[i * 3]     = verts[i][0];
    positions[i * 3 + 1] = verts[i][1];
    positions[i * 3 + 2] = verts[i][2];
  }
  geom.setAttribute('position', new BufferAttribute(positions, 3));

  const indices = [];
  for (const f of finalFaces) {
    indices.push(f[0], f[1], f[2]);
  }
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

// ─────────────────────────────────────────────────────────────────────────────
// parseColor — hex → Three.Color avec fallback amber
// ─────────────────────────────────────────────────────────────────────────────

function parseColor(hex: string): Color {
  try {
    // Si la couleur est au format rgba(r,g,b,a), on la convertit en rgb(r,g,b)
    // car THREE.Color ne supporte pas le canal alpha (cela génère un warning).
    if (hex.startsWith('rgba')) {
      const rgb = hex.replace(/rgba?(\([^,]+,[^,]+,[^,]+),[^)]+\)/, 'rgb$1)');
      return new Color(rgb);
    }
    return new Color(hex);
  } catch {
    return new Color('#c8a84b');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AsteroidMesh
// ─────────────────────────────────────────────────────────────────────────────

interface AsteroidMeshProps {
  asteroidId: number;
  color:      string;
}

function AsteroidMesh({ asteroidId, color }: AsteroidMeshProps): React.ReactElement {
  const wireRef = useRef<Mesh>(null!);
  const faceRef = useRef<Mesh>(null!);
  const pointsRef = useRef<Points>(null!);

  const geometry   = useMemo(() => buildDeformedGeometry(asteroidId), [asteroidId]);
  const threeColor = useMemo(() => parseColor(color), [color]);

  // Matériau wireframe — MeshBasicMaterial (éclairage ignoré, toujours lisible)
  const wireMat = useMemo(
    () => new MeshBasicMaterial({
      color: threeColor, wireframe: true, transparent: true, opacity: 0.55, depthWrite: false,
    }),
    [threeColor],
  );

  // Matériau faces — remplissage léger pour la perception de volume
  const faceMat = useMemo(
    () => new MeshLambertMaterial({
      color: threeColor, transparent: true, opacity: 0.04, side: FrontSide, depthWrite: false,
    }),
    [threeColor],
  );

  // Matériau points (sommets lumineux)
  const pointsMat = useMemo(
    () => new PointsMaterial({
      color: threeColor, size: 2.5, transparent: true, opacity: 0.9, sizeAttenuation: false, depthWrite: false,
    }),
    [threeColor],
  );

  // Quaternion Three.js mutable — pas de re-render à chaque frame
  const tq = useRef(new ThreeQuaternion());

  // Delta-quaternions constants (vitesses en rad/frame @ 60 fps)
  const dqY = useMemo(() => new ThreeQuaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0.005),  []);
  const dqX = useMemo(() => new ThreeQuaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.0018), []);
  const dqZ = useMemo(() => new ThreeQuaternion().setFromAxisAngle(new Vector3(0, 0, 1), 0.0009), []);

  // Boucle 60 fps — composition quaternion puis synchronisation des meshes
  useFrame(() => {
    tq.current.multiply(dqY).multiply(dqX).multiply(dqZ).normalize();
    wireRef.current?.quaternion.copy(tq.current);
    faceRef.current?.quaternion.copy(tq.current);
    pointsRef.current?.quaternion.copy(tq.current);
  });

  return (
    <group scale={[0.6, 0.6, 0.6]}>
      {/* 1. Faces translucides — renderOrder 0 (fond) */}
      <mesh ref={faceRef} geometry={geometry} material={faceMat} renderOrder={0} />

      {/* 2. Wireframe par-dessus */}
      <mesh ref={wireRef} geometry={geometry} material={wireMat} renderOrder={1} />

      {/* 3. Points lumineux aux sommets */}
      <points ref={pointsRef} geometry={geometry} material={pointsMat} renderOrder={2} />

    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SceneLights
// ─────────────────────────────────────────────────────────────────────────────

function SceneLights({ color }: { color: string }): React.ReactElement {
  const c = useMemo(() => parseColor(color), [color]);
  return (
    <>
      <ambientLight     color={c} intensity={0.15} />
      <directionalLight color={c} intensity={1.2} position={[-2,  2.5,  3]} />
      <directionalLight color={c} intensity={0.3} position={[ 2, -1.5, -2]} />
      <pointLight       color={c} intensity={0.6} distance={3} decay={2} position={[0, 0, 0]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HoloGrid — grille de fond holographique (lineSegments)
// ─────────────────────────────────────────────────────────────────────────────

function HoloGrid({ color }: { color: string }): React.ReactElement {
  const c = useMemo(() => parseColor(color), [color]);

  const mat = useMemo(
    () => new LineBasicMaterial({ color: c, transparent: true, opacity: 0.04, depthWrite: false }),
    [c],
  );

  const geo = useMemo(() => {
    const pts: number[] = [];
    const R = 2.5, S = 0.35, Z = -1.5;
    for (let v = -R; v <= R + 0.001; v += S) { pts.push(-R, v, Z, R, v, Z); }
    for (let u = -R; u <= R + 0.001; u += S) { pts.push(u, -R, Z, u, R, Z); }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return <lineSegments geometry={geo} material={mat} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CameraSetup — aspect ratio + position
// ─────────────────────────────────────────────────────────────────────────────

function CameraSetup({ width, height }: { width: number; height: number }): null {
  const { camera } = useThree();
  useMemo(() => {
    const cam = camera as PerspectiveCamera;
    cam.aspect = width / (height || 1);
    cam.fov    = 42;
    cam.near   = 0.1;
    cam.far    = 50;
    cam.position.set(0, 0, 3.2);
    cam.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// WireframeModel — export principal
// ─────────────────────────────────────────────────────────────────────────────

export default function WireframeModel({
  asteroidId,
  color,
  width,
  height,
  // rotation : reçu pour compatibilité de signature mais non transmis au Canvas.
  // useFrame gère sa propre boucle 60 fps indépendante du thread JS React Native.
}: WireframeModelProps): React.ReactElement {
  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <Canvas
        style={{ width, height }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // fond transparent → noir du View parent
        }}
      >
        <CameraSetup width={width} height={height} />
        <SceneLights  color={color} />
        <AsteroidMesh asteroidId={asteroidId} color={color} />
      </Canvas>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    zIndex: 0, // les overlays HUD natifs (coins, textes) ont zIndex > 0
  },
});