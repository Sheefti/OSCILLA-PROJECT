/**
 * NeoDetailScreen.tsx
 *
 * Écran de détail pour un astéroïde issu de l'API NASA NeoWS.
 * Reçoit l'objet NeoAsteroid sérialisé en JSON via les params de navigation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { NeoAsteroid } from '../hooks/useNeoAsteroids';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Row({ label, value, accent = Colors.cyan }: { label: string; value: string; accent?: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function Section({ title, children, index = 0 }: { title: string; children: React.ReactNode; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(350)} style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionBar} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

// ─── Écran ────────────────────────────────────────────────────────────────────

export default function NeoDetailScreen({ asteroid }: { asteroid: NeoAsteroid }) {
  const isHazardous = asteroid.isHazardous;
  const accent = isHazardous ? Colors.red : Colors.cyan;
  const borderColor = isHazardous ? 'rgba(255,61,61,0.2)' : Colors.cyanBorder;

  const velKms = (asteroid.velocity.kmPerHour / 3600).toFixed(3);
  const velKmh = asteroid.velocity.kmPerHour.toLocaleString('fr-FR');
  const distLunar = asteroid.missDistance.lunar.toFixed(2);
  const distKm = asteroid.missDistance.km.toLocaleString('fr-FR');
  const diamMin = asteroid.diameterKm.min.toFixed(3);
  const diamMax = asteroid.diameterKm.max.toFixed(3);

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Topbar ── */}
      <Animated.View entering={FadeIn.duration(300)} style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Text style={s.backBtnText}>◀  CATALOGUE</Text>
        </TouchableOpacity>

        <Text style={s.topTitle}>OSCILLA · FICHE NEO</Text>

        <View style={[s.statusBadge, { borderColor }]}>
          <View style={[s.statusDot, { backgroundColor: accent }]} />
          <Text style={[s.statusText, { color: accent }]}>
            {isHazardous ? 'PHO · MENACE CONFIRMÉE' : 'NEO · NOMINAL'}
          </Text>
        </View>
      </Animated.View>

      {/* ── Titre de l'astéroïde ── */}
      <Animated.View entering={FadeInDown.delay(40).duration(350)} style={[s.hero, { borderBottomColor: borderColor }]}>
        <Text style={s.heroId}>NASA JPL · NEO-ID {asteroid.id}</Text>
        <Text style={[s.heroName, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
          {asteroid.name}
        </Text>
        {asteroid.closeApproachDate && (
          <Text style={s.heroDate}>PROCHAINE APPROCHE · {asteroid.closeApproachDate}</Text>
        )}
      </Animated.View>

      {/* ── Corps scrollable ── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <Section title="DONNÉES DYNAMIQUES" index={1}>
          <Row label="VITESSE RELATIVE"    value={`${velKms} km/s`}   accent={accent} />
          <Row label="VITESSE (km/h)"      value={`${velKmh} km/h`}   accent={accent} />
          <View style={s.divider} />
          <Row label="DISTANCE PÉRIGÉE"    value={`${distLunar} LD`}  accent={isHazardous ? Colors.amber : Colors.cyan} />
          <Row label="DISTANCE (km)"       value={`${distKm} km`}     accent={isHazardous ? Colors.amber : Colors.cyan} />
        </Section>

        <Section title="DONNÉES PHYSIQUES" index={2}>
          <Row label="DIAMÈTRE MIN."       value={`${diamMin} km`}    accent={Colors.green} />
          <Row label="DIAMÈTRE MAX."       value={`${diamMax} km`}    accent={Colors.green} />
        </Section>

        <Section title="CORPS CÉLESTES ASSOCIÉS" index={3}>
          {asteroid.orbitingBodies.length > 0 ? (
            <View style={s.chips}>
              {asteroid.orbitingBodies.map((b) => (
                <View key={b} style={[s.chip, { borderColor }]}>
                  <Text style={[s.chipText, { color: accent }]}>{b.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.noData}>Aucune donnée d'approche disponible.</Text>
          )}
        </Section>

        {/* Alerte si dangereux */}
        {isHazardous && (
          <Animated.View entering={FadeInDown.delay(320).duration(350)} style={s.alertBox}>
            <Text style={s.alertTitle}>⚠  OBJET POTENTIELLEMENT DANGEREUX</Text>
            <Text style={s.alertBody}>
              Cet astéroïde est classé PHO (Potentially Hazardous Object) par la NASA.{'\n'}
              Sa trajectoire nécessite une surveillance continue.
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Coins HUD */}
      <View style={[s.hc, s.hcTL, { borderColor }]} />
      <View style={[s.hc, s.hcTR, { borderColor }]} />
      <View style={[s.hc, s.hcBL]} />
      <View style={[s.hc, s.hcBR]} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  topbar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cyanBorder,
    backgroundColor: 'rgba(1,8,16,0.95)',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cyanBorder,
    backgroundColor: Colors.cyanDark,
  },
  backBtnText: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, color: Colors.cyan },
  topTitle: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 3, color: 'rgba(0,229,255,0.5)' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 4, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 },

  hero: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  heroId: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'rgba(0,229,255,0.3)', marginBottom: 4 },
  heroName: { fontFamily: 'monospace', fontSize: 30, fontWeight: '700', letterSpacing: 2, lineHeight: 34 },
  heroDate: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 2, color: 'rgba(0,229,255,0.35)', marginTop: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  section: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.cyanBorder,
    borderRadius: 6,
    backgroundColor: 'rgba(0,229,255,0.02)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.cyanBorder,
    backgroundColor: 'rgba(0,229,255,0.03)',
  },
  sectionBar: { width: 3, height: 10, borderRadius: 2, backgroundColor: Colors.cyan },
  sectionTitle: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 2.5, color: 'rgba(0,229,255,0.5)' },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
  },
  rowLabel: { fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 },
  rowValue: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.cyanBorder, marginHorizontal: 14 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14 },
  chip: {
    paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: 2, borderWidth: 1,
    backgroundColor: 'rgba(0,229,255,0.04)',
  },
  chipText: { fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 },
  noData: { fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,229,255,0.2)', padding: 14, letterSpacing: 1 },

  alertBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,61,61,0.3)',
    borderRadius: 6,
    padding: 14,
    backgroundColor: 'rgba(255,61,61,0.05)',
  },
  alertTitle: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, color: Colors.red, marginBottom: 8, fontWeight: '700' },
  alertBody: { fontFamily: 'monospace', fontSize: 8.5, letterSpacing: 0.5, color: 'rgba(255,61,61,0.5)', lineHeight: 15 },

  hc: { position: 'absolute', width: 14, height: 14, borderColor: 'rgba(0,229,255,0.2)' },
  hcTL: { top: 48, left: 4, borderTopWidth: 1, borderLeftWidth: 1 },
  hcTR: { top: 48, right: 4, borderTopWidth: 1, borderRightWidth: 1 },
  hcBL: { bottom: 4, left: 4, borderBottomWidth: 1, borderLeftWidth: 1 },
  hcBR: { bottom: 4, right: 4, borderBottomWidth: 1, borderRightWidth: 1 },
});
