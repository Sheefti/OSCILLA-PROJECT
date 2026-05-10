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
| GET | `/api/neo?page=0&size=20` | Liste d'astéroïdes paginée |
| GET | `/api/neo/by-body?body=earth&size=4` | NEO par corps céleste |

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
      "react-native-svg": "compatible SDK 54",
      "react-native-reanimated": "~4.1.1",
      "react-native-gesture-handler": "~2.28.0",
      "react-native-safe-area-context": "compatible SDK 54",
      "expo-screen-orientation": "~9.0.8",
      "expo-font": "~14.0.11",
      "expo-linear-gradient": "compatible SDK 54",
      "react-native-webview": "compatible SDK 54",
      "axios": "^1.x"
    }

### ⚠️ Décisions techniques importantes
- **Navigation Immersive** : `expo-router` (dossier `app/`). Navigation de type "Zoom" d'une vue radar vers une vue détaillée.
- **PAS de `@shopify/react-native-skia`** — incompatible avec Expo Go sans build natif.
- **PAS de `expo-dev-client`** — pas de compte Apple Developer, crée conflits npm.
- **Rendu graphique** : `react-native-svg` pour le radar et les animations 3D wireframe.
- **Orientation** : verrouillée en Landscape via `expo-screen-orientation`.
- **Safe Area** : `SafeAreaView` de `react-native-safe-area-context` sur **TOUS** les écrans (y compris Splash et Onboarding).
- **Test sur device** : Expo Go via QR code (WiFi local).
- **Toujours utiliser** `npx expo install` pour les dépendances natives.

### Structure des dossiers
    frontend/
    ├── app/                          ✅ Routing Expo Router
    │   ├── _layout.tsx               ✅ Chef d'orchestre (Stack sans header, fond sombre)
    │   ├── index.tsx                 ✅ Entrée : Splash → Onboarding → Dashboard
    │   ├── onboarding.tsx            ✅ Route onboarding
    │   ├── splash.tsx                ✅ Route splash
    │   └── radar/
    │       ├── _layout.tsx           ✅ Stack radar
    │       ├── index.tsx             ✅ Dashboard orbital
    │       ├── list.tsx              ✅ Catalogue NEO
    │       ├── details.tsx           ✅ Détail astéroïde (données statiques)
    │       └── neo-details.tsx       ✅ Détail astéroïde (données API NASA)
    ├── src/
    │   ├── math/
    │   │   ├── orbital.ts            ✅ Moteur orbital (sin/cos)
    │   │   └── quaternion.ts         ✅ Moteur quaternion (sans Gimbal Lock)
    │   ├── theme/
    │   │   ├── colors.ts             ✅ Tokens de couleurs
    │   │   ├── asteroids.ts          ✅ Données statiques astéroïdes
    │   │   └── planets.ts            ✅ Données planètes + fallbacks
    │   ├── components/
    │   │   ├── OrbitalRadar/
    │   │   │   └── OrbitalRadar.tsx  ✅ Radar SVG animé
    │   │   ├── LeftPanel/
    │   │   │   └── LeftPanel.tsx     ✅ Télémétrie NASA
    │   │   ├── PlanetNav/
    │   │   │   └── PlanetNav.tsx     ✅ Navigation planètes
    │   │   └── WireframeModel/
    │   │       └── WireframeModel.tsx ✅ Modèle 3D SVG wireframe
    │   ├── hooks/
    │   │   ├── useNeoAsteroids.ts    ✅ Fetch backend NASA + pagination
    │   │   └── useQuaternion.ts      ✅ Calculs de rotation quaternion
    │   └── services/
    │       └── api.ts                ✅ Client Axios
    ├── assets/images/
    │   └── logo.png
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
- **Orbitron** (titres HUD) & **Share Tech Mono** (données chiffrées).
- Glassmorphism, Glow/Shadow cyan sur éléments actifs.
- HUD corners, Topbar, Bottombar.
- Scanlines animées (translateY en boucle).

---

## 🔢 Les 4 Piliers Mathématiques

### 1. Moteur Orbital (`src/math/orbital.ts`) ✅
    angle = t * speed + phase
    x = rx * cos(angle)
    y = ry * sin(angle)

### 2. Moteur Quaternion (`src/math/quaternion.ts`) ✅
Rotation PURE sans Gimbal Lock. Alimenté par `useQuaternion` hook.

### 3. Radar Orbital (`OrbitalRadar`) ✅
- `react-native-svg` avec `setInterval` (60fps).
- Tri par profondeur (painter's algorithm).
- Support multi-planètes (8 corps célestes).

### 4. Modèle Wireframe 3D (`WireframeModel`) ✅
- Icosphère déformée procédurale en SVG.
- Rotation via quaternions purs.

---

## 📋 État d'Avancement

| Composant | État | Notes |
|-----------|------|-------|
| Backend Node.js | ✅ Fonctionnel | API NASA opérationnelle (NEO + by-body) |
| Moteurs Math | ✅ Complets | orbital.ts & quaternion.ts |
| Thème & Data | ✅ Complets | colors.ts, asteroids.ts, planets.ts |
| `SplashScreen` | ✅ Fonctionnel | SafeAreaView ✅ |
| `OnboardingScreen` | ✅ Fonctionnel | SafeAreaView ✅, 3 slides WebView |
| `OrbitalRadar` | ✅ Fonctionnel | SVG animé, multi-planètes |
| `LeftPanel` | ✅ Fonctionnel | Télémétrie dynamique |
| `PlanetNav` | ✅ Fonctionnel | 8 planètes |
| `WireframeModel` | ✅ Fonctionnel | Rendu 3D SVG quaternion |
| `Dashboard` | ✅ Fonctionnel | SafeAreaView ✅ |
| `NeoListScreen` | ✅ Fonctionnel | SafeAreaView ✅, filtres + skeleton |
| `AsteroidInspector` | ✅ Fonctionnel | SafeAreaView ✅, quaternion live |
| `useNeoAsteroids` hook | ✅ Fonctionnel | Fetch + pagination |
| `useQuaternion` hook | ✅ Fonctionnel | Rotation temps réel |
| Navigation Expo Router | ✅ Fonctionnel | Stack multi-niveaux |

---

## ⚠️ Règles pour l'Agent IA

1. **SafeAreaView obligatoire** sur tous les écrans — utiliser `SafeAreaView` de `react-native-safe-area-context` avec `edges={['top', 'bottom', 'left', 'right']}`.
2. **Ne jamais changer la stack** sans validation explicite de l'utilisateur.
3. **Ne pas installer** `expo-dev-client`, `@shopify/react-native-skia`, ou tout autre package nécessitant un build natif.
4. **Toujours utiliser** `npx expo install <package>` pour les dépendances natives.
5. **Animations** : privilégier `react-native-reanimated` (Reanimated 4) pour les nouvelles animations plutôt que `Animated` de React Native core.
6. **Pas de Gimbal Lock** : toujours utiliser les quaternions pour les rotations 3D.
7. **Code mort** : ne pas laisser de composants, fonctions ou styles déclarés mais jamais utilisés.