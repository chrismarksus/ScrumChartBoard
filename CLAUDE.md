# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (required after cloning)
npm install

# Dev server with live reload at http://localhost:9000
npm run dev

# Run all tests without a browser (fastest; covers all chart and model specs)
npm test

# Run Puppeteer E2E tests (requires dev server running first)
npm run dev &
npm run test:e2e

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

To load data in the dev server, add query params: `http://localhost:9000?team=abc&project=sample`

## Architecture

The app is a no-database, browser-only SPA that loads three JSON files via fetch and renders Scrum metric charts.

**Data flow:**
1. `main.js` reads `?team=` and `?project=` query params, calls `GetData.setup()` to fetch `dashboard.json`, `project.json`, and `intervals.json` in parallel via `Promise.all`.
2. The merged data is passed to `Model`, which computes all derived metrics (velocity, capacity, satisfaction averages, card estimates, etc.).
3. `Scrum` receives the `Model`, renders the template into `#main`, then instantiates and calls `render()` on each chart class.

**Source layout (`app/scripts/`):**
- `main.js` — entry point, bootstraps the app
- `GetData.js` — fetch calls for the three JSON files
- `Model.js` — all data computation; the single source of truth for derived metrics
- `Scrum.js` — orchestrates template rendering and chart instantiation
- `Helper.js` — date formatting and query-string parsing utilities
- `Colors.js` — chart color palette
- `Templates.js` — HTML template strings (template literals, no external template engine)
- `charts/Charts.js` — base class all chart classes extend
- `charts/*.js` — one file per chart type (Burndown, Line, Lines, Pie, Satisfaction, Status, Timelines, TwoBars, Types)

All source files use ES modules (`import`/`export default`).

**Build pipeline (`vite.config.js`):**
- `npm run dev` — Vite dev server with HMR at http://localhost:9000; serves `test/teams/` at `/teams/` for sample data
- `npm run build` — production build to `dist/`
- Vite root is `app/`; styles are plain CSS (`app/styles/main.css`) with no preprocessor

**Test runner (`test/node-runner.js`):** Sets up a jsdom DOM environment, loads jQuery from npm, stubs `Chart.js` via `require.cache` pre-population (canvas not usable in jsdom), uses `@babel/register` to transform ESM source files to CommonJS, loads all source files via `require()`, then runs Mocha specs via `vm.runInThisContext`. The only spec not covered is `Scrum.js` (requires full app bootstrap).

**Data format:** See `DATA_FORMAT.md` for the full JSON schema. Team data lives in `teams/<teamName>/` (not checked in; not included in `dist/`).

## Code style

ES6 classes with ES modules (`import`/`export default`). Single quotes. Keep new code consistent with existing patterns.
