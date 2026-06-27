---
version: alpha
name: GrafStudio — DaVinci Resolve
description: Dark, dense, professional broadcast graphics editor. Pixel-perfect homage to DaVinci Resolve 19, tuned for lower-third authoring and OGraf v1 control.
colors:
  bg-canvas: "#0e0e0e"
  bg-panel: "#1c1c1c"
  bg-panel-2: "#232323"
  bg-header: "#161616"
  bg-input: "#0a0a0a"
  border-panel: "#2a2a2a"
  border-subtle: "#1f1f1f"
  text-primary: "#e8e8e8"
  text-secondary: "#a8a8a8"
  text-muted: "#6e6e6e"
  on-accent: "#ffffff"
  primary: "#f97316"
  accent-orange: "#f97316"
  accent-red: "#ff3b3b"
  accent-record: "#e53935"
  accent-blue: "#3b82f6"
  selection-bg: "#2d3540"
typography:
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    letterSpacing: 0.04em
  body:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  numeric:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 400
    fontFeature: '"tnum" 1'
  xxs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: 400
  heading:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 6px
  full: 9999px
spacing:
  0: 0px
  1: 2px
  2: 4px
  3: 8px
  4: 12px
  5: 16px
  6: 24px
  7: 32px
  8: 48px
components:
  panel-header:
    backgroundColor: "{colors.bg-panel}"
    height: 28px
    padding: "8px"
    rounded: "{rounded.none}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-caps}"
  list-item:
    backgroundColor: "{colors.bg-canvas}"
    height: 24px
    padding: "8px"
    rounded: "{rounded.none}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
  list-item-hover:
    backgroundColor: "{colors.bg-panel-2}"
  list-item-active:
    backgroundColor: "{colors.selection-bg}"
  section-header:
    backgroundColor: "{colors.bg-canvas}"
    height: 24px
    padding: "8px"
    rounded: "{rounded.none}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "8px"
    height: 28px
  button-primary-hover:
    backgroundColor: "#ea580c"
  button-outline:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px"
    height: 28px
  button-destructive:
    backgroundColor: "{colors.accent-red}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: 28px
    padding: "8px"
    typography: "{typography.numeric}"
  input-focus:
    backgroundColor: "{colors.bg-input}"
  module-nav-item:
    textColor: "{colors.text-muted}"
    typography: "{typography.label-caps}"
  module-nav-item-active:
    textColor: "{colors.primary}"
  modified-dot:
    backgroundColor: "{colors.accent-red}"
    width: 6px
    height: 6px
    rounded: "{rounded.full}"
  record-indicator:
    backgroundColor: "{colors.accent-record}"
    width: 8px
    height: 8px
    rounded: "{rounded.full}"
  topbar:
    backgroundColor: "{colors.bg-header}"
    height: 36px
  modulenav:
    backgroundColor: "{colors.bg-header}"
    height: 52px
  shell:
    backgroundColor: "{colors.bg-canvas}"
    textColor: "{colors.text-primary}"
  iframe:
    backgroundColor: "{colors.bg-input}"
---

## Overview

GrafStudio adopts the visual language of **DaVinci Resolve 19**: a near-black canvas, two shades of dark grey for panels, a single warm-orange accent for active states, and a single cool-blue accent for selection. The product is a professional broadcast graphics editor for OGraf v1 lower thirds, so the interface values information density, scannable hierarchy, and minimal chrome over decorative flourish.

Dark mode is the only mode — there is no light theme. The product runs in live-control environments (gallery walls, MCR desks) where contrast against surrounding equipment matters more than aesthetic range.

The token system below is the single source of truth. shadcn-vue aliases (`--background`, `--card`, `--primary`, …) are kept for compatibility but are re-aliased onto this palette in `app/assets/css/tailwind.css`. Agents generating new components must consume these tokens rather than introduce new raw colors.

## Colors

The palette has three layers: **surfaces** (5 dark greys for hierarchy), **text** (3 lightness steps), and **accents** (3 semantic hues).

### Surfaces

Surfaces stack from darkest to lightest. Each step up should increase visual prominence by ~5–7 % luminance.

| Token             | Hex       | Use                                                  |
| ----------------- | --------- | ---------------------------------------------------- |
| `bg-canvas`       | `#0e0e0e` | App background, timeline, viewports                  |
| `bg-input`        | `#0a0a0a` | Form fields, nested wells                            |
| `bg-header`       | `#161616` | TopBar, ModuleNav                                    |
| `bg-panel`        | `#1c1c1c` | Media Pool, Inspector, all panel containers          |
| `bg-panel-2`      | `#232323` | Hover, raised sections, secondary panels             |
| `selection-bg`    | `#2d3540` | Selected list row, focus wash                        |

### Borders

| Token           | Hex       | Use                                  |
| --------------- | --------- | ------------------------------------ |
| `border-subtle` | `#1f1f1f` | Inner dividers, list separators      |
| `border-panel`  | `#2a2a2a` | Panel outlines, input borders        |

### Text

| Token           | Hex       | Use                                |
| --------------- | --------- | ---------------------------------- |
| `text-primary`  | `#e8e8e8` | Body, values, headings             |
| `text-secondary`| `#a8a8a8` | Panel headers, captions, metadata  |
| `text-muted`    | `#6e6e6e` | Disabled modules, placeholder text |

### Accents

Each accent has a single role. Do not reuse one accent for another's semantic.

| Token           | Hex       | Role                                                      |
| --------------- | --------- | --------------------------------------------------------- |
| `accent-orange` | `#f97316` | **Active module** in ModuleNav, primary CTA              |
| `accent-blue`   | `#3b82f6` | **Selection border** (left rail), focus ring, info accent |
| `accent-red`    | `#ff3b3b` | **Modified-parameter dot** in Inspector                   |
| `accent-record` | `#e53935` | Live-record indicator (Controller ON AIR)                 |

### Charts

Chart colors live in the shadcn-vue theme (`--chart-1` through `--chart-5`) but are intentionally not part of this design contract. They are reserved for future data-visualization surfaces (timelines, telemetry) and should be introduced into DESIGN.md only when first consumed.

### Contrast notes

`on-accent` (`#ffffff`) on `primary` (`#f97316`) measures **2.80:1**, and on `accent-red` (`#ff3b3b`) **3.53:1**. Both fall below the WCAG AA threshold of 4.5:1 for body text. The product runs in dimmed control rooms where the DaVinci Resolve visual reference is part of the brand promise, so this is an accepted tradeoff. The pairing is restricted to short labels (button captions, badges); long-form text must never appear on these surfaces.

## Typography

A single family — **Inter** — covers the entire UI. The visual variety comes from **size and weight**, not from multiple families.

```css
font-family: "Inter", system-ui, sans-serif;
font-feature-settings: "tnum" 1; /* tabular figures for numeric values */
```

### Scale

| Token        | Size  | Weight | Tracking   | Use                                              |
| ------------ | ----- | ------ | ---------- | ------------------------------------------------ |
| `xxs`        | 10 px | 400    | normal     | Tight metadata, secondary axis labels            |
| `numeric`    | 11 px | 400    | tabular    | All numeric values (X, Y, W, H, opacity, time)  |
| `label-caps` | 11 px | 600    | 0.04 em    | Panel headers, ModuleNav items                   |
| `body`       | 12 px | 400    | normal     | List items, inputs, buttons                      |
| `heading`    | 14 px | 600    | normal     | Inspector tab labels, dialog titles              |

- **Uppercase + tracking-wide** is reserved for `label-caps`. Never apply it to `body`.
- **Tabular figures** (`tnum`) are mandatory on every numeric value to keep keyframe timelines aligned.

## Layout

The shell is a 3-zone grid anchored by a top bar and a bottom module nav. Every measurement is a multiple of 2 px or 4 px.

```
┌─ TopBar ────────────────────────────────────────────────────────┐  36 px
│  [Media Pool] [Effects] [Index] [Sound Library] | [Quick Exp]   │
├──────────┬────────────────────────────────┬────────────────────┤
│ 260 px   │  flex-1                       │  300 px            │
│ LeftSlot │  CenterSlot                   │  RightSlot         │
│          │  - Viewer (CanvasPreview)     │  Inspector         │
│          │  - Timeline                   │                    │
├──────────┴────────────────────────────────┴────────────────────┤
│  ModuleNav  [Media] [Cut] [Edit●] [Fusion] [Color] [Fairlight●] [Deliver]  52 px
```

### Spacing scale

The spacing scale uses 2 px and 4 px increments to preserve density. Tailwind's default scale is overridden in the project config.

| Step | Value | Use                                          |
| ---- | ----- | -------------------------------------------- |
| `0`  | 0 px  | Reset                                        |
| `1`  | 2 px  | Stack-tight (dot, badge, icon gap)           |
| `2`  | 4 px  | Inner element padding                        |
| `3`  | 8 px  | Default list/panel padding                   |
| `4`  | 12 px | Section gutters                              |
| `5`  | 16 px | Panel-to-panel separation                    |
| `6`  | 24 px | Major section breaks                         |
| `7`  | 32 px | Dialog padding                               |
| `8`  | 48 px | Reserved (large empty states)                |

### Sizing conventions

| Region            | Height | Notes                                          |
| ----------------- | ------ | ---------------------------------------------- |
| `topbar`          | 36 px  | Fixed; never collapses                         |
| `modulenav`       | 52 px  | Fixed at the bottom                            |
| Panel header      | 28 px  | All panels (Media Pool, Inspector, Library)   |
| List row          | 24 px  | All list items                                 |
| Section header    | 24 px  | Inspector collapsible sections                 |
| Button            | 28 px  | All shadcn-vue `Button` overrides              |
| Input             | 28 px  | All `Input` / `Textarea` / `Select`            |
| Timeline ruler    | 20 px  | Timecode strip                                 |

## Elevation & Depth

The design is intentionally **flat**. Depth is communicated through tone, not shadow.

- **No drop shadows** on any UI element. Panels, dialogs, and popovers use a 1 px border (`border-panel` or `border-subtle`) to define their edges.
- **Hover** is a 1-step surface lift: `bg-panel` → `bg-panel-2`. There is no opacity or blur effect.
- **Focus** is a 1 px `accent-blue` ring at 40 % opacity (`ring-accent-blue/40`). Never use a coloured fill to indicate focus.
- **Selection** is `selection-bg` (`#2d3540`) with a 2 px left border in `accent-blue` — the only place blue is used as a fill.

Z-ordering follows DOM order. No `z-index` ladders beyond the standard 0/10/20/50 (modal) used by shadcn-vue.

### Borders

The DESIGN.md spec does not declare `borderColor` as a component sub-token, but borders are first-class in the Resolve aesthetic. Apply them via Tailwind utilities backed by CSS variables in `app/assets/css/tailwind.css`:

- `border-border-subtle` (`#1f1f1f`) — inner dividers, list separators.
- `border-border-panel` (`#2a2a2a`) — panel outlines, input borders.
- `border-l-2 border-l-accent-blue` — selected list row (paired with `selection-bg` fill).

Border thickness is always 1 px, except the 2 px left rail on the active list item.

## Shapes

Every container is **near-square** (`rounded-sm`, 2 px). Larger radii (`rounded-md`, `rounded-lg`) are reserved for special cases only.

| Token      | Value | Use                                                     |
| ---------- | ----- | ------------------------------------------------------- |
| `none`     | 0 px  | Panel headers, list rows, ModuleNav items              |
| `sm`       | 2 px  | Buttons, inputs, cards, popovers, dialogs (default)    |
| `md`       | 4 px  | Modals, large dialogs only                             |
| `lg`       | 6 px  | **Not used.** Reserved for future chart tooltips        |
| `full`     | 9999px | Round dots only (record indicator, modified-param dot) |

**Anti-pattern**: never apply `rounded-xl` or larger — it breaks the Resolve visual reference.

## Components

The component tokens above (`button-primary`, `panel-header`, `list-item`, `input`, `topbar`, `modulenav`, `shell`, `iframe`) are normative. Every reusable surface in the app maps to one of them.

### Module nav

- **Active item**: 2 px top border in `primary` (aliased to `accent-orange`, `#f97316`), label in `primary`, font `label-caps`.
- **Inactive item**: `text-muted`, no border, no hover effect.
- **Disabled item**: 60 % opacity, `pointer-events: none`, label stays `text-muted`. The 5 reserved modules (Media, Cut, Fusion, Color, Deliver) use this state in v1.

### Inspector field

- Two-column layout: `label` (left, `body`) — `value` (right, `numeric`).
- A 6 px round `accent-red` dot appears to the left of the section title when any field in that section has been modified from its default.
- Sections are collapsible; collapsed state keeps the header at 24 px.

### Buttons (shadcn-vue override)

- All `Button` instances are forced to `h-7 px-2 text-[11px] rounded-[2px]`.
- The `outline` variant is re-skinned to `bg-input` with `border-panel`.
- The default `Button` (primary) uses `accent-orange`.

### Inputs (shadcn-vue override)

- All `Input` / `Textarea` / `SelectTrigger` instances are forced to `h-7 bg-input border-border-panel rounded-[2px]`.
- Focus ring is `ring-accent-blue/40`.
- Numeric inputs default to right-aligned text and tabular figures.

### Iframe player

- Background: `bg-input` (deeper than the panel, to frame the video).
- 1 px border in `border-panel`.
- Used for `CanvasPreview` (Composer) and `PlayerFrame` (Controller).

## Do's and Don'ts

### Do

- Consume the tokens in this file. Reference `{colors.accent-blue}` or the CSS variable (`var(--accent-blue)`); never hardcode hex literals in new code.
- Use the `numeric` typography token for any value that the user can read as a number (position, size, opacity, time, keyframe values).
- Use `label-caps` + uppercase tracking for any header inside a panel, and nowhere else.
- Use a 6 px round `accent-red` dot to mark modified parameters in the Inspector.
- Use `selection-bg` + 2 px left blue border for the single selected row in any list.
- Anchor the active module in `accent-orange`. That color is reserved for this role and for primary CTAs.

### Don't

- Don't introduce new colors. The palette is closed; if a need arises, add a token here first.
- Don't use drop shadows, blurs, or gradients anywhere in chrome.
- Don't apply `rounded-xl` or larger. The product is intentionally angular.
- Don't use light text (`text-primary` or lighter) on `accent-orange` only for short CTAs — never for body copy, where `on-accent` (#ffffff) is the pairing.
- Don't reuse `accent-orange` for selection. Selection is always `accent-blue`. Orange and blue have non-overlapping roles.
- Don't use `font-bold` or weights above 600. The product's hierarchy is expressed through size and color, not weight.
- Don't add a light theme. Dark mode is the only mode in v1.
- Don't change the module nav height (52 px) or top bar height (36 px). They are fixed anchors of the Resolve reference layout.
