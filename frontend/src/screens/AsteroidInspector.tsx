import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  LayoutChangeEvent,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../theme/colors';
import { AsteroidData } from '../theme/asteroids';
import { useQuaternion } from '../hooks/useQuaternion';
import WireframeModel from '../components/WireframeModel/WireframeModel';

// ─────────────────────────────────────────────────────────────────────────────
// Fonts
// Ajoute dans ton projet :
//   expo install @expo-google-fonts/orbitron @expo-google-fonts/share-tech-mono
// Dans _layout.tsx, charge-les avec useFonts() et passe les noms ci-dessous.
// ─────────────────────────────────────────────────────────────────────────────
const F_MONO = 'ShareTechMono_400Regular';
const F_ORB  = 'Orbitron_900Black';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveNameColor(asteroid: AsteroidData): string {
  if (asteroid.name === 'APOPHIS') return Colors.red;
  if (asteroid.alert) return Colors.amber;
  return Colors.cyan;
}

// ─────────────────────────────────────────────────────────────────────────────
// useBlink — retourne une Animated.Value qui clignote en step-end
// ─────────────────────────────────────────────────────────────────────────────

function useBlink(active: boolean) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.step0 }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.step0 }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [active]);
  return opacity;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanline
// ─────────────────────────────────────────────────────────────────────────────

function ScanLine() {
  const translateY = useRef(new Animated.Value(-2)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      translateY.setValue(-2);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 900, duration: 9000, useNativeDriver: true, easing: Easing.linear }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.delay(8100),
          Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }),
        ]),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.scanLine, { transform: [{ translateY }], opacity }]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PulsingDot
// ─────────────────────────────────────────────────────────────────────────────

function PulsingDot({ color, size = 5 }: { color: string; size?: number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PulsingRing
// ─────────────────────────────────────────────────────────────────────────────

function PulsingRing({ color }: { color: string }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.06, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(scale,   { toValue: 1,    duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.12, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4,  duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pulsingRing, { borderColor: color + '55', opacity, transform: [{ scale }] }]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, color = 'rgba(255,255,255,0.35)' }: { title: string; color?: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionHeaderBar, { backgroundColor: color }]} />
      <Text style={[styles.sectionHeaderText, { color }]}>{title}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DataRow
// ─────────────────────────────────────────────────────────────────────────────

function DataRow({
  label, value,
  accent = 'rgba(255,255,255,0.85)',
  blink = false,
}: { label: string; value: string; accent?: string; blink?: boolean }) {
  const blinkOp = useBlink(blink);
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataKey}>{label}</Text>
      {blink
        ? <Animated.Text style={[styles.dataVal, { color: accent, opacity: blinkOp }]}>{value}</Animated.Text>
        : <Text style={[styles.dataVal, { color: accent }]}>{value}</Text>
      }
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TorinoGauge
// ─────────────────────────────────────────────────────────────────────────────

function TorinoGauge({ level, color }: { level: number; color: string }) {
  const barOp = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(barOp, { toValue: 0.7, duration: 1250, useNativeDriver: false }),
        Animated.timing(barOp, { toValue: 1,   duration: 1250, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  return (
    <View style={[styles.torinoBox, { borderColor: color + '33', backgroundColor: color + '0D' }]}>
      <View style={[styles.torinoTopLine, { backgroundColor: color + '55' }]} />
      <Text style={[styles.torinoLabel, { color: color + 'AA' }]}>NIVEAU DE MENACE TORINO</Text>
      <View style={styles.torinoBarBg}>
        <Animated.View
          style={[styles.torinoBarFill, { width: `${(level / 10) * 100}%` as any, backgroundColor: color, opacity: barOp }]}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={[styles.torinoLevel, { color }]}>{level}</Text>
        <Text style={[styles.torinoSub,   { color: color + '88' }]}>/ 10 · MÉRITE SURVEILLANCE</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TelemetryBar
// ─────────────────────────────────────────────────────────────────────────────

type TeleItem = { label: string; value: string; accent?: string; blink?: boolean };

function TeleBadge({ item, isLast }: { item: TeleItem; isLast: boolean }) {
  const blinkOp = useBlink(!!item.blink);
  const color   = item.accent ?? 'rgba(255,255,255,0.75)';
  return (
    <View style={[styles.teleItem, isLast && styles.teleItemLast]}>
      <Text style={styles.teleLabel}>{item.label}</Text>
      {item.blink
        ? <Animated.Text style={[styles.teleVal, { color, opacity: blinkOp }]}>{item.value}</Animated.Text>
        : <Text style={[styles.teleVal, { color }]}>{item.value}</Text>
      }
    </View>
  );
}

function TelemetryBar({ items }: { items: TeleItem[] }) {
  return (
    <View style={styles.teleBar}>
      {items.map((item, i) => (
        <TeleBadge key={i} item={item} isLast={i === items.length - 1} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Écran principal
// ─────────────────────────────────────────────────────────────────────────────

interface AsteroidInspectorProps {
  asteroid: AsteroidData;
}

export default function AsteroidInspector({ asteroid }: AsteroidInspectorProps) {
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const [rotAngles, setRotAngles] = useState({ roll: 0, pitch: 0, yaw: 0 });

  const rotation      = useQuaternion(0.10, 0.25, 0.06);
  const nameColor     = resolveNameColor(asteroid);
  const isAlert       = !!asteroid.alert;
  const isPHO         = isAlert || asteroid.name === 'APOPHIS';
  const hasDimensions = panelSize.width > 0 && panelSize.height > 0;

  useEffect(() => {
    const id = setInterval(() => {
      setRotAngles(p => ({
        roll:  (p.roll  + 0.0009 * 180 / Math.PI) % 360,
        pitch: (p.pitch + 0.0018 * 180 / Math.PI) % 360,
        yaw:   (p.yaw   + 0.005  * 180 / Math.PI) % 360,
      }));
    }, 16);
    return () => clearInterval(id);
  }, []);

  function onVizLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setPanelSize({ width, height });
  }

  const teleItems: TeleItem[] = [
    { label: 'OBJETS',    value: '01' },
    { label: 'SIGNAL',    value: 'FORT',          accent: Colors.green },
    { label: 'LATENCE',   value: '14 ms' },
    { label: 'PRÉCISION', value: '±0.1"' },
    { label: 'SOURCE',    value: 'NASA · CNEOS' },
    {
      label: 'STATUT',
      value: isAlert ? 'ALERTE ACTIVE' : 'NOMINAL',
      accent: isAlert ? nameColor : Colors.green,
      blink: isAlert,
    },
  ];

  return (
    // edges=['top','bottom','left','right'] : rien ne sera jamais coupé
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000103" />

      <ScanLine />

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <View style={styles.topbar}>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.6}>
          <Text style={styles.backText}>{'< CATALOGUE'}</Text>
        </TouchableOpacity>

        <View style={styles.topbarSep} />

        <View style={styles.topbarCenter}>
          <Text style={styles.topbarTitle}>
            <Text style={styles.topbarTitleBold}>OSCILLA</Text>
            {'  ·  ANALYSE ORBITALE'}
          </Text>
        </View>

        <View style={styles.topbarSep} />

        <View style={[
          styles.statusBadge,
          { borderColor: nameColor + '80', backgroundColor: nameColor + '12' },
        ]}>
          <PulsingDot color={nameColor} />
          <Text style={[styles.statusText, { color: nameColor }]}>
            {isAlert ? 'MENACE CONFIRMÉE' : 'NOMINAL'}
          </Text>
        </View>

      </View>

      {/* ── CORPS ──────────────────────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* ═══ PANNEAU GAUCHE ═══ */}
        <View style={styles.leftPanel}>

          {/* En-tête */}
          <View style={[styles.objHeader, isPHO && styles.objHeaderPHO]}>
            {isPHO && <View style={[styles.phoBar, { backgroundColor: nameColor }]} />}
            <Text style={styles.objMeta}>
              {'NEO-ID · '}
              {String(asteroid.id).padStart(4, '0')}
              {' · EPOCH 32088'}
            </Text>
            <Text style={[styles.objName, { color: nameColor }]} numberOfLines={1} adjustsFontSizeToFit>
              {asteroid.name}
            </Text>
            <View style={styles.objClassRow}>
              <Text style={styles.objClass}>{asteroid.cls}</Text>
              {isPHO && (
                <View style={[styles.phoBadge, { borderColor: nameColor + '80', backgroundColor: nameColor + '1A' }]}>
                  <Text style={[styles.phoBadgeText, { color: nameColor }]}>⚠ PHO</Text>
                </View>
              )}
            </View>
          </View>

          {/* Données scrollables */}
          <ScrollView style={styles.dataScroll} showsVerticalScrollIndicator={false}>

            <View style={styles.dataSection}>
              <SectionHeader title="PARAMÈTRES ORBITAUX" />
              <DataRow label="DEMI-GRAND AXE"   value={`${asteroid.rx} UA`} />
              <DataRow label="EXCENTRICITÉ"      value={`${asteroid.ry}`} />
              <DataRow label="INCLINAISON"       value={`${asteroid.tilt}°`} />
              <DataRow label="LONG. NŒUD ASC."   value="183.2°" />
              <DataRow label="ARG. DU PÉRIHÉLIE" value="102.4°" />
              <DataRow label="VITESSE ORB."      value={`${asteroid.speed.toFixed(2)} rad/s`} accent={Colors.cyan} />
            </View>

            <View style={styles.dataSection}>
              <SectionHeader title="DONNÉES PHYSIQUES" />
              <DataRow label="DIAMÈTRE EST."  value={asteroid.diam}          accent={Colors.amber} />
              <DataRow label="MAGNITUDE ABS." value={`H ${asteroid.mag}`}    accent={Colors.cyan} />
              <DataRow label="ALBÉDO"         value="0.154" />
              <DataRow label="VITESSE REL."   value={`${asteroid.vel} km/s`} accent={isAlert ? nameColor : Colors.green} />
            </View>

            {isAlert && (
              <View style={styles.dataSection}>
                <SectionHeader title="APPROCHE CRITIQUE" color={nameColor + 'BB'} />
                <DataRow label="DATE"             value={asteroid.approachDate ?? '2032-12-22'} accent={nameColor} blink />
                <DataRow label="DIST. MIN. TERRE" value={`${asteroid.dist} UA`}                accent={nameColor} />
                <DataRow label="DIST. MIN. (LD)"  value="0.003 LD"                             accent={nameColor} />
                <DataRow label="PROB. IMPACT"     value={asteroid.impact ?? '1 / 83'}          accent={nameColor} />
                <TorinoGauge level={asteroid.torinoLevel ?? 4} color={nameColor} />
              </View>
            )}

            <View style={styles.dataSection}>
              <SectionHeader title="QUATERNION · LIVE" color={nameColor + 'BB'} />
              <DataRow label="W" value={rotation.q.w.toFixed(4)} accent={nameColor} />
              <DataRow label="X" value={rotation.q.x.toFixed(4)} accent={nameColor} />
              <DataRow label="Y" value={rotation.q.y.toFixed(4)} accent={nameColor} />
              <DataRow label="Z" value={rotation.q.z.toFixed(4)} accent={nameColor} />
            </View>

          </ScrollView>

        </View>

        {/* ═══ PANNEAU DROIT ═══ */}
        <View style={styles.rightPanel}>

          {/* Zone wireframe */}
          <View style={styles.vizWrap} onLayout={onVizLayout}>

            {/* Coins HUD */}
            <View style={[styles.vc, styles.vcTL]} />
            <View style={[styles.vc, styles.vcTR]} />
            <View style={[styles.vc, styles.vcBL]} />
            <View style={[styles.vc, styles.vcBR]} />

            {hasDimensions && (
              <WireframeModel
                asteroidId={asteroid.id}
                rotation={rotation}
                color={nameColor}
                width={panelSize.width}
                height={panelSize.height}
              />
            )}

            <PulsingRing color={nameColor} />

            {/* SCAN EN COURS — haut droite, à l'intérieur du coin TR */}
            <View style={styles.scanLabelTR}>
              <Text style={styles.scanText}>SCAN EN COURS</Text>
              <PulsingDot color={Colors.green} size={4} />
            </View>

            {/* Dimensions — bas gauche, à l'intérieur du coin BL */}
            <Text style={[styles.scanText, styles.scanBL]}>
              {`${panelSize.width.toFixed(0)} × ${panelSize.height.toFixed(0)} px`}
            </Text>

            {/* Rotation — bas droite, deux lignes, à l'intérieur du coin BR */}
            <View style={styles.scanBR}>
              <Text style={styles.scanText}>ROT. AUTO · Q-SPACE</Text>
              <Text style={styles.scanText}>
                {`ROLL ${rotAngles.roll.toFixed(1)}°  PITCH ${rotAngles.pitch.toFixed(1)}°  YAW ${rotAngles.yaw.toFixed(1)}°`}
              </Text>
            </View>

          </View>

          {/* Barre télémétrie */}
          <TelemetryBar items={teleItems} />

        </View>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:          '#000103',
  border:      'rgba(255,255,255,0.06)',
  borderFaint: 'rgba(255,255,255,0.04)',
  textDim:     'rgba(255,255,255,0.38)',
  textFaint:   'rgba(255,255,255,0.15)',
};

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)', zIndex: 99,
  },

  // ── Topbar ──────────────────────────────────────────────────────────────
  topbar: {
    height: 38, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:  { opacity: 0.45 },
  backText: { fontFamily: F_MONO, fontSize: 7, letterSpacing: 2.5, color: 'rgba(255,255,255,0.9)' },
  topbarSep: { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.08)' },
  topbarCenter: { flex: 1, alignItems: 'center' },
  topbarTitle: { fontFamily: F_ORB, fontSize: 10, letterSpacing: 6, color: 'rgba(255,255,255,0.4)' },
  topbarTitleBold: { color: 'rgba(255,255,255,0.75)', fontWeight: '400' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 4, borderWidth: 1,
  },
  statusText: { fontFamily: F_MONO, fontSize: 7, letterSpacing: 2 },

  // ── Corps ────────────────────────────────────────────────────────────────
  body: { flex: 1, flexDirection: 'row', overflow: 'hidden' },

  // ── Panneau gauche ───────────────────────────────────────────────────────
  leftPanel: {
    width: 280,
    borderRightWidth: 1, borderRightColor: C.border,
    flexDirection: 'column',
  },

  objHeader: {
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: C.borderFaint,
    position: 'relative', flexShrink: 0,
  },
  objHeaderPHO: { paddingLeft: 18 },
  phoBar: {
    position: 'absolute', left: 0,
    top: '15%' as any, bottom: '15%' as any,
    width: 2, borderRadius: 1,
  },
  objMeta: { fontFamily: F_MONO, fontSize: 6.5, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 },
  objName: { fontFamily: F_ORB, fontSize: 28, fontWeight: '900', letterSpacing: 2, lineHeight: 32, marginBottom: 5 },
  objClassRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  objClass: { fontFamily: F_MONO, fontSize: 6.5, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5 },
  phoBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, borderWidth: 1 },
  phoBadgeText: { fontFamily: F_MONO, fontSize: 6.5, letterSpacing: 1.5 },

  dataScroll: { flex: 1 },
  dataSection: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: C.borderFaint,
  },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  sectionHeaderBar: { width: 2, height: 10, borderRadius: 1 },
  sectionHeaderText: { fontFamily: F_MONO, fontSize: 6.5, letterSpacing: 2.5, textTransform: 'uppercase' },

  dataRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.025)',
  },
  dataKey: { fontFamily: F_MONO, fontSize: 6.5, color: C.textDim, letterSpacing: 1, flex: 1 },
  dataVal: { fontFamily: F_MONO, fontSize: 9, letterSpacing: 0.5, textAlign: 'right' },

  torinoBox: { marginTop: 6, padding: 8, borderRadius: 4, borderWidth: 1, overflow: 'hidden' },
  torinoTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  torinoLabel: { fontFamily: F_MONO, fontSize: 6, letterSpacing: 2, marginBottom: 5 },
  torinoBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  torinoBarFill: { height: '100%' as any, borderRadius: 2 },
  torinoLevel: { fontFamily: F_ORB, fontSize: 11, fontWeight: '700' },
  torinoSub: { fontFamily: F_MONO, fontSize: 6 },

  // ── Panneau droit ────────────────────────────────────────────────────────
  rightPanel: { flex: 1, flexDirection: 'column' },
  vizWrap:    { flex: 1, position: 'relative', overflow: 'hidden' },

  vc: { position: 'absolute', width: 12, height: 12, borderColor: 'rgba(255,255,255,0.25)', borderStyle: 'solid', zIndex: 20 },
  vcTL: { top: 10,    left: 10,  borderTopWidth: 1,    borderLeftWidth: 1    },
  vcTR: { top: 10,    right: 10, borderTopWidth: 1,    borderRightWidth: 1   },
  vcBL: { bottom: 10, left: 10,  borderBottomWidth: 1, borderLeftWidth: 1    },
  vcBR: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1   },

  pulsingRing: {
    position: 'absolute',
    width: 160, height: 160,
    left: '50%' as any, top: '50%' as any,
    marginLeft: -80, marginTop: -80,
    borderRadius: 80, borderWidth: 1, zIndex: 15,
  },

  // SCAN EN COURS — haut droite, à droite du coin TR
  scanLabelTR: {
    position: 'absolute', top: 14, right: 28,
    flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 20,
  },
  // Dimensions — bas gauche, au-dessus du coin BL
  scanBL: { position: 'absolute', bottom: 28, left: 28, zIndex: 20 },
  // Rotation — bas droite, au-dessus du coin BR, aligné à droite
  scanBR: { position: 'absolute', bottom: 28, right: 28, zIndex: 20, alignItems: 'flex-end' },
  scanText: { fontFamily: F_MONO, fontSize: 6, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5 },

  teleBar: {
    height: 30, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  teleItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, height: '100%' as any,
    borderRightWidth: 1, borderRightColor: C.borderFaint,
  },
  teleItemLast: { borderRightWidth: 0, marginLeft: 'auto' as any },
  teleLabel: { fontFamily: F_MONO, fontSize: 6, letterSpacing: 1.5, color: C.textDim },
  teleVal:   { fontFamily: F_MONO, fontSize: 8, letterSpacing: 0.5 },
});
