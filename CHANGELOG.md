# Changelog

All notable changes to ScrumChartBoard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] / Phase 0 progress

### Added
- Downloadable starter sample CSVs next to Import buttons in Board and Editor (rich realistic examples with quoting, blocked cards, matching the sample project shapes for types/status). Located at `samples/` (built into dist) and inside the `abc/sample` data dir.
- Export JSON button (in Board backlog header): uses `BoardAdapter.toJsonFiles` to produce and download `dashboard.json` / `project.json` / `intervals.json` from the current live board + planner + timeline state. Enables easy roundtrip to static `teams/` folders or the JSON editor.
- `?apiBase=...` support: set `Store.apiBase` from query param (or persisted localStorage value). Board mutations now auto-sync (POST) to a self-hosted REST server. Small visible "🔗 host" badge appears when active.
- `?tab=board|planner|timeline|dashboard` support (per `spec.main_tabbar.md`): tab navigation updates the URL via `history.pushState` (preserving team/project/apiBase etc.), direct links load the specified tab, early class application prevents FOUC. Default remains dashboard when team+project present.
- Small polish:
  - Delete confirmations (native confirm) for cards (Board), intervals (Planner), and themes (Timeline).
  - Double-click a card title in the Board to inline-edit it (saves via store.updateCard + re-render).
  - Basic live filter input in the backlog column (filters visible cards by title or type; resets pagination).

### Changed
- `vite.config.js`: added `publicDir: '../public'` (so `samples/` and other static assets reliably copy during `build` to `dist/`). Extended the dev `/teams` middleware to serve `*.csv` files with correct `text/csv` Content-Type.
- Removed hardcoded `is-active` on dashboard tab button (JS now controls initial tab state).
- Updated `BoardAdapter` integration, Store usage, and main loading paths remain compatible.

### Documentation
- `README.md`: expanded mentions of editor, CSV samples (with download links), Export, `?apiBase`, `?tab=`.
- `DATA_FORMAT.md`: new section documenting the CSV import formats + starter samples + how Export + editor fit the workflow.
- `specs/spec.roadmap.md`: marked numerous Phase 0 items complete (CSV samples, Export, apiBase, ?tab=, small polish), updated current shipped state and remaining list.

Tests (272), lint, and production build remain clean. Self-host flow (clone → dev/build → editor or samples CSV import or board edits → ?tab= + Export → optional ?apiBase sync to server/) is now substantially complete for Phase 0.

## [0.2.2] - Prior

See git history for earlier changes.
