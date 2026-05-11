# 🛰️ OSCILLA PROJECT

> Centre de Contrôle Aérospatial & Cinématique — Application mobile React Native / Expo

[![CI Backend](https://github.com/Sheefti/OSCILLA-PROJECT/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/Sheefti/OSCILLA-PROJECT/actions/workflows/ci-backend.yml)
[![CD Backend](https://github.com/Sheefti/OSCILLA-PROJECT/actions/workflows/cd-backend.yml/badge.svg)](https://github.com/Sheefti/OSCILLA-PROJECT/actions/workflows/cd-backend.yml)

---

## 📖 Présentation

**Oscilla** est une application mobile de suivi orbital en temps réel, orientée direction artistique holographique JARVIS.  
Elle consomme l'API NASA NeoWS via un backend Node.js et affiche les astéroïdes géocroiseurs (NEO/PHO) sur un radar orbital animé.

**Plateforme cible** : iOS (Expo Go) · Format **Paysage (Landscape)** verrouillé

---

## 🏗️ Architecture

```
oscilla/
├── .github/
│   └── workflows/
│       ├── ci-backend.yml       # Tests Jest sur PR → main
│       └── cd-backend.yml       # Build & push image Docker sur main
├── backend/                     # Node.js 20 / Express (JavaScript)
├── frontend/                    # Expo SDK 54 / React Native 0.81 (TypeScript)
│   ├── app/                     # Expo Router (routes)
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Point d'entrée (Splash → Onboarding → Dashboard)
│   │   ├── onboarding.tsx
│   │   ├── splash.tsx
│   │   └── radar/
│   │       ├── _layout.tsx
│   │       ├── index.tsx        # Dashboard orbital
│   │       ├── list.tsx         # Catalogue NEO
│   │       ├── details.tsx      # Détail astéroïde (données statiques)
│   │       └── neo-details.tsx  # Détail astéroïde (données API NASA)
│   └── src/
│       ├── screens/             # Écrans principaux
│       │   ├── SplashScreen.tsx
│       │   ├── OnboardingScreen.tsx
│       │   ├── Dashboard.tsx
│       │   ├── NeoListScreen.tsx
│       │   └── AsteroidInspector.tsx
│       ├── components/
│       │   ├── OrbitalRadar/    # Radar SVG animé (sin/cos 3D)
│       │   ├── LeftPanel/       # Télémétrie dynamique
│       │   ├── PlanetNav/       # Navigation par planète
│       │   └── WireframeModel/  # Modèle 3D wireframe (quaternions)
│       ├── hooks/
│       │   ├── useNeoAsteroids.ts   # Fetch API NASA + pagination
│       │   └── useQuaternion.ts     # Moteur quaternion temps réel
│       ├── math/
│       │   ├── orbital.ts       # Équations orbitales (sin/cos)
│       │   └── quaternion.ts    # Rotation 3D sans Gimbal Lock
│       ├── theme/
│       │   ├── colors.ts        # Tokens de couleurs
│       │   ├── asteroids.ts     # Données statiques astéroïdes
│       │   └── planets.ts       # Données planètes + fallbacks
│       └── services/
│           └── api.ts           # Client Axios vers le backend
├── docker-compose.yml
├── AGENT.md                     # Contexte IA (lire en premier)
└── README.md
```

---

## 🔧 Stack Technique

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 20 | Runtime |
| Express | 4.x | Serveur HTTP |
| Axios | 1.x | Proxy NASA API |
| Helmet + CORS | — | Sécurité |
| Jest + Supertest | — | Tests |
| Docker | alpine | Déploiement |

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Expo SDK | ~54.0.33 | Plateforme mobile |
| React Native | 0.81.5 | UI native |
| expo-router | ~4.0.17 | Navigation déclarative |
| react-native-reanimated | ~4.1.1 | Animations 60fps |
| react-native-svg | SDK 54 compat | Radar & wireframes |
| react-native-safe-area-context | SDK 54 compat | Gestion encoches |
| expo-screen-orientation | ~9.0.8 | Verrouillage Landscape |
| expo-linear-gradient | — | Vignettes & dégradés |
| react-native-webview | — | Canvas HTML (onboarding) |
| axios | ^1.x | Appels backend |

---

## 🚀 Lancement

### Prérequis
- Node.js ≥ 20
- Expo Go installé sur l'appareil (même réseau Wi-Fi)
- (Optionnel) Docker pour le backend

### Backend
```bash
cd backend
npm install
npm start          # Port 3000
# ou
docker-compose up  # Via Docker
```

### Frontend
```bash
cd frontend
npm install
npx expo start     # Scanne le QR dans Expo Go
```

> ⚠️ Renseigne l'IP du backend dans `frontend/src/services/api.ts` si tu testes sur appareil physique.

---

## 🎨 Design System

- **Thème** : Dark holographique (JARVIS / HUD spatial)
- **Couleurs** : Cyan `#00e5ff`, Amber `#ffab00`, Red `#ff3d3d`, Green `#00ff88`
- **Fond** : `#010810`
- **Typographie** : Orbitron (titres) + Share Tech Mono (données)
- **Effets** : Glassmorphism, glow/shadow, HUD corners, scanlines

---

## 🔢 Moteurs Mathématiques

### 1. Moteur Orbital (`src/math/orbital.ts`)
```
angle = t × speed + phase
x = rx × cos(angle)
y = ry × sin(angle)
```
Simule des trajectoires elliptiques en 3D via projection perspective.

### 2. Moteur Quaternion (`src/math/quaternion.ts`)
Rotation 3D pure sans Gimbal Lock — interpolation SLERP entre états rotationnels.
Les quaternions alimentent le `WireframeModel` et l'`AsteroidInspector`.

### 3. Radar Orbital (`OrbitalRadar`)
SVG animé à 60fps avec tri par profondeur (painter's algorithm) — 4 à N astéroïdes par planète.

### 4. Modèle Wireframe 3D (`WireframeModel`)
Icosphère déformée procédurale rendue en SVG, tournant via quaternions purs.

---

## 📡 API Backend

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Healthcheck |
| GET | `/api/neo?page=0&size=20` | Liste NEO paginée |
| GET | `/api/neo/by-body?body=earth&size=4` | NEO par corps céleste |

---

## 🧭 Navigation (Expo Router)

```
/              → Splash → Onboarding → Dashboard
/radar         → Dashboard orbital
/radar/list    → Catalogue NEO (avec filtres status + planète)
/radar/details → Détail astéroïde (données statiques)
/radar/neo-details → Détail astéroïde (données API NASA)
```

---

## ✅ Fonctionnalités Implémentées

- [x] Splash Screen animé (rings concentriques + scan line)
- [x] Onboarding 3 slides (WebView canvas HTML)
- [x] Dashboard orbital radar animé (sin/cos 3D, SVG)
- [x] Navigation multi-planètes (8 planètes du système solaire)
- [x] Données NASA en temps réel (API NeoWS via backend)
- [x] Catalogue NEO avec filtres statut + corps céleste
- [x] Squelettes de chargement (Reanimated)
- [x] Gestion d'erreur avec bouton retry
- [x] AsteroidInspector (données orbitales + modèle 3D wireframe)
- [x] Moteur quaternion temps réel (W, X, Y, Z live)
- [x] SafeAreaView sur tous les écrans
- [x] CI/CD GitHub Actions (lint + tests + Docker)

---

## 📋 CI/CD

- **CI** : Lint + Jest sur chaque Pull Request vers `main`
- **CD** : Build et push de l'image Docker vers `ghcr.io/sheefti/oscilla-backend:latest` sur push `main`

---

## 📄 Licence

MIT — voir [LICENSE](./LICENSE)
g