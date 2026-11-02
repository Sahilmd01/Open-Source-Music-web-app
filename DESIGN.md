# Music App — Design System

A warm, modern music-streaming UI built around **burnt orange** and **lemon yellow**, set in **Poppins**. This document is the source of truth for `index.css`.

> **Note on the reference swatches:** the template labels all four swatches `#040415`, which looks like a copy-paste error. Values below were sampled from the visible colors.

---

## 1. Principles

1. **Warm and editorial.** Orange hero surfaces, soft taupe backgrounds, generous rounding.
2. **Yellow means "active".** The accent is reserved for the current state: active nav, play button, played waveform, selected chips.
3. **Soft surfaces, big radii.** Cards 24px, buttons and inputs fully pill-shaped, avatars circular.
4. **Content first.** Album art and artist photos carry the color; UI chrome stays neutral.
5. **Accessible by default.** Visible focus rings, reduced-motion support, AA contrast on text.

---

## 2. Typography

**Font family:** Poppins (Google Fonts), weights 300–700. Fallback: `system-ui, sans-serif`.

| Token | Size | Weight | Use |
|---|---|---|---|
| `.display` | 48px | 700 | Hero titles (BLINDING LIGHT) |
| `h1` | 36px | 700 | Page titles |
| `h2` | 28px | 600 | Section titles |
| `h3` | 22px | 500 | "Popular artists", "Recently played", sidebar headings |
| `h4` | 18px | 500 | Card titles |
| body | 16px | 400 | Default text, nav items, track titles |
| small | 14px | 400 | Artist names, metadata, buttons |
| caption | 12px | 400–600 | Durations, labels, eyebrow (uppercase, +0.08em) |

Use `font-variant-numeric: tabular-nums` (`.tabular`) for durations and counters.

---

## 3. Color

### 3.1 Brand palette

| Name | Hex | Role |
|---|---|---|
| Orange 500 | `#be5c2b` | Primary brand, hero card, primary buttons |
| Yellow 500 | `#fbff7a` | Accent: active nav, play button, waveform progress |
| Ink 800 | `#1f1f1f` | Primary text (light), text on yellow |
| Ink 100 | `#f2f2f2` | Light surface, text on dark |
| Ink 500 | `#5a5555` | Sidebar and player bar grey |

Full scales (`--orange-100…800`, `--yellow-300…700`, `--ink-50…900`) are defined in `index.css`.

### 3.2 Semantic tokens — Light vs Dark

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#ffffff` | `#1b1918` |
| `--bg-surface` | `#ffffff` | `#1f1d1b` |
| `--bg-surface-2` (panels, inputs) | `#f2f2f2` | `#2a2724` |
| `--bg-surface-3` | `#e8e6e4` | `#353230` |
| `--bg-sidebar` | `#5a5555` | `#26231f` |
| `--bg-player` | `rgba(90,85,85,.92)` | `rgba(42,39,36,.94)` |
| `--text-primary` | `#1f1f1f` | `#f2f2f2` |
| `--text-secondary` | `#5f5a56` | `#bdb7b2` |
| `--text-muted` | `#8a847f` | `#8f8984` |
| `--border-default` | `#dcd8d4` | `#3a3633` |
| `--brand` | `#be5c2b` | `#d0693a` |
| `--accent` | `#fbff7a` | `#fbff7a` |
| `--border-focus` | `#be5c2b` | `#fbff7a` |

### 3.3 Status colors

| State | Light | Dark | Soft bg (light / dark) | Usage |
|---|---|---|---|---|
| **Success** | `#2e9e6b` | `#4cc38a` | `#e3f5ec` / 14% green | Saved, added to library, upload complete |
| **Error** | `#d64545` | `#ff6b6b` | `#fbe9e9` / 14% red | Failed playback, invalid input, delete |
| **Warning** | `#e8a317` | `#f5b83d` | `#fdf3dc` / 14% amber | Low connectivity, expiring plan |
| **Info** | `#3b82f6` | `#6ea8fe` | `#e5eefe` / 14% blue | Tips, new release notices |

Each status has `--x`, `--x-hover`, `--x-soft`, `--x-border`, `--x-text` tokens.

---

## 4. Theming

```html
<html data-theme="light">  <!-- force light -->
<html data-theme="dark">   <!-- force dark -->
<html>                     <!-- auto: follows OS preference -->
```

Toggle in JS:

```js
const root = document.documentElement;
const toggle = () =>
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
// persist
localStorage.setItem("theme", root.dataset.theme);
// restore on load
const saved = localStorage.getItem("theme");
if (saved) root.dataset.theme = saved;
```

Notes:
- The **sidebar and bottom player stay dark in both themes** (matches the reference).
- The **hero card** keeps its orange gradient in both themes; in dark it is slightly deeper.
- In dark mode, focus rings and active chips switch to yellow for contrast.

---

## 5. Spacing, Radius, Elevation

**Spacing scale (4px base):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 → `--space-1…16`

**Radius**

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 6px | Code, tooltips |
| `--radius-sm` | 10px | Track covers, dropdown items |
| `--radius-md` | 16px | Alerts, dropdowns |
| `--radius-lg` | 24px | Cards, hero, now-playing, player |
| `--radius-xl` | 32px | App window frame |
| `--radius-pill` | 999px | Buttons, inputs, chips, nav items |

**Shadows:** `--shadow-sm` (rows) · `--shadow-md` (hover cards) · `--shadow-lg` (modals, player) · `--shadow-brand` (orange glow under the hero).

---

## 6. Layout

```
┌───────────┬──────────────────────────────┬─────────────┐
│  Sidebar  │  Topbar (breadcrumb · tabs)  │             │
│  260px    ├──────────────────────────────┤ Now Playing │
│           │  Hero · Artists · Recent     │   340px     │
└───────────┴──────────────────────────────┴─────────────┘
              ╰──── floating Player bar (76px) ────╯
```

| Breakpoint | Behavior |
|---|---|
| ≥ 1100px | Full 3-column layout |
| < 1100px | Now Playing panel hidden |
| < 760px | Sidebar hidden, single column, compact player |

---

## 7. Components

### 7.1 Buttons

| Class | Look | When to use |
|---|---|---|
| `.btn--primary` | Orange fill, white text | Main action (Subscribe, Play playlist) |
| `.btn--accent` | Yellow fill, dark text | Highlight CTA on dark surfaces |
| `.btn--secondary` | Outline | Secondary action |
| `.btn--ghost` | Transparent | Tertiary / toolbar |
| `.btn--link` | Text only | Inline actions |
| `.btn--success` | Green fill | Confirm / save success |
| `.btn--danger` / `.btn--error` | Red fill | Destructive (Delete playlist) |
| `.btn--warning` | Amber fill | Cautionary action |
| `.btn--danger-outline`, `.btn--success-outline` | Outlined status | Low-emphasis status actions |

**Sizes:** `.btn--sm` (34px) · default (44px) · `.btn--lg` (52px) · `.btn--block` (full width)
**Special:** `.btn-icon`, `.btn-play` (yellow circle), `.btn-like` (`.is-liked` turns it white/red)
**States:** hover (darker fill) · active (scale .97) · focus (ring) · disabled (45% opacity) · loading (`.is-loading` spinner)

```html
<button class="btn btn--primary">Play all</button>
<button class="btn btn--danger btn--sm">Delete</button>
<button class="btn btn--accent is-loading">Saving</button>
<button class="btn-play" aria-label="Pause">⏸</button>
```

### 7.2 Form controls

- `.input`, `.select`, `.textarea`: pill inputs on `--bg-surface-2`, orange focus ring (yellow in dark).
- Validation: wrap in `.field.is-success` or `.field.is-error`, or use `.input--success` / `.input--error`, with a `.hint` message.
- `.check` (checkbox/radio), `.switch` (toggle), `.range` (seek/volume), `.search` (icon input).

```html
<div class="field is-error">
  <label class="label" for="email">Email</label>
  <input id="email" class="input" type="email" />
  <span class="hint">Enter a valid email address.</span>
</div>
```

### 7.3 Navigation

- `.nav-item` sidebar link; `.is-active` gets a dark pill with **yellow text** (the "Browse" state).
- `.tabs` / `.tab` for New Releases · New Feed · Shuffle Play.
- `.breadcrumb`, `.segmented`, `.chip` (`.is-active` for selected filter).

### 7.4 Cards and media

- `.card`, `.card--muted`, `.card--interactive` (lifts on hover)
- `.hero`: curated playlist banner with orange gradient and glow
- `.now-playing`: grey rounded panel with square cover
- `.artist`: 120px circular photo with name below
- `.avatar` (`--sm`, `--lg`)

### 7.5 Track list

`.track` is a 5-column grid: cover · title/artist · album/artist · duration · action. `.is-playing` tints the row yellow and colors the title orange.

### 7.6 Feedback

| Component | Classes | Notes |
|---|---|---|
| Alert | `.alert--success / --error / --warning / --info` | Left accent border, soft background, icon + title + body |
| Toast | `.toast--success / --error / --warning / --info` | Top-right region, slides in, auto-dismiss ~4s |
| Badge | `.badge--success / --error / --warning / --info / --brand / --accent` | Small status pills |
| Inline message | `.msg--success`, `.msg--error` | Next to inputs |
| Progress | `.progress--brand / --success / --error` | Set `style="--value:60%"` |
| Loaders | `.spinner`, `.skeleton` | Use skeletons for lists and covers |

```html
<div class="alert alert--success" role="status">
  <div>
    <div class="alert__title">Added to Favorites</div>
    <p class="alert__body">"Snowfall" is now in your library.</p>
  </div>
</div>

<div class="alert alert--error" role="alert">
  <div>
    <div class="alert__title">Playback failed</div>
    <p class="alert__body">Check your connection and try again.</p>
  </div>
</div>
```

### 7.7 Player bar and waveform

- `.player`: floating dark pill-card, bottom center, with blur.
- `.wave` containing `<i style="--h:60%">` bars; add `.is-played` for yellow progress, unplayed bars are translucent white.
- Controls: `.btn-icon` (prev/next/shuffle/queue/volume) + `.btn-play`.

### 7.8 Overlays

`.modal-backdrop` + `.modal` · `.dropdown` + `.dropdown__item` (`--danger`) · `[data-tooltip="Text"]`

---

## 8. Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120ms | Press, color changes |
| `--dur-base` | 200ms | Hover, focus |
| `--dur-slow` | 320ms | Theme switch, modals, toasts |
| `--ease` | `cubic-bezier(.2,.8,.2,1)` | All transitions |

`prefers-reduced-motion: reduce` disables animations and transitions.

---

## 9. Accessibility checklist

- Text contrast ≥ 4.5:1: `--text-primary` on `--bg-page` passes in both themes; white on `--brand` (#be5c2b) is ~4.6:1.
- Yellow is **never** used as text on white. Use it on dark surfaces or as a fill with dark text.
- Never rely on color alone for status: pair with an icon and label.
- All interactive elements show `:focus-visible` ring.
- Use `role="alert"` for errors, `role="status"` for success/info; icon buttons need `aria-label`.
- Minimum touch target 40–44px.

---

## 10. Quick start

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="index.css" />
</head>
<body>
  <div class="app">
    <div class="window">
      <aside class="sidebar">…</aside>
      <main class="main">…</main>
    </div>
  </div>
  <div class="player">…</div>
</body>
</html>
```
