import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  RadialGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';

import { useNeoAsteroids, NeoAsteroid } from '../hooks/useNeoAsteroids';

// ─── Thème ────────────────────────────────────────────────────────────────────

const C = {
  bg:       '#000103',
  red:      '#cc3333',
  redBg:    'rgba(204,51,51,0.09)',
  redBorder:'rgba(204,51,51,0.55)',
  green:    '#2ecc71',
  white:    '#ffffff',
  w82:      'rgba(255,255,255,0.82)',
  w75:      'rgba(255,255,255,0.75)',
  w50:      'rgba(255,255,255,0.50)',
  w45:      'rgba(255,255,255,0.45)',
  w40:      'rgba(255,255,255,0.40)',
  w22:      'rgba(255,255,255,0.22)',
  w09:      'rgba(255,255,255,0.09)',
  w06:      'rgba(255,255,255,0.06)',
  w04:      'rgba(255,255,255,0.04)',
  w03:      'rgba(255,255,255,0.03)',
};

// ─── Constantes UI ────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['TOUS', 'DANGEREUX', 'NOMINAUX', 'PROCHES'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const BODY_FILTERS = [
  'TOUS', 'Earth', 'Mars', 'Venus', 'Merc', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
] as const;
type BodyFilter = (typeof BODY_FILTERS)[number];

const BODY_META: Record<BodyFilter, { code: string; accent: string }> = {
  TOUS:    { code: 'TOUS',  accent: C.white },
  Earth:   { code: 'TERRE', accent: '#6db8ff' },
  Mars:    { code: 'MARS',  accent: '#d4622a' },
  Venus:   { code: 'VÉNUS', accent: '#e8c840' },
  Merc:    { code: 'MERC',  accent: '#a0a0a0' },
  Jupiter: { code: 'JUPIT', accent: '#c88b3a' },
  Saturn:  { code: 'SATUR', accent: '#e4d191' },
  Uranus:  { code: 'URAN',  accent: '#7de8e8' },
  Neptune: { code: 'NEPT',  accent: '#5b7fde' },
};

// ─── Icônes planètes SVG ──────────────────────────────────────────────────────

function PlanetIcon({ planet }: { planet: BodyFilter }) {
  switch (planet) {
    case 'Earth': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="eg-o" cx="40%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#2050c8" />
            <Stop offset="40%" stopColor="#0c2890" />
            <Stop offset="100%" stopColor="#020818" />
          </RadialGradient>
          <RadialGradient id="eg-l" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="ec"><Circle cx="12" cy="12" r="8.5" /></ClipPath>
        </Defs>
        <Circle cx="12" cy="12" r="8.5" fill="url(#eg-o)" />
        <G clipPath="url(#ec)">
          <Path d="M7 7.5 C7.5 7 8.5 7.2 9 7.8 C9.5 8.5 9.2 9.5 8.5 10.2 C7.8 11 7 11.5 7 12.5 C7 13.5 7.5 14.5 7.2 15.5 C6.9 16.5 6 16.5 6 15.5 C5.8 14.2 6.2 13 6 11.5 Z" fill="#2d7a3a" opacity={0.8} />
          <Path d="M4 10 Q8 9 12 10 Q16 11 20 9.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" />
        </G>
        <Circle cx="12" cy="12" r="8.5" fill="url(#eg-l)" />
        <Circle cx="12" cy="12" r="8.5" stroke="#c8c8c8" strokeWidth="0.6" fill="none" opacity={0.35} />
      </Svg>
    );
    case 'Mars': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="mg" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#e07848" />
            <Stop offset="30%" stopColor="#b85020" />
            <Stop offset="100%" stopColor="#2e0a00" />
          </RadialGradient>
          <RadialGradient id="ml" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,200,160,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="mc"><Circle cx="12" cy="12" r="7.5" /></ClipPath>
        </Defs>
        <Circle cx="12" cy="12" r="7.5" fill="url(#mg)" />
        <G clipPath="url(#mc)">
          <Ellipse cx="12" cy="5.5" rx="3.5" ry="1.5" fill="rgba(255,240,240,0.55)" />
          <Path d="M7 11.5 Q10 11 13 11.8 Q16 12.6 18 12" stroke="#6a2008" strokeWidth="1.5" fill="none" opacity={0.6} />
        </G>
        <Circle cx="12" cy="12" r="7.5" fill="url(#ml)" />
        <Circle cx="12" cy="12" r="7.5" stroke="#d4622a" strokeWidth="0.6" fill="none" opacity={0.45} />
      </Svg>
    );
    case 'Venus': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="vg" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#f0d860" />
            <Stop offset="35%" stopColor="#c8a020" />
            <Stop offset="100%" stopColor="#2e1c00" />
          </RadialGradient>
          <RadialGradient id="vl" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,240,160,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="vc"><Circle cx="12" cy="12" r="8" /></ClipPath>
        </Defs>
        <Circle cx="12" cy="12" r="8" fill="url(#vg)" />
        <G clipPath="url(#vc)">
          <Path d="M4 9 Q8 7.5 12 8.5 Q16 9.5 20 8.5" stroke="rgba(255,220,100,0.5)" strokeWidth="1.5" fill="none" />
          <Path d="M4 12.5 Q8 11 12 12 Q16 13 20 12" stroke="rgba(220,180,60,0.4)" strokeWidth="1.8" fill="none" />
        </G>
        <Circle cx="12" cy="12" r="8" fill="url(#vl)" />
        <Circle cx="12" cy="12" r="8" stroke="#e8c840" strokeWidth="0.6" fill="none" opacity={0.4} />
      </Svg>
    );
    case 'Merc': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="mrg" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#c0b8a8" />
            <Stop offset="35%" stopColor="#888078" />
            <Stop offset="100%" stopColor="#101008" />
          </RadialGradient>
          <RadialGradient id="mrl" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(220,210,200,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
        </Defs>
        <Circle cx="12" cy="12" r="6.5" fill="url(#mrg)" />
        <Circle cx="9"  cy="10" r="1.5" fill="rgba(0,0,0,0.3)" opacity={0.6} />
        <Circle cx="15" cy="13" r="1"   fill="rgba(0,0,0,0.25)" opacity={0.5} />
        <Circle cx="12" cy="12" r="6.5" fill="url(#mrl)" />
        <Circle cx="12" cy="12" r="6.5" stroke="#a0a0a0" strokeWidth="0.6" fill="none" opacity={0.4} />
      </Svg>
    );
    case 'Jupiter': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="jg" cx="38%" cy="32%" r="70%">
            <Stop offset="0%" stopColor="#e8c070" />
            <Stop offset="35%" stopColor="#c08030" />
            <Stop offset="100%" stopColor="#2e1800" />
          </RadialGradient>
          <RadialGradient id="jl" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,240,180,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="jc"><Circle cx="12" cy="12" r="9" /></ClipPath>
        </Defs>
        <Circle cx="12" cy="12" r="9" fill="url(#jg)" />
        <G clipPath="url(#jc)">
          <Path d="M3 10.5 Q8 9.5 12 10.5 Q16 11.5 21 10.5" stroke="#8a5010" strokeWidth="2.2" fill="none" opacity={0.65} />
          <Ellipse cx="15" cy="12.5" rx="2.5" ry="1.5" fill="#b84020" opacity={0.7} />
          <Path d="M3 13 Q8 12 12 13.2 Q16 14.4 21 13" stroke="#a06820" strokeWidth="1.4" fill="none" opacity={0.5} />
        </G>
        <Circle cx="12" cy="12" r="9" fill="url(#jl)" />
        <Circle cx="12" cy="12" r="9" stroke="#c88b3a" strokeWidth="0.6" fill="none" opacity={0.4} />
      </Svg>
    );
    case 'Saturn': return (
      <Svg width={30} height={22} viewBox="0 0 30 22">
        <Defs>
          <RadialGradient id="sg" cx="38%" cy="32%" r="70%">
            <Stop offset="0%" stopColor="#f0e090" />
            <Stop offset="30%" stopColor="#c8b050" />
            <Stop offset="100%" stopColor="#2e2200" />
          </RadialGradient>
          <RadialGradient id="sl" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,248,200,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="sc"><Circle cx="15" cy="11" r="7.5" /></ClipPath>
        </Defs>
        <Ellipse cx="15" cy="11" rx="13.5" ry="3.5" fill="none" stroke="rgba(220,190,100,0.25)" strokeWidth="2.5" />
        <Circle cx="15" cy="11" r="7.5" fill="url(#sg)" />
        <G clipPath="url(#sc)">
          <Path d="M7.5 11.5 Q11 10.5 15 11.5 Q19 12.5 22.5 11" stroke="#a88820" strokeWidth="1.5" fill="none" opacity={0.55} />
        </G>
        <Circle cx="15" cy="11" r="7.5" fill="url(#sl)" />
        <Circle cx="15" cy="11" r="7.5" stroke="#e4d191" strokeWidth="0.6" fill="none" opacity={0.4} />
        <Path d="M7 13.5 Q15 17.5 23 13.5" stroke="rgba(220,190,100,0.22)" strokeWidth="2.5" fill="none" />
      </Svg>
    );
    case 'Uranus': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="ug" cx="40%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#a8f0f0" />
            <Stop offset="30%" stopColor="#50c8c8" />
            <Stop offset="100%" stopColor="#042828" />
          </RadialGradient>
          <RadialGradient id="ul" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(200,255,255,0.22)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
        </Defs>
        <Circle cx="12" cy="12" r="8" fill="url(#ug)" />
        <Ellipse cx="12" cy="12" rx="11" ry="2.5" fill="none" stroke="rgba(125,232,232,0.2)" strokeWidth="1" />
        <Circle cx="12" cy="12" r="8" fill="url(#ul)" />
        <Circle cx="12" cy="12" r="8" stroke="#7de8e8" strokeWidth="0.6" fill="none" opacity={0.4} />
      </Svg>
    );
    case 'Neptune': return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Defs>
          <RadialGradient id="ng" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#6090f0" />
            <Stop offset="30%" stopColor="#2848b8" />
            <Stop offset="100%" stopColor="#020818" />
          </RadialGradient>
          <RadialGradient id="nl" cx="38%" cy="32%" r="55%">
            <Stop offset="0%" stopColor="rgba(160,180,255,0.2)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <ClipPath id="nc"><Circle cx="12" cy="12" r="7.5" /></ClipPath>
        </Defs>
        <Circle cx="12" cy="12" r="7.5" fill="url(#ng)" />
        <G clipPath="url(#nc)">
          <Ellipse cx="10" cy="11" rx="2.5" ry="1.8" fill="rgba(10,20,90,0.7)" opacity={0.8} />
          <Path d="M5 13 Q8 12 12 13 Q16 14 19 13" stroke="#3050b8" strokeWidth="1.5" fill="none" opacity={0.55} />
        </G>
        <Circle cx="12" cy="12" r="7.5" fill="url(#nl)" />
        <Circle cx="12" cy="12" r="7.5" stroke="#5b7fde" strokeWidth="0.6" fill="none" opacity={0.4} />
      </Svg>
    );
    default: return (
      <View style={s.planetDefault}>
        <Text style={s.planetDefaultText}>◎</Text>
      </View>
    );
  }
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 700 }),
        withTiming(0.3,  { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[s.skRow, anim]}>
      {/* badge placeholder */}
      <View style={[s.skBlock, { width: 54, height: 18, marginRight: 12 }]} />
      {/* name block */}
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[s.skBlock, { width: '60%', height: 10 }]} />
        <View style={[s.skBlock, { width: '35%', height: 7 }]} />
      </View>
      {/* stat placeholders */}
      <View style={s.skStats}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[s.skBlock, { width: 44, height: 28 }]} />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── AsteroidCard ─────────────────────────────────────────────────────────────

interface AsteroidCardProps {
  item: NeoAsteroid;
  selected: boolean;
  onSelect: () => void;
}

const AsteroidCard = React.memo(function AsteroidCard({ item, selected, onSelect }: AsteroidCardProps) {
  const isPho       = item.isHazardous;
  const accent      = isPho ? C.red   : C.w82;
  const badgeColor  = isPho ? C.red   : C.w50;
  const badgeBg     = isPho ? C.redBg : 'rgba(255,255,255,0.04)';
  const badgeBorder = isPho ? C.redBorder : C.w22;
  const barColor    = isPho ? C.red   : C.w50;

  const velKms   = (item.velocity.kmPerHour / 3600).toFixed(2);
  const distLD   = item.missDistance.lunar.toFixed(1);
  const diamKm   = item.diameterKm.max.toFixed(2);

  return (
    <Animated.View entering={FadeIn.duration(220)} layout={LinearTransition.duration(180)}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          s.row,
          selected && s.rowSelected,
          pressed  && s.rowPressed,
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.04)' }}
      >
        {/* left accent bar */}
        <View style={[s.rowBar, { backgroundColor: barColor, opacity: selected ? 1 : 0 }]} />

        {/* badge */}
        <View style={[s.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
          <Text style={[s.badgeText, { color: badgeColor }]}>
            {isPho ? '⚠ PHO' : '● NEO'}
          </Text>
        </View>

        {/* name + date */}
        <View style={s.rowMain}>
          <Text style={[s.rowName, { color: accent }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.closeApproachDate ? (
            <Text style={s.rowDate}>APPROCHE · {item.closeApproachDate}</Text>
          ) : null}
        </View>

        {/* stats */}
        <View style={s.rowStats}>
          {([
            [velKms, 'km/s'],
            [distLD, 'LD'],
            [diamKm, 'km'],
          ] as [string, string][]).map(([val, unit], i) => (
            <View key={i} style={[s.statCol, i > 0 && s.statColBorder]}>
              <Text style={[s.statVal, { color: accent }]}>{val}</Text>
              <Text style={s.statUnit}>{unit}</Text>
            </View>
          ))}
        </View>

        {/* chevron */}
        <Text style={[s.chevron, { color: accent }]}>▶</Text>
      </Pressable>
    </Animated.View>
  );
});

// ─── ErrorView ────────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.centered}>
      <Text style={[s.stateIcon, { color: 'rgba(204,51,51,0.5)' }]}>⚠</Text>
      <Text style={[s.stateTitle, { color: 'rgba(204,51,51,0.7)', letterSpacing: 4 }]}>ERREUR SYSTÈME</Text>
      <Text style={[s.stateDesc,  { color: 'rgba(204,51,51,0.4)' }]}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={s.retryBtn} activeOpacity={0.7}>
        <Text style={s.retryText}>↺  RÉESSAYER</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── ListHeader ───────────────────────────────────────────────────────────────

interface ListHeaderProps {
  total: number;
  hazardCount: number;
  activeStatus: StatusFilter;
  onStatusChange: (f: StatusFilter) => void;
  activeBody: BodyFilter;
  onBodyChange: (b: BodyFilter) => void;
}

function ListHeader({
  total, hazardCount, activeStatus, onStatusChange, activeBody, onBodyChange,
}: ListHeaderProps) {
  return (
    <View>
      {/* ── Stats bar ── */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <View style={[s.pip, { backgroundColor: C.w50, shadowColor: C.white }]} />
          <View>
            <Text style={[s.statBig, { color: C.white }]}>{total}</Text>
            <Text style={s.statLabel}>OBJETS TRACÉS</Text>
          </View>
        </View>
        <View style={s.statSep} />
        <View style={s.statItem}>
          <View style={[s.pip, { backgroundColor: C.red, shadowColor: C.red }]} />
          <View>
            <Text style={[s.statBig, { color: C.red }]}>{hazardCount}</Text>
            <Text style={s.statLabel}>POTENTIELLEMENT{'\n'}DANGEREUX</Text>
          </View>
        </View>
        <View style={s.statSep} />
        <View style={s.statItem}>
          <View style={[s.pip, { backgroundColor: C.green, shadowColor: C.green }]} />
          <View>
            <Text style={[s.statBig, { color: C.green }]}>{total - hazardCount}</Text>
            <Text style={s.statLabel}>NOMINAUX</Text>
          </View>
        </View>
      </View>

      {/* ── Filtre statut ── */}
      <View style={s.filterRow}>
        <Text style={s.filterLabel}>STATUT ·</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          <View style={s.filterChips}>
            {STATUS_FILTERS.map(f => {
              const active = activeStatus === f;
              const isRed  = f === 'DANGEREUX';
              const isGrn  = f === 'NOMINAUX';
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => onStatusChange(f)}
                  activeOpacity={0.7}
                  style={[
                    s.chip,
                    active && s.chipActive,
                    active && isRed && s.chipRed,
                    active && isGrn && s.chipGrn,
                  ]}
                >
                  <Text style={[
                    s.chipText,
                    active && s.chipTextActive,
                    active && isRed && { color: C.red },
                    active && isGrn && { color: C.green },
                  ]}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Planet nav ── */}
      <View style={s.planetNav}>
        <Text style={s.filterLabel}>CORPS · CIBLE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={s.planetTrack}>
          {BODY_FILTERS.map(b => {
            const active = activeBody === b;
            const meta   = BODY_META[b];
            return (
              <TouchableOpacity
                key={b}
                onPress={() => onBodyChange(b)}
                activeOpacity={0.7}
                style={[
                  s.planetBtn,
                  active && { borderColor: meta.accent + '59', backgroundColor: meta.accent + '12' },
                ]}
              >
                <View style={s.planetIconWrap}>
                  <PlanetIcon planet={b} />
                </View>
                <Text style={[s.planetCode, active && { color: meta.accent }]}>
                  {meta.code}
                </Text>
                {/* bottom accent bar */}
                {active && (
                  <View style={[s.planetBar, { backgroundColor: meta.accent }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List head ── */}
      <View style={s.listHead}>
        {['TYPE', 'DÉSIGNATION', 'VITESSE', 'DIST.', 'DIAM.'].map((h, i) => (
          <Text
            key={h}
            style={[s.listHeadCell, i >= 2 && { flex: 0, width: 60, textAlign: 'right' }]}
            numberOfLines={1}
          >{h}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function NeoListScreen() {
  const { asteroids, loading, refreshing, error, page, refresh } = useNeoAsteroids();

  const [activeStatus, setActiveStatus] = useState<StatusFilter>('TOUS');
  const [activeBody,   setActiveBody  ] = useState<BodyFilter>('TOUS');
  const [selectedId,   setSelectedId  ] = useState<string | null>(null);

  const filtered = asteroids
    .filter(a => {
      switch (activeStatus) {
        case 'DANGEREUX': return a.isHazardous;
        case 'NOMINAUX':  return !a.isHazardous;
        case 'PROCHES':   return a.missDistance.lunar < 5;
        default:          return true;
      }
    })
    .filter(a => activeBody === 'TOUS' || (a.orbitingBodies ?? []).includes(activeBody));

  const hazardCount = asteroids.filter(a => a.isHazardous).length;

  const renderItem = useCallback(
    ({ item }: { item: NeoAsteroid }) => (
      <AsteroidCard
        item={item}
        selected={selectedId === item.id}
        onSelect={() => setSelectedId(item.id)}
      />
    ),
    [selectedId],
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

  const emptyLabel =
    activeBody !== 'TOUS'
      ? `Aucun astéroïde ciblant ${BODY_META[activeBody].code}.`
      : activeStatus !== 'TOUS'
      ? `Aucun astéroïde dans la catégorie "${activeStatus}".`
      : 'La liste est vide. Tire vers le bas pour actualiser.';

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Topbar ── */}
      <View style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backText}>◀  RADAR</Text>
        </TouchableOpacity>

        <Text style={s.topTitle}>OSCILLA · CATALOGUE NEO</Text>

        <View style={s.topRight}>
          {page && (
            <Text style={s.topMeta}>
              {'PAGE '}
              <Text style={s.topMetaVal}>{(page.number ?? 0) + 1}</Text>
              {' / '}{page.totalPages ?? '—'}
            </Text>
          )}
          <View style={[s.liveDot, { backgroundColor: error ? C.red : C.green }]} />
          <Text style={s.topMeta}>{error ? 'HORS LIGNE' : 'NASA · NEOWS'}</Text>
        </View>
      </View>

      {/* HUD corners */}
      <View style={[s.hc, s.hcTL]} /><View style={[s.hc, s.hcTR]} />
      <View style={[s.hc, s.hcBL]} /><View style={[s.hc, s.hcBR]} />

      {/* ── Corps ── */}
      {loading ? (
        <>
          {listHeader}
          <View style={{ flex: 1 }}>
            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
          </View>
        </>
      ) : error ? (
        <>
          {listHeader}
          <ErrorView message={error} onRetry={refresh} />
        </>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.duration(300)} style={s.centered}>
              <Text style={s.stateIcon}>◎</Text>
              <Text style={s.stateTitle}>AUCUN OBJET DÉTECTÉ</Text>
              <Text style={s.stateDesc}>{emptyLabel}</Text>
            </Animated.View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={C.white}
              colors={[C.white]}
              progressBackgroundColor={C.bg}
            />
          }
          ItemSeparatorComponent={() => <View style={s.separator} />}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          windowSize={5}
          maxToRenderPerBatch={8}
          initialNumToRender={8}
        />
      )}

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity style={s.pgBtn} onPress={refresh} disabled={refreshing}>
          <Text style={s.pgBtnText}>{refreshing ? '…' : '◀'}</Text>
        </TouchableOpacity>
        <Text style={s.pgInfo}>
          {'PAGE '}
          <Text style={s.pgInfoVal}>{page ? (page.number ?? 0) + 1 : '—'}</Text>
          {' / '}{page?.totalPages ?? '—'}
        </Text>
        <TouchableOpacity style={s.pgBtn}>
          <Text style={s.pgBtnText}>▶</Text>
        </TouchableOpacity>
        <Text style={s.ftRight}>
          {filtered.length} / {asteroids.length} OBJETS · {activeStatus !== 'TOUS' || activeBody !== 'TOUS' ? 'FILTRE ACTIF' : 'TOUS'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const MONO = 'monospace' as const;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Topbar ──────────────────────────────────────────────────────────────────
  topbar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.w06,
    backgroundColor: 'rgba(0,0,3,0.98)',
  },
  backBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.w09,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backText: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 2,
    color: C.w75,
  },
  topTitle: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 4,
    color: C.w40,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topMeta: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1.5,
    color: C.w40,
  },
  topMetaVal: {
    color: C.white,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  // ── HUD corners ─────────────────────────────────────────────────────────────
  hc: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 20,
  },
  hcTL: { top: 48, left: 4, borderTopWidth: 1, borderLeftWidth: 1 },
  hcTR: { top: 48, right: 4, borderTopWidth: 1, borderRightWidth: 1 },
  hcBL: { bottom: 32, left: 4, borderBottomWidth: 1, borderLeftWidth: 1 },
  hcBR: { bottom: 32, right: 4, borderBottomWidth: 1, borderRightWidth: 1 },

  // ── Stats bar ───────────────────────────────────────────────────────────────
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.w04,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pip: {
    width: 3,
    height: 18,
    borderRadius: 2,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statBig: {
    fontFamily: MONO,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  statLabel: {
    fontFamily: MONO,
    fontSize: 6,
    letterSpacing: 1.5,
    color: C.w40,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 32,
    backgroundColor: C.w06,
    marginHorizontal: 4,
  },

  // ── Filtres ─────────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.w04,
  },
  filterLabel: {
    fontFamily: MONO,
    fontSize: 6.5,
    letterSpacing: 2,
    color: C.w45,
    width: 80,
    flexShrink: 0,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 5,
    paddingRight: 14,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.w09,
  },
  chipActive: {
    borderColor: C.w45,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  chipRed: {
    borderColor: 'rgba(204,51,51,0.6)',
    backgroundColor: 'rgba(204,51,51,0.08)',
  },
  chipGrn: {
    borderColor: 'rgba(46,204,113,0.4)',
    backgroundColor: 'rgba(46,204,113,0.07)',
  },
  chipText: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1,
    color: C.w45,
  },
  chipTextActive: {
    color: C.white,
  },

  // ── Planet nav ──────────────────────────────────────────────────────────────
  planetNav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    paddingLeft: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.w04,
  },
  planetTrack: {
    flexDirection: 'row',
    gap: 2,
    paddingRight: 14,
    alignItems: 'center',
    height: 60,
  },
  planetBtn: {
    width: 52,
    height: 56,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  planetIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetCode: {
    fontFamily: MONO,
    fontSize: 5,
    letterSpacing: 1.5,
    color: C.w40,
    textTransform: 'uppercase',
  },
  planetBar: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    borderRadius: 2,
    opacity: 0.8,
  },
  planetDefault: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetDefaultText: {
    fontSize: 16,
    color: C.w40,
  },

  // ── List header row ──────────────────────────────────────────────────────────
  listHead: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.w04,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  listHeadCell: {
    flex: 1,
    fontFamily: MONO,
    fontSize: 6,
    letterSpacing: 2,
    color: C.w40,
  },

  // ── Rows ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: C.w04,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    position: 'relative',
  },
  rowSelected: {
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  rowBar: {
    position: 'absolute',
    left: 0,
    top: '15%',
    bottom: '15%',
    width: 2,
    borderRadius: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    minWidth: 52,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  rowMain: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rowDate: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1,
    color: C.w40,
  },
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  statColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: C.w06,
  },
  statVal: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statUnit: {
    fontFamily: MONO,
    fontSize: 7,
    color: C.w45,
    marginTop: 1,
  },
  chevron: {
    fontFamily: MONO,
    fontSize: 8,
    opacity: 0.5,
  },

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  skRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.w04,
    gap: 10,
  },
  skStats: {
    flexDirection: 'row',
    gap: 10,
  },
  skBlock: {
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // ── States ───────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 12,
  },
  stateIcon: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.1)',
  },
  stateTitle: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.25)',
  },
  stateDesc: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.18)',
    textAlign: 'center',
    lineHeight: 16,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(204,51,51,0.4)',
    backgroundColor: 'rgba(204,51,51,0.08)',
  },
  retryText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2,
    color: C.red,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.w04,
    position: 'relative',
  },
  pgBtn: {
    width: 20,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.w09,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pgBtnText: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.w40,
  },
  pgInfo: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.35)',
  },
  pgInfoVal: {
    color: C.white,
  },
  ftRight: {
    position: 'absolute',
    right: 14,
    fontFamily: MONO,
    fontSize: 6,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.22)',
  },
});
