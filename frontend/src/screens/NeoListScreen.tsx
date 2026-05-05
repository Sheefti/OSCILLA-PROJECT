/**
 * NeoListScreen.tsx
 *
 * Écran principal de la liste des astéroïdes NEO.
 * Fonctionnalités démontrées :
 *   ✅ 1. Données via API (GET /api/neo via hook useNeoAsteroids)
 *   ✅ 2. FlatList verticale
 *   ✅ 3. refreshControl prop
 *   ✅ 4. Animations Reanimated (entering sur items + layout)
 *   ✅ 5. ListHeaderComponent (stats + titre)
 *   ✅ 6. Nested ScrollView (filtres horizontaux dans le header)
 *   ✅ 7. Skeletons pour le loader
 *   ✅ 8. Gestion données vides / erreur
 *   ✅ 9. windowSize + maxToRenderPerBatch (optionnel)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { Colors } from '../theme/colors';
import { useNeoAsteroids, NeoAsteroid } from '../hooks/useNeoAsteroids';

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['TOUS', 'DANGEREUX', 'NOMINAUX', 'PROCHES'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

// Toutes les planètes du système solaire présentes dans les données NASA NeoWS
const BODY_FILTERS = [
  'TOUS', 'Earth', 'Mars', 'Venus', 'Merc', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
] as const;
type BodyFilter = (typeof BODY_FILTERS)[number];

const BODY_LABELS: Record<BodyFilter, string> = {
  TOUS:    'TOUS',
  Earth:   '🌍 TERRE',
  Mars:    '🔴 MARS',
  Venus:   '🟡 VÉNUS',
  Merc:    '⚫ MERCURE',
  Jupiter: '🟠 JUPITER',
  Saturn:  '🪐 SATURNE',
  Uranus:  '🔵 URANUS',
  Neptune: '🌀 NEPTUNE',
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.3, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.skeletonCard, animStyle]}>
      <View style={styles.skeletonLeft}>
        <View style={styles.skeletonBadge} />
        <View style={styles.skeletonNameWide} />
        <View style={styles.skeletonNameNarrow} />
      </View>
      <View style={styles.skeletonRight}>
        <View style={styles.skeletonStat} />
        <View style={styles.skeletonStat} />
        <View style={styles.skeletonStat} />
      </View>
    </Animated.View>
  );
}

function SkeletonList() {
  return (
    <View style={styles.skeletonContainer}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

// ─── Asteroid Card ────────────────────────────────────────────────────────────

interface AsteroidCardProps {
  item: NeoAsteroid;
  index: number;
}

const AsteroidCard = React.memo(function AsteroidCard({ item, index }: AsteroidCardProps) {
  const accentColor = item.isHazardous ? Colors.red : Colors.cyan;
  const borderColor = item.isHazardous
    ? 'rgba(255,61,61,0.18)'
    : Colors.cyanBorder;

  const velKms = (item.velocity.kmPerHour / 3600).toFixed(2);
  const distLunar = item.missDistance.lunar.toFixed(1);

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      layout={LinearTransition.duration(200)}
    >
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { borderColor },
          pressed && styles.cardPressed,
        ]}
        android_ripple={{ color: 'rgba(0,229,255,0.06)' }}
        onPress={() =>
          router.push({
            pathname: '/radar/neo-details',
            params: { data: JSON.stringify(item) },
          })
        }
      >
        {/* Badge alerte */}
        <View style={[styles.alertBadge, { backgroundColor: item.isHazardous ? 'rgba(255,61,61,0.12)' : 'rgba(0,229,255,0.06)', borderColor }]}>
          <Text style={[styles.alertBadgeText, { color: accentColor }]}>
            {item.isHazardous ? '⚠ PHO' : '● NEO'}
          </Text>
        </View>

        {/* Nom + date */}
        <View style={styles.cardMain}>
          <Text style={[styles.cardName, { color: accentColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.closeApproachDate && (
            <Text style={styles.cardDate}>APPROCHE · {item.closeApproachDate}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>VITESSE</Text>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {velKms} <Text style={styles.statUnit}>km/s</Text>
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DIST.</Text>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {distLunar} <Text style={styles.statUnit}>LD</Text>
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DIAM.</Text>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {item.diameterKm.max.toFixed(2)} <Text style={styles.statUnit}>km</Text>
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <Text style={[styles.chevron, { color: accentColor }]}>▶</Text>
      </Pressable>
    </Animated.View>
  );
});

// ─── Error View ───────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠</Text>
      <Text style={styles.errorTitle}>ERREUR SYSTÈME</Text>
      <Text style={styles.errorDesc}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.75}>
        <Text style={styles.retryBtnText}>↺  RÉESSAYER</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── List Header Component ────────────────────────────────────────────────────

interface ListHeaderProps {
  total: number;
  hazardCount: number;
  activeStatus: StatusFilter;
  onStatusChange: (f: StatusFilter) => void;
  activeBody: BodyFilter;
  onBodyChange: (b: BodyFilter) => void;
}

function ListHeader({ total, hazardCount, activeStatus, onStatusChange, activeBody, onBodyChange }: ListHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Stats row */}
      <View style={styles.headerStats}>
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>{total}</Text>
          <Text style={styles.headerStatLabel}>OBJETS TRACÉS</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={[styles.headerStatValue, { color: Colors.red }]}>{hazardCount}</Text>
          <Text style={styles.headerStatLabel}>POTENTIELLEMENT DANGEREUX</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={[styles.headerStatValue, { color: Colors.green }]}>
            {total - hazardCount}
          </Text>
          <Text style={styles.headerStatLabel}>NOMINAUX</Text>
        </View>
      </View>

      {/* Filtres statut — ScrollView horizontal (Nested ScrollView) */}
      <Text style={styles.filterGroupLabel}>STATUT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
        nestedScrollEnabled
      >
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeStatus === f && styles.filterChipActive]}
            onPress={() => onStatusChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeStatus === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtres corps célestes — deuxième ScrollView horizontal imbriqué */}
      <Text style={styles.filterGroupLabel}>CORPS CÉLESTE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={[styles.filtersScroll, { marginBottom: 4 }]}
        nestedScrollEnabled
      >
        {BODY_FILTERS.map((b) => (
          <TouchableOpacity
            key={b}
            style={[styles.filterChip, activeBody === b && styles.filterChipBodyActive]}
            onPress={() => onBodyChange(b)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, activeBody === b && styles.filterChipTextActive]}>
              {BODY_LABELS[b]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function NeoListScreen() {
  const { asteroids, loading, refreshing, error, page, refresh } = useNeoAsteroids();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('TOUS');
  const [activeBody, setActiveBody] = useState<BodyFilter>('TOUS');

  // Filtrage combiné statut + corps céleste
  const filteredAsteroids = asteroids
    .filter((a) => {
      switch (activeStatus) {
        case 'DANGEREUX': return a.isHazardous;
        case 'NOMINAUX':  return !a.isHazardous;
        case 'PROCHES':   return a.missDistance.lunar < 5;
        default:          return true;
      }
    })
    .filter((a) => {
      if (activeBody === 'TOUS') return true;
      // Fallback défensif : orbitingBodies peut être undefined si le backend
      // n'a pas encore été redémarré avec la nouvelle version
      return (a.orbitingBodies ?? []).includes(activeBody);
    });

  const hazardCount = asteroids.filter((a) => a.isHazardous).length;

  const renderItem = useCallback(
    ({ item, index }: { item: NeoAsteroid; index: number }) => (
      <AsteroidCard item={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: NeoAsteroid) => item.id, []);

  const listHeader = (
    <ListHeader
      total={asteroids.length}
      hazardCount={hazardCount}
      activeStatus={activeStatus}
      onStatusChange={setActiveStatus}
      activeBody={activeBody}
      onBodyChange={setActiveBody}
    />
  );

  // Message vide contextualisé
  const emptyLabel =
    activeBody !== 'TOUS'
      ? `Aucun astéroïde dont l'approche cible ${BODY_LABELS[activeBody]}.`
      : activeStatus !== 'TOUS'
      ? `Aucun astéroïde dans la catégorie "${activeStatus}".`
      : 'La liste est vide. Tire vers le bas pour actualiser.';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Topbar ── */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Text style={styles.backBtnText}>◀  RADAR</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>OSCILLA · CATALOGUE NEO</Text>

        <View style={styles.topRight}>
          {page && (
            <Text style={styles.topMeta}>
              PAGE <Text style={styles.topMetaVal}>{(page.number ?? 0) + 1}</Text> /{' '}
              {page.totalPages ?? '—'}
            </Text>
          )}
          <View style={[styles.liveDot, { backgroundColor: error ? Colors.red : Colors.green }]} />
          <Text style={styles.topMeta}>{error ? 'HORS LIGNE' : 'NASA · NEOWS'}</Text>
        </View>
      </View>

      {/* ── Corps ── */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <ErrorView message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={filteredAsteroids}
          renderItem={renderItem}
          keyExtractor={keyExtractor}

          // ✅ 5. ListHeaderComponent
          ListHeaderComponent={listHeader}

          // ✅ 3. RefreshControl
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.cyan}
              colors={[Colors.cyan]}
              progressBackgroundColor={Colors.bg}
            />
          }

          // ✅ 8. Gestion données vides
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>◎</Text>
              <Text style={styles.emptyTitle}>AUCUN OBJET DÉTECTÉ</Text>
              <Text style={styles.emptyDesc}>{emptyLabel}</Text>
            </Animated.View>
          }

          // ✅ 9. Optimisation performance (optionnel)
          windowSize={5}
          maxToRenderPerBatch={8}
          initialNumToRender={8}

          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Coins HUD */}
      <View style={[styles.hc, styles.hcTL]} />
      <View style={[styles.hc, styles.hcTR]} />
      <View style={[styles.hc, styles.hcBL]} />
      <View style={[styles.hc, styles.hcBR]} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Topbar ──────────────────────────────────────────────────────────────────
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
  backBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.cyan,
  },
  topTitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(0,229,255,0.6)',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  topMeta: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1.5,
    color: 'rgba(0,229,255,0.3)',
  },
  topMetaVal: {
    color: Colors.amber,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cyanBorder,
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 0,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  headerStatLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(0,229,255,0.3)',
    letterSpacing: 1.5,
    marginTop: 2,
    textAlign: 'center',
  },
  headerStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.cyanBorder,
    marginHorizontal: 4,
  },

  // ── Filtres (Nested ScrollView horizontal) ───────────────────────────────────
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.cyanBorder,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.cyanDark,
    borderColor: Colors.cyan,
  },
  filterChipBodyActive: {
    backgroundColor: Colors.amberDark,
    borderColor: Colors.amber,
  },
  filterGroupLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    letterSpacing: 2,
    color: 'rgba(0,229,255,0.25)',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  filterChipText: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(0,229,255,0.35)',
  },
  filterChipTextActive: {
    color: Colors.cyan,
  },

  // ── Liste ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.04)',
    marginHorizontal: 16,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.cyanBorder,
    backgroundColor: 'rgba(0,229,255,0.012)',
  },
  cardPressed: {
    backgroundColor: 'rgba(0,229,255,0.035)',
  },
  alertBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 54,
  },
  alertBadgeText: {
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  cardMain: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardDate: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(0,229,255,0.3)',
    letterSpacing: 1.5,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statItem: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(0,229,255,0.3)',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statUnit: {
    fontSize: 8,
    fontWeight: '400',
    color: 'rgba(0,229,255,0.4)',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.cyanBorder,
  },
  chevron: {
    fontFamily: 'monospace',
    fontSize: 9,
    opacity: 0.5,
    marginLeft: 4,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  skeletonContainer: {
    flex: 1,
    paddingTop: 8,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,229,255,0.07)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.04)',
  },
  skeletonLeft: {
    flex: 1,
    gap: 8,
  },
  skeletonBadge: {
    width: 54,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(0,229,255,0.08)',
  },
  skeletonNameWide: {
    width: '60%',
    height: 14,
    borderRadius: 2,
    backgroundColor: 'rgba(0,229,255,0.08)',
  },
  skeletonNameNarrow: {
    width: '35%',
    height: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  skeletonRight: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonStat: {
    width: 48,
    height: 32,
    borderRadius: 2,
    backgroundColor: 'rgba(0,229,255,0.06)',
  },

  // ── Empty ─────────────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
    color: 'rgba(0,229,255,0.12)',
  },
  emptyTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 4,
    color: 'rgba(0,229,255,0.3)',
  },
  emptyDesc: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(0,229,255,0.2)',
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── Error ──────────────────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  errorIcon: {
    fontSize: 36,
    color: Colors.red,
    opacity: 0.6,
  },
  errorTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 4,
    color: Colors.red,
  },
  errorDesc: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,61,61,0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,61,61,0.4)',
    borderRadius: 4,
    backgroundColor: 'rgba(255,61,61,0.08)',
  },
  retryBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.red,
  },

  // ── HUD Corners ───────────────────────────────────────────────────────────────
  hc: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: 'rgba(0,229,255,0.2)',
  },
  hcTL: { top: 48, left: 4, borderTopWidth: 1, borderLeftWidth: 1 },
  hcTR: { top: 48, right: 4, borderTopWidth: 1, borderRightWidth: 1 },
  hcBL: { bottom: 4, left: 4, borderBottomWidth: 1, borderLeftWidth: 1 },
  hcBR: { bottom: 4, right: 4, borderBottomWidth: 1, borderRightWidth: 1 },
});
