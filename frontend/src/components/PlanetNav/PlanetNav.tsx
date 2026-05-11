/**
 * src/components/PlanetNav/PlanetNav.tsx
 * Barre de navigation verticale droite — sélection de la planète cible.
 * Largeur fixe 58px, liste scrollable manuellement.
 * Design fidèle à la maquette oscilla-v3.html.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
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

// ─── Icônes planètes (SVG haute fidélité — identiques à la maquette HTML) ────

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
        <RadialGradient id="mer-light" cx="38%" cy="32%" r="55%">
          <Stop offset="0%"   stopColor="rgba(255,255,255,0.18)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <ClipPath id="mer-clip"><Circle cx={12} cy={12} r={7.5}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={7.5} fill="url(#merg)"/>
      <G clipPath="url(#mer-clip)" opacity={0.6}>
        <Path d="M5 9 Q8 8.2 11 9.5 Q14 10.8 18 9.2"   stroke="#6a6a7a" strokeWidth={0.7} fill="none"/>
        <Path d="M4.8 13 Q7 12 10 13.5 Q13 15 17 13"    stroke="#5a5a6a" strokeWidth={0.5} fill="none"/>
        <Path d="M6 16 Q9 15 13 16.5 Q16 17.5 19 16"   stroke="#585868" strokeWidth={0.4} fill="none"/>
      </G>
      <G clipPath="url(#mer-clip)">
        <Circle cx={9.2}  cy={9.8}  r={1.5} fill="none"    stroke="#3a3a4a" strokeWidth={0.6} opacity={0.8}/>
        <Circle cx={9.2}  cy={9.8}  r={0.5} fill="#2a2a3a" opacity={0.6}/>
        <Circle cx={14.5} cy={13.5} r={1.1} fill="none"    stroke="#404050" strokeWidth={0.5} opacity={0.7}/>
        <Circle cx={14.5} cy={13.5} r={0.35} fill="#303040" opacity={0.5}/>
        <Circle cx={11}   cy={15.2} r={0.8} fill="none"    stroke="#3a3a4a" strokeWidth={0.4} opacity={0.6}/>
        <Circle cx={7.5}  cy={13.5} r={0.6} fill="none"    stroke="#404050" strokeWidth={0.4} opacity={0.5}/>
        <Circle cx={15.5} cy={9.5}  r={0.5} fill="none"    stroke="#3a3a4a" strokeWidth={0.35} opacity={0.5}/>
        {/* Caloris Basin */}
        <Circle cx={8.5}  cy={10.5} r={2.8} fill="none"    stroke="#909098" strokeWidth={0.3} opacity={0.25}/>
      </G>
      <Circle cx={12} cy={12} r={7.5} fill="url(#mer-light)"/>
      <Circle cx={12} cy={12} r={7.5} stroke="#b0b0c8" strokeWidth={0.6} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function VenusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="veg" cx="40%" cy="32%" r="70%">
          <Stop offset="0%"   stopColor="#f0d878"/>
          <Stop offset="25%"  stopColor="#d4a83a"/>
          <Stop offset="60%"  stopColor="#8c6010"/>
          <Stop offset="100%" stopColor="#2e1a00"/>
        </RadialGradient>
        <RadialGradient id="ven-atm" cx="50%" cy="50%" r="50%">
          <Stop offset="70%"  stopColor="rgba(0,0,0,0)"/>
          <Stop offset="100%" stopColor="rgba(232,180,60,0.35)"/>
        </RadialGradient>
        <RadialGradient id="ven-light" cx="40%" cy="32%" r="50%">
          <Stop offset="0%"   stopColor="rgba(255,248,200,0.22)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <ClipPath id="ven-clip"><Circle cx={12} cy={12} r={8}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={8} fill="url(#veg)"/>
      <G clipPath="url(#ven-clip)">
        <Path d="M4.2 8.5 C6 7.5 9 8.8 12 8.2 C15 7.6 18 8.5 19.8 8"         stroke="#e8c060" strokeWidth={1.4} fill="none" opacity={0.5}/>
        <Path d="M4 10.5 C7 9.2 10 11 12 10.2 C14.5 9.3 17 10.5 20 10"       stroke="#c89830" strokeWidth={1}   fill="none" opacity={0.45}/>
        <Path d="M4.2 13 C7 12 9.5 13.8 12 13 C14.5 12.2 17 13.5 19.8 13"   stroke="#e0b040" strokeWidth={1.3} fill="none" opacity={0.5}/>
        <Path d="M4.5 15.5 C7 14.5 10 16 12.5 15.2 C15 14.4 17.5 15.5 19.5 15" stroke="#c89030" strokeWidth={0.9} fill="none" opacity={0.4}/>
        <Path d="M5 17.5 C8 16.8 11 17.8 14 17.2 C16 16.8 18 17.5 19 17.2"  stroke="#d4a040" strokeWidth={0.7} fill="none" opacity={0.3}/>
        <Path d="M14 9.5 C16 10.5 17 12 15.5 13.5 C14 15 12 14.5 11 13"     stroke="#f0c840" strokeWidth={0.5} fill="none" opacity={0.3}/>
      </G>
      <Circle cx={12} cy={12} r={8} fill="url(#ven-atm)"/>
      <Circle cx={12} cy={12} r={8} fill="url(#ven-light)"/>
      <Circle cx={12} cy={12} r={8} stroke="#e8c97a" strokeWidth={0.6} fill="none" opacity={0.45}/>
    </Svg>
  );
}

function TerreIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="eg-ocean" cx="40%" cy="35%" r="65%">
          <Stop offset="0%"   stopColor="#1a4a8a"/>
          <Stop offset="45%"  stopColor="#0d2860"/>
          <Stop offset="100%" stopColor="#040e28"/>
        </RadialGradient>
        <RadialGradient id="eg-light" cx="38%" cy="32%" r="55%">
          <Stop offset="0%"   stopColor="rgba(255,255,255,0.15)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <RadialGradient id="eg-atm" cx="50%" cy="50%" r="50%">
          <Stop offset="68%"  stopColor="rgba(0,0,0,0)"/>
          <Stop offset="100%" stopColor="rgba(80,140,255,0.3)"/>
        </RadialGradient>
        <ClipPath id="earth-clip"><Circle cx={12} cy={12} r={8.5}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={8.5} fill="url(#eg-ocean)"/>
      <G clipPath="url(#earth-clip)">
        {/* Amérique du Nord */}
        <Path d="M5.5 7.5 L7 6.5 L9 7 L9.5 8.5 L8.5 10 L7 10.5 L5.5 9.5 Z" fill="#2d6a2a" opacity={0.85}/>
        {/* Europe */}
        <Path d="M12 7 L13.5 6.5 L14.5 7.5 L14 9 L13 9.5 L12 9 Z"           fill="#3a7a30" opacity={0.8}/>
        {/* Afrique */}
        <Path d="M12.5 10 L14 9.8 L15 11 L14.5 13 L13 13.5 L12 12.5 L12 11 Z" fill="#3a7030" opacity={0.75}/>
        {/* Asie */}
        <Path d="M14 7.5 L17 7 L18.5 8.5 L18 10.5 L16 11 L14.5 10 L14 8.5 Z" fill="#2e6828" opacity={0.8}/>
        {/* Amérique du Sud */}
        <Path d="M7.5 12 L9 11.5 L10 13 L9.5 15.5 L8 16 L6.8 14.5 L7 13 Z"  fill="#357030" opacity={0.75}/>
        {/* Australie */}
        <Path d="M16 14 L18 13.8 L18.5 15.2 L17 16 L15.5 15.2 Z"            fill="#3a6e28" opacity={0.7}/>
        {/* Antarctique */}
        <Path d="M7 18.5 Q12 17.5 17 18.5" stroke="#e0e8f0" strokeWidth={1.5} fill="none" opacity={0.4}/>
        {/* Nuages */}
        <Path d="M5 10.5 Q8 9.5 11 10.8"   stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} fill="none"/>
        <Path d="M10 7.5 Q13 6.5 16 7.5"   stroke="rgba(255,255,255,0.4)" strokeWidth={0.9} fill="none"/>
        <Path d="M14 13.5 Q16.5 12.5 19 13.5" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} fill="none"/>
      </G>
      <Circle cx={12} cy={12} r={8.5} fill="url(#eg-atm)"/>
      <Circle cx={12} cy={12} r={8.5} fill="url(#eg-light)"/>
      <Circle cx={12} cy={12} r={8.5} stroke="#a0c0ff" strokeWidth={0.7} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function MarsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="mg" cx="38%" cy="30%" r="68%">
          <Stop offset="0%"   stopColor="#d45a30"/>
          <Stop offset="35%"  stopColor="#a03818"/>
          <Stop offset="75%"  stopColor="#601808"/>
          <Stop offset="100%" stopColor="#280800"/>
        </RadialGradient>
        <RadialGradient id="mar-light" cx="38%" cy="30%" r="55%">
          <Stop offset="0%"   stopColor="rgba(255,180,120,0.2)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <ClipPath id="mar-clip"><Circle cx={12} cy={12} r={7.5}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={7.5} fill="url(#mg)"/>
      <G clipPath="url(#mar-clip)">
        <Path d="M4.8 9.5 C7 8.5 10 10 12 9.2 C14 8.4 17 9.5 19.2 9"       stroke="#7a2808" strokeWidth={1.2} fill="none" opacity={0.5}/>
        <Path d="M5 12 C7.5 11 10.5 12.5 12 11.8 C14 11 17 12.5 19 12"     stroke="#6a2008" strokeWidth={0.9} fill="none" opacity={0.4}/>
        <Path d="M5.5 15 C8 14 11 15.5 13.5 14.5 C16 13.5 18 15 19 14.5"   stroke="#7a2808" strokeWidth={0.7} fill="none" opacity={0.35}/>
        {/* Valles Marineris */}
        <Path d="M9 11 L15 11.5"   stroke="#3a1000" strokeWidth={1.1} opacity={0.6}/>
        <Path d="M9.2 11.6 L15.2 12.1" stroke="#4a1800" strokeWidth={0.6} opacity={0.4}/>
        {/* Olympus Mons */}
        <Circle cx={7.5} cy={10}  r={1.8} fill="#b84020" opacity={0.35}/>
        <Circle cx={7.5} cy={10}  r={0.8} fill="#d05030" opacity={0.5}/>
        {/* Cratères */}
        <Circle cx={15}  cy={14}  r={1.2} fill="none" stroke="#501408" strokeWidth={0.5} opacity={0.6}/>
        <Circle cx={10}  cy={15.5} r={0.8} fill="none" stroke="#501408" strokeWidth={0.4} opacity={0.5}/>
        {/* Calotte nord */}
        <Path d="M8.5 4.8 Q12 4.2 15.5 4.8 Q14 5.8 12 6 Q10 5.8 8.5 4.8Z" fill="#e8e0d8" opacity={0.6}/>
        {/* Calotte sud */}
        <Path d="M9.5 19 Q12 19.5 14.5 19 Q13 18.2 12 18 Q11 18.2 9.5 19Z" fill="#d0c8c0" opacity={0.4}/>
      </G>
      <Circle cx={12} cy={12} r={7.5} fill="url(#mar-light)"/>
      <Circle cx={12} cy={12} r={7.5} stroke="#ff6d3a" strokeWidth={0.6} fill="none" opacity={0.4}/>
    </Svg>
  );
}

function JupiterIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="jg" cx="38%" cy="38%" r="68%">
          <Stop offset="0%"   stopColor="#f0a050"/>
          <Stop offset="30%"  stopColor="#c87028"/>
          <Stop offset="70%"  stopColor="#7a3808"/>
          <Stop offset="100%" stopColor="#280e00"/>
        </RadialGradient>
        <RadialGradient id="jup-light" cx="38%" cy="32%" r="55%">
          <Stop offset="0%"   stopColor="rgba(255,220,150,0.2)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <ClipPath id="jup-clip"><Circle cx={12} cy={12} r={9}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={9} fill="url(#jg)"/>
      <G clipPath="url(#jup-clip)">
        {/* Bandes atmosphériques détaillées */}
        <Rect x={3} y={6.2}  width={18} height={1.6} fill="#c87838" opacity={0.55} rx={0.3}/>
        <Rect x={3} y={8.2}  width={18} height={1.0} fill="#f0c890" opacity={0.35} rx={0.2}/>
        <Rect x={3} y={9.5}  width={18} height={2.0} fill="#a05520" opacity={0.6}  rx={0.3}/>
        <Rect x={3} y={11.8} width={18} height={0.9} fill="#e8b868" opacity={0.4}  rx={0.2}/>
        <Rect x={3} y={13}   width={18} height={1.8} fill="#b86030" opacity={0.55} rx={0.3}/>
        <Rect x={3} y={15.1} width={18} height={1.0} fill="#d09050" opacity={0.35} rx={0.2}/>
        <Rect x={3} y={16.4} width={18} height={1.4} fill="#a04818" opacity={0.5}  rx={0.3}/>
        {/* Ondulations */}
        <Path d="M3 10.5 Q7 9.8 12 10.8 Q17 11.8 21 10.5" stroke="#7a3000" strokeWidth={0.5} fill="none" opacity={0.4}/>
        <Path d="M3 13.5 Q6 12.8 12 13.8 Q18 14.8 21 13.5" stroke="#903820" strokeWidth={0.5} fill="none" opacity={0.4}/>
        {/* Grande Tache Rouge */}
        <Ellipse cx={8.5} cy={13.2} rx={2.8} ry={1.7} fill="#8a2000" opacity={0.75}/>
        <Ellipse cx={8.5} cy={13.2} rx={1.8} ry={1.0} fill="#b02808" opacity={0.6}/>
        <Ellipse cx={8.2} cy={13}   rx={0.8} ry={0.45} fill="#c83010" opacity={0.5}/>
        {/* Tempêtes ovales */}
        <Ellipse cx={16}   cy={10}   rx={1.2} ry={0.7} fill="#e8d0a0" opacity={0.35}/>
        <Ellipse cx={14.5} cy={15.5} rx={1.0} ry={0.6} fill="#e0c890" opacity={0.3}/>
      </G>
      <Circle cx={12} cy={12} r={9} fill="url(#jup-light)"/>
      <Circle cx={12} cy={12} r={9} stroke="#ffab00" strokeWidth={0.6} fill="none" opacity={0.35}/>
    </Svg>
  );
}

function SaturneIcon() {
  return (
    <Svg width={30} height={22} viewBox="0 0 32 24">
      <Defs>
        <RadialGradient id="satg" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#d4b870"/>
          <Stop offset="35%"  stopColor="#a88840"/>
          <Stop offset="70%"  stopColor="#6a5018"/>
          <Stop offset="100%" stopColor="#281e04"/>
        </RadialGradient>
        <RadialGradient id="sat-light" cx="38%" cy="32%" r="52%">
          <Stop offset="0%"   stopColor="rgba(255,245,200,0.18)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <LinearGradient id="ring-A" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <Stop offset="12%"  stopColor="rgba(180,150,70,0.5)"/>
          <Stop offset="30%"  stopColor="rgba(220,190,110,0.75)"/>
          <Stop offset="50%"  stopColor="rgba(240,215,140,0.85)"/>
          <Stop offset="70%"  stopColor="rgba(210,175,90,0.7)"/>
          <Stop offset="88%"  stopColor="rgba(165,130,55,0.45)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </LinearGradient>
        <LinearGradient id="ring-B" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <Stop offset="10%"  stopColor="rgba(140,110,45,0.3)"/>
          <Stop offset="35%"  stopColor="rgba(200,165,75,0.55)"/>
          <Stop offset="50%"  stopColor="rgba(225,195,105,0.65)"/>
          <Stop offset="65%"  stopColor="rgba(190,155,65,0.5)"/>
          <Stop offset="90%"  stopColor="rgba(130,100,38,0.25)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </LinearGradient>
        <LinearGradient id="ring-C" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <Stop offset="15%"  stopColor="rgba(100,78,28,0.18)"/>
          <Stop offset="50%"  stopColor="rgba(150,118,45,0.28)"/>
          <Stop offset="85%"  stopColor="rgba(95,72,24,0.15)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </LinearGradient>
        <ClipPath id="sat-planet"><Circle cx={16} cy={12.5} r={7.2}/></ClipPath>
      </Defs>
      {/* Anneaux arrière */}
      <Ellipse cx={16} cy={14.5} rx={10}   ry={2.6} fill="none" stroke="url(#ring-C)" strokeWidth={2.5} opacity={0.7}/>
      <Ellipse cx={16} cy={14.5} rx={13}   ry={3.4} fill="none" stroke="url(#ring-B)" strokeWidth={3}   opacity={0.8}/>
      <Ellipse cx={16} cy={14.5} rx={15.5} ry={4}   fill="none" stroke="url(#ring-A)" strokeWidth={2}   opacity={0.75}/>
      {/* Corps de la planète */}
      <Circle cx={16} cy={12.5} r={7.2} fill="url(#satg)"/>
      <G clipPath="url(#sat-planet)">
        <Rect x={8.8} y={8.5}  width={14.4} height={1.2} fill="#c8a040" opacity={0.4}  rx={0.2}/>
        <Rect x={8.8} y={10}   width={14.4} height={1.8} fill="#a07828" opacity={0.45} rx={0.2}/>
        <Rect x={8.8} y={12.2} width={14.4} height={1.0} fill="#d4b060" opacity={0.35} rx={0.2}/>
        <Rect x={8.8} y={13.5} width={14.4} height={1.5} fill="#906020" opacity={0.4}  rx={0.2}/>
        <Rect x={8.8} y={15.3} width={14.4} height={0.9} fill="#b88838" opacity={0.3}  rx={0.2}/>
      </G>
      <Circle cx={16} cy={12.5} r={7.2} fill="url(#sat-light)"/>
      <Circle cx={16} cy={12.5} r={7.2} stroke="#e8d5a0" strokeWidth={0.5} fill="none" opacity={0.4}/>
      {/* Anneaux avant */}
      <Path d="M9.5 15.5 Q16 17.8 22.5 15.5" stroke="url(#ring-B)" strokeWidth={3}   fill="none" opacity={0.85}/>
      <Path d="M8 16.2 Q16 18.8 24 16.2"     stroke="url(#ring-A)" strokeWidth={2}   fill="none" opacity={0.8}/>
      <Path d="M10.5 14.8 Q16 16.8 21.5 14.8" stroke="url(#ring-C)" strokeWidth={2.5} fill="none" opacity={0.65}/>
    </Svg>
  );
}

function UranusIcon() {
  return (
    <Svg width={30} height={22} viewBox="0 0 32 24">
      <Defs>
        <RadialGradient id="urg" cx="40%" cy="35%" r="65%">
          <Stop offset="0%"   stopColor="#a8f0f0"/>
          <Stop offset="30%"  stopColor="#50d0d0"/>
          <Stop offset="65%"  stopColor="#189898"/>
          <Stop offset="100%" stopColor="#023030"/>
        </RadialGradient>
        <RadialGradient id="ura-light" cx="40%" cy="35%" r="52%">
          <Stop offset="0%"   stopColor="rgba(200,255,255,0.2)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <RadialGradient id="ura-limb" cx="50%" cy="50%" r="50%">
          <Stop offset="70%"  stopColor="rgba(0,0,0,0)"/>
          <Stop offset="100%" stopColor="rgba(80,220,220,0.25)"/>
        </RadialGradient>
        <ClipPath id="ura-clip"><Circle cx={16} cy={12} r={6.8}/></ClipPath>
      </Defs>
      {/* Anneaux verticaux (inclinaison axiale ~98°) */}
      <Ellipse cx={16} cy={12} rx={3.5} ry={11.5} fill="none" stroke="#5ac8c8" strokeWidth={1.2} opacity={0.22}/>
      <Ellipse cx={16} cy={12} rx={4.8} ry={13.5} fill="none" stroke="#40b0b0" strokeWidth={0.8} opacity={0.16}/>
      <Ellipse cx={16} cy={12} rx={6}   ry={15}   fill="none" stroke="#30a0a0" strokeWidth={0.5} opacity={0.1}/>
      {/* Planète */}
      <Circle cx={16} cy={12} r={6.8} fill="url(#urg)"/>
      <G clipPath="url(#ura-clip)">
        <Path d="M9.2 9.5 Q13 8.8 22.8 9.5"  stroke="#78e0e0" strokeWidth={0.8} fill="none" opacity={0.2}/>
        <Path d="M9.2 12 Q13 11.5 22.8 12"   stroke="#60d0d0" strokeWidth={0.6} fill="none" opacity={0.15}/>
        <Path d="M9.2 14.5 Q13 14 22.8 14.5" stroke="#50c8c8" strokeWidth={0.5} fill="none" opacity={0.12}/>
        <Ellipse cx={16} cy={16.5} rx={5.5} ry={2} fill="#189898" opacity={0.2}/>
      </G>
      <Circle cx={16} cy={12} r={6.8} fill="url(#ura-light)"/>
      <Circle cx={16} cy={12} r={6.8} fill="url(#ura-limb)"/>
      <Circle cx={16} cy={12} r={6.8} stroke="#7de8e8" strokeWidth={0.6} fill="none" opacity={0.4}/>
      {/* Arcs d'anneaux avant */}
      <Path d="M16 0.5 Q16.1 6 16 12"   stroke="#5ac8c8" strokeWidth={1.2} fill="none" opacity={0.18}/>
      <Path d="M16 12 Q16.1 18 16 23.5" stroke="#5ac8c8" strokeWidth={1.2} fill="none" opacity={0.22}/>
    </Svg>
  );
}

function NeptuneIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="npg" cx="38%" cy="32%" r="68%">
          <Stop offset="0%"   stopColor="#4090f0"/>
          <Stop offset="30%"  stopColor="#1848c0"/>
          <Stop offset="65%"  stopColor="#082078"/>
          <Stop offset="100%" stopColor="#020518"/>
        </RadialGradient>
        <RadialGradient id="nep-light" cx="38%" cy="32%" r="52%">
          <Stop offset="0%"   stopColor="rgba(150,190,255,0.2)"/>
          <Stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </RadialGradient>
        <RadialGradient id="nep-limb" cx="50%" cy="50%" r="50%">
          <Stop offset="68%"  stopColor="rgba(0,0,0,0)"/>
          <Stop offset="100%" stopColor="rgba(60,100,255,0.3)"/>
        </RadialGradient>
        <ClipPath id="nep-clip"><Circle cx={12} cy={12} r={8}/></ClipPath>
      </Defs>
      <Circle cx={12} cy={12} r={8} fill="url(#npg)"/>
      <G clipPath="url(#nep-clip)">
        <Path d="M4.2 8.5 C7 7.5 10 9 12 8.2 C14.5 7.3 17.5 8.5 19.8 8"     stroke="#2060e0" strokeWidth={1.1} fill="none" opacity={0.5}/>
        <Path d="M4.2 11 C7 10 10.5 11.5 12 10.8 C14 10 17 11.5 19.8 11"     stroke="#1850d0" strokeWidth={0.9} fill="none" opacity={0.45}/>
        <Path d="M4 13.5 C7 12.5 10 14 12.5 13.2 C15 12.4 17.5 13.8 20 13.5" stroke="#1a58d8" strokeWidth={1}   fill="none" opacity={0.45}/>
        <Path d="M4.5 16 C7 15 10.5 16.2 13 15.5 C15.5 14.8 17.5 16 19.5 15.5" stroke="#1448c0" strokeWidth={0.7} fill="none" opacity={0.35}/>
        {/* Grande Tache Sombre */}
        <Ellipse cx={9.5} cy={12.5} rx={2.8} ry={1.8} fill="#060e40" opacity={0.8}/>
        <Ellipse cx={9.3} cy={12.3} rx={1.8} ry={1.1} fill="#0a1858" opacity={0.6}/>
        {/* Scooter */}
        <Ellipse cx={15.5} cy={9.5} rx={1.2} ry={0.7} fill="#c0d8ff" opacity={0.35}/>
        {/* Dark Spot 2 */}
        <Ellipse cx={14} cy={15} rx={1.4} ry={0.9} fill="#080f3a" opacity={0.6}/>
      </G>
      <Circle cx={12} cy={12} r={8} fill="url(#nep-light)"/>
      <Circle cx={12} cy={12} r={8} fill="url(#nep-limb)"/>
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

// ─── Composant principal ─────────────────────────────────────────────────────

export default function PlanetNav({ selectedPlanet, onSelectPlanet }: Props) {
  const dotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 900,  useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1,   duration: 900,  useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.nav}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>OSC</Text>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Liste scrollable avec masques de fondu */}
      <View style={styles.scrollContainer}>
        {/* Masque haut */}
        <View style={styles.fadeMaskTop} pointerEvents="none" />
        {/* Masque bas */}
        <View style={styles.fadeMaskBottom} pointerEvents="none" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {INNER_PLANETS.map((key) => (
            <PlanetButton
              key={key}
              planetKey={key}
              isActive={selectedPlanet === key}
              onPress={() => onSelectPlanet(key)}
            />
          ))}

          {OUTER_PLANETS.map((key) => (
            <PlanetButton
              key={key}
              planetKey={key}
              isActive={selectedPlanet === key}
              onPress={() => onSelectPlanet(key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerGlow} />
        <Text style={styles.footerSys}>SYS·SOL</Text>
        <Text style={styles.footerIdx}>08</Text>
      </View>
    </View>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

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
  const glowAnim  = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 30 }),
      Animated.timing(glowAnim,  { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
      Animated.timing(glowAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
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
            // Box shadow glow like the mockup
            shadowColor: planet.accentCol,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Hover/press glow bg (radial ellipse effect) */}
        <Animated.View
          style={[
            btn.glowBg,
            {
              opacity: glowAnim,
              backgroundColor: `rgba(${planet.accentRgb},0.08)`,
            },
          ]}
        />

        {/* Active right accent bar — with gradient feel via layered views */}
        {isActive && (
          <View style={btn.accentBarWrap}>
            <View
              style={[
                btn.accentBar,
                { backgroundColor: planet.accentCol },
              ]}
            />
            {/* Glow halo */}
            <View
              style={[
                btn.accentBarGlow,
                {
                  backgroundColor: planet.accentCol,
                  shadowColor: planet.accentCol,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 6,
                },
              ]}
            />
          </View>
        )}

        {/* Planet icon */}
        <View style={[btn.iconWrap, hasRing && btn.iconWrapRing]}>
          {IconFn()}
        </View>

        {/* Label */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  header: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLogo: {
    fontFamily: 'ShareTechMono_400Regular',
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
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 5,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.25)',
  },
  // Wrapper pour les masques de fondu
  scrollContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  fadeMaskTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 28,
    backgroundColor: 'transparent',
    // En RN on peut simuler le gradient avec une View semi-opaque
    // Le vrai masque nécessite expo-linear-gradient, ici on utilise une approche simple
    zIndex: 5,
    // Workaround: opacité décroissante avec un fond proche de la bg
    backgroundImage: undefined, // non supporté en RN natif, on garde léger
  },
  fadeMaskBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 28,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 1,
  },
  footer: {
    width: '100%',
    paddingVertical: 6,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  // Lueur horizontale au top du footer
  footerGlow: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  footerSys: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 4.5,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.12)',
  },
  footerIdx: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 7,
    color: 'rgba(255,255,255,0.2)',
  },
});

const dv = StyleSheet.create({
  wrap: {
    width: 44,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginVertical: 4,
  },
  // Ligne avec effet de gradient (couleur centrale plus forte)
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    // Simule le gradient 90deg via shadow
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  label: {
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 4.5,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.25)',  // légèrement plus visible qu'avant (0.14 → 0.25)
    textTransform: 'uppercase',
  },
});

const btn = StyleSheet.create({
  wrap: {
    width: 48, height: 48,    // légèrement plus haut (46 → 48) pour donner de l'air
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
  // Fond radial pour l'effet hover/press
  glowBg: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 6,
  },
  // Wrapper de l'accent bar droite
  accentBarWrap: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    alignItems: 'flex-end',
  },
  // Barre principale
  accentBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 2,
    opacity: 0.95,
  },
  // Halo de lueur derrière la barre
  accentBarGlow: {
    position: 'absolute',
    right: 0,
    top: -2,
    bottom: -2,
    width: 4,
    borderRadius: 4,
    opacity: 0.4,
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
    fontFamily: 'ShareTechMono_400Regular',
    fontSize: 5,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.22)',
    textTransform: 'uppercase',
  },
});