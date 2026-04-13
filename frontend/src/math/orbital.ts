export interface AsteroidOrbitParams {
  id:    number;
  rx:    number;   // demi-grand axe pixels
  ry:    number;   // demi-petit axe pixels
  tilt:  number;   // inclinaison en degrés
  speed: number;   // rad/frame
  phase: number;   // phase initiale rad
}

export interface OrbitalPosition {
  x:     number;
  y:     number;
  depth: number;   // [0..1] pour scale et opacité
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

  // Rotation d'inclinaison
  const xW   = xL * Math.cos(tr) - yL * Math.sin(tr);
  const yW   = xL * Math.sin(tr) + yL * Math.cos(tr);

  // Profondeur simulée (sin donne l'illusion avant/arrière)
  const z     = Math.sin(ang + params.phase * 0.3);
  const depth = (z + 1) / 2;
  const scale = 0.55 + depth * 0.7;

  return {
    x:     centerX + xW,
    y:     centerY + yW,
    depth,
    scale,
  };
}