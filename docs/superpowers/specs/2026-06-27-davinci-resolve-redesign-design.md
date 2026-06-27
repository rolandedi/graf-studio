# GrafStudio — Redesign style DaVinci Resolve

> Spec rédigée le 2026-06-27. Scope : refonte visuelle de l'ensemble de l'application (Composer + Controller + layout global) pour adopter l'esthétique et l'ergonomie de DaVinci Resolve 19, niveau de fidélité pixel-perfect. Aucun changement au modèle de données existant.

## 1. Contexte

L'application **GrafStudio** est un éditeur de lower thirds OGraf v1 (Nuxt 4 + Vue 3 + shadcn-vue + Tailwind v4). L'identité visuelle est déjà partiellement orientée DaVinci Resolve (variables CSS `oklch(...)` sur fond bleu-violet sombre), mais la mise en page reste éloignée de la cible :

- Navigation par onglets centrés en bas (`Composer` / `Controller`).
- Composer en 3 panneaux simples (ElementTree / CanvasPreview / PropertiesPanel) + Timeline en bas, sur fond bleu-violet.
- Controller avec 2 players Preview/Program.

L'objectif est de reprendre l'architecture applicative de DaVinci Resolve (TopBar à icônes, 3 panneaux flottants, Inspector à onglets, ModuleNav 7 modules) et de l'aligner sur les fonctionnalités de GrafStudio.

## 2. Décisions clés (validées par l'utilisateur)

| Sujet                          | Décision                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portée**                     | App complète (Composer + Controller + layout global)                                                                                        |
| **Fidélité**                   | Clone quasi pixel-perfect                                                                                                                   |
| **Mapping modules DaVinci**    | 2 modules actifs : Edit ↔ Composer, Fairlight ↔ Controller. Les 5 autres (Media, Cut, Fusion, Color, Deliver) sont visibles mais désactivés |
| **MediaPool (panneau gauche)** | Conserver ElementTree, renommé visuellement en « Library » / « Smart Bins » sans changement fonctionnel                                     |
| **Timeline**                   | Restylage visuel uniquement — modèle de données keyframes-par-propriété inchangé                                                            |
| **TopBar**                     | Implémentée comme switcher de panneau gauche (Media Pool / Effects / Index / Sound Library) + actions droite (Quick Export, Metadata)       |
| **Inspector**                  | Tabs Video / Audio / Effects / Transition / Image / File + sections collapsibles Transform / Cropping / Composite / Speed Change            |

## 3. Architecture cible

### 3.1 Coquille d'application (`AppShell`)

```
┌─ TopBar ────────────────────────────────────────────────────────┐  36px
│  [Media Pool] [Effects] [Index] [Sound Library] | [Quick Exp]   │
│  [Metadata] [Inspector toggle: show/hide RightSlot]            │
├──────────┬────────────────────────────────┬────────────────────┤
│          │                                │                    │
│ LeftSlot │ CenterSlot                     │ RightSlot          │
│  260px   │  flex-1                        │  300px             │
│ (Media   │  - Viewer (CanvasPreview)      │  (Inspector)       │
│  Pool /  │  - Timeline                    │                    │
│  Effects │                                │                    │
│  /Index) │                                │                    │
├──────────┴────────────────────────────────┴────────────────────┤
│  ModuleNav  [Media] [Cut] [Edit●] [Fusion] [Color] [Fairlight●] [Deliver]  52px
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Mapping des routes

| Module DaVinci | Route cible  | Route actuelle (alias) | Statut    |
| -------------- | ------------ | ---------------------- | --------- |
| Media          | `/media`     | —                      | désactivé |
| Cut            | `/cut`       | —                      | désactivé |
| **Edit**       | `/edit`      | `/composer` (alias)    | actif     |
| Fusion         | `/fusion`    | —                      | désactivé |
| Color          | `/color`     | —                      | désactivé |
| **Fairlight**  | `/fairlight` | `/controller` (alias)  | actif     |
| Deliver        | `/deliver`   | —                      | désactivé |

Les pages Composer/Controller actuelles restent accessibles via leurs routes historiques (compatibilité liens externes, tests E2E existants, bookmarks). De nouvelles pages `edit.vue` et `fairlight.vue` sont créées et contiennent la composition effective. Les fichiers `composer.vue` et `controller.vue` deviennent de simples re-exports : un `definePageMeta({ redirect: '/edit' })` (idem pour `controller.vue` → `/fairlight`) qui préserve la compatibilité sans dupliquer le code.

## 4. Theme tokens

L'actuelle palette `oklch(...)` est **remplacée** par des valeurs hex inspirées Resolve. Les variables shadcn-vue (`--background`, `--card`, etc.) sont conservées mais ré-aliènées sur ces nouvelles valeurs.

```css
:root {
  /* Surfaces Resolve */
  --bg-canvas: #0e0e0e; /* fond global + zone timeline */
  --bg-panel: #1c1c1c; /* Media Pool / Inspector */
  --bg-panel-2: #232323; /* hover / section active */
  --bg-header: #161616; /* TopBar / ModuleNav */
  --bg-input: #0a0a0a; /* champs de saisie */
  --border-panel: #2a2a2a;
  --border-subtle: #1f1f1f;

  /* Texte */
  --text-primary: #e8e8e8;
  --text-secondary: #a8a8a8;
  --text-muted: #6e6e6e;

  /* Accents */
  --accent-red: #ff3b3b; /* record dot / état modifié */
  --accent-orange: #f97316; /* module actif (DaVinci) */
  --accent-blue: #3b82f6; /* sélection / focus */
  --accent-record: #e53935;

  /* Typographie compacte */
  --text-xxs: 10px;
  --text-xs2: 11px;
  --text-sm2: 12px;

  /* Coins */
  --radius: 2px; /* quasi-carré partout */
}
```

Le shadcn-vue `Button`, `Input`, `Select`, `Card` etc. sont **personnalisés** (override des classes via `tailwind.config` / `app/assets/css/tailwind.css` `@layer components`) pour adopter `radius: 2px`, hauteur compacte (`h-7`), et bordures `--border-panel`.

## 5. Composants

### 5.1 Nouveaux

| Fichier                                        | Rôle                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `app/components/layout/Shell.vue`              | Coquille 3 panneaux (slot left/center/right) + TopBar + ModuleNav             |
| `app/components/layout/TopBar.vue`             | Barre d'icônes supérieure, switcher panneau gauche + actions droite           |
| `app/components/layout/ModuleNav.vue`          | Bottom-nav 7 modules (remplace `AppTabs.vue`)                                 |
| `app/components/layout/SidebarTab.vue`         | Wrapper icône+libellé style Resolve (réutilisé TopBar & panneaux)             |
| `app/components/composer/InspectorTabs.vue`    | Tabs Video/Audio/Effects/Transition/Image/File                                |
| `app/components/composer/InspectorSection.vue` | Section collapsible (Transform, Composite, Speed Change…)                     |
| `app/components/composer/InspectorField.vue`   | Ligne `label: valeur` alignée 2 colonnes                                      |
| `app/components/composer/MediaPoolPanel.vue`   | Switcher MediaPool / Effects / Index / SoundLibrary                           |
| `app/components/composer/MediaPoolItem.vue`    | Miniature clip/asset                                                          |
| `app/components/composer/TimelineRuler.vue`    | Règle temporelle `00:00:00:13`                                                |
| `app/components/composer/TimelineTrack.vue`    | Piste (V1/V2/A1…) avec clips colorés                                          |
| `app/composables/useUiStore.ts`                | State éphémère : `activeLeftPanel`, `rightPanelVisible`, `activeInspectorTab` |

### 5.2 Modifiés (restylage)

- `app/components/composer/ElementTree.vue` → renommé `LibraryPanel.vue` visuellement (entête « Smart Bins / Master / Toolbox »). Fonction interne identique.
- `app/components/composer/PropertiesPanel.vue` → entièrement réécrit pour devenir un Inspector DaVinci (tabs + sections collapsibles).
- `app/components/composer/TimelineEditor.vue` → réécrit en mini-timeline multi-pistes (visuel uniquement, données inchangées).
- `app/components/composer/CanvasPreview.vue` → conserve le canvas, ajoute transport-controls Resolve (◀◀ ◀ ▶ ▶▶ ⏏) et zoom.
- `app/components/controller/PlayerFrame.vue` + `PlayerControls.vue` + `DataForm.vue` → même palette, même densité.
- `app/layouts/default.vue` → remplacé par `app/layouts/shell.vue` (utilise `Shell.vue`).

### 5.3 Supprimés

- `app/components/layout/AppTabs.vue` → remplacé par `ModuleNav.vue` (ou conservé vide pour rétro-compat, à décider en phase 1).

## 6. Détails visuels clés

- **Coins** : `border-radius: 2px` sur tous les conteneurs. Pas d'arrondi sur les boutons principaux (override shadcn).
- **Densité typographique** :
  - Labels panneaux : `text-[11px] font-semibold uppercase tracking-wide text-text-secondary`.
  - Items de liste : `text-[12px] leading-tight`.
  - Valeurs numériques : `text-[11px] tabular-nums`.
- **Header de panneau** : `h-7 bg-panel border-b border-border-subtle px-3 flex items-center justify-between`.
- **Item de panneau (Library)** : `h-6 px-2 flex items-center gap-2`. Hover `bg-panel-2`. Sélectionné `bg-[#2d3540] border-l-2 border-l-accent-blue`.
- **Section Inspector** : `h-6 px-2 flex items-center justify-between border-b border-border-subtle`. Dot rouge 6px à gauche (signal paramètre modifié) + libellé `text-[11px] font-medium` + chevron droit.
- **TopBar** : `h-9 bg-header border-b border-border-panel`. Icônes `size-4`. Séparateurs `w-px h-5 bg-border-panel mx-2`. Items `[Media Pool] [Effects] [Index] [Sound Library] |sép| [Quick Export] [Metadata] [Inspector]`.
- **ModuleNav** : `h-[52px] bg-header border-t border-border-panel`. Modules `flex items-center gap-6 px-8`. Actif = `border-t-2 border-t-accent-orange text-accent-orange` + libellé uppercase. Désactivé = `text-text-muted pointer-events-none opacity-60`.
- **Boutons shadcn (`Button`)** : override pour `h-7 px-2 text-[11px]`, variante `outline` en `bg-bg-input border-border-panel`.
- **Inputs (`Input`)** : `h-7 bg-bg-input border-border-panel text-[11px]`. Focus ring `ring-accent-blue/40`.

## 7. State éphémère (UI store)

Nouveau composable `useUiStore` (réactif, en mémoire, pas de persistance) :

```typescript
interface UiState {
  activeLeftPanel: "media" | "effects" | "index" | "sound";
  rightPanelVisible: boolean; // toggle Inspector
  activeInspectorTab:
    | "video"
    | "audio"
    | "effects"
    | "transition"
    | "image"
    | "file";
  expandedInspectorSections: Set<string>; // ids des sections dépliées
  timelineZoom: number; // 0.5 .. 2
}
```

Persistance : aucune (state purement éphémère, reset à chaque rechargement — choix UX pour rester proche de Resolve).

## 8. Stratégie d'implémentation

3 phases courtes, chacune testable visuellement avec `pnpm dev`.

### Phase 1 — Thème & Shell (~1 h de travail)

1. Mettre à jour `app/assets/css/tailwind.css` avec les nouveaux tokens.
2. Override shadcn (Button, Input, Card, Separator, ScrollArea) via `@layer components` ou classes utilitaires.
3. Créer `Shell.vue`, `TopBar.vue`, `ModuleNav.vue`, `SidebarTab.vue`, `useUiStore.ts`.
4. Créer `app/layouts/shell.vue` et faire pointer `app.vue` dessus.
5. Brancher Composer et Controller dans le nouveau shell (juste l'enveloppe, contenu non encore restylé).
6. Créer pages `edit.vue` et `fairlight.vue` ; transformer `composer.vue` et `controller.vue` en redirects `definePageMeta({ redirect: '/edit' | '/fairlight' })` ; désactiver les 5 modules inactifs dans `ModuleNav.vue`.

**Critère de validation** : l'app démarre avec la nouvelle coque, le TopBar et le ModuleNav sont pixel-perfect, les modules désactivés sont bien grisés, Composer et Controller sont accessibles.

### Phase 2 — Composer Inspector + Library + Timeline (~2 h)

1. Réécrire `PropertiesPanel.vue` en Inspector à tabs + sections collapsibles (Transformer/Composite/Speed Change).
2. Restyler `ElementTree.vue` (header « Smart Bins / Master », items `h-6`, sélection `border-l-2`).
3. Réécrire `TimelineEditor.vue` en mini-timeline multi-pistes (règle, pistes, clips colorés).
4. Ajouter `MediaPoolPanel.vue` (switcher Media Pool / Effects / Index / Sound Library) dans le LeftSlot.
5. Connecter `TopBar` au `useUiStore.activeLeftPanel`.
6. Ajouter `InspectorTabs.vue`, `InspectorSection.vue`, `InspectorField.vue`.

**Critère de validation** : sur `/edit`, on retrouve la structure 3 panneaux, l'Inspector a ses tabs et sections, la Library ressemble à Media Pool, la Timeline est compacte et dense.

### Phase 3 — Controller + polish (~1 h)

1. Restyler `PlayerFrame.vue`, `PlayerControls.vue`, `DataForm.vue` (palette + densité).
2. Restyler `CanvasPreview.vue` (ajout transport-controls style Resolve).
3. Vérifier hover/focus sur tous les boutons et items.
4. Vérifier le rendu sur petit écran (1280×720 minimum).
5. Supprimer `AppTabs.vue` (ou conserver si rétro-compat recherchée).

**Critère de validation** : `/fairlight` a la même densité visuelle que `/edit`, l'app est cohérente dans les deux modules actifs.

## 9. Hors scope

- Changement du modèle de données (keyframe, GraphicElement, OgrafProject).
- Refonte fonctionnelle du TimelineEditor (reste keyframe-par-propriété).
- Implémentation des 5 modules désactivés (Media, Cut, Fusion, Color, Deliver).
- Mixer / faders verticaux (pas pertinent pour lower thirds sans audio).
- Persistance du state UI.

## 10. Tests

| Test      | Méthode                           | Critère                                                      |
| --------- | --------------------------------- | ------------------------------------------------------------ |
| Thème OK  | `pnpm dev` + ouverture `/edit`    | Fond `#0e0e0e`, panneaux `#1c1c1c`, texte `#e8e8e8`          |
| TopBar    | Inspection visuelle               | Hauteur 36px, icônes alignées, séparateur central            |
| ModuleNav | Clic sur `Edit` puis `Fairlight`  | Bordure orange sur l'actif, gris sur les autres              |
| Inspector | Clic sur un élément de la Library | Tabs visibles, sections Transform / Composite / Speed Change |
| Timeline  | Clic sur un keyframe              | Bloc coloré dans la piste, lecture temporelle                |
| Densité   | Inspection                        | Labels en `11px`, items en `12px`, hauteur panneau 28px      |

## 11. Risques

| Risque                                                             | Mitigation                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Régression visuelle sur les composants shadcn-vue                  | Override scoped via `@layer components`, ne pas modifier `components/ui/*` |
| Performance du TimelineEditor avec 100+ keyframes                  | Virtualisation native CSS, pas de lib externe                              |
| Routes `/composer` et `/controller` cassées par des liens externes | Aliases conservés indéfiniment                                             |
| Conflit avec le `toast` styling (Sonner)                           | Garder `vue-sonner` mais ajuster les `toast-options` au nouveau thème      |

## 12. Critères de succès

- L'inspection visuelle d'`/edit` à 1920×1080 donne l'impression de DaVinci Resolve 19 (Edit module).
- L'inspection visuelle d'`/fairlight` est cohérente avec `/edit` (même palette, même densité).
- Les 5 modules désactivés sont visuellement distincts (grisés, non-cliquables) et clairement non-disponibles.
- Aucune régression fonctionnelle : création, édition, animation, export OGraf, contrôle Preview/Program continuent de fonctionner.
- Le code respecte les patterns shadcn-vue et Nuxt 4 existants.
