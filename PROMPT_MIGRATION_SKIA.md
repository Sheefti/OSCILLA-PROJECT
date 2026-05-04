# PROMPT AGENT — Migration SVG → Skia (Oscilla)

## Contexte obligatoire
Lis d'abord `AGENT.md` à la racine du projet avant toute intervention.

---

## Situation actuelle

L'AGENT.md indique `"PAS de @shopify/react-native-skia"` — cette décision
était correcte à l'époque car Skia nécessitait un build natif.

**Cette contrainte est levée depuis Expo SDK 50+.**
`@shopify/react-native-skia` est désormais inclus dans Expo Go via
`expo-modules-core`. Il n'est plus nécessaire d'avoir un compte Apple Developer
ni `expo-dev-client`. L'installation correcte se fait UNIQUEMENT via :

```bash
npx expo install @shopify/react-native-skia
```

⚠️ Ne jamais utiliser `npm install` ou `yarn add` pour cette dépendance.
⚠️ Ne pas installer `expo-dev-client`.
⚠️ Ne pas modifier `babel.config.js` pour Skia (aucun plugin requis).

Après installation, mettre à jour `AGENT.md` :
- Retirer la ligne `"PAS de @shopify/react-native-skia"`
- Ajouter `"@shopify/react-native-skia": "compatible SDK 54"` dans la stack

---

## Objectif

Remplacer **entièrement** `react-native-svg` par `@shopify/react-native-skia`
dans les deux composants graphiques du projet :

1. `src/components/OrbitalRadar/OrbitalRadar.tsx`
2. `src/components/WireframeModel/WireframeModel.tsx`

`react-native-svg` reste installé (utilisé ailleurs potentiellement),
mais ne doit plus être importé dans ces deux fichiers.

---

## Règles impératives

- **Ne toucher à aucun autre fichier** que les deux listés ci-dessus et `AGENT.md`
- **Ne pas modifier** : `orbital.ts`, `quaternion.ts`, `useQuaternion.ts`,
  `colors.ts`, `asteroids.ts`, `AsteroidInspector.tsx`, `LeftPanel.tsx`
- **Conserver exactement** la même API de props des deux composants
- **Conserver exactement** la même direction artistique (palette Colors, opacités,
  style holographique JARVIS)
- **Ne pas utiliser** de Canvas imperatif JavaScript brut — utiliser les composants
  React déclaratifs de Skia : `<Canvas>`, `<Path>`, `<Circle>`, `<Line>`, etc.

---

## Migration 1 — `OrbitalRadar.tsx`

### API de props à conserver (inchangée)
```typescript
interface Props {
  width:           number;
  height:          number;
  onAsteroidPress: (asteroid: AsteroidData) => void;
  selectedId:      number;
}
```

### Ce que le composant doit faire
- Envelopper tout le rendu dans un `<Canvas>` Skia (remplace `<Svg>`)
- Conserver le `requestAnimationFrame` existant pour l'animation
- Conserver la logique de hit-test tactile (`TouchableWithoutFeedback` +
  détection par distance euclidienne depuis `astPosRef`)
- Conserver les couches statiques mémoïsées (étoiles, grille, Terre, orbites)

### Table de correspondance SVG → Skia

| react-native-svg | @shopify/react-native-skia |
|---|---|
| `<Svg width height>` | `<Canvas style={{width, height}}>` |
| `<Circle cx cy r fill stroke>` | `<Circle cx cy r color>` + Paint |
| `<Line x1 y1 x2 y2 stroke>` | `<Line p1 p2 color>` |
| `<Path d fill stroke>` | `<Path path={Skia.Path.MakeFromSVGString(d)} ...>` |
| `<Ellipse cx cy rx ry>` | `<Circle>` avec scale ou Path elliptique |
| `<Polygon points fill stroke>` | `<Path>` construit avec `path.moveTo / lineTo / close` |
| `<G rotation origin>` | `<Group transform={[{rotate}]}>` |
| `<Text>` | `<Text>` Skia (nécessite font chargée) |
| `<Defs><RadialGradient>` | `Skia.Shader.MakeRadialGradient(...)` dans Paint |
| `<ClipPath>` | `<Group clip={...}>` |
| `fill="rgba(r,g,b,a)"` | `color` + `opacity`, ou Paint avec `setColor` |
| `stopOpacity` sur gradient | alpha encodé dans les couleurs du tableau |

### Spécificités Skia importantes

**Couleurs** : Skia accepte les strings CSS (`'rgba(0,229,255,0.6)'`, `'#00e5ff'`).

**Paint partagé** : Créer les objets Paint en dehors du render avec `useMemo`
et `Skia.Paint()` pour éviter des allocations à chaque frame.

**Polygone de mesh** : Pour les faces du mesh 3D wireframe dans le radar,
construire le Path ainsi :
```typescript
const path = Skia.Path.Make();
path.moveTo(pts[0].sx, pts[0].sy);
pts.slice(1).forEach(p => path.lineTo(p.sx, p.sy));
path.close();
```

**Gradient radial Terre** : Utiliser `Skia.Shader.MakeRadialGradient` :
```typescript
const shader = Skia.Shader.MakeRadialGradient(
  { x: cx + 5, y: cy - 8 },   // centre décalé (highlight)
  EARTH_R,
  ['#4fc3f7', '#2196f3', '#1565c0', '#0d3a7a', '#020d20'],
  [0, 0.25, 0.55, 0.80, 1.0],
  TileMode.Clamp
);
const earthPaint = Skia.Paint();
earthPaint.setShader(shader);
```

**Rotation de la bague terrestre** : Utiliser `<Group transform>` :
```typescript
<Group transform={[
  { translateX: cx }, { translateY: cy },
  { rotate: ringAngle * Math.PI / 180 },
  { translateX: -cx }, { translateY: -cy },
]}>
  {/* ellipse en pointillés */}
</Group>
```

**ClipPath Terre** : Utiliser `<Group clip={...}>` avec un Path circulaire :
```typescript
const earthClip = Skia.Path.Make();
earthClip.addCircle(cx, cy, EARTH_R);
// puis : <Group clip={earthClip}> ... </Group>
```

**Texte** : Si la police monospace n'est pas chargée via expo-font, utiliser
`defaultFont` de Skia ou `matchFont`. Pour les labels simples, construire
le texte avec `<Text x y text font paint>`.

---

## Migration 2 — `WireframeModel.tsx`

### API de props à conserver (inchangée)
```typescript
interface WireframeModelProps {
  asteroidId: number;
  rotation:   QuaternionState;   // import depuis hooks/useQuaternion
  color:      string;            // '#00e5ff' | '#ffab00' | '#ff3d3d'
  width:      number;
  height:     number;
  radius?:    number;
}
```

### Ce que le composant doit faire
- Envelopper dans `<Canvas style={{width, height}}>`
- Conserver la géométrie icosphère niveau 1 (80 faces — ne pas repasser à 2)
- Conserver le painter's algorithm (tri faces arrière→avant)
- Conserver le back-face culling (`depth < -0.85`)
- Conserver l'éclairage directionnel (dotLight)
- Conserver le réticule de ciblage (4 segments)
- Conserver le glow central (2 cercles concentriques)
- Conserver l'overlay HUD Euler en bas

### Rendu des faces avec Skia

Chaque face = 1 seul `<Path>` avec fill + stroke (comme la version SVG optimisée) :
```typescript
const facePath = Skia.Path.Make();
facePath.moveTo(pa.sx, pa.sy);
facePath.lineTo(pb.sx, pb.sy);
facePath.lineTo(pc.sx, pc.sy);
facePath.close();

// Rendu fill
const fillPaint = Skia.Paint();
fillPaint.setColor(Skia.Color(`rgba(${colorRgb},${faceOpacity})`));
fillPaint.setStyle(PaintStyle.Fill);

// Rendu stroke
const strokePaint = Skia.Paint();
strokePaint.setColor(Skia.Color(`rgba(${colorRgb},${edgeOpacity})`));
strokePaint.setStyle(PaintStyle.Stroke);
strokePaint.setStrokeWidth(0.6);
```

### Optimisation Skia spécifique au WireframeModel

Utiliser `useCanvasRef` + `canvas.drawPath()` en mode **impératif** si le
mode déclaratif (composants React) reste sous 50 FPS. Le mode impératif
est plus performant pour les scènes avec beaucoup de chemins :
```typescript
const canvasRef = useCanvasRef();

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // drawPath, drawCircle, etc. directs sur le canvas
}, [rotation]);
```

---

## Gains attendus après migration

| Composant | Avant (SVG) | Attendu (Skia) |
|---|---|---|
| OrbitalRadar | ~42 FPS UI | 60 FPS stable |
| WireframeModel | ~60 FPS UI / 13 FPS JS | 60 FPS UI + JS |
| RAM | ~265 MB | ~200 MB (pas d'overhead bridge SVG) |

Skia s'exécute sur le thread UI natif via JSI — contrairement à
`react-native-svg` qui passe par le bridge JavaScript.

---

## Vérification finale

Après migration, vérifier dans Expo Go (Flipper ou overlay perf) :
- [ ] OrbitalRadar : UI ≥ 58 FPS, JS ≤ 16ms
- [ ] WireframeModel : UI = 60 FPS, JS ≤ 8ms
- [ ] Aucune erreur TypeScript (`npx tsc --noEmit`)
- [ ] Hit-test tactile astéroïdes fonctionnel
- [ ] Navigation radar → inspector → retour fonctionnelle
- [ ] Direction artistique identique visuellement
