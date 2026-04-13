export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

export type Vec3 = [number, number, number];

/** Multiplie deux quaternions : q1 ⊗ q2 */
export function multiplyQ(q1: Quaternion, q2: Quaternion): Quaternion {
  return {
    w: q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z,
    x: q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y,
    y: q1.w*q2.y - q1.x*q2.z + q1.y*q2.w + q1.z*q2.x,
    z: q1.w*q2.z + q1.x*q2.y - q1.y*q2.x + q1.z*q2.w,
  };
}

/** Conjugué d'un quaternion (= inverse si normalisé) */
export function conjugateQ(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

/** Norme du quaternion */
export function normQ(q: Quaternion): number {
  return Math.sqrt(q.w**2 + q.x**2 + q.y**2 + q.z**2);
}

/** Normalise le quaternion (norme = 1) */
export function normalizeQ(q: Quaternion): Quaternion {
  const n = normQ(q);
  if (n === 0) return { w: 1, x: 0, y: 0, z: 0 };
  return { w: q.w/n, x: q.x/n, y: q.y/n, z: q.z/n };
}

/**
 * Applique la rotation quaternion à un vecteur 3D.
 * Formule : v' = q ⊗ (0,v) ⊗ q*
 * SANS conversion en angles d'Euler → zéro Gimbal Lock
 */
export function rotateVec3(v: Vec3, q: Quaternion): Vec3 {
  const qNorm = normalizeQ(q);
  // Vecteur comme quaternion pur (w=0)
  const vQ: Quaternion = { w: 0, x: v[0], y: v[1], z: v[2] };
  const result = multiplyQ(multiplyQ(qNorm, vQ), conjugateQ(qNorm));
  return [result.x, result.y, result.z];
}

/** Convertit quaternion → angles d'Euler (AFFICHAGE SEULEMENT, pas pour rotation) */
export function quaternionToEuler(q: Quaternion) {
  const roll  = Math.atan2(2*(q.w*q.x + q.y*q.z), 1 - 2*(q.x**2 + q.y**2));
  const pitch = Math.asin(Math.max(-1, Math.min(1, 2*(q.w*q.y - q.z*q.x))));
  const yaw   = Math.atan2(2*(q.w*q.z + q.x*q.y), 1 - 2*(q.y**2 + q.z**2));
  return {
    roll:  roll  * (180/Math.PI),
    pitch: pitch * (180/Math.PI),
    yaw:   yaw   * (180/Math.PI),
  };
}