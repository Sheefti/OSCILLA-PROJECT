

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Circle, Ellipse, Path, G, Rect,
  Defs, RadialGradient, LinearGradient, Stop, ClipPath,
} from 'react-native-svg';
import { PLANET_ORDER, INNER_PLANETS, OUTER_PLANETS, PLANETS } from '../../theme/planets';

interface Props {
  selectedPlanet: string;
  onSelectPlanet: (key: string) => void;
}

function MercureIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="merg" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#c8c8d8"/>
          <Stop offset="30%"  stopColor="#8c8ca0"/>
          <Stop offset="70%"  stopColor="#484858"/>
          <Stop offset="100%" stopColor="#1a1a26"/>
        </RadialGradient>
      </Defs>
      <Circle cx={12} cy={12} r={7.5} fill="url(#merg)"/>
      <G opacity={0.6}>
        <Path d="M5 9 Q8 8.2 11 9.5 Q14 10.8 18 9.2" stroke="#6a6a7a" strokeWidth={0.7} fill="none"/>
        <Path d="M4.8 13 Q7 12 10 13.5 Q13 15 17 13" stroke="#5a5a6a" strokeWidth={0.5} fill="none"/>
      </G>
      <Circle cx={9.2} cy={9.8} r={1.5} fill="none" stroke="#3a3a4a" strokeWidth={0.6} opacity={0.8}/>
      <Circle cx={14.5} cy={13.5} r={1.1} fill="none" stroke="#404050" strokeWidth={0.5} opacity={0.7}/>
      <Circle cx={12} cy={12} r={7.5} stroke="#b0b0c8" strokeWidth={0.6} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function VenusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="veg2" cx="40%" cy="32%" r="70%">
          <Stop offset="0%"   stopColor="#f0d878"/>
          <Stop offset="25%"  stopColor="#d4a83a"/>
          <Stop offset="60%"  stopColor="#8c6010"/>
          <Stop offset="100%" stopColor="#2e1a00"/>
        </RadialGradient>
      </Defs>
      <Circle cx={12} cy={12} r={8} fill="url(#veg2)"/>
      <Path d="M4.2 8.5 C6 7.5 9 8.8 12 8.2 C15 7.6 18 8.5 19.8 8" stroke="#e8c060" strokeWidth={1.4} fill="none" opacity={0.5}/>
      <Path d="M4 10.5 C7 9.2 10 11 12 10.2 C14.5 9.3 17 10.5 20 10" stroke="#c89830" strokeWidth={1} fill="none" opacity={0.45}/>
      <Path d="M4.2 13 C7 12 9.5 13.8 12 13 C14.5 12.2 17 13.5 19.8 13" stroke="#e0b040" strokeWidth={1.3} fill="none" opacity={0.5}/>
      <Circle cx={12} cy={12} r={8} stroke="#e8c97a" strokeWidth={0.6} fill="none" opacity={0.45}/>
    </Svg>
  );
}

function TerreIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="eg2" cx="40%" cy="35%" r="65%">
          <Stop offset="0%"   stopColor="#1a4a8a"/>
          <Stop offset="45%"  stopColor="#0d2860"/>
          <Stop offset="100%" stopColor="#040e28"/>
        </RadialGradient>
        <RadialGradient id="eatm2" cx="50%" cy="50%" r="50%">
          <Stop offset="68%" stopColor="rgba(0,0,0,0)"/>
          <Stop offset="100%" stopColor="rgba(80,140,255,0.3)"/>
        </RadialGradient>
        <ClipPath id="eclip2"><Circle cx={12} cy={12} r={8.5}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={8.5} fill="url(#eg2)"/>
      <G clipPath="url(#eclip2)">
        <Path d="M5.5 7.5 L7 6.5 L9 7 L9.5 8.5 L8.5 10 L7 10.5 L5.5 9.5 Z" fill="#2d6a2a" opacity={0.85}/>
        <Path d="M12 7 L13.5 6.5 L14.5 7.5 L14 9 L13 9.5 L12 9 Z" fill="#3a7a30" opacity={0.8}/>
        <Path d="M14 7.5 L17 7 L18.5 8.5 L18 10.5 L16 11 L14.5 10 L14 8.5 Z" fill="#2e6828" opacity={0.8}/>
        <Path d="M5 10.5 Q8 9.5 11 10.8" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} fill="none"/>
      </G>
      <Circle cx={12} cy={12} r={8.5} fill="url(#eatm2)"/>
      <Circle cx={12} cy={12} r={8.5} stroke="#a0c0ff" strokeWidth={0.7} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function MarsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="mg2" cx="38%" cy="30%" r="68%">
          <Stop offset="0%"   stopColor="#d45a30"/>
          <Stop offset="35%"  stopColor="#a03818"/>
          <Stop offset="75%"  stopColor="#601808"/>
          <Stop offset="100%" stopColor="#280800"/>
        </RadialGradient>
        <ClipPath id="mclip2"><Circle cx={12} cy={12} r={7.5}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={7.5} fill="url(#mg2)"/>
      <G clipPath="url(#mclip2)">
        <Path d="M9 11 L15 11.5" stroke="#3a1000" strokeWidth={1.1} opacity={0.6}/>
        <Circle cx={7.5} cy={10} r={1.8} fill="#b84020" opacity={0.35}/>
        <Circle cx={15} cy={14} r={1.2} fill="none" stroke="#501408" strokeWidth={0.5} opacity={0.6}/>
        <Path d="M8.5 4.8 Q12 4.2 15.5 4.8 Q14 5.8 12 6 Q10 5.8 8.5 4.8Z" fill="#e8e0d8" opacity={0.6}/>
      </G>
      <Circle cx={12} cy={12} r={7.5} stroke="#ff6d3a" strokeWidth={0.6} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function JupiterIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="jg2" cx="38%" cy="38%" r="68%">
          <Stop offset="0%"   stopColor="#f0a050"/>
          <Stop offset="30%"  stopColor="#c87028"/>
          <Stop offset="70%"  stopColor="#7a3808"/>
          <Stop offset="100%" stopColor="#280e00"/>
        </RadialGradient>
        <ClipPath id="jclip2"><Circle cx={12} cy={12} r={9}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={9} fill="url(#jg2)"/>
      <G clipPath="url(#jclip2)">
        <Rect x={3} y={6.2}  width={18} height={1.6} fill="#c87838" opacity={0.55} rx={0.3}/>
        <Rect x={3} y={9.5}  width={18} height={2.0} fill="#a05520" opacity={0.6}  rx={0.3}/>
        <Rect x={3} y={13}   width={18} height={1.8} fill="#b86030" opacity={0.55} rx={0.3}/>
        <Ellipse cx={8.5} cy={13.2} rx={2.8} ry={1.7} fill="#8a2000" opacity={0.75}/>
        <Ellipse cx={8.5} cy={13.2} rx={1.8} ry={1.0} fill="#b02808" opacity={0.6}/>
      </G>
      <Circle cx={12} cy={12} r={9} stroke="#ffab00" strokeWidth={0.6} fill="none" opacity={0.35}/>
    </Svg>
  );
}

function SaturneIcon() {
  return (
    <Svg width={30} height={22} viewBox="0 0 32 24">
      <Defs>
        <RadialGradient id="satg2" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#d4b870"/>
          <Stop offset="35%"  stopColor="#a88840"/>
          <Stop offset="70%"  stopColor="#6a5018"/>
          <Stop offset="100%" stopColor="#281e04"/>
        </RadialGradient>
        <LinearGradient id="ringA2" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <Stop offset="30%"  stopColor="rgba(220,190,110,0.75)"/>
          <Stop offset="70%"  stopColor="rgba(210,175,90,0.7)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </LinearGradient>
        <ClipPath id="satpl2"><Circle cx={16} cy={12.5} r={7.2}/></ClipPath>
      </Defs>
      
      <Ellipse cx={16} cy={14.5} rx={15.5} ry={4} fill="none" stroke="url(#ringA2)" strokeWidth={2} opacity={0.75}/>
      <Circle cx={16} cy={12.5} r={7.2} fill="url(#satg2)"/>
      <G clipPath="url(#satpl2)">
        <Rect x={8.8} y={10}   width={14.4} height={1.8} fill="#a07828" opacity={0.45} rx={0.2}/>
        <Rect x={8.8} y={13.5} width={14.4} height={1.5} fill="#906020" opacity={0.4}  rx={0.2}/>
      </G>
      <Circle cx={16} cy={12.5} r={7.2} stroke="#e8d5a0" strokeWidth={0.5} fill="none" opacity={0.4}/>
      
      <Path d="M8 16.2 Q16 18.8 24 16.2" stroke="url(#ringA2)" strokeWidth={2} fill="none" opacity={0.8}/>
    </Svg>
  );
}

function UranusIcon() {
  return (
    <Svg width={30} height={22} viewBox="0 0 32 24">
      <Defs>
        <RadialGradient id="urg2" cx="40%" cy="35%" r="65%">
          <Stop offset="0%"   stopColor="#a8f0f0"/>
          <Stop offset="30%"  stopColor="#50d0d0"/>
          <Stop offset="65%"  stopColor="#189898"/>
          <Stop offset="100%" stopColor="#023030"/>
        </RadialGradient>
      </Defs>
      
      <Ellipse cx={16} cy={12} rx={3.5} ry={11.5} fill="none" stroke="#5ac8c8" strokeWidth={1.2} opacity={0.22}/>
      <Ellipse cx={16} cy={12} rx={4.8} ry={13.5} fill="none" stroke="#40b0b0" strokeWidth={0.8} opacity={0.16}/>
      <Circle cx={16} cy={12} r={6.8} fill="url(#urg2)"/>
      <Circle cx={16} cy={12} r={6.8} stroke="#7de8e8" strokeWidth={0.6} fill="none" opacity={0.35}/>
    </Svg>
  );
}

function NeptuneIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="npg2" cx="38%" cy="32%" r="68%">
          <Stop offset="0%"   stopColor="#4090f0"/>
          <Stop offset="30%"  stopColor="#1860d0"/>
          <Stop offset="70%"  stopColor="#083090"/>
          <Stop offset="100%" stopColor="#020a40"/>
        </RadialGradient>
      </Defs>
      <Circle cx={12} cy={12} r={8} fill="url(#npg2)"/>
      <Ellipse cx={9.5} cy={12.5} rx={2.8} ry={1.8} fill="#060e40" opacity={0.8}/>
      <Ellipse cx={15.5} cy={9.5} rx={1.2} ry={0.7} fill="#c0d8ff" opacity={0.35}/>
      <Circle cx={12} cy={12} r={8} stroke="#4080ff" strokeWidth={0.6} fill="none" opacity={0.4}/>
    </Svg>
  );
}

const PLANET_ICONS: Record<string, () => React.ReactNode> = {
  mercure: () => <MercureIcon />,
  venus:   () => <VenusIcon />,
  terre:   () => <TerreIcon />,
  mars:    () => <MarsIcon />,
  jupiter: () => <JupiterIcon />,
  saturne: () => <SaturneIcon />,
  uranus:  () => <UranusIcon />,
  neptune: () => <NeptuneIcon />,
};

export default function PlanetNav({ selectedPlanet, onSelectPlanet }: Props) {
  const dotAnim   = useRef(new Animated.Value(1)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 900,  useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1,   duration: 900,  useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const ITEM_H      = 47;
  const DIVIDER_H   = 22;
  const TOTAL_H     = (INNER_PLANETS.length + OUTER_PLANETS.length) * ITEM_H + 2 * DIVIDER_H;
  const SCROLL_DIST = TOTAL_H * 0.45;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim, {
          toValue: SCROLL_DIST, duration: 8100,
          easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(scrollAnim, {
          toValue: 0, duration: 8100,
          easing: Easing.inOut(Easing.quad), useNativeDriver: true,
        }),
        Animated.delay(900),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [SCROLL_DIST]);

  return (
    <View style={styles.nav}>

      
      <View style={styles.glowEdge} />

      
      <View style={styles.header}>
        <Text style={styles.headerLogo}>OSC</Text>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      
      <View style={styles.scrollMask}>
        
        <View style={[styles.fadeMask, styles.fadeMaskTop]}    pointerEvents="none" />
        <View style={[styles.fadeMask, styles.fadeMaskBottom]} pointerEvents="none" />

        <Animated.View
          style={[
            styles.scrollTrack,
            { transform: [{ translateY: Animated.multiply(scrollAnim, -1) }] },
          ]}
        >
          
          <SectionDivider label="INTERNE" />
          {INNER_PLANETS.map((key) => (
            <PlanetButton
              key={key}
              planetKey={key}
              isActive={selectedPlanet === key}
              onPress={() => onSelectPlanet(key)}
            />
          ))}
          
          <SectionDivider label="EXTERNE" />
          {OUTER_PLANETS.map((key) => (
            <PlanetButton
              key={key}
              planetKey={key}
              isActive={selectedPlanet === key}
              onPress={() => onSelectPlanet(key)}
            />
          ))}
        </Animated.View>
      </View>

      
      <View style={styles.footer}>
        <View style={styles.footerGlow} />
        <Text style={styles.footerSys}>SYS·SOL</Text>
        <Text style={styles.footerIdx}>08</Text>
      </View>
    </View>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <View style={dv.wrap}>
      <View style={dv.line} />
      <Text style={dv.label}>{label}</Text>
      <View style={dv.line} />
    </View>
  );
}

function PlanetButton({
  planetKey, isActive, onPress,
}: { planetKey: string; isActive: boolean; onPress: () => void }) {
  const planet  = PLANETS[planetKey];
  const IconFn  = PLANET_ICONS[planetKey];
  const hasRing = planet.hasRing;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          btn.wrap,
          isActive && {
            borderColor: `rgba(${planet.accentRgb},0.35)`,
            backgroundColor: `rgba(${planet.accentRgb},0.07)`,
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        
        {isActive && (
          <View
            style={[
              btn.accentBar,
              { backgroundColor: planet.accentCol },
            ]}
          />
        )}

        
        <View style={[btn.iconWrap, hasRing && btn.iconWrapRing]}>
          {IconFn()}
        </View>

        
        <Text
          style={[
            btn.code,
            isActive && { color: planet.accentCol, opacity: 0.9 },
          ]}
        >
          {planet.code}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nav: {
    width: 58,
    backgroundColor: 'rgba(0,0,4,0.99)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowEdge: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0, width: 1,
    backgroundColor: 'transparent',
    shadowColor: 'rgba(255,255,255,0.18)',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  header: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLogo: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#ffffff',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  liveDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  liveText: {
    fontFamily: 'monospace',
    fontSize: 5,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.25)',
  },
  scrollMask: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollTrack: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 1,
    width: '100%',
  },
  fadeMask: {
    position: 'absolute',
    left: 0, right: 0,
    height: 24,
    zIndex: 5,
  },
  fadeMaskTop: {
    top: 0,
    backgroundColor: 'rgba(0,2,6,0.88)',
  },
  fadeMaskBottom: {
    bottom: 0,
    backgroundColor: 'rgba(0,2,6,0.88)',
  },
  footer: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  footerGlow: {
    position: 'absolute',
    top: 0, left: '15%', right: '15%', height: 1,
    backgroundColor: 'transparent',
    shadowColor: 'rgba(255,255,255,0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  footerSys: {
    fontFamily: 'monospace',
    fontSize: 4.5,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.12)',
  },
  footerIdx: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(255,255,255,0.2)',
  },
});

const dv = StyleSheet.create({
  wrap: {
    width: 38,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginVertical: 3,
  },
  line: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 4.5,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.14)',
    textTransform: 'uppercase',
  },
});

const btn = StyleSheet.create({
  wrap: {
    width: 48, height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  accentBar: {
    position: 'absolute',
    right: 0, top: '25%', bottom: '25%',
    width: 2,
    borderRadius: 2,
    opacity: 0.9,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 26, height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapRing: {
    width: 32, height: 26,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 5,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.22)',
    textTransform: 'uppercase',
  },
});

