# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (required after cloning)
npm install

# Install server dependencies (required once)
cd server && npm install && cd ..

# Run the REST API server (port 3001 by default)
cd server && npm start

# Run server in dev mode (auto-restarts on file changes)
cd server && npm run dev

# Dev server with live reload at http://localhost:9000
npm run dev

# Dev server exposed on the local network (for phone/tablet access)
npm run dev:host

# Lint all source files
npm run lint

# Run all tests without a browser (fastest; covers all chart and model specs)
npm test

# Run Puppeteer E2E tests (requires dev server running first)
npm run dev &
npm run test:e2e

# Run visual regression tests (requires dev server running first)
npm run dev &
npm run test:visual

# Update visual baselines after intentional UI changes
npm run dev &
npm run test:visual:update   # overwrites screenshots/baseline/*.png — commit the results

# Take a screenshot (opens Chrome with DevTools; optional URL argument)
npm run screenshot
npm run screenshot -- "http://localhost:9000?team=abc&project=sample"

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

To load data in the dev server, add query params: `http://localhost:9000?team=abc&project=sample`

## Architecture

The app is a SPA that renders Scrum metric charts from JSON files. Board data persists to `localStorage` and optionally syncs with a Node/Express REST backend (`server/`); the server stores data as JSON files — no SQL database.

**Data flow — charts:**
1. `main.js` reads `?team=` and `?project=` query params, calls `GetData.setup()` to fetch `dashboard.json`, `project.json`, and `intervals.json` in parallel via `Promise.all`.
2. The merged data is passed to `Model`, which computes all derived metrics (velocity, capacity, satisfaction averages, card estimates, etc.).
3. `Scrum` receives the `Model`, renders the template into `#main`, then instantiates and calls `render()` on each chart class.

**Data flow — board:**
1. `Store.js` reads board state from `localStorage` on init; if `Store.apiBase` is set it also calls `sync()` to pull the latest state from the REST server.
2. Every card/interval/timeline mutation writes to `localStorage` and, if `Store.apiBase` is set, POSTs to `POST /board?team=X&project=Y`.

**Source layout (`app/scripts/`):**
- `main.js` — entry point, bootstraps the app
- `GetData.js` — fetch calls for the three JSON files
- `Model.js` — all data computation; the single source of truth for derived metrics
- `Scrum.js` — orchestrates template rendering and chart instantiation
- `Helper.js` — date formatting and query-string parsing utilities
- `Colors.js` — chart color palette; reads semantic colors from CSS custom properties (`--c-done`, `--c-todo`, etc.) so charts update when the palette changes
- `ThemeSwitcher.js` — fixed pill widget (top-right) for light/dark toggle and palette selection; persists preference to `localStorage` under key `scrum_theme_0001`
- `Templates.js` — HTML template strings (template literals, no external template engine)
- `Store.js` — localStorage persistence for board data (`scrum_board_{team}_{project}`); manages cards, intervals, and timelines; set `Store.apiBase` to sync with the REST server (`sync()` on init, POST on every change)
- `Board.js` — Kanban board (Backlog / To Do / In Progress / Done) with SortableJS drag-and-drop, inline card creation, blocked tagging, and delete
- `IntervalPlanner.js` — drag-and-drop interval planner; left panel shows unassigned backlog cards, right panel shows one lane per interval with point totals and active-interval marking
- `TimelineEditor.js` — Gantt-style timeline editor; rows are themes/epics, columns are intervals, range set via start/end selectors, status badge cycles todo → inprogress → done
- `charts/Charts.js` — base class all chart classes extend
- `charts/*.js` — one file per chart type (Burndown, Line, Lines, Pie, Satisfaction, Status, Timelines, TwoBars, Types)

**Theme system:**
- Palette and mode are controlled by two classes on `<body>`: `theme-{light|dark}` and `palette-{forest|warm|electric|mono}`
- CSS custom properties (`--c-done`, `--c-todo`, `--c-inprogress`, `--c-satisfaction`, `--c-default`, `--c-hover`, `--tab-active`) are defined per palette/mode in `app/styles/main.css`
- `Colors.js` reads those vars at chart-render time so Chart.js canvases use the active palette
- `ThemeSwitcher` saves the preference to `localStorage` and calls `location.reload()` on change so charts re-render with updated colors
- An inline script at the top of `<body>` in `index.html` applies the saved class before the module loads, preventing flash of unstyled content

All source files use ES modules (`import`/`export default`).

**Build pipeline (`vite.config.js`):**
- `npm run dev` — Vite dev server with HMR at http://localhost:9000; serves `test/teams/` at `/teams/` for sample data
- `npm run build` — production build to `dist/`
- Vite root is `app/`; styles are plain CSS (`app/styles/main.css`) with no preprocessor

**Test runner (`test/node-runner.js`):** Sets up a jsdom DOM environment, loads jQuery from npm, stubs `Chart.js` via `require.cache` pre-population (canvas not usable in jsdom), uses `@babel/register` to transform ESM source files to CommonJS, loads all source files via `require()`, then runs Mocha specs via `vm.runInThisContext`. All specs including `Scrum.js` are covered.

**Data format:** See `DATA_FORMAT.md` for the full JSON schema. Team data lives in `teams/<teamName>/` (not checked in; not included in `dist/`).

**REST server (`server/`):**
- `server/index.js` — Express app; `GET /board` and `POST /board` with `?team=X&project=Y` query params
- `server/data/` — one JSON file per team/project (`{team}_{project}.json`); gitignored
- Set `Store.apiBase = 'http://localhost:3001'` in the browser console (or in a future config) to enable server sync; the Store calls `sync()` on init and POSTs on every change

## Workflow

**Issues — every change should have one:**

Use the `/start-work` slash command — it searches for an existing issue, creates one if needed, and prints the issue number ready to reference in commits:
```
/start-work add dark mode to landing page
```

Manual steps (if needed without the skill):
- Before starting work, search for an existing issue: `gh issue list --repo chrismarksus/ScrumChartBoard`
- If none exists, create one: `gh issue create --repo chrismarksus/ScrumChartBoard --title "..." --body "..."`
- Reference the issue number in the commit message (e.g. `closes #42`)
- Close the issue after pushing: `gh issue close <number> --repo chrismarksus/ScrumChartBoard`

**Before committing / pushing:**
```bash
npm run lint    # no lint errors
npm test        # all specs must pass before you push
```
- **Docs** — does README, CONTRIBUTIONS, DATA_FORMAT, or CLAUDE.md need updating? New scripts, changed behaviour, new data fields, and new workflow steps should all be reflected.
- **Test coverage** — does the change introduce new logic without a corresponding spec? Check `test/spec/` for the relevant file and add tests if coverage is missing.

**After pushing:**
```bash
gh run list --repo chrismarksus/ScrumChartBoard --limit 3
```
Check that the most recent run shows `completed` / `success`. If it failed, open it with `gh run view <run-id> --log-failed` to see which step broke.

**Releasing (triggers GitHub Pages deployment):**

Use the `/release` slash command — it runs lint + tests, bumps the version, commits, pushes, and creates the GitHub release in one guided flow:
```
/release 0.3.0
```

Manual steps (if needed without the skill):
```bash
# 1. Bump version in package.json to match the new tag, then commit
npm version 1.x.x --no-git-tag-version
git add package.json && git commit -m "chore: bump version to 1.x.x"
git push origin master

# 2. Cut the release — this triggers deploy-pages.yml
gh release create v1.x.x --repo chrismarksus/ScrumChartBoard --title "v1.x.x · <subtitle>" --notes "..."
```
Publishing a release triggers `deploy-pages.yml`, which builds with the `/ScrumChartBoard/` base URL, copies sample data, and deploys to `https://chrismarksus.github.io/ScrumChartBoard/`. Pages is already configured (Source → GitHub Actions, `v*` tag policy set on the `github-pages` environment).

## Code style

ES6 classes with ES modules (`import`/`export default`). Single quotes. Keep new code consistent with existing patterns.
