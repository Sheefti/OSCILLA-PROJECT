import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';
import { AsteroidData } from '../../theme/asteroids';

interface Props {
  selectedAsteroid: AsteroidData | null;
}

interface LogLine {
  id:   number;
  text: string;
  type: 'hi' | 'wa' | 'ok' | 'normal';
}

const INITIAL_LOGS: LogLine[] = [
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
];

export default function LeftPanel({ selectedAsteroid }: Props) {
  const [vel, setVel]   = useState(28.74);
  const [dist, setDist] = useState(0.0034);
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [clock, setClock] = useState('--:--:--');
  const tt = useRef(0);
  const logId = useRef(20);

  useEffect(() => {
    const id = setInterval(() => {
      tt.current++;
      setVel(28.74  + Math.sin(tt.current * 0.04) * 1.1);
      setDist(0.0034 + Math.sin(tt.current * 0.025) * 0.0009);
      setClock(new Date().toUTCString().slice(17, 25));

      // Nouveau log toutes les 3s
      if (tt.current % 14 === 0) {
        const newLog: LogLine = {
          id: logId.current++,
          text: [
            '▶ MISE À JOUR TRAJECTOIRE',
            '✔ SIGNAL NOMINAL',
            '  CALCUL ORBITAL EN COURS',
            '⚠ ANOMALIE DÉTECTÉE',
            '✔ CORRECTION APPLIQUÉE',
          ][Math.floor(Math.random() * 5)],
          type: ['hi','ok','normal','wa','ok'][Math.floor(Math.random() * 5)] as any,
        };
        setLogs((prev) => [...prev.slice(-20), newLog]);
      }
    }, 220);
    return () => clearInterval(id);
  }, []);

  const target = selectedAsteroid ?? {
    name: '2024 YR4', cls: 'CLASSE APOLLO · PHO',
    vel: '28.74', dist: '0.0034', diam: '~50m', mag: '24.5',
  };

  return (
    <View style={styles.container}>

      {/* ── Titre ── */}
      <View style={styles.sectionTitle}>
        <View style={styles.diamond} />
        <Text style={styles.sectionTitleText}>TÉLÉMÉTRIE NASA</Text>
      </View>

      {/* ── Objet cible ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>OBJET CIBLE</Text>
        <Text style={styles.cardValue} numberOfLines={1}>{target.name}</Text>
        <Text style={styles.cardSub}>{target.cls}</Text>
      </View>

      {/* ── Vitesse orbitale ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>VITESSE ORBITALE</Text>
        <View style={styles.row}>
          <Text style={styles.cardValue}>{vel.toFixed(2)}</Text>
          <Text style={styles.cardUnit}>km/s</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${(vel / 40) * 100}%` }]} />
        </View>
      </View>

      {/* ── Distance périgée ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>DISTANCE PÉRIGÉE</Text>
        <View style={styles.row}>
          <Text style={styles.cardValue}>{dist.toFixed(4)}</Text>
          <Text style={styles.cardUnit}>UA</Text>
        </View>
        <Text style={styles.cardWarn}>⚠ APPROCHE CRITIQUE</Text>
      </View>

      {/* ── Éléments orbitaux ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ÉLÉMENTS ORBITAUX</Text>
        <Text style={styles.orbLine}>e = <Text style={styles.orbVal}>0.2174</Text>  i = <Text style={styles.orbVal}>6.08°</Text></Text>
        <Text style={styles.orbLine}>Ω = <Text style={styles.orbVal}>183.2°</Text>  ω = <Text style={styles.orbVal}>102.4°</Text></Text>
        <Text style={styles.orbLine}>a = <Text style={styles.orbVal}>1.134</Text> UA  H = <Text style={styles.orbVal}>18.7</Text></Text>
      </View>

      {/* ── Log système ── */}
      <View style={styles.logBox}>
        <ScrollView
          ref={(ref) => { if (ref) ref.scrollToEnd({ animated: true }); }}
          showsVerticalScrollIndicator={false}
        >
          {logs.map((l) => (
            <Text
              key={l.id}
              style={[styles.logLine, styles[`log_${l.type}`]]}
              numberOfLines={1}
            >
              {l.text}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* ── Stats bas ── */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>OBJETS</Text>
          <Text style={styles.statValue}>04</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>SIGNAL</Text>
          <Text style={[styles.statValue, { color: Colors.green }]}>●</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>LATENCE</Text>
          <Text style={styles.statValue}>12ms</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>PRÉCIS.</Text>
          <Text style={styles.statValue}>±0.1"</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    gap: 5,
  } as any,

  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.06)',
  },
  diamond: {
    width: 4, height: 4,
    backgroundColor: Colors.cyan,
    transform: [{ rotate: '45deg' }],
  },
  sectionTitleText: {
    fontFamily: 'monospace',
    fontSize: 7,
    letterSpacing: 3,
    color: 'rgba(0,229,255,0.3)',
  },

  card: {
    backgroundColor: 'rgba(0,229,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.1)',
    borderRadius: 5,
    padding: 6,
  },
  cardLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    letterSpacing: 2,
    color: 'rgba(0,229,255,0.3)',
    marginBottom: 2,
  },
  cardValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: Colors.cyan,
  },
  cardUnit: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(0,229,255,0.4)',
    marginLeft: 2,
    alignSelf: 'flex-end',
  },
  cardSub: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(255,80,80,0.65)',
    marginTop: 2,
  },
  cardWarn: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(255,80,80,0.65)',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressBg: {
    height: 2,
    backgroundColor: 'rgba(0,229,255,0.07)',
    borderRadius: 1,
    marginTop: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%' as any,
    backgroundColor: Colors.cyan,
  },
  orbLine: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(0,229,255,0.35)',
    lineHeight: 13,
  },
  orbVal: {
    color: 'rgba(0,229,255,0.7)',
  },

  logBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.06)',
    borderRadius: 4,
    padding: 2,
    minHeight: 0,
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 7,
    letterSpacing: 0.5,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  log_normal: { color: 'rgba(0,229,255,0.2)' },
  log_hi:     { color: 'rgba(0,229,255,0.6)' },
  log_wa:     { color: 'rgba(255,80,60,0.65)' },
  log_ok:     { color: 'rgba(0,255,136,0.55)' },

  statsGrid: {
    flexDirection: 'row',
    gap: 3,
  },
  statCell: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.06)',
    borderRadius: 4,
    padding: 3,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 6,
    color: 'rgba(0,229,255,0.25)',
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.cyan,
  },
});