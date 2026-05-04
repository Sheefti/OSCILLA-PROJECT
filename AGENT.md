# AGENT.md — Oscilla Project

> Ce fichier est le contexte de référence pour tout agent IA travaillant sur ce projet.
> Il doit être lu en premier avant toute intervention sur le code.

---

## 🛰️ Présentation du Projet

**Oscilla** est une application mobile "Centre de Contrôle Aérospatial et Cinématique".
Elle est conçue comme un **projet portfolio de très haut niveau**, orienté mathématiques,
ingénierie spatiale et direction artistique holographique.

- **Développeur** : 1 personne seule
- **Plateforme cible** : iOS (iPhone 12 Pro), format **Paysage (Landscape) verrouillé**
- **Test** : Expo Go (pas de compte Apple Developer)

---

## 🏗️ Architecture Full-Stack

    oscilla/
    ├── .github/
    │   └── workflows/
    │       ├── ci-backend.yml       # Tests sur PR
    │       └── cd-backend.yml       # Build Docker sur push main
    ├── backend/                     # Node.js / Express (JavaScript)
    ├── frontend/                    # Expo / React Native (TypeScript) avec Expo Router
    ├── docker-compose.yml
    ├── AGENT.md
    └── README.md

---

## 🔧 Backend — Node.js / Express

### Rôle
Middleware proxy qui **cache la clé API NASA** et formate les données.

### Stack
- Node.js 20 + Express
- Axios (appels NASA)
- Helmet, CORS, express-rate-limit
- Jest + Supertest (tests)
- Docker (image multi-stage node:20-alpine)

### Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Healthcheck |
| GET | `/api/neo?page=0&size=20` | Liste d'astéroïdes formatés |

### CI/CD
- **CI** : lint + tests Jest sur chaque PR vers `main`
- **CD** : build + push image Docker vers `ghcr.io/sheefti/oscilla-backend:latest`
- **Fix important** : utiliser `github.repository_owner` (lowercase) et non `github.repository`

---

## 📱 Frontend — Expo / React Native / TypeScript

### Stack DÉFINITIVE (ne pas changer)
    {
      "expo": "~54.0.33",
      "expo-router": "~4.0.17",
      "react": "19.1.0",
      "react-native": "0.81.5",
      "@shopify/react-native-skia": "compatible SDK 54",
      "react-native-svg": "compatible SDK 54",
      "react-native-reanimated": "~4.1.1",
      "react-native-gesture-handler": "~2.28.0",
      "react-native-safe-area-context": "compatible SDK 54",
      "expo-screen-orientation": "~9.0.8",
      "expo-font": "~14.0.11",
      "axios": "^1.x"
    }

### ⚠️ Décisions techniques importantes
- **Navigation Immersive** : Remplacement de `App.tsx` par `expo-router` (dossier `app/`). Navigation de type "Zoom" d'une vue radar vers une vue détaillée.
- **`@shopify/react-native-skia`** — inclus dans Expo Go depuis SDK 50+, **aucun build natif requis**. Installer UNIQUEMENT via `npx expo install @shopify/react-native-skia`.
- **PAS de `expo-dev-client`** — pas de compte Apple Developer, crée conflits npm.
- **Rendu graphique** : `@shopify/react-native-skia` pour `OrbitalRadar` et `WireframeModel` (thread UI natif JSI, 60 FPS). `react-native-svg` conservé pour d'éventuels autres usages.
- **Fonts Skia** : `matchFont` système utilisé comme fallback. Intégration Orbitron/Share Tech Mono via expo-font prévue dans un second temps.
- **Orientation** : verrouillée en Landscape via `expo-screen-orientation`.
- **Safe Area** : `react-native-safe-area-context` pour gérer les encoches iPhone.
- **Test sur device** : Expo Go via QR code (WiFi local).
- **Toujours utiliser** `npx expo install` pour les dépendances natives.

### Structure des dossiers
    frontend/
    ├── app/                          ✅ Routing Expo Router (Nouveau point d'entrée)
    │   ├── _layout.tsx               ✅ Chef d'orchestre (Stack sans header, fond sombre)
    │   ├── index.tsx                 ✅ Écran Radar Principal (HUD + LeftPanel)
    │   └── asteroid/
    │       └── [id].tsx              ⏳ Écran Immersif (Quaternions + Modèle 3D)
    ├── src/
    │   ├── math/
    │   │   ├── orbital.ts            ✅ Moteur orbital (sin/cos)
    │   │   └── quaternion.ts         ✅ Moteur quaternion (sans Gimbal Lock)
    │   ├── theme/
    │   │   ├── colors.ts             ✅ Tokens de couleurs
    │   │   └── asteroids.ts          ✅ Données statiques astéroïdes
    │   ├── components/
    │   │   ├── OrbitalRadar/
    │   │   │   └── OrbitalRadar.tsx  ✅ Radar SVG animé
    │   │   ├── LeftPanel/
    │   │   │   └── LeftPanel.tsx     ✅ Télémétrie NASA
    │   │   └── WireframeModel/       ⏳ Modèle 3D SVG (remplace le RightPanel statique)
    │   └── hooks/
    │       ├── useAsteroids.ts       ⏳ Fetch backend NASA
    │       └── useQuaternion.ts      ⏳ Calculs de rotation
    ├── assets/images/
    ├── app.json                      ✅ orientation: landscape, plugins router
    ├── babel.config.js               ✅ Reanimated plugin
    └── tsconfig.json                 ✅

---

## 🎨 Direction Artistique — Thème JARVIS/Holographique

### Palette de couleurs
    export const Colors = {
      bg:         '#010810',   // Fond principal
      cyan:       '#00e5ff',   // Couleur primaire (accents, UI)
      cyan60:     'rgba(0,229,255,0.6)',
      cyanDark:   'rgba(0,229,255,0.12)',
      cyanBorder: 'rgba(0,229,255,0.1)',
      amber:      '#ffab00',   // Alertes, objets dangereux
      red:        '#ff3d3d',   // Critique (APOPHIS)
      green:      '#00ff88',   // Signal live, nominal
    }

### Typographie & Effets
- **Orbitron** & **Share Tech Mono** (en attente : `fontFamily: 'monospace'`).
- Glassmorphism, Glow/Shadow cyan sur éléments actifs.
- HUD corners, Topbar 30px, Bottombar 20px.

---

## 🔢 Les 4 Piliers Mathématiques

### 1. Moteur Orbital (`src/math/orbital.ts`) ✅
    angle = t * speed + phase
    x = rx * cos(angle)
    y = ry * sin(angle)

### 2. Moteur Quaternion (`src/math/quaternion.ts`) ✅
Rotation PURE sans Gimbal Lock.

### 3. Radar Orbital (`OrbitalRadar`) ✅
- `@shopify/react-native-skia` avec `requestAnimationFrame` (60fps, thread UI natif).
- Tri par profondeur (painter's algorithm).

### 4. Modèle Wireframe 3D (`WireframeModel`) ✅
- Icosphère déformée procédurale en Skia (mode déclaratif).
- Rotation via quaternions purs.

---

## 📋 État d'Avancement

| Composant | État | Notes |
|-----------|------|-------|
| Backend Node.js | ✅ Fonctionnel | API NASA opérationnelle |
| Moteurs Math | ✅ Complets | orbital.ts & quaternion.ts |
| Thème & Data | ✅ Complets | colors.ts & asteroids.ts |
| `OrbitalRadar` | ✅ Fonctionnel | SVG animé, 4 astéroïdes |
| `LeftPanel` | ✅ Fonctionnel | Télémétrie dynamique |
| `app/_layout.tsx` | ✅ Fonctionnel | Setup Expo Router |
| `app/index.tsx` | ✅ Fonctionnel | Dashboard principal |
| `app/asteroid/[id].tsx` | ⏳ À faire | Écran immersif astéroïde |
| `WireframeModel` | ✅ Migré Skia | Rendu 3D Skia déclaratif (80 faces) |
| `OrbitalRadar` | ✅ Migré Skia | Radar Skia, gradients, clippath, RAF |
| `useAsteroids` hook | ⏳ À faire | Fetch backend NASA |