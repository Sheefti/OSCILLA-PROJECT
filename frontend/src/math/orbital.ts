export interface AsteroidOrbitParams {
  id:    number;
  rx:    number;
  ry:    number;
  tilt:  number;
  speed: number;
  phase: number;
}

export interface OrbitalPosition {
  x:     number;
  y:     number;
  depth: number;
  scale: number;
}

export function computeOrbitalPosition(
  params: AsteroidOrbitParams,
  t: number,
  centerX: number,
  centerY: number
): OrbitalPosition {
  const ang  = t * params.speed + params.phase;
  const xL   = params.rx * Math.cos(ang);
  const yL   = params.ry * Math.sin(ang);
  const tr   = params.tilt * (Math.PI / 180);

  const xW   = xL * Math.cos(tr) - yL * Math.sin(tr);
  const yW   = xL * Math.sin(tr) + yL * Math.cos(tr);

  const z     = Math.sin(ang + params.phase * 0.3);
  const depth = (z + 1) / 2;
  const scale = 0.55 + depth * 0.7;

  return { x: centerX + xW, y: centerY + yW, depth, scale };
}