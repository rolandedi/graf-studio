# AGENTS.md — Directives pour les agents IA

Ce document définit les rôles, règles et meilleures pratiques que doivent suivre les agents IA participant au projet **GrafStudio**.

---

## 1. Contexte du projet

**GrafStudio** est un éditeur visuel pour construire des expériences interactives basées sur le format Ograf (Open Graph Framework).

- **Framework principal** : Nuxt 4+ avec Vue 3 / Composition API
- **Langage** : TypeScript strict
- **Styling** : Tailwind CSS + shadcn-vue
- **Gestion d'état** : Pinia via les composables du dossier `composables/`
- **Moteur graphique** : Canvas 2D dans `components/composer/CanvasPreview.vue`
- **Génération de sortie** : `lib/ograf/` (manifest-builder, export, webcomponent-generator)
- **Package manager** : pnpm (monorepo via `pnpm-workspace.yaml`)

---

## 2. Rôles des agents IA

### 2.1 Développeur / Contributeur

- Implémenter des fonctionnalités, corriger des bugs, refactoriser du code.
- Respecter les conventions du projet et les patterns établis.
- Écrire du code testable et maintenable.

### 2.2 Architecte

- Proposer et valider la structure des modules avant modification majeure.
- Veiller à la cohérence entre `lib/ograf/`, les composables et l'UI.
- Documenter les décisions techniques dans `docs/`.

### 2.3 Reviewer

- Vérifier la qualité, la sécurité et la cohérence du code généré.
- S'assurer que les changements ne cassent pas le format Ograf ou le builder.

### 2.4 Assistant utilisateur

- Aider à naviguer dans le codebase.
- Expliquer les choix techniques et proposer des alternatives.

---

## 3. Règles générales

1. **Toujours privilégier la clarté à la brieveté.** Le code doit être lisible par des humains.
2. **Ne jamais inventer d'API ou de propriétés** sans vérifier dans `lib/ograf/types.ts` ou les composants existants.
3. **Toujours utiliser les chemins absolus** lors des appels à des outils prenant un `filePath`.
4. **Avant d'éditer un fichier**, le lire ou s'assurer qu'il est déjà dans le contexte.
5. **Ne jamais imprimer de bloc de code** représentant un changement : utiliser les outils d'édition (`replace_string_in_file`, `insert_edit_into_file`).
6. **Ne jamais modifier un fichier via une commande terminal** sauf demande explicite.
7. **Valider les changements** après édition en vérifiant les erreurs de compilation via `get_errors` ou `pnpm typecheck`.
8. **Respecter la langue** : le codebase est en anglais ; les commentaires, noms de variables et documentation technique doivent être en anglais. Les discussions avec l'utilisateur peuvent être en français.

---

## 4. Conventions de code

### 4.1 Vue / Nuxt

- Utiliser la **Composition API** avec `<script setup lang="ts">`.
- Préférer les **composables** (`useProjectStore`, `useUiStore`, etc.) à l'état local dispersé.
- Utiliser `defineProps<T>()` et `defineEmits<T>()` typés.
- Les composants réutilisables doivent résider dans `components/ui/` (shadcn) ou `components/shared/`.
- Les composants métier restent dans `components/composer/`, `components/controller/`, etc.

### 4.2 TypeScript

- Activer le typage strict : pas de `any` implicite.
- Définir les types métier dans `lib/ograf/types.ts`.
- Utiliser des interfaces pour les objets de données et des types pour les unions.
- Exporter les types depuis `lib/ograf/types.ts`.

### 4.3 Styling

- Utiliser **Tailwind CSS** pour le styling.
- Pour les composants shadcn-vue, respecter la structure et les tokens (`components/ui/*`).
- Éviter les styles inline ; utiliser les utilitaires Tailwind.
- Les couleurs et espacements doivent suivre la config Tailwind du projet.

### 4.4 Gestion d'état

- L'état global du projet (scènes, éléments, médias) via `useProjectStore`.
- L'état UI (panneaux, sélection, onglets) via `useUiStore`.
- L'état local d'un composant via `ref` / `reactive` uniquement si nécessaire.

### 4.5 Ograf / Builder

- Toute nouvelle propriété d'élément doit être reflétée dans :
  - `lib/ograf/types.ts`
  - le builder (`manifest-builder.ts`)
  - l'export (`export.ts`)
  - l'inspecteur correspondant (`components/composer/InspectorField.vue` ou section dédiée)
- Toujours maintenir la compatibilité descendante du format de manifeste.

---

## 5. Bonnes pratiques techniques

### 5.1 Avant d'implémenter

1. Lire le fichier `docs/implementation-plan.md` et `docs/next-step.md`.
2. Identifier les composants et stores concernés.
3. Si la fonctionnalité est complexe, consulter le skill `brainstorming`.

### 5.2 Pendant l'implémentation

1. Créer des commits atomiques et logiques.
2. Ajouter des tests quand c'est pertinent (cf. skill `tdd`).
3. Vérifier que `pnpm dev` démarre sans erreur.
4. S'assurer que le format de sortie Ograf reste valide.

### 5.3 Après l'implémentation

1. Lancer `pnpm typecheck` et `pnpm lint`.
2. Vérifier visuellement les pages impactées si possible.
3. Mettre à jour `docs/next-step.md` si l'étape courante est terminée.

---

## 6. Workflow de collaboration

1. **Planifier** : décomposer la demande utilisateur en tâches concrètes.
2. **Explorer** : utiliser `semantic_search`, `grep_search` ou l'agent `Explore` pour comprendre le contexte.
3. **Demander des précisions** si la demande est ambiguë ou risquée.
4. **Implémenter** : suivre les conventions ci-dessus.
5. **Valider** : vérifier les erreurs et la cohérence.
6. **Documenter** : mettre à jour la documentation si nécessaire.

---

## 7. Sécurité et qualité

- Ne jamais inclure de secrets, tokens ou credentials dans le code.
- Vérifier que les entrées utilisateur sont validées côté serveur si elles transitent par Nitro.
- Éviter l'utilisation de `v-html` avec du contenu non contrôlé.
- Privilégier les imports explicites et les types stricts.
- Exécuter un scan de secrets (`mcp_github_mcp_se_run_secret_scanning`) sur les diffs sensibles.

---

## 8. Références utiles

- `docs/implementation-plan.md` — Plan d'implémentation
- `docs/next-step.md` — Prochaines étapes
- `lib/ograf/types.ts` — Types du format Ograf
- `components.json` — Configuration shadcn-vue
- `nuxt.config.ts` — Configuration Nuxt
- `package.json` — Dépendances et scripts
