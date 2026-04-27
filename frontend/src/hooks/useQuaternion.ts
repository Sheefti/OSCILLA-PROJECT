import { useRef, useEffect, useState } from 'react';
import {
  Quaternion,
  multiplyQ,
  normalizeQ,
  quaternionToEuler,
} from '../math/quaternion';

export interface QuaternionState {
  q: Quaternion;
  euler: { roll: number; pitch: number; yaw: number };
}

const IDENTITY: Quaternion = { w: 1, x: 0, y: 0, z: 0 };

/**
 * Construit un quaternion de rotation autour d'un axe normalisé (ax, ay, az)
 * pour un angle donné (rad).
 */
function fromAxisAngle(ax: number, ay: number, az: number, angle: number): Quaternion {
  const s = Math.sin(angle / 2);
  return normalizeQ({ w: Math.cos(angle / 2), x: ax * s, y: ay * s, z: az * s });
}

/**
 * useQuaternion
 *
 * Effectue une rotation continue via `requestAnimationFrame`.
 * - `speedX`, `speedY`, `speedZ` : vitesses angulaires en rad/s sur chaque axe.
 * - Retourne le quaternion courant + les angles d'Euler (pour affichage HUD).
 */
export function useQuaternion(
  speedX = 0.12,
  speedY = 0.28,
  speedZ = 0.05
): QuaternionState {
  const qRef   = useRef<Quaternion>(IDENTITY);
  const lastTs = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const [state, setState] = useState<QuaternionState>({
    q:     IDENTITY,
    euler: { roll: 0, pitch: 0, yaw: 0 },
  });

  useEffect(() => {
    function tick(ts: number) {
      if (lastTs.current === null) lastTs.current = ts;
      const dt = Math.min((ts - lastTs.current) / 1000, 0.05); // cap à 50 ms
      lastTs.current = ts;

      // Incrément de rotation différentiel pour chaque axe
      const dqX = fromAxisAngle(1, 0, 0, speedX * dt);
      const dqY = fromAxisAngle(0, 1, 0, speedY * dt);
      const dqZ = fromAxisAngle(0, 0, 1, speedZ * dt);

      // Composition : q' = dqZ ⊗ dqY ⊗ dqX ⊗ q  (ordre rotation locale)
      const delta = normalizeQ(multiplyQ(dqZ, multiplyQ(dqY, dqX)));
      qRef.current = normalizeQ(multiplyQ(delta, qRef.current));

      setState({
        q:     qRef.current,
        euler: quaternionToEuler(qRef.current),
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speedX, speedY, speedZ]);

  return state;
}
