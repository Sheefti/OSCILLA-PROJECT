/**
 * src/screens/Dashboard.tsx
 * Dashboard principal Oscilla — avec PlanetNav droite et changement de planète dynamique.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, View, Text, Animated, Easing,
  useWindowDimensions, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import OrbitalRadar  from '../components/OrbitalRadar/OrbitalRadar';
import LeftPanel     from '../components/LeftPanel/LeftPanel';
import PlanetNav     from '../components/PlanetNav/PlanetNav';
import { PLANETS, PlanetAsteroidData } from '../theme/planets';
import { Colors }   from '../theme/colors';
import api          from '../services/api';

// ─── Horloge UTC ─────────────────────────────────────────────────────────────

function useUTCClock() {
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(
        [n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
          .map((v) => String(v).padStart(2, '0')).join(':')
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

function Topbar({ systemLabel }: { systemLabel: string }) {
  const clock = useUTCClock();
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={tb.bar}>
      <Text style={tb.logo}>OSCILLA</Text>
      <View style={tb.mid}>
        <View style={tb.dotLive} />
        <Text style={tb.midText}>{systemLabel}</Text>
      </View>
      <View style={tb.right}>
        <Text style={tb.metaText}>UTC <Text style={tb.metaVal}>{clock}</Text></Text>
        <Text style={tb.metaText}>SESSION <Text style={tb.metaVal}>ΔT-2847</Text></Text>
        <Text style={tb.metaText}>INTÉGRITÉ <Text style={tb.metaVal}>99.7%</Text></Text>
        <Text style={tb.metaText}>MODE{' '}
          <Animated.Text style={[tb.metaVal, { opacity: blink }]}>ACTIF</Animated.Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Bottombar ───────────────────────────────────────────────────────────────

function Bottombar() {
  const prog = useRef(new Animated.Value(0.12)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(prog, { toValue: 0.93, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(prog, { toValue: 0.12, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const barWidth = prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={bb.bar}>
      <Text style={bb.text}>OSCILLA <Text style={bb.em}>v4.0</Text> · CINÉMATIQUE ORBITALE</Text>
      <View style={bb.track}>
        <Animated.View style={[bb.fill, { width: barWidth }]} />
      </View>
      <Text style={bb.text}><Text style={bb.em}>JPL · CNEOS · ESA</Text> · TEMPS RÉEL</Text>
    </View>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { width, height } = useWindowDimensions();

  const LEFT_WIDTH = 200;
  const NAV_WIDTH  = 58;

  const [radarSize, setRadarSize] = useState({ w: 0, h: 0 });

  // ── État planète ──────────────────────────────────────────────────────────
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('terre');
  const [asteroids, setAsteroids]                 = useState<PlanetAsteroidData[]>(
    PLANETS['terre'].fallbackAsteroids
  );
  const [isLoading, setIsLoading]                 = useState(false);
  const [selectedAsteroid, setSelectedAsteroid]   = useState<PlanetAsteroidData | null>(null);

  // ── Fade de transition du radar ───────────────────────────────────────────
  const radarOpacity = useRef(new Animated.Value(1)).current;

  const switchPlanet = useCallback(async (key: string) => {
    if (key === selectedPlanetKey) return;

    const planet = PLANETS[key];
    if (!planet) return;

    // 1. Flash out
    Animated.timing(radarOpacity, {
      toValue: 0, duration: 150, useNativeDriver: true,
    }).start(async () => {
      // 2. Données statiques immédiates
      setSelectedPlanetKey(key);
      setAsteroids(planet.fallbackAsteroids);
      setSelectedAsteroid(null);
      setIsLoading(true);

      // 3. Flash in
      Animated.timing(radarOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }).start();

      // 4. Appel API en arrière-plan
      try {
        const response = await api.get('/api/neo/by-body', {
          params: { body: planet.nasaBody, size: 4 },
        });

        if (response.data?.success && response.data.data?.asteroids?.length > 0) {
          const raw = response.data.data.asteroids;

          // Mapper les données NASA vers notre format PlanetAsteroidData
          const mapped: PlanetAsteroidData[] = raw.map((neo: any, idx: number) => ({
            id:    idx,
            name:  neo.name,
            cls:   neo.isHazardous ? 'OBJET POTENTIELLEMENT DANGEREUX' : 'NEO · SUIVI ACTIF',
            rx:    planet.fallbackAsteroids[idx % planet.fallbackAsteroids.length]?.rx ?? 110,
            ry:    planet.fallbackAsteroids[idx % planet.fallbackAsteroids.length]?.ry ?? 48,
            tilt:  planet.fallbackAsteroids[idx % planet.fallbackAsteroids.length]?.tilt ?? -20,
            speed: planet.fallbackAsteroids[idx % planet.fallbackAsteroids.length]?.speed ?? 0.4,
            phase: planet.fallbackAsteroids[idx % planet.fallbackAsteroids.length]?.phase ?? 0,
            color: neo.isHazardous ? '#ff3d3d' : planet.accentCol,
            rgb:   neo.isHazardous ? '255,61,61' : planet.accentRgb,
            alert: neo.isHazardous,
            diam:  neo.diameterKm
              ? `~${((neo.diameterKm.min + neo.diameterKm.max) / 2).toFixed(2)}km`
              : '?',
            mag:   '–',
            vel:   neo.velocity?.kmPerSecond?.toFixed(2) ?? '–',
            dist:  neo.missDistance?.au?.toFixed(4) ?? '–',
          }));

          setAsteroids(mapped);
        }
        // Si l'API ne trouve rien pour cette planète, on garde les fallbacks
      } catch (err) {
        // Erreur silencieuse — on reste sur les données statiques
        console.warn('[Dashboard] API fetch failed, using fallback data:', err);
      } finally {
        setIsLoading(false);
      }
    });
  }, [selectedPlanetKey, radarOpacity]);

  // ── Charge la Terre au démarrage ──────────────────────────────────────────
  useEffect(() => {
    // On laisse les fallbacks au lancement pour ne pas bloquer le rendu
    // et on enrichit avec l'API après 500ms
    const timer = setTimeout(() => {
      setIsLoading(true);
      api.get('/api/neo/by-body', { params: { body: 'earth', size: 4 } })
        .then(res => {
          if (res.data?.success && res.data.data?.asteroids?.length > 0) {
            const planet = PLANETS['terre'];
            const raw = res.data.data.asteroids;
            const mapped: PlanetAsteroidData[] = raw.map((neo: any, idx: number) => ({
              id:    idx,
              name:  neo.name,
              cls:   neo.isHazardous ? 'OBJET POTENTIELLEMENT DANGEREUX' : 'NEO · SUIVI ACTIF',
              rx:    planet.fallbackAsteroids[idx % 4]?.rx ?? 110,
              ry:    planet.fallbackAsteroids[idx % 4]?.ry ?? 48,
              tilt:  planet.fallbackAsteroids[idx % 4]?.tilt ?? -20,
              speed: planet.fallbackAsteroids[idx % 4]?.speed ?? 0.4,
              phase: planet.fallbackAsteroids[idx % 4]?.phase ?? 0,
              color: neo.isHazardous ? '#ff3d3d' : planet.accentCol,
              rgb:   neo.isHazardous ? '255,61,61' : planet.accentRgb,
              alert: neo.isHazardous,
              diam:  neo.diameterKm
                ? `~${((neo.diameterKm.min + neo.diameterKm.max) / 2).toFixed(2)}km`
                : '?',
              mag:   '–',
              vel:   neo.velocity?.kmPerSecond?.toFixed(2) ?? '–',
              dist:  neo.missDistance?.au?.toFixed(4) ?? '–',
            }));
            setAsteroids(mapped);
          }
        })
        .catch(() => {}) // Silencieux
        .finally(() => setIsLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleAsteroidPress(a: PlanetAsteroidData) {
    setSelectedAsteroid(prev => prev?.id === a.id ? null : a);
    router.push({ pathname: '/radar/details', params: { id: String(a.id) } });
  }

  const currentPlanet = PLANETS[selectedPlanetKey];

  // ── Scanline ──────────────────────────────────────────────────────────────
  const scanY = useRef(new Animated.Value(-2)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanY, {
        toValue: height, duration: 7000, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();
  }, [height]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
    <View style={[styles.container, { flex: 1 }]}>
      <StatusBar hidden />

      {/* Scanline */}
      <Animated.View style={[styles.scanline, { transform: [{ translateY: scanY }] }]} />

      {/* Main */}
      <View style={styles.main}>

        {/* Panneau gauche — télémétrie */}
        <View style={[styles.leftPanel, { width: LEFT_WIDTH }]}>
          <LeftPanel
            selectedAsteroid={selectedAsteroid}
            accentCol={currentPlanet.accentCol}
            accentRgb={currentPlanet.accentRgb}
            asteroidCount={asteroids.length}
            onOpenCatalogue={() => router.push('/radar/list')}
          />
        </View>

        {/* Radar central */}
        <Animated.View
          style={{ flex: 1, opacity: radarOpacity }}
          onLayout={(e) => {
            const { width: rw, height: rh } = e.nativeEvent.layout;
            setRadarSize({ w: rw, h: rh });
          }}
        >
          {radarSize.w > 0 && (
            <OrbitalRadar
              width={radarSize.w}
              height={radarSize.h}
              onAsteroidPress={handleAsteroidPress}
              selectedId={selectedAsteroid?.id ?? -1}
              asteroids={asteroids}
              planetColors={currentPlanet.planetColor}
              accentRgb={currentPlanet.accentRgb}
            />
          )}

          {/* Indicateur de chargement API */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={currentPlanet.accentCol} />
              <Text style={[styles.loadingText, { color: currentPlanet.accentCol }]}>
                SYNCHRONISATION NASA
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Nav bar planètes — droite */}
        <PlanetNav
          selectedPlanet={selectedPlanetKey}
          onSelectPlanet={switchPlanet}
        />
      </View>

    </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const tb = StyleSheet.create({
  bar: {
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.008)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  logo: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 13, fontWeight: '900', letterSpacing: 10,
    color: '#ffffff',
  },
  mid: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dotLive: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6,
  },
  midText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8, letterSpacing: 2,
    color: 'rgba(255,255,255,0.25)',
  },
  right: { flexDirection: 'row', gap: 16 },
  metaText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8, letterSpacing: 1,
    color: 'rgba(255,255,255,0.25)',
  },
  metaVal: { color: '#c8a84b' },
});

const bb = StyleSheet.create({
  bar: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.006)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14,
  },
  text: { fontFamily: 'ShareTechMono_400Regular', fontSize: 7, color: 'rgba(255,255,255,0.18)', letterSpacing: 1 },
  em:   { color: 'rgba(255,255,255,0.40)' },
  track: {
    width: 90, height: 2,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden',
  },
  fill: { flex: 1, backgroundColor: '#ffffff' },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    overflow: 'hidden', borderRadius: 0,
    flexDirection: 'column',
  },
  scanline: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)', zIndex: 99,
  },
  main: { flex: 1, flexDirection: 'row' },
  leftPanel: {
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 5, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  loadingText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 7, letterSpacing: 2,
  },
  hc: {
    position: 'absolute', width: 16, height: 16,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  hcTL: { top: 5, left: 5, borderTopWidth: 1, borderLeftWidth: 1 },
  hcTR: { top: 5, right: 5, borderTopWidth: 1, borderRightWidth: 1 },
  hcBL: { bottom: 5, left: 5, borderBottomWidth: 1, borderLeftWidth: 1 },
  hcBR: { bottom: 5, right: 5, borderBottomWidth: 1, borderRightWidth: 1 },
});