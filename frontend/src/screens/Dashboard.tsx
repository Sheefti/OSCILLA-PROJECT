import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OrbitalRadar from '../components/OrbitalRadar/OrbitalRadar';
import LeftPanel from '../components/LeftPanel/LeftPanel';
import { AsteroidData } from '../theme/asteroids';
import { Colors } from '../theme/colors';

function useUTCClock() {
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(
        [n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
          .map((v) => String(v).padStart(2, '0'))
          .join(':')
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

function Topbar() {
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
      {/* Logo */}
      <Text style={tb.logo}>OSCILLA</Text>

      {/* Centre — statut live */}
      <View style={tb.mid}>
        <View style={tb.dotLive} />
        <Text style={tb.midText}>SYSTÈME OPÉRATIONNEL · SUIVI ORBITAL ACTIF</Text>
      </View>

      {/* Droite — méta */}
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

export default function Dashboard() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const W = Math.max(width, height);
  const H = Math.min(width, height);

  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidData | null>(null);

  const LEFT_WIDTH  = 200;
  const RIGHT_WIDTH = selectedAsteroid ? 240 : 0;
  const TOPBAR_H    = 30;
  const BOTTOMBAR_H = 20;
  const H_MAIN      = H - TOPBAR_H - BOTTOMBAR_H;
  const RADAR_WIDTH = W - LEFT_WIDTH - RIGHT_WIDTH - insets.left - insets.right;

  // Scanline
  const scanY = useRef(new Animated.Value(-2)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanY, {
        toValue: H,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [H]);

  return (
    <View style={[
      styles.container,
      { width: W, height: H, paddingLeft: insets.left, paddingRight: insets.right }
    ]}>
      <StatusBar hidden />

      {/* Scanline */}
      <Animated.View
        pointerEvents="none"
        style={[styles.scanline, { transform: [{ translateY: scanY }] }]}
      />

      {/* Topbar */}
      <Topbar />

      {/* Main */}
      <View style={[styles.main, { height: H_MAIN }]}>
        <View style={[styles.leftPanel, { width: LEFT_WIDTH }]}>
          <LeftPanel selectedAsteroid={selectedAsteroid} />
        </View>

        <View style={{ width: RADAR_WIDTH, height: H_MAIN }}>
          <OrbitalRadar
            width={RADAR_WIDTH}
            height={H_MAIN}
            onAsteroidPress={(a) => setSelectedAsteroid(prev => prev?.id === a.id ? null : a)}
            selectedId={selectedAsteroid?.id ?? -1}
          />
        </View>

        {selectedAsteroid && (
          <View style={[styles.rightPanel, { width: RIGHT_WIDTH }]} />
        )}
      </View>

      {/* Bottombar */}
      <Bottombar />

      {/* Coins HUD */}
      <View style={[styles.hc, styles.hcTL]} />
      <View style={[styles.hc, styles.hcTR]} />
      <View style={[styles.hc, styles.hcBL]} />
      <View style={[styles.hc, styles.hcBR]} />
    </View>
  );
}

const tb = StyleSheet.create({
  bar: {
    height: 30,
    backgroundColor: 'rgba(0,229,255,0.025)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  logo: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 10,
    color: Colors.cyan,
  },
  mid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  midText: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 2,
    color: 'rgba(0,229,255,0.35)',
  },
  right: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(0,229,255,0.3)',
  },
  metaVal: {
    color: Colors.amber,
  },
});

const bb = StyleSheet.create({
  bar: {
    height: 20,
    backgroundColor: 'rgba(0,229,255,0.015)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,229,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(0,229,255,0.18)',
    letterSpacing: 1,
  },
  em: {
    color: 'rgba(0,229,255,0.4)',
  },
  track: {
    width: 90,
    height: 2,
    backgroundColor: 'rgba(0,229,255,0.07)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%' as any,
    backgroundColor: Colors.cyan,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    flexDirection: 'column',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.1)',
    zIndex: 99,
    pointerEvents: 'none' as any,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,229,255,0.06)',
    backgroundColor: 'rgba(0,229,255,0.018)',
  },
  rightPanel: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,229,255,0.06)',
    backgroundColor: 'rgba(0,229,255,0.01)',
  },
  hc: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: 'rgba(0,229,255,0.35)',
  },
  hcTL: { top: 5, left: 5, borderTopWidth: 1, borderLeftWidth: 1 },
  hcTR: { top: 5, right: 5, borderTopWidth: 1, borderRightWidth: 1 },
  hcBL: { bottom: 5, left: 5, borderBottomWidth: 1, borderLeftWidth: 1 },
  hcBR: { bottom: 5, right: 5, borderBottomWidth: 1, borderRightWidth: 1 },
});
