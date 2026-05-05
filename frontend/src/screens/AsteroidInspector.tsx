/**
 * AsteroidInspector.tsx
 *
 * Écran immersif "JARVIS" d'analyse d'un astéroïde.
 * Reçoit l'astéroïde déjà résolu en prop depuis la route Expo Router.
 *
 * Layout paysage :
 *   ┌──────────────────────────────────────────────────────┐
 *   │  TOPBAR (retour · titre · badge statut)              │
 *   ├────────────────┬─────────────────────────────────────┤
 *   │  TÉLÉMÉTRIE    │   WIREFRAME MODEL 3D (SVG)           │
 *   │  (280 px)      │   (flex: 1)                          │
 *   └────────────────┴─────────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../theme/colors';
import { AsteroidData } from '../theme/asteroids';
import { useQuaternion } from '../hooks/useQuaternion';
import WireframeModel from '../components/WireframeModel/WireframeModel';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveNameColor(asteroid: AsteroidData): string {
  if (asteroid.name === 'APOPHIS') return Colors.red;
  if (asteroid.alert) return Colors.amber;
  return Colors.cyan;
}

function resolveBorderColor(asteroid: AsteroidData): string {
  if (asteroid.name === 'APOPHIS') return Colors.red;
  if (asteroid.alert) return Colors.amber;
  return Colors.cyanBorder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────────────────────

interface TelemetryRowProps {
  label: string;
  value: string;
  accent?: string;
}

function TelemetryRow({ label, value, accent = Colors.cyan }: TelemetryRowProps) {
  return (
    <View style={styles.telemetryRow}>
      <Text style={styles.telemetryLabel}>{label}</Text>
      <Text style={[styles.telemetryValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  color?: string;
}

function SectionHeader({ title, color = Colors.cyan60 }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionHeaderLine, { backgroundColor: color }]} />
      <Text style={[styles.sectionHeaderText, { color }]}>{title}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AsteroidInspectorProps {
  asteroid: AsteroidData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Écran principal
// ─────────────────────────────────────────────────────────────────────────────

export default function AsteroidInspector({ asteroid }: AsteroidInspectorProps) {
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });

  // Rotation continue — vitesses asymétriques pour un mouvement organique
  const rotation = useQuaternion(0.10, 0.25, 0.06);

  const nameColor   = resolveNameColor(asteroid);
  const borderColor = resolveBorderColor(asteroid);
  const isAlert     = asteroid.alert;
  const hasDimensions = panelSize.width > 0 && panelSize.height > 0;

  // Couleur rgb inline pour les étiquettes de scan
  const colorRgb =
    nameColor === Colors.red   ? '255,61,61'   :
    nameColor === Colors.amber ? '255,171,0'   :
                                 '0,229,255';

  function onRightPanelLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setPanelSize({ width, height });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
          accessibilityLabel="Retour au radar"
        >
          <Text style={styles.backBtnText}>◀  RETOUR AU RADAR</Text>
        </TouchableOpacity>

        <Text style={styles.systemTitle}>OSCILLA · ANALYSE ORBITALE</Text>

        <View style={[styles.statusBadge, { borderColor }]}>
          <View style={[styles.statusDot, { backgroundColor: nameColor }]} />
          <Text style={[styles.statusText, { color: nameColor }]}>
            {isAlert ? 'MENACE CONFIRMÉE' : 'NOMINAL'}
          </Text>
        </View>
      </View>

      {/* ── Coins HUD extérieurs ───────────────────────────────────────────── */}
      <View style={[styles.hudCornerTL, { borderColor: Colors.cyanBorder }]} />
      <View style={[styles.hudCornerTR, { borderColor: Colors.cyanBorder }]} />
      <View style={[styles.hudCornerBL, { borderColor: Colors.cyanBorder }]} />
      <View style={[styles.hudCornerBR, { borderColor: Colors.cyanBorder }]} />

      {/* ── Corps — deux colonnes ──────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* ════════════════════════
            COLONNE GAUCHE — Télémétrie
        ════════════════════════ */}
        <View style={[styles.leftPanel, { borderColor }]}>

          {/* En-tête objet */}
          <View style={styles.objectHeader}>
            <Text style={styles.objectId}>
              NEO-ID · {String(asteroid.id).padStart(4, '0')}
            </Text>
            <Text
              style={[styles.objectName, { color: nameColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {asteroid.name}
            </Text>
            <Text style={styles.objectClass}>{asteroid.cls}</Text>
          </View>

          <View style={styles.divider} />

          {/* Paramètres orbitaux */}
          <SectionHeader title="PARAMÈTRES ORBITAUX" />
          <TelemetryRow label="DEMI-AXE RX"  value={`${asteroid.rx} UA`}                  accent={Colors.cyan} />
          <TelemetryRow label="DEMI-AXE RY"  value={`${asteroid.ry} UA`}                  accent={Colors.cyan} />
          <TelemetryRow label="INCLINAISON"   value={`${asteroid.tilt}°`}                  accent={Colors.cyan} />
          <TelemetryRow label="VITESSE ORB."  value={`${asteroid.speed.toFixed(2)} rad/s`} accent={Colors.cyan} />
          <TelemetryRow label="PHASE INIT."   value={`${asteroid.phase.toFixed(3)} rad`}   accent={Colors.cyan} />

          <View style={styles.divider} />

          {/* Données physiques */}
          <SectionHeader title="DONNÉES PHYSIQUES" />
          <TelemetryRow label="DIAMÈTRE EST."    value={asteroid.diam}          accent={Colors.green} />
          <TelemetryRow label="MAGNITUDE ABS."   value={`H ${asteroid.mag}`}    accent={Colors.green} />
          <TelemetryRow label="VITESSE REL."     value={`${asteroid.vel} km/s`} accent={isAlert ? nameColor : Colors.green} />
          <TelemetryRow label="DIST. MIN. TERRE" value={`${asteroid.dist} AU`}  accent={isAlert ? nameColor : Colors.green} />

          <View style={styles.divider} />

          {/* Quaternion live */}
          <SectionHeader title="QUATERNION · LIVE" color={nameColor} />
          <TelemetryRow label="W" value={rotation.q.w.toFixed(4)} accent={nameColor} />
          <TelemetryRow label="X" value={rotation.q.x.toFixed(4)} accent={nameColor} />
          <TelemetryRow label="Y" value={rotation.q.y.toFixed(4)} accent={nameColor} />
          <TelemetryRow label="Z" value={rotation.q.z.toFixed(4)} accent={nameColor} />

          {/* Alerte critique */}
          {isAlert && (
            <>
              <View style={styles.divider} />
              <View style={[styles.alertBox, { borderColor: nameColor }]}>
                <Text style={[styles.alertTitle, { color: nameColor }]}>
                  ⚠  ALERTE TRAJECTOIRE
                </Text>
                <Text style={styles.alertBody}>
                  Cet objet présente une trajectoire à{'\n'}
                  risque d'approche terrestre confirmée.{'\n'}
                  Surveillance continue activée.
                </Text>
              </View>
            </>
          )}

          <View style={{ flex: 1 }} />
          <Text style={styles.panelFooter}>OSCILLA v1.0 · DATA NASA JPL · LIVE</Text>
        </View>

        {/* ════════════════════════
            ZONE DROITE — Wireframe 3D
        ════════════════════════ */}
        <View
          style={[styles.rightPanel, { borderColor }]}
          onLayout={onRightPanelLayout}
        >
          {/* Coins HUD intérieurs */}
          <View style={[styles.innerCornerTL, { borderColor }]} />
          <View style={[styles.innerCornerTR, { borderColor }]} />
          <View style={[styles.innerCornerBL, { borderColor }]} />
          <View style={[styles.innerCornerBR, { borderColor }]} />

          {/* Modèle 3D SVG */}
          {hasDimensions && (
            <WireframeModel
              asteroidId={asteroid.id}
              rotation={rotation}
              color={nameColor}
              width={panelSize.width}
              height={panelSize.height}
            />
          )}

          {/* Étiquettes HUD */}
          <View style={styles.scanLabelTR}>
            <Text style={[styles.scanText, { color: `rgba(${colorRgb},0.45)` }]}>
              SCAN EN COURS
            </Text>
            <View style={[styles.scanDot, { backgroundColor: Colors.green }]} />
          </View>

          <View style={styles.scanLabelBL}>
            <Text style={styles.scanText}>
              {`${panelSize.width.toFixed(0)} × ${panelSize.height.toFixed(0)} px`}
            </Text>
          </View>

          <View style={styles.scanLabelBR}>
            <Text style={styles.scanText}>ROT. AUTO · Q-SPACE</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const HUD_CORNER = 16;
const HUD_BORDER = 1.5;

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    position: 'relative',
  },

  // Coins HUD extérieurs
  hudCornerTL: {
    position: 'absolute', top: 44, left: 4,
    width: HUD_CORNER, height: HUD_CORNER,
    borderTopWidth: HUD_BORDER, borderLeftWidth: HUD_BORDER,
  },
  hudCornerTR: {
    position: 'absolute', top: 44, right: 4,
    width: HUD_CORNER, height: HUD_CORNER,
    borderTopWidth: HUD_BORDER, borderRightWidth: HUD_BORDER,
  },
  hudCornerBL: {
    position: 'absolute', bottom: 4, left: 4,
    width: HUD_CORNER, height: HUD_CORNER,
    borderBottomWidth: HUD_BORDER, borderLeftWidth: HUD_BORDER,
  },
  hudCornerBR: {
    position: 'absolute', bottom: 4, right: 4,
    width: HUD_CORNER, height: HUD_CORNER,
    borderBottomWidth: HUD_BORDER, borderRightWidth: HUD_BORDER,
  },

  // Topbar
  topbar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cyanBorder,
    backgroundColor: 'rgba(1,8,16,0.92)',
  },
  systemTitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.cyan60,
    textTransform: 'uppercase',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cyanBorder,
    backgroundColor: Colors.cyanDark,
  },
  backBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.cyan,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
  },

  // Corps
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 8,
    gap: 8,
  },

  // ── Panneau gauche ────────────────────────────────────────────────────────
  leftPanel: {
    width: 280,
    flexDirection: 'column',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'rgba(0,229,255,0.02)',
  },
  objectHeader: { marginBottom: 8 },
  objectId: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.cyan60,
    letterSpacing: 2,
    marginBottom: 4,
  },
  objectName: {
    fontFamily: 'monospace',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 30,
  },
  objectClass: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: Colors.cyan60,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cyanBorder,
    marginVertical: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderLine: {
    width: 3,
    height: 10,
    borderRadius: 2,
  },
  sectionHeaderText: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3.5,
  },
  telemetryLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    flex: 1,
  },
  telemetryValue: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'right',
  },
  alertBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    backgroundColor: 'rgba(255,61,61,0.05)',
  },
  alertTitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: '700',
  },
  alertBody: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  panelFooter: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(0,229,255,0.2)',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Panneau droit ─────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  innerCornerTL: {
    position: 'absolute', top: 8, left: 8,
    width: 20, height: 20,
    borderTopWidth: 1.5, borderLeftWidth: 1.5,
    zIndex: 10,
  },
  innerCornerTR: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20,
    borderTopWidth: 1.5, borderRightWidth: 1.5,
    zIndex: 10,
  },
  innerCornerBL: {
    position: 'absolute', bottom: 8, left: 8,
    width: 20, height: 20,
    borderBottomWidth: 1.5, borderLeftWidth: 1.5,
    zIndex: 10,
  },
  innerCornerBR: {
    position: 'absolute', bottom: 8, right: 8,
    width: 20, height: 20,
    borderBottomWidth: 1.5, borderRightWidth: 1.5,
    zIndex: 10,
  },
  scanLabelTR: {
    position: 'absolute', top: 12, right: 36,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    zIndex: 10,
  },
  scanLabelBL: {
    position: 'absolute', bottom: 12, left: 36,
    zIndex: 10,
  },
  scanLabelBR: {
    position: 'absolute', bottom: 12, right: 36,
    zIndex: 10,
  },
  scanText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(0,229,255,0.3)',
    letterSpacing: 1.5,
  },
  scanDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.8,
  },
});
