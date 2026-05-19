# Landing Page

## Overview

The landing page (`index.html`) is the public-facing marketing page for ScrumChartBoard. It is a standalone HTML page — not part of the app's tab bar — built as a separate Vite entry point alongside `dashboard.html`.

The app redirects here automatically when `?team=` or `?project=` query params are absent (see `main.js`). Users can also reach it directly via URL or by clicking the brand mark inside the app.

---

## Navigation

Not accessed via a tab. Entry points:

- Direct URL: `/` (or `/index.html`)
- Auto-redirect from `dashboard.html` when team/project params are missing
- Brand mark link (`<a class="brand">`) inside the main app header

The page contains internal anchor links for single-page scroll navigation:
- `#features` → Charts section
- `#palettes` → Palette parade section
- `#pricing` → Pricing section

---

## Layout

The page is a full-width, vertically stacked marketing layout using a centered `.shell` container. Sections in order:

### 1. Topbar (`.topbar`)

A sticky/fixed header with three zones:

- **Brand mark** — four-square icon + "Scrum*ChartBoard*" wordmark; links to `index.html` (`/`)
- **Top nav** — anchor links: Charts, Palettes, Pricing, Docs (Docs is a stub `#`)
- **Top actions** — "Start free" CTA button linking to `./?team=abc&project=sample`; inline theme switcher (palette chips + light/dark toggle)

The theme switcher in the topbar:
- Palette chips rendered into `#ls-palette-chips` by `ThemeSwitcher`
- Mode toggle: two `<span class="ls-mode-span">` elements for LIGHT and DARK
- `ThemeSwitcher` is initialized with `{ reload: false }` so switching theme/palette on the landing page does not trigger a page reload

### 2. Hero (`.hero`)

Two-column grid layout:

**Left column:**
- Kicker: `v{VERSION} · The sprint dashboard, re-themed`
- `<h1>` with styled strikethrough on "noise": _"See the sprint, not the ~~noise~~."_
- Lede paragraph (product description)
- CTA row: primary "Start a free project" button + secondary "See sample dashboard" link (both link to `./?team=abc&project=sample`)
- Proof bar: MIT badge, SELF-HOST OR CLOUD, NO CREDIT CARD — text badges below CTAs

**Right column (`.hero-visual`):**
- A `.mini-dash` mock-up — an inline, non-interactive preview of the dashboard UI showing:
  - Mini header with project name, date, author
  - Three sprint tabs (one marked active)
  - Four mini chart cards: Burnup (inline SVG), Velocity stat, Status bar (inline SVG), with legend

### 3. "Doh!" Strip (`.doh-strip`)

A two-column problem-statement card:

- **Left:** Headline referencing the "Doh - There is no data available!" empty state, body copy about importing from Jira/Linear/CSV, link to the sample import flow
- **Right:** A ghost-lines visual showing a broken empty-state dashboard with `ERR · MISSING JSON` monospace label

### 4. Charts Section (`.charts-section`, `id="features"`)

Section eyebrow: `07 charts · 1 dashboard`

A CSS grid (`.feature-grid`) with seven feature tiles. Each tile has a `.feature-head` (title + tag), body copy, and an inline SVG visualization. Tiles use span classes to control width within the 6-column grid:

| # | Tag | Title | Span | Visual |
|---|-----|-------|------|--------|
| 01 | CHART | Burnups that don't lie | span-3 | Line chart SVG (scope vs. completed) |
| 02 | CHART | Status, at a glance | span-3 | Donut chart SVG (4 statuses) |
| 03 | METRIC | _(velocity stat)_ | span-2 | Big-stat `15/8` VELOCITY |
| 04 | CHART | Commit vs. complete | span-4 | Bar chart SVG (paired bars per sprint) |
| 05 | CHART | Timeline themes | span-4 | Gantt-style bar chart SVG |
| 06 | METRIC | _(capacity stat)_ | span-2 | Big-stat `50d` CAPACITY |
| 07 | CHART | Satisfaction tracking | span-6 | Scatter chart SVG (full width) |

All SVG chart illustrations use CSS custom properties (`var(--c-done)`, `var(--c-inprogress)`, etc.) so they visually update when the palette or mode changes.

### 5. Palette Parade (`.palette-section`, `id="palettes"`)

Section eyebrow: `Four palettes · one switcher`

A row of four `.palette-card` elements, each with:
- `data-palette` attribute matching the palette key
- Subtitle tag (color description: "Orange + Blue", etc.)
- Palette name (`<h3>`)
- Six `.palette-sw` swatch divs (hardcoded hex colors for visual preview)
- Description paragraph

Palettes:

| Key | Name | Tag |
|-----|------|-----|
| `warm` | Warm | Orange + Blue |
| `electric` | Electric | Pink + Indigo |
| `forest` | Forest | Clay + Olive |
| `mono` | Mono | Neutrals only |

Clicking a card activates that palette (handled by `ThemeSwitcher`). The active card receives an outline state.

### 6. Pricing Section (`.pricing-section`, `id="pricing"`)

Section eyebrow: `Pricing`
Headline: _"Pay per team. Not per chart."_

Three `.price-card` elements in a row; the center card has `.is-featured`:

| Tier | Price | Key features | CTA |
|------|-------|--------------|-----|
| Open | $0/forever | Self-host, MIT, all 7 charts, CSV import, community support | "Clone the repo" (stub `#`) |
| Team _(featured)_ | $##/seat/mo | Hosted cloud, SSO, Jira & Linear sync, multi-project, shareable links, priority support | "Start free trial" (stub `#`) |
| Studio | Talk to us | On-prem, custom branding, audit logs, SAML, SLA + CSM | "Book a call" (stub `#`) |

Note: Team tier price (`$##`) and all CTA links in the pricing section are placeholder stubs.

### 7. Final CTA (`.final-cta`)

- Headline: _"Your next sprint, charted."_
- Subtext: "Forty seconds to import. Four palettes to choose. Zero 'Doh!' empty states."
- Two CTAs: primary "Start a free project" (`./?team=abc&project=sample`) + secondary "View on GitHub"

### 8. Footer (`.footer`)

- Left: `© 2026 ScrumChartBoard · MIT`
- Right: links for Docs, Changelog, GitHub, Twitter (Docs/Changelog/Twitter are stub `#`)

---

## Behavior

### Theme persistence

An inline `<script>` at the top of `<body>` reads `localStorage` key `scrum_theme_0001` and applies `theme-{light|dark}` and `palette-{forest|warm|electric|mono}` classes to `<body>` before the module loads. Default is `theme-light palette-forest`.

This prevents flash of unstyled content on load — the correct theme is applied synchronously before first paint.

### ThemeSwitcher integration

`landing.js` imports `ThemeSwitcher` and initializes it with `{ reload: false }`. On the landing page:
- Switching mode (light/dark) updates classes on `<body>` and saves to `localStorage` without a page reload
- Switching palette updates classes on `<body>` and saves to `localStorage` without a page reload
- All SVG chart illustrations and CSS-variable-driven styles update immediately

### Chart illustrations

All inline SVGs use CSS custom properties for stroke and fill colors. When the palette or mode class changes on `<body>`, the SVGs re-render automatically with no JavaScript re-draw needed.

### Version injection

The hero kicker contains `%APP_VERSION%`. A Vite plugin (`versionInjectPlugin` in `vite.config.js`) replaces this with the value from `package.json` at build time.

### Responsive layout

Two CSS breakpoints in `landing.css`:
- `960px` — grid columns collapse; hero goes single-column; feature grid re-spans
- `640px` — compact mobile layout; pricing cards stack; topbar collapses to minimal form

---

## Out of Scope for MVP

- Docs, Changelog, and Twitter links are stubs — content not yet defined
- Team tier pricing (`$##`) is a placeholder — not yet set
- Pricing CTA links are stubs — no checkout/trial flow implemented
- "Clone the repo" link on Open tier points to `#`
- No contact/waitlist form
- No analytics or tracking
- No server-side rendering or SEO meta tags beyond the `<title>`
