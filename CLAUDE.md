# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (required after cloning)
npm install && bower install

# Dev server with live reload at http://localhost:9000
npx gulp serve

# Run all tests without a browser (fastest; covers all chart and model specs)
node test/node-runner.js

# Full browser test suite (requires Chrome)
# Terminal 1:
npx gulp serve:test
# Terminal 2 (use port printed by BrowserSync):
npx mocha-headless-chrome -f http://localhost:9000/

# Production build → dist/
npx gulp
```

To load data in the dev server, add query params: `http://localhost:9000?team=abc&project=sample`

## Architecture

The app is a no-database, browser-only SPA that loads three JSON files via Ajax and renders Scrum metric charts.

**Data flow:**
1. `main.js` reads `?team=` and `?project=` query params, calls `GetData.setup()` to fetch `dashboard.json`, `project.json`, and `intervals.json` in parallel via `$.when`.
2. The merged data is passed to `Model`, which computes all derived metrics (velocity, capacity, satisfaction averages, card estimates, etc.).
3. `Scrum` receives the `Model`, renders the Handlebars `main` template into `#main`, then instantiates and calls `render()` on each chart class.

**Source layout (`app/scripts/`):**
- `main.js` — entry point, bootstraps the app
- `GetData.js` — Ajax fetches for the three JSON files
- `Model.js` — all data computation; the single source of truth for derived metrics
- `Scrum.js` — orchestrates template rendering and chart instantiation
- `Helper.js` — date formatting and query-string parsing utilities
- `Colors.js` — chart color palette
- `charts/Charts.js` — base class all chart classes extend
- `charts/*.js` — one file per chart type (Burndown, Line, Lines, Pie, Satisfaction, Status, Timelines, TwoBars, Types)

**Templates (`app/templates/`):** Handlebars `.hbs` files compiled by Gulp into `App.templates.*` globals. Partials are registered in `Scrum`'s constructor.

**Build pipeline (`gulpfile.babel.js`):**
- `serve` — compiles scripts (Babel), LESS, and Handlebars templates into `.tmp/`, wires Bower deps, starts BrowserSync
- `serve:test` — same compile step but serves `test/` with `.tmp/` routes; used by the browser test suite
- `default` — full minified production build to `dist/`

**Test runner (`test/node-runner.js`):** Sets up a jsdom DOM environment, loads jQuery from bower, stubs `Flotr` (canvas library), loads all source files via `vm.runInThisContext`, then runs Mocha specs. The only spec not covered is `Scrum.js` (requires Handlebars partials and full app bootstrap — run via the browser suite instead).

**Data format:** See `DATA_FORMAT.md` for the full JSON schema. Team data lives in `teams/<teamName>/` (not checked in; not included in `dist/`).

## Code style

ES6 classes. Single quotes. No module system — all classes are globals loaded in dependency order by the HTML. Keep new code consistent with existing patterns.
