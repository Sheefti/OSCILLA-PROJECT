/**
 * app/radar/neo-details.tsx
 * Route Expo Router → AsteroidInspector.
 * Reçoit les données NeoAsteroid (API) en JSON, les adapte vers AsteroidData,
 * puis affiche le même écran de détail que les astéroïdes du radar.
 */

import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme/colors';
import AsteroidInspector from '../../src/screens/AsteroidInspector';
import { NeoAsteroid } from '../../src/hooks/useNeoAsteroids';
import { AsteroidData } from '../../src/theme/asteroids';

// ─── Adaptateur NeoAsteroid → AsteroidData ───────────────────────────────────
// Les champs orbitaux (rx, ry, tilt, speed, phase) ne viennent pas de l'API
// NASA NeoWS Browse. On les dérive de manière déterministe depuis l'ID pour
// que chaque astéroïde ait un wireframe 3D unique et reproductible.

function neoToAsteroidData(neo: NeoAsteroid): AsteroidData {
  // Hash simple et déterministe basé sur les caractères de l'ID
  const hash = neo.id
    .split('')
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 0);

  const velKms = (neo.velocity.kmPerHour / 3600).toFixed(2);
  const distAU = (neo.missDistance.km / 149_597_870.7).toFixed(4);
  const diamStr =
    neo.diameterKm.max >= 1
      ? `~${neo.diameterKm.max.toFixed(2)}km`
      : `~${(neo.diameterKm.max * 1000).toFixed(0)}m`;

  return {
    id:    hash % 10000,
    name:  neo.name,
    cls:   neo.isHazardous ? 'CLASSE PHO · DANGEREUX' : 'CLASSE NEO · NOMINAL',
    // Paramètres orbitaux déterministes
    rx:    90  + (hash % 100),
    ry:    35  + (hash % 50),
    tilt:  -40 + (hash % 80),
    speed: 0.10 + (hash % 60) * 0.006,
    phase: ((hash % 628) / 100),
    // Apparence selon le danger
    color: neo.isHazardous ? Colors.red   : Colors.cyan,
    rgb:   neo.isHazardous ? '255,61,61'  : '0,229,255',
    alert: neo.isHazardous,
    // Données physiques réelles
    diam:  diamStr,
    mag:   'N/A',
    vel:   velKms,
    dist:  distAU,
  };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export default function NeoDetailsRoute() {
  const { data } = useLocalSearchParams<{ data: string }>();

  let asteroid: AsteroidData | null = null;
  try {
    if (data) {
      const neo = JSON.parse(data) as NeoAsteroid;
      asteroid = neoToAsteroidData(neo);
    }
  } catch {
    asteroid = null;
  }

  if (!asteroid) {
    return (
      <View style={styles.error}>
        <Text style={styles.code}>ERR · 400</Text>
        <Text style={styles.msg}>DONNÉES INVALIDES OU MANQUANTES</Text>
      </View>
    );
  }

  return <AsteroidInspector asteroid={asteroid} />;
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Colors.red,
    letterSpacing: 4,
  },
  msg: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
  },
});

