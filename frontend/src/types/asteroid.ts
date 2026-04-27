/**
 * src/types/asteroid.ts
 * Types TypeScript partagés pour les objets célestes.
 * Source de vérité unique — importer depuis ici, pas depuis theme/asteroids.ts.
 */

/** Données complètes d'un astéroïde (statiques ou issues du backend) */
export interface AsteroidData {
  id:    number;
  name:  string;
  cls:   string;   // Classification orbitale (ex: "CLASSE APOLLO · PHO")
  rx:    number;   // Demi-axe X de l'orbite (unités affichage radar)
  ry:    number;   // Demi-axe Y de l'orbite
  tilt:  number;   // Inclinaison orbitale (degrés)
  speed: number;   // Vitesse angulaire (rad/s simulation)
  phase: number;   // Phase initiale (rad)
  color: string;   // Couleur hex principale
  rgb:   string;   // Couleur RGB "r,g,b" pour rgba() inline
  alert: boolean;  // Objet potentiellement dangereux (PHO)
  diam:  string;   // Diamètre estimé (ex: "~50m")
  mag:   string;   // Magnitude absolue
  vel:   string;   // Vitesse relative (km/s)
  dist:  string;   // Distance minimale Terre (AU)
}

/**
 * ⏳ v2.0 — Types planétaires futurs
 * À décommenter lors de l'intégration NASA JPL Horizons
 */

// export type PlanetId = 'earth' | 'mars' | 'jupiter';
//
// export interface PlanetaryBody {
//   id:       string;
//   name:     string;
//   planetId: PlanetId;
//   type:     'asteroid' | 'moon' | 'probe';
//   // Coordonnées éphémérides (X, Y, Z en km depuis le corps central)
//   x: number; y: number; z: number;
//   vx: number; vy: number; vz: number;
// }
