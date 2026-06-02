# Product Roadmap

## Overview

ScrumChartBoard is a chart-first Scrum metrics dashboard with an expanding interactive planning surface (Board, Interval Planner, Timeline Editor). It began as a no-database static-site tool that loads three JSON files (`dashboard.json`, `project.json`, `intervals.json`) and renders seven Chart.js visualizations. It is evolving into a dual offering:

- **Open core** (MIT, self-hostable) — polished, import-friendly, works fully offline or with a lightweight companion server for sync.
- **Hosted cloud / freemium** (future) — accounts, real-time-ish sync, Jira/Linear/CSV imports, shareable links, multi-project views, and paid tiers as described in the landing page.

This top-level spec defines the product direction, data strategy, phasing, and governance for specs. It is the single source of truth that all feature specs (`spec.*.md`) and implementation work must align with. See also `spec.landing.md` (marketing vision and pricing), `spec.main_tabbar.md` (navigation policy), and the detailed page specs.

Current shipped state (as of Phase 0 progress in workspace):
- Landing page with hero, feature illustrations, palette switcher, and pricing stubs.
- Four-tab app (Board, Interval Planner, Timeline, Dashboard) — only completed, fully specced pages appear (per `spec.main_tabbar.md`).
- `Store.js` + `Board.js` + `IntervalPlanner.js` + `TimelineEditor.js` with localStorage persistence and optional REST sync (`Store.apiBase`).
- Lightweight Node/Express server in `server/` (GET/POST `/board?team=...&project=...`, file-per-project JSON, no auth yet).
- Mature chart pipeline (`GetData.js`, `Model.js`, `Scrum.js`, seven chart classes) **now supports BoardAdapter** so board data (cards + planning intervals + timelines) can drive dynamic parts of the charts (status, types, timelines, per-interval committed/completed etc.).
- JSON Editor standalone page (`editor.html`) for the 3 legacy JSON files (forms, live preview, Copy per section).
- CSV import: in Board (bulk cards) and wired into Editor (for cardTypes/cardStatus). Downloadable starter sample CSVs (rich examples, no guesswork) surfaced next to imports.
- Comprehensive test suite (272+ passing specs covering new board features and legacy charts), visual regression, E2E, lint, and GitHub Pages release deploy.
- BoardAdapter + toJsonFiles helper (export of board state to 3-JSON format); Export JSON button in Board UI.
- `Store.apiBase` wired via `?apiBase=` query + local persist + visible badge (enables live sync to self-host server/).
- `?tab=` support: URL now reflects the active tab (pushState on click, read on load with precedence over defaults, preserves team/project/apiBase etc.). Early class application prevents FOUC of the wrong panel.

**Note on spec drift**: Some specs pre-date the interactive board work (`spec.persistence.md`, `spec.backlog.md`, `spec.work_item*.md`, placeholder `spec.planner.md`). The shipped card model (UUIDs, statuses `backlog|todo|inprogress|done`, `intervalId`, etc.) differs from the older integer-ID work-item schema. This roadmap calls for reconciliation (see remaining Phase 0 items below).

### Phase 0 Completed (as of latest build)
- ✅ JSON editor (issue #74, full forms + preview + copy per the spec).
- ✅ CSV import (cards → Board + into editor for types/status; per roadmap bullet). Plus enhanced downloadable starter sample CSVs (rich data, quoted examples) with "Sample CSV"/"Download sample" links next to every import control.
- ✅ BoardAdapter (transforms Store data to Model shape so board drives charts; + toJsonFiles helper for export).
- ✅ Export JSON UI (Export JSON button in Board; downloads the three legacy JSON files from live store data for roundtrips/self-host).
- ✅ `Store.apiBase` wiring ( `?apiBase=...` + persisted + visible sync badge for self-host server sync story).
- ✅ `?tab=` support (URL reflects active tab + direct links + param preservation + no FOUC; per spec.main_tabbar.md).
- Core Board/Planner/Timeline + tab bar + Store + server (from prior work; tests/build clean).

See "Remaining in Phase 0" todos or the bullets below for what's left to hit the success criteria fully and close tracking issue #85.

---

## Vision & Positioning

"See the sprint, not the noise."

- Forty seconds (or less) from first visit or sign-up to a meaningful burnup and planning surface.
- Zero "Doh! There is no data available!" empty states for real users.
- Four beautiful palettes that work in light and dark; semantics never change.
- Self-host or cloud. Open source forever for the core experience.
- The tool a ScrumMaster or team lead actually enjoys opening before a retro.

Landing page (see `app/index.html` and `spec.landing.md`) articulates three tiers:
- **Open** ($0/forever) — self-host, MIT, all charts, CSV import, community.
- **Team** (paid per seat) — hosted, SSO, Jira & Linear sync, multi-project, shareable links, priority support.
- **Studio** (talk to us) — on-prem, custom branding, audit logs, SAML, SLA + CSM.

All roadmap work must either deliver against these promises or explicitly update the landing copy and this spec.

---

## Current State & Known Gaps

**Shipped & Tested**
- Chart dashboard from static JSON (DATA_FORMAT.md).
- Full interactive planning surface (Board/Planner/Timeline) sharing a `Store`.
- Theme system with live palette/mode switching on landing (no reload) and reload on dashboard for chart color consistency.
- Optional sync to the thin REST server.
- Sample data served in dev; copied into GH Pages deploys.

**Gaps vs. Marketed / Specced Experience**
- No easy data creation or import path (manual JSON or copy sample is the reality; landing promises "auto-imported from Jira, Linear, or a single CSV").
- Board/planner data is completely disconnected from the rich dashboard charts (no `BoardAdapter`, no export to `intervals.json` shape).
- No JSON editor/form tool (open issue #74).
- `Store.apiBase` is never set by the app UI; users must hack it for sync.
- No user accounts, projects, or permissions — server is anonymous (team/project strings only).
- Landing CTAs, pricing numbers, Docs/Changelog links are stubs.
- Tab state not reflected in URL (desired in `spec.main_tabbar.md`).
- Some out-of-scope MVP items from board/planner specs remain (editing cards, confirms in places, etc.).
- Conflicting data models across specs vs. implementation.

**Infrastructure**
- Static SPA + optional separate Node server.
- GH Pages for the open demo (with sample data only).
- Strong testing and CI discipline.

---

## Data Model Strategy (Critical Decision)

The single biggest architectural choice for the next 1–2 phases is how the legacy chart data and the new interactive board data relate.

**Recommendation**
1. Make the interactive model (`cards`, `intervals`, `timelines` in Store, plus project-level config for name, cardTypes, cardStatus, timelines metadata, backlog link, etc.) the **primary source of truth** for new projects and for the hosted product.
2. Provide bidirectional adapters/exporters so:
   - A live board+planner project can produce (or incrementally update) the three JSON files that power the full dashboard charts.
   - Existing static JSON users can import into the board/planner surface.
3. Keep the pure static three-JSON path supported indefinitely for simple self-host "published dashboard" use cases and for teams that only want charts without the kanban/planner UI.
4. Over time, the `Model` and chart inputs should be derivable from (or directly consume) Store data + a small project config object.

This unifies the experience, makes the board/planner immediately valuable (you see impact in the charts), and satisfies the "import once, plan + visualize" promise.

Until unification lands, board data remains a parallel planning tool whose output can be manually or semi-automatically turned into chart JSONs.

---

## Phased Roadmap

### Phase 0 — Foundation & Immediate Usability (v0.3.x targets)

Goal: A self-host user can create a project and see both live planning and rich charts without hand-editing JSON.

- Ship / reconcile the Board + Planner + Timeline feature (close tracking issue; ensure all "Out of Scope for MVP" items that are now required are either done or moved).
- Implement the JSON editor page per `spec` intent in open issue #74 (two-column, tabbed forms for Dashboard/Project/Intervals, live JSON preview, Copy button; later local draft + server save).
- Add at least CSV import (cards → Board; optionally rows → intervals for metrics). Wire it into both the new editor and a standalone import flow.
- Implement a `BoardAdapter` (or equivalent) + export so board cards + intervals can populate burnup, velocity, status, capacity, satisfaction, etc. charts. Make the Dashboard able to render from Store data when present (or via explicit "snapshot" action).
- Wire `Store.apiBase` configuration (query param `?apiBase=...` for quick testing + a small persisted settings surface or env injection for self-hosters running their own server). ✅ done (query + persist + badge UI)
- Reconcile or explicitly deprecate outdated specs (`spec.persistence.md`, backlog/work-item family) and update any cross-refs.
- Add `?tab=` support and preserve other params (per `spec.main_tabbar.md`).
- Small polish: card editing (title/type/points), delete confirmations where specced, basic search/filter on backlog columns if it unblocks users.
- Docs: update README "Using the project", DATA_FORMAT.md (add board data shape + CSV samples), CONTRIBUTIONS, this roadmap. Add a "What's new" or changelog entry.
- Success criteria: clone → `npm run dev` → create/edit data via editor → see both board and full dashboard charts for the same project → optional sync to local `server/`. (Export JSON + samples downloads also now live)

**Remaining in Phase 0 (as of this update; see AI todos for tracking):**
- Reconcile/deprecate outdated specs (persistence.md, backlog/work_item family etc. vs current card model) + cross-refs.
- Add `?tab=` URL support + preserve params + load precedence (per main_tabbar.md; currently no URL sync at all). ✅ done (pushState on clicks, read on load with precedence, coexists with team/project/apiBase, early class application to avoid FOUC).
- Small polish from board/planner specs now called out in roadmap: card editing (title/type/points), delete confirmations, basic search/filter on backlog.
- Full ship/reconcile of board feature (update/close #85): complete REST wiring details if needed, polish export UI (currently in Board; could add to Editor too).
- Docs updates across README, DATA_FORMAT (add board Store schema + CSV samples), CONTRIBUTIONS, this file (mark progress, add changelog), close related issues (#74, #85, #109).
- Verify end-to-end success criteria (including optional server sync after apiBase wired; also test Export + samples downloads).

✅ Wire `Store.apiBase` (query param + small persisted UI badge; persisted across reloads; syncs on board ops).
✅ Export JSON UI implemented (Export JSON button in Board backlog header; uses BoardAdapter.toJsonFiles to download the three JSONs for roundtrip/static use). 
✅ Sample starter CSVs enhanced with realistic quoted examples (incl. commas in titles, variety of types/points/blocked, matching sample project shapes); Download links ("Sample CSV", "Download sample") next to every Import CSV in Board + Editor; served reliably via teams/ in sample data (copied on deploy) + public/samples.

See the detailed todo list in the workspace for implementation order. Once these are done, Phase 0 success criteria should be met and we can move to Phase 1 packaging.

### Phase 1 — Self-Host Complete & Packaging

- Round-trip import/export (CSV ↔ full project state including historical metrics).
- Finish remaining MVP items from existing specs (editing intervals/themes, capacity warnings, etc.).
- Improve the editor to be the primary way to manage both chart config and board data.
- Packaging & ops: Dockerfile + docker-compose example that serves the static app + the board API server together; one-command self-host story.
- Optional: GitHub import for issues as cards, basic velocity-based planning suggestions in the planner.
- Update landing page proof points and remove "coming soon" language that is now true.
- Success: non-technical ScrumMaster can self-host a useful instance in under 15 minutes.

### Phase 2 — Hosted Cloud Foundation (enables "Team" tier)

- Authentication & accounts (email magic links or OAuth first; add SSO/SAML later for paid).
- Project model: users own or are invited to projects. Each project has unified config + board state + (later) historical snapshots.
- Replace or augment anonymous `team`/`project` strings with proper ownership. The thin `server/` becomes the seed for (or is replaced by) a real multi-tenant backend.
- Hosted "Start free project" flow from landing that creates an account + project and lands the user in a live dashboard + board (server is authoritative; localStorage is cache/sync).
- Read-only shareable links (token or project visibility setting).
- Basic user dashboard: list of my projects, recent activity.
- Persistence story: server wins for cloud users; graceful offline + conflict notes.
- Billing hooks (Stripe customer/project metadata) even if actual charging is soft-launched.
- Success: a new user can sign up and have a real, shareable, multi-device project with both planning and charts in < 60 seconds.

### Phase 3 — Integrations & Monetization

- Jira and Linear sync (at minimum: import issues as cards with type/points/status, pull some sprint metrics into intervals for charts; two-way updates later).
- In-app CSV/JSON upload and connectors.
- Multi-project rollups and cross-project velocity/satisfaction views (justifies "multi-project" in Team tier).
- Shareable read-only dashboard links that don't require login.
- Priority support workflows.
- Audit logging (lightweight, for Studio tier).
- Update pricing page with real numbers and working CTAs (trial signup that creates a project).
- Success: paid-tier value is demonstrable; conversion funnel exists from landing.

### Phase 4 — Enterprise (Studio) & Scale

- On-prem / air-gapped packaging and deployment docs.
- Custom palette/branding per organization.
- SAML/SCIM, advanced RBAC, audit export.
- SLA, named CSM, dedicated infrastructure options.
- Performance & scale work for large numbers of cards/intervals or many concurrent users.
- Optional white-label or embedded dashboard use cases.

---

## Cross-Cutting Concerns

**Governance**
- Every significant feature or behavior change must have (or update) a spec in `specs/`.
- Use the `/spec-lint` process (or equivalent) before releases that touch user-facing areas.
- Landing page marketing claims must be backed by shipped code or clearly marked as roadmap.
- Update root docs (README, DATA_FORMAT.md, CONTRIBUTIONS.md, CLAUDE.md) when behavior or workflow changes.

**Testing & Quality**
- Maintain the existing high bar: unit (node-runner), E2E, visual regression, lint.
- New interactive or import code must have corresponding specs in `test/spec/`.
- Visual baselines updated only for intentional changes.

**Theming & UX**
- All new UI must respect the existing CSS custom properties and palette system.
- ThemeSwitcher behavior (reload on dashboard, live on landing) is intentional and must be preserved or explicitly evolved in a spec.

**Persistence & Sync**
- `Store` abstraction remains the seam (see current implementation and `spec.board.md`, `spec.interval_planner.md`, `spec.timeline_editor.md`).
- For cloud, the server becomes the source of truth; local is an optimistic cache.
- Future conflict resolution and offline queuing are Phase 2+ concerns.

**Backend Evolution**
- The current `server/index.js` + file storage is a deliberate stepping stone (see closed issue for its addition).
- It is acceptable to keep file-per-project storage for early hosted phases for simplicity, or to introduce a real DB (Postgres, SQLite, or hosted equivalent) when user/project/auth layers arrive.
- Auth and multi-tenancy are Phase 2 concerns; do not add half-auth in Phase 0/1.

---

## Out of Scope / Non-Goals (Near Term)

- Real-time simultaneous multi-user editing on the same board/planner (Phase 2+; simple presence indicators maybe earlier).
- AI-generated retros, risk predictions, or sprint plans (interesting future, not core to v1 product).
- Native mobile apps or offline-first PWA beyond basic service-worker caching.
- Full two-way Jira/Linear sync or complex workflow mapping in first integration pass.
- Public API for third-party developers (internal APIs only until hosted is stable).
- Changing the fundamental "one project = one team + one set of intervals" model without a dedicated spec.

---

## Success Metrics (Proposed)

**Self-host / Open**
- New user time-to-first-useful-dashboard (with their own data) < 10–15 minutes.
- Board + charts visible for the same project without manual data duplication.

**Hosted / Product**
- Sign-up to first rendered burnup + one planned card < 60 seconds (with sample or import).
- Multi-device sync works for a logged-in user without localStorage gymnastics.
- Clear differentiation: Team tier users get value from imports and sharing that pure self-host does not yet provide.

**Process**
- All new work traceable to this roadmap or a referenced feature spec.
- Spec-lint and test/lint gates pass on every PR that touches user experience or data shape.

---

## References & Maintenance

- Marketing & pricing vision: `spec.landing.md`, `app/index.html` (hero, pricing section, final CTA).
- Navigation policy: `spec.main_tabbar.md`.
- Detailed behaviors: `spec.board.md`, `spec.interval_planner.md`, `spec.timeline_editor.md`, `spec.dashboard.md`, and siblings.
- Data format (chart JSONs): `DATA_FORMAT.md`.
- Implementation entry points: `app/scripts/main.js`, `Store.js`, `GetData.js`, `Model.js`, `server/index.js`, `vite.config.js`.
- Open tracking: GitHub issues (e.g. board feature, JSON editor #74).
- Workflow: `CLAUDE.md`, `CONTRIBUTIONS.md`, GitHub branch/PR rules.

This spec should be updated (not replaced) as phases complete. When a phase is largely done, move its bullets to a "Completed" section or archive note and adjust the current "Phase X" pointers.

When in doubt, prefer shipping a smaller, coherent slice that unblocks real users over perfect future architecture. The open-core self-host experience must remain delightful and complete even if the cloud tier is delayed.

---

*Drafted from repo exploration (code, specs/, tests, server, landing, GitHub issues, CI/deploy). Current as of workspace state post-board + server additions. Living document — update with each milestone.*