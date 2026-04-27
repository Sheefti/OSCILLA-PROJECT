/**
 * app/radar/details.tsx — Écran de détail Astéroïde
 * Thin wrapper → AsteroidInspector (logique dans src/screens/).
 * Récupère l'ID passé en paramètre de navigation.
 */

import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ASTEROIDS } from '../../src/theme/asteroids';
import { Colors } from '../../src/theme/colors';
import AsteroidInspector from '../../src/screens/AsteroidInspector';

export default function RadarDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const asteroid = ASTEROIDS.find((a) => String(a.id) === id);

  if (!asteroid) {
    return (
      <View style={styles.error}>
        <Text style={styles.code}>ERR · 404</Text>
        <Text style={styles.msg}>OBJET NON IDENTIFIÉ — ID: {id}</Text>
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
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
});
