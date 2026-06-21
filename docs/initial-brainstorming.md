# GrafStudio — Design Spec

## Résumé du besoin

- **Éditeur hybride** : canvas de prévisualisation temps réel + panneaux de propriétés
- **Player** : intégré dans l'éditeur ET page autonome séparée (Controller)
- **Type de graphique** : lower thirds en priorité
- **Animations** : éditeur de keyframes visuel
- **Persistance** : localStorage/IndexedDB uniquement
- **Résolution** : HD / Full HD / 4K configurable
- **Sortie** : Web Component OGraf v1 conforme + manifeste `.ograf.json`
- **Stack** : Nuxt 4 + Vue 3 + shadcn-vue + Tailwind CSS v4
- **Architecture** : Monolithe Nuxt avec iframe sandbox (Approche A)
- **Thème UI** : Dark mode uniquement, style DaVinci Resolve (fond sombre #1a1a2e / #16213e, panneaux gris foncé, accents bleu/orange, typographie compacte)
- **Navigation** : Onglets centrés en bas de l'écran (style application professionnelle broadcast)

## Architecture globale et structure des pages

L'application Nuxt comporte **2 routes principales** correspondant aux onglets :

- `/composer` — L'éditeur de graphiques lower thirds
- `/controller` — L'interface Preview/Program avec 2 players iframe

Un **layout partagé** (`app.vue`) fournit la barre d'onglets de navigation **centrée en bas** de l'écran, dans un style inspiré de DaVinci Resolve.

### Structure des dossiers

```
app/
├── pages/
│   ├── composer.vue          # Éditeur
│   └── controller.vue        # Preview + Program players
├── components/
│   ├── layout/
│   │   └── AppTabs.vue       # Navigation onglets Composer/Controller
│   ├── composer/
│   │   ├── CanvasPreview.vue         # Iframe de prévisualisation temps réel
│   │   ├── PropertiesPanel.vue       # Panneau de propriétés (texte, couleurs, position)
│   │   ├── TimelineEditor.vue        # Éditeur de keyframes
│   │   └── ElementTree.vue           # Arborescence des éléments du graphique
│   ├── controller/
│   │   ├── PlayerFrame.vue           # Iframe wrapper réutilisable pour player OGraf
│   │   ├── PlayerControls.vue        # Boutons Play/Stop/Update/Goto
│   │   └── DataForm.vue              # Formulaire dynamique basé sur le schema du manifeste
│   └── shared/
│       └── ResolutionSelector.vue    # Sélecteur HD/FHD/4K
├── composables/
│   ├── useProjectStore.ts            # État projet (reactive + persistence IndexedDB)
│   ├── useOgrafBridge.ts             # Communication postMessage avec iframes
│   └── useKeyframeEngine.ts          # Logique d'interpolation de keyframes
├── lib/
│   ├── ograf/
│   │   ├── manifest-builder.ts       # Génération du manifeste .ograf.json
│   │   ├── webcomponent-generator.ts # Génération du code Web Component
│   │   └── types.ts                  # Types TypeScript alignés sur la spec OGraf v1
│   └── storage/
│       └── indexeddb.ts              # Couche persistance IndexedDB
└── plugins/
    └── ssr-width.ts                  # (existant)
```

### Flux de données principal

```
Composer (état projet)
    → manifest-builder + webcomponent-generator
    → Blob URL
    → iframe src
    → Player OGraf (load/play/stop via postMessage)
```

## Modèle de données du projet

Un projet GrafStudio représente un graphique lower third complet. Voici le modèle central :

```typescript
interface OgrafProject {
  id: string; // UUID
  name: string; // Nom du graphique
  description?: string;
  author?: { name: string; email?: string };
  version: string; // ex: "1.0.0"
  resolution: Resolution; // HD | FHD | 4K ou custom
  supportsRealTime: boolean;
  supportsNonRealTime: boolean;
  stepCount: number; // Nombre de steps (défaut: 1)
  elements: GraphicElement[]; // Éléments visuels du lower third
  keyframes: KeyframeTrack[]; // Pistes d'animation
  schema: JSONSchema; // Schéma des données dynamiques (nom, titre, etc.)
  defaultData: Record<string, unknown>; // Valeurs par défaut
  updatedAt: number; // Timestamp
}

interface Resolution {
  width: number; // ex: 1920
  height: number; // ex: 1080
  label: string; // "HD", "Full HD", "4K", "Custom"
}

interface GraphicElement {
  id: string;
  type: "text" | "shape" | "image";
  name: string;
  x: number; // Position en % ou px
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  properties: TextProperties | ShapeProperties | ImageProperties;
}

interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number; // px
  fontWeight: string; // "normal", "bold", ou valeur numérique
  fontStyle: string; // "normal", "italic"
  color: string; // CSS color
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number; // px
}

interface ShapeProperties {
  shapeType: "rectangle" | "rounded-rect" | "circle" | "line";
  fillColor: string; // CSS color
  strokeColor: string; // CSS color
  strokeWidth: number; // px
  borderRadius: number; // px (pour rounded-rect)
}

interface ImageProperties {
  src: string; // URL ou data URI
  objectFit: "cover" | "contain" | "fill" | "none";
}

interface KeyframeTrack {
  elementId: string;
  property: string; // ex: "x", "opacity", "rotation"
  keyframes: Keyframe[];
}

interface Keyframe {
  time: number; // ms depuis le début de l'action
  value: number | string;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cubic-bezier";
  cubicBezier?: [number, number, number, number]; // si easing = cubic-bezier
}
```

### Persistance IndexedDB

- Base : `ograf-builder`
- Store : `projects` (keyPath: `id`)
- Opérations : CRUD + liste + export/import JSON

## Génération OGraf

C'est le cœur du système : transformer un `OgrafProject` en artefacts OGraf v1 conformes.

### Manifest Builder (`manifest-builder.ts`)

Génère le fichier `.ograf.json` à partir du projet :

```typescript
function buildManifest(project: OgrafProject): OgrafManifest {
  return {
    $schema:
      "https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json",
    id: project.id,
    version: project.version,
    name: project.name,
    description: project.description,
    author: project.author,
    main: "graphic.mjs",
    schema: project.schema,
    supportsRealTime: project.supportsRealTime,
    supportsNonRealTime: project.supportsNonRealTime,
    stepCount: project.stepCount,
    renderRequirements: [
      {
        resolution: {
          width: { exact: project.resolution.width },
          height: { exact: project.resolution.height },
        },
      },
    ],
  };
}
```

### Web Component Generator (`webcomponent-generator.ts`)

Génère le code JavaScript du Web Component OGraf. Le générateur produit une classe `HTMLElement` qui :

1. **`load()`** : Crée le DOM du lower third à partir des éléments + applique les styles initiaux
2. **`playAction()`** : Exécute les animations d'entrée via Web Animations API en interpolant les keyframes
3. **`stopAction()`** : Exécute les animations de sortie (keyframes inversées ou dédiées)
4. **`updateAction()`** : Met à jour les propriétés dynamiques (texte, couleurs) avec transition optionnelle
5. **`dispose()`** : Nettoie le DOM et les ressources
6. **`customAction()`** : Retourne 400 (pas d'actions custom en V1)

Le code généré est autonome (pas de dépendances externes) et utilise uniquement des APIs Web standard (Web Animations API, CSS transforms).

### Pipeline de génération complet

```
OgrafProject
    ↓
buildManifest() → manifest.ograf.json (Blob)
    ↓
generateWebComponent() → graphic.mjs (Blob)
    ↓
Créer un Blob URL combiné (HTML wrapper + script)
    ↓
Injecter comme src de l'iframe player
```

Le wrapper HTML dans l'iframe charge le script, instancie le custom element, et expose une API postMessage pour recevoir les commandes `load`, `playAction`, `stopAction`, `updateAction` depuis l'app parent.

## Communication iframe (Ograf Bridge)

Le composable `useOgrafBridge` encapsule toute la communication postMessage entre l'app Nuxt et les iframes player.

### Protocole de messages

**App → Iframe (commandes) :**

| Type                 | Payload                                       | Description                          |
| -------------------- | --------------------------------------------- | ------------------------------------ |
| `ograf:load`         | `{ data, renderType, renderCharacteristics }` | Charge le graphique avec ses données |
| `ograf:playAction`   | `{ goto?, delta?, skipAnimation? }`           | Joue un step                         |
| `ograf:stopAction`   | `{ skipAnimation? }`                          | Arrête le graphique                  |
| `ograf:updateAction` | `{ data, skipAnimation? }`                    | Met à jour les données dynamiques    |
| `ograf:dispose`      | `{}`                                          | Nettoie le graphique                 |

**Iframe → App (réponses) :**

| Type             | Payload                                                           | Description                                  |
| ---------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `ograf:ready`    | `{}`                                                              | Le wrapper est prêt à recevoir des commandes |
| `ograf:response` | `{ requestId, statusCode, statusMessage, currentStep?, result? }` | Réponse à une commande                       |
| `ograf:error`    | `{ requestId, error }`                                            | Erreur d'exécution                           |

Chaque commande envoyée inclut un `requestId` unique pour corréler les réponses asynchrones.

### API du composable

```typescript
const bridge = useOgrafBridge(iframeRef);

await bridge.load({ data: { name: "Jean Dupont" }, renderType: "realtime" });
await bridge.playAction({ delta: 1 });
await bridge.updateAction({ data: { name: "Marie Martin" } });
await bridge.stopAction();
bridge.dispose();
```

Le composable gère automatiquement :

- L'attente du message `ograf:ready` avant d'envoyer des commandes
- La corrélation request/response via `requestId`
- Le timeout configurable par commande
- Le cleanup des listeners au démontage

## Composer (éditeur)

La page `/composer` est organisée en 3 zones :

### Layout du Composer

```
┌─────────────────────────────────────────────────┐
│  Toolbar (nouveau, sauvegarder, résolution, export) │
├──────────────┬──────────────────┬────────────────┤
│              │                  │                │
│ ElementTree  │  CanvasPreview   │ PropertiesPanel│
│ (liste des   │  (iframe avec    │ (propriétés de │
│  éléments)   │   le graphique)  │  l'élément     │
│              │                  │  sélectionné)  │
│              │                  │                │
├──────────────┴──────────────────┴────────────────┤
│  TimelineEditor (keyframes par propriété)         │
└─────────────────────────────────────────────────┘
```

### Composants clés

- **CanvasPreview** : Iframe sandboxé affichant le graphique en temps réel. Se met à jour automatiquement quand le projet change (via `updateAction`). Supporte le zoom et le pan pour l'édition.
- **PropertiesPanel** : Formulaire dynamique qui affiche les propriétés de l'élément sélectionné (texte, couleur, position, taille, opacité, rotation). Les champs sont générés selon le type d'élément.
- **ElementTree** : Liste ordonnée des éléments du graphique avec drag & drop pour réordonner (z-index). Clic pour sélectionner.
- **TimelineEditor** : Éditeur visuel de keyframes. Affiche une piste par propriété animable. L'utilisateur peut ajouter/supprimer/déplacer des keyframes sur une timeline. Courbe d'easing configurable par keyframe.

### Interactions principales

1. L'utilisateur ajoute un élément texte → il apparaît dans l'ElementTree et sur le canvas
2. Il modifie les propriétés dans le PropertiesPanel → le canvas se met à jour via `updateAction`
3. Il ajoute des keyframes dans la Timeline → les animations sont régénérées et prévisualisées
4. Bouton "Play" dans le canvas → appelle `playAction()` pour tester l'animation complète

## Controller (Preview/Program)

La page `/controller` implémente le modèle broadcast classique avec 2 players.

### Layout du Controller

```
┌─────────────────────────────────────────────────┐
│  Toolbar (sélection projet, résolution globale)    │
├───────────────────────┬─────────────────────────┤
│                       │                         │
│   PREVIEW Player      │   PROGRAM Player        │
│   (iframe sandbox)    │   (iframe sandbox)      │
│                       │                         │
├───────────────────────┼─────────────────────────┤
│   Preview Controls    │   Program Controls      │
│   Play / Stop / Update│   Play / Stop / Update  │
│   Data Form           │   Data Form             │
│   Step Navigation     │   Step Navigation       │
└───────────────────────┴─────────────────────────┘
```

### Comportement

- **Preview** : Bac à sable pour tester les modifications. L'utilisateur peut modifier les données, jouer/arrêter les animations librement. Les changements dans le Composer se reflètent ici en temps réel.
- **Program** : Simule la sortie broadcast. Fonctionne indépendamment du Preview. L'utilisateur doit explicitement charger un graphique et contrôler le playout. Représente le "rendu final".
- Les deux players sont **indépendants** : chacun a son propre état, ses propres données, sa propre timeline.
- Un bouton **"Copy to Program"** permet de transférer l'état du Preview vers le Program (comme un take en régie).

### Composants

- **PlayerFrame** : Wrapper iframe réutilisable. Accepte un `projectId` ou un blob URL. Expose les méthodes OGraf via `useOgrafBridge`.
- **PlayerControls** : Boutons Play/Stop/Goto + indicateur de step courant. Générés dynamiquement selon le `stepCount` du manifeste.
- **DataForm** : Formulaire généré automatiquement à partir du `schema` JSON du manifeste. Permet de modifier les données dynamiques (nom, titre, couleur, etc.) et d'envoyer `updateAction()`.

## Export OGraf et gestion des erreurs

### Export

L'utilisateur peut exporter son projet sous forme de **dossier OGraf conforme** (téléchargement ZIP) contenant :

- `manifest.ograf.json` — le manifeste généré
- `graphic.mjs` — le Web Component généré
- `assets/` — les ressources éventuelles (images, fonts)

Le bouton "Export" dans la toolbar du Composer déclenche ce téléchargement. Le ZIP est directement compatible avec tout renderer OGraf (dont ograf-server).

### Gestion des erreurs

| Scénario                         | Comportement                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Génération échoue                | Toast d'erreur avec détails, canvas affiche un état vide                           |
| Iframe ne répond pas (timeout)   | Retry automatique (max 3), puis toast d'erreur                                     |
| IndexedDB plein                  | Notification + option export forcé                                                 |
| Web Component lève une exception | Capturée dans l'iframe, remontée via `ograf:error`, affichée dans un panneau debug |
| Données invalides vs schema      | Validation avant envoi, champs en erreur surlignés dans le DataForm                |

### Hors périmètre V1

Ces fonctionnalités sont explicitement exclues de la V1 :

- Actions custom OGraf
- Support non-real-time (`goToTime`, `setActionsSchedule`)
- Templates prédéfinis / bibliothèque
- Backend / API serveur
- Import de projets existants (hors format GrafStudio)
- Édition multi-graphiques simultanée
