# CLAUDE.md

This file provides guidance to AI coding agents (primarily Claude Code at claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Install server dependencies (required once)
cd server && npm install && cd ..

# Run the REST API server (port 3001 by default)
cd server && npm start

# Run server in dev mode (auto-restarts on file changes)
cd server && npm run dev

# Dev server with live reload at http://localhost:9000
npm run dev

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

# Production build → dist/
npm run build
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

**Source layout:** `app/scripts/`; entry point is `main.js`. Charts in `charts/*.js`; base class is `charts/Charts.js`.

**Theme system:**
- Palette and mode are controlled by two classes on `<body>`: `theme-{light|dark}` and `palette-{forest|warm|electric|mono}`
- CSS custom properties (`--c-done`, `--c-todo`, `--c-inprogress`, `--c-satisfaction`, `--c-default`, `--c-hover`, `--tab-active`) are defined per palette/mode in `app/styles/main.css`
- `Colors.js` reads those vars at chart-render time so Chart.js canvases use the active palette
- `ThemeSwitcher` saves the preference to `localStorage` and calls `location.reload()` on change so charts re-render with updated colors
- An inline script at the top of `<body>` in both `index.html` and `dashboard.html` applies the saved class before the module loads, preventing flash of unstyled content

**Test runner (`test/node-runner.js`):** Node-based jsdom + Mocha runner; no browser required. All specs including `Scrum.js` are covered.

**Data format:** See `DATA_FORMAT.md` for the full JSON schema. Team data lives in `teams/<teamName>/` (not checked in; not included in `dist/`).

**REST server (`server/`):**
- `server/index.js` — Express app; `GET /board` and `POST /board` with `?team=X&project=Y` query params
- `server/data/` — one JSON file per team/project (`{team}_{project}.json`); gitignored

## Workflow

**Branch strategy:** `master` is protected — no direct pushes. Every change goes through a feature branch + PR. CI must pass before merging; no reviewer required (squash-merge to keep history clean).

**Starting work — every change should have an issue and a branch:**

Use the `/start-work` command (typically run by the human or via host-level integration) — it finds or creates a GitHub issue and checks out a correctly-named feature branch:
```
/start-work add dark mode to landing page
# → creates issue #42, checks out feat/42-dark-mode-landing-page
```

**Before committing / pushing:**
```bash
npm run lint    # no lint errors
npm test        # all specs must pass
```
- **Docs** — does README, CONTRIBUTIONS, DATA_FORMAT, or CLAUDE.md need updating? New scripts, changed behaviour, new data fields, and new workflow steps should all be reflected.
- **Test coverage** — does the change introduce new logic without a corresponding spec? Check `test/spec/` for the relevant file and add tests if coverage is missing.

**Opening a PR:**
```bash
git push -u origin <branch-name>
gh pr create --fill    # uses branch name + commits to prefill title/body
```
Reference the issue in the PR body (`closes #<number>`). GitHub Actions runs CI automatically; the PR can be merged once the `test` check is green.

**After merging:**
```bash
gh run list --repo chrismarksus/ScrumChartBoard --limit 3
```
Check that the most recent run shows `completed` / `success`. If it failed, open it with `gh run view <run-id> --log-failed` to see which step broke.

**Releasing (triggers GitHub Pages deployment):**

Use the `/release` command (typically run by the human or via host-level integration) — it runs lint + tests, bumps the version, commits, pushes, and creates the GitHub release in one guided flow:
```
/release 0.3.0
```

## Feature specs (`specs/`)

Design specs for new features live in `specs/`. Each spec covers one page or shared component. Cross-references between specs use the filename directly (e.g. `spec.backlog.md`). Read the relevant spec before implementing a feature.

Glob `specs/` to find current spec files.

## Custom slash commands (`.claude/commands/`)

These are AI-executable commands defined as Markdown instruction files. They focus on the spec-driven development process:

- `/spec-lint` — reads every spec and reports broken cross-references, orphaned specs, undefined behaviors (e.g. shortcuts), missing sections, and contradictions.
- `/new-spec <name>` — scaffolds `specs/spec.<name>.md` from the standard template and (for tab-related features) updates the tab bar spec.
- `/spec-to-tasks <spec-file>` — converts a spec + its cross-references into a concrete task list and files it as a GitHub enhancement issue via `gh`.

Higher-level workflow commands such as `/start-work` (create issue + branch) and `/release` (bump version, tag, publish) are documented in the Workflow section above. They are typically initiated by the human (or provided as host-level skills outside this repo's `.claude/commands/`) rather than as local AI command files. This keeps per-conversation context lean.

## Code style

ES6 classes with ES modules (`import`/`export default`). Single quotes. Keep new code consistent with existing patterns.
