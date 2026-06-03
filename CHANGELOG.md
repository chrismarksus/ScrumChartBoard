# Changelog

All notable changes to ScrumChartBoard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Self-host packaging (Phase 1 start): Dockerfile (multi-stage build of client + server) + docker-compose.yml for one-command self-host (SPA + /board API + samples + persistent data volume on single port 8080).
- Enhanced `server/index.js` to serve the built `dist/` SPA (with teams/ samples fallback) + SPA catch-all alongside the existing board API. Updated startup logs and added /teams middleware.
- Round-trip import/export enhancements for CSV and full board state:
  - Board: **Export Cards CSV** (includes status, intervalId for bidirectional), **Export State** (full {cards,intervals,timelines} JSON), **Import State** (loads full state back to board/Store).
  - CSV import now respects `status` and `intervalId` columns (in addition to title/type/points/blocked).
  - Updated starter samples to demonstrate roundtrip columns.
- Interval editing in Planner (MVP remaining): dblclick name or ✎ button to edit name/dates inline with save/cancel. Basic ⚠ over-commit warning for lanes >40 pts.
- Planner capacity warnings (Phase 1): intervals now support `capacity` (pts) via create form and edit. Non-blocking warnings: top banner + lane ⚠ when non-done committed points exceed capacity. Dynamic "X pts / CAP" display. Recomputes on drag, add, delete, status-affecting changes (reflected on tab visit). Pure helpers + live render.
- Docs: README + DATA_FORMAT + CONTRIBUTIONS + CHANGELOG + roadmap updated.
- Store: added `importState(data)` helper for clean roundtrips.
- Minor editor UI notes for roundtrip.

This enables CSV ↔ board planning state roundtrip (planning data) + JSON state backup/restore, finishes MVP interval editing + adds usable capacity warnings for planning. Packaging + roundtrip + capacity + edits advance Phase 1 self-host.

### Changed
- Board backlog header buttons now include CSV export, state export/import for better roundtrip UX (existing Export JSON for legacy charts remains).

This makes a non-technical user able to `docker-compose up --build` and have a full working instance (with board sync) in < 5 minutes. Addresses Phase 1 "one-command self-host story".

## [0.3.0] - 2026-06-02

### Added
- **Phase 0 foundation shipped** (closes #109; advances board #85 + editor #74): interactive Board/Planner/Timeline now unifies with the classic charts via `BoardAdapter` (live derivation of statusCounts, cardTypeCounts, timelines, per-interval aggregates from Store cards/assignments). Dashboard reflects board edits in real time.
- Downloadable starter sample CSVs next to every Import button in Board and Editor (rich realistic examples with quoting, blocked cards, matching the sample project shapes for types/status). Files served from `samples/` (copied to `dist/` on build) and inside test `teams/abc/sample`.
- Export JSON button (Board backlog header) + "Download JSON files" in Editor: uses `BoardAdapter.toJsonFiles` to emit `dashboard.json` + `project.json` + `intervals.json` from live state for roundtrips or static hosting.
- `?apiBase=...` + badge: query (or localStorage) sets `Store.apiBase`; mutations POST to your self-hosted `server/`. Visible "🔗 host" indicator when active. Enables full self-host sync story.
- `?tab=board|planner|timeline|dashboard` (per `spec.main_tabbar.md`): URL-driven tabs with `history.pushState` (preserves other params), direct-link support, load precedence, early DOM class to avoid FOUC.
- Small polish on the board surface: native confirm guards on deletes (cards/intervals/themes), dblclick-to-edit card titles, live backlog filter (title/type, resets pagination).
- Full JSON Editor page (`editor.html` + `app/scripts/editor.js`): dynamic repeating forms for dashboard/project/intervals data, live preview, per-section Copy, CSV import for types/status + sample downloads. Bidirectional nav links between editor and main app.

### Changed
- `vite.config.js`: `publicDir: '../public'` + extended `/teams` middleware (now serves `*.csv` as `text/csv`) so samples + assets are reliable in dev and `npm run build`.
- Board data model is now primary for new/interactive use; legacy 3-JSON path remains fully supported for static/self-host "published dashboard" cases.
- Tab bar no longer has hardcoded active state on dashboard (JS-driven).

### Documentation
- `README.md` + `CONTRIBUTIONS.md`: expanded editor nav, CSV samples, Export, `?apiBase`, `?tab=`, self-host flow, running instructions.
- `DATA_FORMAT.md`: new "Board data model" + "CSV import formats (starter samples)" + "Export JSON" sections with examples and roundtrip notes.
- `CHANGELOG.md` (new), `specs/spec.roadmap.md` (Phase 0 marked shipped, deprecation notes on old specs, current shipped state updated).
- `CLAUDE.md` + workflow docs lightly generalized (AI assistant references).

All gates passed: 272 unit specs, lint, visual baselines refreshed, production build includes samples. Self-host end-to-end verified (dev server + API server, board → charts via adapter, samples/CSV, Export, ?tab= + ?apiBase sync).

See PR #111 (and its commits) + `specs/spec.roadmap.md` for the full Phase 0 story. This is the first release with a complete open-core interactive + visualization experience.

## [0.2.2] - Prior

See git history for earlier changes.
