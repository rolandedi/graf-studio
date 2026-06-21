# Plan d'implémentation — GrafStudio

## Phase 1 — Fondations & Thème UI

**Objectif :** Mettre en place la base de l'app avec le thème dark DaVinci Resolve et la navigation par onglets en bas.

1. **Configurer le thème dark** dans `tailwind.css` (variables CSS : fonds `#1a1a2e` / `#16213e`, panneaux gris foncé, accents bleu/orange, typographie compacte)
2. **Créer le layout `default.vue`** avec la barre d'onglets centrée en bas (Composer / Controller)
3. **Créer les pages vides** `composer.vue` et `controller.vue`
4. **Mettre à jour `app.vue`** (titre, meta, structure de base)
5. **Vérifier** que la navigation entre onglets fonctionne

## Phase 2 — Types & Persistance

**Objectif :** Modèle de données et stockage IndexedDB.

1. **Créer `lib/ograf/types.ts`** — Types TypeScript (`OgrafProject`, `GraphicElement`, `Keyframe`, `TextProperties`, etc.)
2. **Créer `lib/storage/indexeddb.ts`** — Couche IndexedDB (CRUD projets)
3. **Créer `composables/useProjectStore.ts`** — Store réactif (projet courant, liste, sauvegarde auto)
4. **Tester** la création/sauvegarde/chargement d'un projet vide

## Phase 3 — Génération OGraf

**Objectif :** Transformer un projet en artefacts OGraf v1.

1. **Créer `lib/ograf/manifest-builder.ts`** — Génération du manifeste `.ograf.json`
2. **Créer `lib/ograf/webcomponent-generator.ts`** — Génération du code Web Component (DOM + Web Animations API)
3. **Créer le wrapper HTML** qui charge le script + expose l'API postMessage dans l'iframe
4. **Créer `composables/useOgrafBridge.ts`** — Communication postMessage (load/play/stop/update/dispose)
5. **Tester** la génération d'un lower third minimal et son chargement dans une iframe

## Phase 4 — Composer (éditeur)

**Objectif :** L'éditeur hybride avec canvas, panneaux et timeline.

1. **Créer `CanvasPreview.vue`** — Iframe sandbox + zoom/pan + bouton Play
2. **Créer `ElementTree.vue`** — Liste des éléments avec drag & drop (z-index)
3. **Créer `PropertiesPanel.vue`** — Formulaire dynamique selon le type d'élément
4. **Créer `TimelineEditor.vue`** — Éditeur de keyframes visuel (pistes, ajout/déplacement/suppression, easing)
5. **Créer `composables/useKeyframeEngine.ts`** — Interpolation des keyframes
6. **Assembler `composer.vue`** — Layout 3 zones + toolbar (nouveau, sauvegarder, résolution, export)
7. **Tester** la création d'un lower third complet avec animation

## Phase 5 — Controller (Preview/Program)

**Objectif :** L'interface de contrôle broadcast avec 2 players.

1. **Créer `PlayerFrame.vue`** — Wrapper iframe réutilisable (charge un projet, expose le bridge)
2. **Créer `PlayerControls.vue`** — Boutons Play/Stop/Goto + indicateur de step
3. **Créer `DataForm.vue`** — Formulaire généré depuis le schema JSON du manifeste
4. **Créer `ResolutionSelector.vue`** — Sélecteur HD/FHD/4K partagé
5. **Assembler `controller.vue`** — Layout Preview | Program + bouton "Copy to Program"
6. **Tester** le contrôle complet d'un graphique en Preview et Program

## Phase 6 — Export & Polish

**Objectif :** Export ZIP OGraf conforme + gestion d'erreurs + finitions.

1. **Implémenter l'export ZIP** (manifeste + Web Component + assets) via JSZip
2. **Ajouter la gestion d'erreurs** (toasts, retry iframe, validation schema, panneau debug)
3. **Polish UI** — Transitions, états vides, raccourcis clavier, responsive
4. **Test end-to-end** — Créer un lower third → animer → prévisualiser → controller → exporter → tester dans ograf-server

## Dépendances entre phases

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

Chaque phase produit un incrément testable et démontrable.
