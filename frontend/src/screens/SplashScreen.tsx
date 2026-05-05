import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Palette noir & blanc — cohérente avec la carte graphique de l'app
const Colors = {
  bg: '#000000',           // noir profond (même fond que l'app)
  white: '#FFFFFF',        // blanc pur — éléments principaux
  white60: 'rgba(255,255,255,0.6)',
  white30: 'rgba(255,255,255,0.3)',
  white10: 'rgba(255,255,255,0.10)',
  white04: 'rgba(255,255,255,0.04)',
  whiteBorder: 'rgba(255,255,255,0.12)',
};

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  // Animations
  const ringScale1   = useRef(new Animated.Value(0.3)).current;
  const ringScale2   = useRef(new Animated.Value(0.3)).current;
  const ringScale3   = useRef(new Animated.Value(0.3)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const ringOpacity3 = useRef(new Animated.Value(0)).current;

  const logoOpacity     = useRef(new Animated.Value(0)).current;
  const logoY           = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const progressWidth   = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  const scanLineY   = useRef(new Animated.Value(-60)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;

  const gridOpacity   = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;

  const TOTAL_DURATION = 3200;

  useEffect(() => {
    // Grid fade in
    Animated.timing(gridOpacity, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    // Rings pulse in séquentiellement
    const ringAnim = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1, duration: 900,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1, duration: 400, useNativeDriver: true,
          }),
        ]),
      ]);

    Animated.parallel([
      ringAnim(ringScale1, ringOpacity1, 100),
      ringAnim(ringScale2, ringOpacity2, 300),
      ringAnim(ringScale3, ringOpacity3, 500),
    ]).start();

    // Logo apparaît
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0, duration: 600,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(subtitleOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
    ]).start();

    // Scan line
    Animated.sequence([
      Animated.delay(700),
      Animated.timing(scanOpacity, {
        toValue: 0.5, duration: 200, useNativeDriver: true,
      }),
      Animated.timing(scanLineY, {
        toValue: 60, duration: 900,
        easing: Easing.inOut(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(scanOpacity, {
        toValue: 0, duration: 200, useNativeDriver: true,
      }),
    ]).start();

    // Barre de progression
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(progressOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1100),
      Animated.timing(progressWidth, {
        toValue: 1, duration: 1800,
        easing: Easing.inOut(Easing.quad), useNativeDriver: false,
      }),
    ]).start();

    // Status text
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(statusOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();

    // Fin
    const timer = setTimeout(onFinish, TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Lignes de grille
  const gridLines = [];
  const cols = 12;
  const rows = 6;
  for (let i = 1; i < cols; i++) {
    gridLines.push(
      <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i / cols) * 100}%` as any }]} />
    );
  }
  for (let i = 1; i < rows; i++) {
    gridLines.push(
      <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i / rows) * 100}%` as any }]} />
    );
  }

  return (
    <View style={styles.container}>

      {/* Grille de fond */}
      <Animated.View style={[styles.grid, { opacity: gridOpacity }]}>
        {gridLines}
      </Animated.View>

      {/* Rings + Logo groupés ensemble */}
      <Animated.View style={[styles.logoContainer, {
        opacity: logoOpacity,
        transform: [{ translateY: logoY }],
      }]}>

        {/* Rings concentriques — centrés autour du logo */}
        <View style={styles.ringsContainer}>
          <Animated.View style={[styles.ring, styles.ring3, {
            transform: [{ scale: ringScale3 }], opacity: ringOpacity3,
          }]} />
          <Animated.View style={[styles.ring, styles.ring2, {
            transform: [{ scale: ringScale2 }], opacity: ringOpacity2,
          }]} />
          <Animated.View style={[styles.ring, styles.ring1, {
            transform: [{ scale: ringScale1 }], opacity: ringOpacity1,
          }]} />

          {/* Scan line sur les rings */}
          <Animated.View style={[styles.scanLine, {
            opacity: scanOpacity,
            transform: [{ translateY: scanLineY }],
          }]} />

          {/* Logo image centré dans les rings */}
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

      </Animated.View>

      {/* Textes — positionnés en absolu depuis le centre écran */}
      <Animated.View style={[styles.textBlock, { opacity: logoOpacity }]}>
        <Text style={styles.logoText}>OSCILLA</Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          AEROSPACE CONTROL CENTER  ·  v1.0.0
        </Animated.Text>
      </Animated.View>

      {/* Barre de progression */}
      <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
        <Animated.Text style={[styles.statusText, { opacity: statusOpacity }]}>
          INITIALIZING SYSTEMS...
        </Animated.Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
          {/* Glow tip */}
          <Animated.View style={[styles.progressGlow, { left: progressBarWidth }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>BOOT</Text>
          <Text style={styles.progressLabel}>NOMINAL</Text>
        </View>
      </Animated.View>

    </View>
  );
}

const RING_BASE = Math.min(width, height) * 0.55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grille
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineV: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: Colors.white04,
  },
  gridLineH: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: Colors.white04,
  },

  // Rings
  ringsContainer: {
    width: RING_BASE,
    height: RING_BASE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  ring1: {
    width: RING_BASE * 0.38,
    height: RING_BASE * 0.38,
    borderColor: Colors.white,
    backgroundColor: Colors.white10,
  },
  ring2: {
    width: RING_BASE * 0.65,
    height: RING_BASE * 0.65,
    borderColor: Colors.white30,
    borderStyle: 'dashed',
  },
  ring3: {
    width: RING_BASE,
    height: RING_BASE,
    borderColor: Colors.whiteBorder,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    width: RING_BASE,
    height: 1.5,
    backgroundColor: Colors.white,
    shadowColor: Colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    zIndex: 10,
    top: '-10%',
  },
  logoImage: {
    position: 'absolute',
    width: RING_BASE * 0.28,
    height: RING_BASE * 0.28,
    tintColor: Colors.white,
  },
  textBlock: {
    position: 'absolute',
    top: '50%',
    marginTop: RING_BASE / 10,
    alignItems: 'center',
    width: width * 0.9,
  },
  logoText: {
    fontFamily: 'monospace',
    fontSize: 42,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 18,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.white60,
    letterSpacing: 4,
    marginTop: 8,
  },

  // Progress
  progressContainer: {
    position: 'absolute',
    bottom: 22,
    left: 48,
    right: 48,
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.white60,
    letterSpacing: 3,
    marginBottom: 4,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.white10,
    borderRadius: 1,
    overflow: 'visible',
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
    shadowColor: Colors.white,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  progressGlow: {
    position: 'absolute',
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    shadowColor: Colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  progressLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: Colors.white30,
    letterSpacing: 2,
  },
});
