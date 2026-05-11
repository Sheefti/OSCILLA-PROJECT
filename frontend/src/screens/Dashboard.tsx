
import { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, View, Text, Animated, Easing,
  useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import OrbitalRadar  from '../components/OrbitalRadar/OrbitalRadar';
import LeftPanel     from '../components/LeftPanel/LeftPanel';
import PlanetNav     from '../components/PlanetNav/PlanetNav';
import { PLANETS, PlanetAsteroidData } from '../theme/planets';
import { Colors }   from '../theme/colors';
import api          from '../services/api';


export default function Dashboard() {
  const { height } = useWindowDimensions();

  const LEFT_WIDTH = 200;

  const [radarSize, setRadarSize] = useState({ w: 0, h: 0 });

  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('terre');
  const [asteroids, setAsteroids]                 = useState<PlanetAsteroidData[]>(
    PLANETS['terre'].fallbackAsteroids
  );
  const [isLoading, setIsLoading]                 = useState(false);
  const [selectedAsteroid, setSelectedAsteroid]   = useState<PlanetAsteroidData | null>(null);

  const radarOpacity = useRef(new Animated.Value(1)).current;

  const switchPlanet = useCallback(async (key: string) => {
    if (key === selectedPlanetKey) return;

    const planet = PLANETS[key];
    if (!planet) return;

    Animated.timing(radarOpacity, {
      toValue: 0, duration: 150, useNativeDriver: true,
    }).start(async () => {
      setSelectedPlanetKey(key);
      setAsteroids(planet.fallbackAsteroids);
      setSelectedAsteroid(null);
      setIsLoading(true);

      Animated.timing(radarOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }).start();

      try {
        const response = await api.get('/api/neo/by-body', {
          params: { body: planet.nasaBody, size: 4 },
        });

        if (response.data?.success && response.data.data?.asteroids?.length > 0) {
          const raw = response.data.data.asteroids;

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
      } catch (err) {
        console.warn('[Dashboard] API fetch failed, using fallback data:', err);
      } finally {
        setIsLoading(false);
      }
    });
  }, [selectedPlanetKey, radarOpacity]);

  useEffect(() => {
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
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function handleAsteroidPress(a: PlanetAsteroidData) {
    setSelectedAsteroid(prev => prev?.id === a.id ? null : a);
    router.push({
      pathname: '/radar/neo-details',
      params: { data: JSON.stringify({
        id:    String(a.id),
        name:  a.name,
        isHazardous: a.alert,
        diameterKm:  { min: 0, max: parseFloat(a.diam?.replace(/[^0-9.]/g, '') ?? '0') || 0 },
        velocity:    { kmPerHour: parseFloat(a.vel ?? '0') * 3600 },
        missDistance:{ km: parseFloat(a.dist ?? '0') * 149_597_870.7, lunar: parseFloat(a.dist ?? '0') * 389.17 },
        closeApproachDate: null,
        orbitingBodies: [],
        nasaUrl: '',
      })},
    });
  }

  const currentPlanet = PLANETS[selectedPlanetKey];

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

      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={`gv${i}`} style={[styles.gridLineV, { left: `${(i / 30) * 100}%` as any }]} />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <View key={`gh${i}`} style={[styles.gridLineH, { top: `${(i / 18) * 100}%` as any }]} />
        ))}
      </View>

      <Animated.View
        style={[styles.scanlineWrap, { transform: [{ translateY: scanY }] }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.10)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanlineGradient}
        />
      </Animated.View>

      <View style={styles.main}>

        <View style={[styles.leftPanel, { width: LEFT_WIDTH }]}>
          <LeftPanel
            selectedAsteroid={selectedAsteroid}
            accentCol={currentPlanet.accentCol}
            accentRgb={currentPlanet.accentRgb}
            asteroidCount={asteroids.length}
            onOpenCatalogue={() => router.push('/radar/list')}
          />
        </View>

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

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={currentPlanet.accentCol} />
              <Text style={[styles.loadingText, { color: currentPlanet.accentCol }]}>
                SYNCHRONISATION NASA
              </Text>
            </View>
          )}
        </Animated.View>

        <PlanetNav
          selectedPlanet={selectedPlanetKey}
          onSelectPlanet={switchPlanet}
        />
      </View>

    </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    overflow: 'hidden', borderRadius: 0,
    flexDirection: 'column',
  },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLineV: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(255,255,255,0.018)',
  },
  gridLineH: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.018)',
  },

  scanlineWrap: {
    position: 'absolute', left: 0, right: 0, height: 1, zIndex: 99,
  },
  scanlineGradient: {
    height: 1, flex: 1,
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
});

