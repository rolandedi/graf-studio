# GrafStudio

> **Constructeur de graphiques broadcast OGraf v1 — conforme EBU, dans votre navigateur.**

GrafStudio est un éditeur professionnel de **lower thirds** et de graphiques TV animés, conçu pour la spécification [OGraf v1](https://ograf.ebu.io/) soutenue par l'**EBU (European Broadcasting Union)**. Il permet de concevoir, animer et exporter des graphiques HTML prêts pour la production, exécutables sur tout moteur de rendu compatible OGraf.

<p align="center">
  <img src="https://img.shields.io/badge/nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/vue-3.x-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/tailwind-css%20v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/shadcn--vue-latest-black" alt="shadcn-vue" />
  <img src="https://img.shields.io/badge/PNPM-9.x-F69220?logo=pnpm&logoColor=white" alt="PNPM" />
  <img src="https://img.shields.io/badge/OGraf-v1-0050FF" alt="OGraf v1" />
</p>

---

## ✨ Fonctionnalités

- **🖌️ Éditeur hybride** — Canvas de prévisualisation temps réel + panneaux de propriétés + inspecteur à onglets
- **🎬 Animation par keyframes** — Éditeur visuel de keyframes avec courbes d'easing configurables
- **📺 Interface Controller** — Modèle Preview/Program broadcast avec 2 players iframe indépendants
- **📐 Résolutions configurables** — HD / Full HD / 4K (ou personnalisé)
- **📦 Export OGraf v1** — Génération conforme d'un dossier OGraf complet : manifeste `.ograf.json` + Web Component `graphic.mjs` + assets
- **💾 Persistance locale** — Stockage IndexedDB, aucun backend requis
- **🎨 Interface professionnelle** — Design inspiré de DaVinci Resolve, dark mode exclusif
- **🔌 Communication iframe** — Protocole postMessage (`useOgrafBridge`) pour le contrôle sandboxé des players
- **🧩 Zero dépendance runtime** — Le Web Component généré est autonome (Web Animations API, CSS transforms)

---

## 🏗️ Architecture

```
┌─ TopBar ──────────────────────────────────────────────────────────┐
│  [Media Pool] [Effects] [Index] [Sound Library] | [Quick Export]   │
├──────────┬─────────────────────────────────┬───────────────────────┤
│ LeftSlot │        CenterSlot               │      RightSlot        │
│ (Media   │  • CanvasPreview (iframe)       │  • Inspector          │
│  Pool /  │  • Timeline (keyframes)         │    (onglets Video,    │
│  Effects)│                                  │     Audio, Effects…)  │
├──────────┴─────────────────────────────────┴───────────────────────┤
│  ModuleNav  [Media] [Cut] [Edit●] [Fusion] [Color] [Fairlight●]…  │
└────────────────────────────────────────────────────────────────────┘
```

| Module                      | Route        | Rôle                                          |
| --------------------------- | ------------ | --------------------------------------------- |
| **Edit**                    | `/edit`      | Composer — Édition des graphiques lower third |
| **Fairlight**               | `/fairlight` | Controller — Interface Preview/Program        |
| Media                       | `/media`     | Réservé (v2)                                  |
| Cut, Fusion, Color, Deliver | —            | Réservés (v2)                                 |

---

## 📁 Structure du projet

```
ograf-tool/
├── app/
│   ├── pages/
│   │   ├── index.vue              # Landing
│   │   ├── edit.vue               # Composer (éditeur)
│   │   ├── fairlight.vue          # Controller (preview/program)
│   │   ├── composer.vue           # Alias → /edit
│   │   ├── controller.vue         # Alias → /fairlight
│   │   └── player.vue             # Player autonome
│   ├── components/
│   │   ├── layout/                # Shell, TopBar, ModuleNav, SidebarTab
│   │   ├── composer/              # CanvasPreview, ElementTree, PropertiesPanel, TimelineEditor, Inspector
│   │   ├── controller/            # PlayerFrame, PlayerControls, DataForm
│   │   ├── shared/                # ResolutionSelector
│   │   └── ui/                    # Composants shadcn-vue (Button, Card, Select…)
│   ├── composables/
│   │   ├── useProjectStore.ts     # Store réactif + persistance IndexedDB
│   │   ├── useOgrafBridge.ts      # Communication postMessage avec iframes
│   │   ├── useKeyframeEngine.ts   # Interpolation de keyframes
│   │   └── useUiStore.ts          # État UI (panneaux, onglets, sélection)
│   ├── lib/
│   │   ├── ograf/
│   │   │   ├── types.ts                   # Types TypeScript alignés OGraf v1
│   │   │   ├── manifest-builder.ts         # Génération .ograf.json
│   │   │   ├── webcomponent-generator.ts   # Génération Web Component
│   │   │   └── export.ts                  # Export ZIP du projet
│   │   └── storage/
│   │       └── indexeddb.ts       # Couche CRUD IndexedDB
│   └── assets/
│       └── css/
│           └── tailwind.css       # Thème dark DaVinci Resolve
├── docs/                          # Documentation & specs
├── public/                        # Assets statiques
├── nuxt.config.ts                 # Configuration Nuxt 4
├── tailwind.config.ts             # (géré via @tailwindcss/vite)
├── components.json                # Configuration shadcn-vue
├── tsconfig.json
└── package.json
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.x

### Installation

```bash
pnpm install
```

### Développement

```bash
pnpm dev
```

L'application démarre sur `http://localhost:3000`.

### Build production

```bash
pnpm build
pnpm preview
```

---

## 🧠 Modèle de données

Un projet GrafStudio (`OgrafProject`) représente un graphique lower third complet :

```
OgrafProject
├── id, name, version, author
├── resolution (HD / FHD / 4K / custom)
├── stepCount, supportsRealTime
├── elements[]
│   ├── GraphicElement (text | shape | image)
│   │   ├── position (x, y, width, height, rotation, opacity, zIndex)
│   │   └── properties (TextProperties | ShapeProperties | ImageProperties)
├── keyframes[]
│   └── KeyframeTrack (elementId + property + Keyframe[])
├── schema (JSON Schema pour les données dynamiques)
└── defaultData (valeurs par défaut)
```

---

## 🔄 Pipeline de génération

```
OgrafProject
    ↓
buildManifest()        → manifest.ograf.json
    ↓
generateWebComponent() → graphic.mjs (Web Component autonome)
    ↓
Blob URL combiné (HTML wrapper + script)
    ↓
iframe src → Player OGraf (load → playAction → stopAction → dispose)
```

Le Web Component généré implémente l'interface OGraf v1 complète :

- `load()` — Construction du DOM
- `playAction()` / `stopAction()` — Animations via Web Animations API
- `updateAction()` — Mise à jour des propriétés dynamiques
- `dispose()` — Nettoyage des ressources

---

## 📡 Protocole Bridge (postMessage)

| Commande             | Direction    | Description                       |
| -------------------- | ------------ | --------------------------------- |
| `ograf:load`         | App → Iframe | Charge le graphique + données     |
| `ograf:playAction`   | App → Iframe | Joue un step d'animation          |
| `ograf:stopAction`   | App → Iframe | Arrête le graphique               |
| `ograf:updateAction` | App → Iframe | Met à jour les données dynamiques |
| `ograf:dispose`      | App → Iframe | Nettoie le graphique              |
| `ograf:ready`        | Iframe → App | Signal de disponibilité           |
| `ograf:response`     | Iframe → App | Réponse à une commande            |
| `ograf:error`        | Iframe → App | Erreur d'exécution                |

---

## 🎯 Feuille de route

### V1 (actuelle)

- [x] Thème UI DaVinci Resolve
- [x] Navigation par modules (Edit, Fairlight)
- [x] Éditeur de lower thirds avec canvas temps réel
- [x] Éditeur de keyframes visuel
- [x] Controller Preview/Program
- [x] Export OGraf v1 (ZIP)
- [x] Persistance IndexedDB

### V2 (planifiée)

- [ ] Import de projets OGraf existants
- [ ] Bibliothèque de templates
- [ ] Support multi-graphiques (plusieurs projets ouverts)
- [ ] MediaPool avec assets locaux
- [ ] Support non-real-time (`goToTime`, `setActionsSchedule`)
- [ ] Actions custom OGraf

---

## 🤝 Compatibilité

Les graphiques générés par GrafStudio sont compatibles avec :

- La spécification [OGraf v1](https://ograf.ebu.io/)
- [ograf-server](https://github.com/ebu/ograf-server) (renderer de référence EBU)
- Tout moteur de rendu conforme OGraf v1

---

## 📄 Licence

MIT © GrafStudio
