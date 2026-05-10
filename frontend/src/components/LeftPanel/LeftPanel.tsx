/**
 * src/components/LeftPanel/LeftPanel.tsx
 * Panneau de télémétrie gauche — fidèle à oscilla-v3.html
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { PlanetAsteroidData } from '../../theme/planets';

interface Props {
  selectedAsteroid: PlanetAsteroidData | null;
  accentCol:        string;
  accentRgb:        string;
  asteroidCount:    number;
  onOpenCatalogue?: () => void;
}

interface LogLine {
  id:   number;
  text: string;
  type: 'hi' | 'wa' | 'ok' | 'normal';
}

const LOG_LINES: LogLine[] = [
  { id:0,  text: '▶ ΣTRACK · ACQUISITION VERROU', type: 'hi' },
  { id:1,  text: '  MJD 60432.771 · ÉPOQUE J2000', type: 'normal' },
  { id:2,  text: '⚠ 2024 YR4 · DISTANCE CRITIQUE', type: 'wa' },
  { id:3,  text: '  ΔV: +0.012 km/s²', type: 'normal' },
  { id:4,  text: '✔ 1994 PC1 · NOMINAL', type: 'ok' },
  { id:5,  text: '  FLUX: 4.2 kJy', type: 'normal' },
  { id:6,  text: '▶ APOPHIS · SUIVI ACTIF', type: 'hi' },
  { id:7,  text: '⚡ PERTURBATION GRAVIT.', type: 'wa' },
  { id:8,  text: '✔ SYSTÈMES NOMINAUX', type: 'ok' },
  { id:9,  text: '  2025 BX12 · ALT 387km', type: 'normal' },
  { id:10, text: '▶ RADAR · SCAN COMPLET', type: 'hi' },
  { id:11, text: '✔ 4 OBJETS TRACKÉS', type: 'ok' },
  // duplicate for seamless loop
  { id:12, text: '▶ ΣTRACK · ACQUISITION VERROU', type: 'hi' },
  { id:13, text: '  MJD 60432.771 · ÉPOQUE J2000', type: 'normal' },
  { id:14, text: '⚠ 2024 YR4 · DISTANCE CRITIQUE', type: 'wa' },
  { id:15, text: '  ΔV: +0.012 km/s²', type: 'normal' },
  { id:16, text: '✔ 1994 PC1 · NOMINAL', type: 'ok' },
  { id:17, text: '  FLUX: 4.2 kJy', type: 'normal' },
  { id:18, text: '▶ APOPHIS · SUIVI ACTIF', type: 'hi' },
  { id:19, text: '⚡ PERTURBATION GRAVIT.', type: 'wa' },
  { id:20, text: '✔ SYSTÈMES NOMINAUX', type: 'ok' },
  { id:21, text: '  2025 BX12 · ALT 387km', type: 'normal' },
];

const LINE_H = 17; // paddingVertical 2+2 + fontSize 7 + border ≈ 17px
const HALF   = 11; // half of LOG_LINES (first half)

export default function LeftPanel({
  selectedAsteroid, accentCol, accentRgb, asteroidCount, onOpenCatalogue,
}: Props) {
  const [vel,  setVel]  = useState(28.74);
  const [dist, setDist] = useState(0.0034);
  const tt = useRef(0);

  const baseVel  = selectedAsteroid ? parseFloat(selectedAsteroid.vel)  || 28.74  : 28.74;
  const baseDist = selectedAsteroid ? parseFloat(selectedAsteroid.dist) || 0.0034 : 0.0034;

  // Animated log scroll — seamless loop like CSS scrollL
  const scrollY = useRef(new Animated.Value(0)).current;
  const totalH  = HALF * LINE_H;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollY, {
        toValue: -totalH,
        duration: 14000,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [totalH]);

  useEffect(() => {
    const id = setInterval(() => {
      tt.current++;
      setVel(baseVel   + Math.sin(tt.current * 0.04) * 1.1);
      setDist(baseDist + Math.sin(tt.current * 0.025) * 0.0009);
    }, 220);
    return () => clearInterval(id);
  }, [baseVel, baseDist]);

  const target = selectedAsteroid ?? {
    name: '2024 YR4', cls: 'CLASSE APOLLO · PHO',
    vel: '28.74', dist: '0.0034',
  };

  const velRatio = Math.min(Math.max(vel / 40, 0), 1);

  const accent      = accentCol;
  const accentFaint = `rgba(${accentRgb},0.30)`;
  const accentMid   = `rgba(${accentRgb},0.65)`;
  const cardBg      = 'rgba(255,255,255,0.012)';
  const cardBorder  = 'rgba(255,255,255,0.07)';

  return (
    <View style={s.container}>

      {/* Titre section */}
      <View style={s.ptitle}>
        <View style={[s.diamond, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
        <Text style={s.ptitleText}>TÉLÉMÉTRIE NASA</Text>
      </View>

      {/* Objet cible */}
      <View style={[s.gc, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={s.gcTopLine} />
        <Text style={s.lb}>OBJET CIBLE</Text>
        <Text style={[s.vl, { fontSize: 11 }]} numberOfLines={1}>
          {target.name}
        </Text>
        <Text style={s.sb}>{target.cls}</Text>
      </View>

      {/* Vitesse orbitale */}
      <View style={[s.gc, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={s.gcTopLine} />
        <Text style={s.lb}>VITESSE ORBITALE</Text>
        <View style={s.row}>
          <Text style={s.vl}>{vel.toFixed(2)}</Text>
          <Text style={s.un}>km/s</Text>
        </View>
        <View style={s.pbar}>
          <View style={[s.pbarF, { width: `${(velRatio * 100).toFixed(1)}%` as any, backgroundColor: '#ffffff' }]} />
        </View>
      </View>

      {/* Distance périgée */}
      <View style={[s.gc, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={s.gcTopLine} />
        <Text style={s.lb}>DISTANCE PÉRIGÉE</Text>
        <View style={s.row}>
          <Text style={s.vl}>{dist.toFixed(4)}</Text>
          <Text style={s.un}>UA</Text>
        </View>
        <Text style={s.sb}>⚠ ALERTE APPROCHE CRITIQUE</Text>
      </View>

      {/* Éléments orbitaux */}
      <View style={[s.gc, { backgroundColor: cardBg, borderColor: cardBorder, paddingVertical: 5, paddingHorizontal: 7 }]}>
        <View style={s.gcTopLine} />
        <Text style={s.lb}>ÉLÉMENTS ORBITAUX</Text>
        <Text style={s.orbLine}>
          {'e = '}<Text style={s.orbVal}>0.2174</Text>
          {'  i = '}<Text style={s.orbVal}>6.08°</Text>
        </Text>
        <Text style={s.orbLine}>
          {'Ω = '}<Text style={s.orbVal}>183.2°</Text>
          {'  ω = '}<Text style={s.orbVal}>102.4°</Text>
        </Text>
        <Text style={s.orbLine}>
          {'a = '}<Text style={s.orbVal}>1.134</Text>
          {' UA  H = '}<Text style={s.orbVal}>18.7</Text>
          {' mag'}
        </Text>
      </View>

      {/* Log — scroll continu */}
      <View style={s.logBox}>
        <Animated.View style={{ transform: [{ translateY: scrollY }] }}>
          {LOG_LINES.map((l) => (
            <Text key={l.id} style={[s.ll, s[`ll_${l.type}`]]} numberOfLines={1}>
              {l.text}
            </Text>
          ))}
        </Animated.View>
      </View>

      {/* Stats grid */}
      <View style={s.sgrid}>
        <View style={s.sc}>
          <Text style={s.sl}>OBJETS</Text>
          <Text style={[s.sv, { color: accent }]}>{String(asteroidCount).padStart(2, '0')}</Text>
        </View>
        <View style={s.sc}>
          <Text style={s.sl}>SIGNAL</Text>
          <Text style={[s.sv, { color: '#00ff88', textShadowColor: '#00ff88', textShadowRadius: 8, textShadowOffset: { width:0, height:0 } }]}>●</Text>
        </View>
        <View style={s.sc}>
          <Text style={s.sl}>LATENCE</Text>
          <Text style={[s.sv, { color: accent }]}>12ms</Text>
        </View>
        <View style={s.sc}>
          <Text style={s.sl}>PRÉCIS.</Text>
          <Text style={[s.sv, { color: accent }]}>±0.1"</Text>
        </View>
      </View>

      {/* Bouton catalogue — dans le panel, en bas */}
      <TouchableOpacity style={s.catBtn} onPress={onOpenCatalogue} activeOpacity={0.75}>
        <View style={s.catTopLine} />
        <Text style={s.catIcon}>⊞</Text>
        <Text style={s.catLabel}>CATALOGUE</Text>
        <Text style={s.catCount}>2847</Text>
      </TouchableOpacity>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 7, gap: 4 },

  ptitle: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingBottom: 5, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  diamond: { width: 4, height: 4, transform: [{ rotate: '45deg' }] },
  ptitleText: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, letterSpacing: 3, color: 'rgba(255,255,255,0.30)',
  },

  // Glassmorphism card
  gc: {
    borderWidth: 1, borderRadius: 4,
    paddingVertical: 5, paddingHorizontal: 8,
    position: 'relative', overflow: 'hidden',
  },
  // Top highlight line — approximates CSS ::after gradient
  gcTopLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  lb: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, letterSpacing: 2,
    color: 'rgba(255,255,255,0.30)', marginBottom: 2,
  },
  vl: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 13, color: '#ffffff',
  },
  un: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 8, color: 'rgba(255,255,255,0.4)', marginLeft: 2, alignSelf: 'flex-end',
  },
  sb: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, color: 'rgba(255,80,80,0.65)', marginTop: 2,
  },
  row: { flexDirection: 'row', alignItems: 'baseline' },
  pbar: {
    height: 2, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 1, marginTop: 3, overflow: 'hidden',
  },
  pbarF: { height: '100%' },

  orbLine: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, color: 'rgba(255,255,255,0.35)', lineHeight: 13,
  },
  orbVal: { fontFamily: 'ShareTechMono_400Regular', color: 'rgba(255,255,255,0.70)' },

  // Log
  logBox: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4, overflow: 'hidden', minHeight: 0,
  },
  ll: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, letterSpacing: 0.5,
    paddingVertical: 2, paddingHorizontal: 7,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  ll_normal: { color: 'rgba(255,255,255,0.18)' },
  ll_hi:     { color: 'rgba(255,255,255,0.55)' },
  ll_wa:     { color: 'rgba(255,75,55,0.65)' },
  ll_ok:     { color: 'rgba(0,220,110,0.50)' },

  // Stats grid
  sgrid: { flexDirection: 'row', gap: 3 },
  sc: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.40)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4, padding: 3, alignItems: 'center',
  },
  sl: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 6, color: 'rgba(255,255,255,0.25)', letterSpacing: 1,
  },
  sv: { fontFamily: 'ShareTechMono_400Regular', fontSize: 10, color: '#ffffff' },

  // Catalogue button
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5, paddingVertical: 6, paddingHorizontal: 8,
    position: 'relative', overflow: 'hidden',
  },
  catTopLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  catIcon:  { fontSize: 11, color: 'rgba(255,255,255,0.50)' },
  catLabel: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, letterSpacing: 2.5, color: 'rgba(255,255,255,0.40)',
    flex: 1,
  },
  catCount: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7, letterSpacing: 1, color: 'rgba(255,255,255,0.20)',
  },
});