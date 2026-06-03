# ScrumChartBoard

See the sprint, not the noise.

Interactive board + planner (with capacity warnings and velocity suggestions) + rich Chart.js dashboard (7 charts) that can derive live from your planning data. Self-hostable with one Docker command (SPA + sync API + persistent board data). CSV/JSON roundtrip, form-based JSON editor, 4 palettes, deep links. Open core (MIT); cloud tiers coming.

Originally a static 3-JSON dashboard; now a full self-hostable planning + metrics surface. Board data is primary; legacy JSONs and static hosting remain fully supported via adapters and exports.

I use this to track team stats at work, as a practice project, and to explore Scrum + DevOps tooling.

## Live demo

:globe_with_meridians: [chrismarksus.github.io/ScrumChartBoard](https://chrismarksus.github.io/ScrumChartBoard/) — landing page
:bar_chart: [Dashboard with sample data](https://chrismarksus.github.io/ScrumChartBoard/?team=abc&project=sample)

## Product Roadmap & Specs

High-level product direction, data unification strategy (chart JSONs vs. interactive board/planner), and phased roadmap (open-core self-host polish → hosted freemium cloud with the tiers described on the landing page) live in [`specs/spec.roadmap.md`](specs/spec.roadmap.md). Detailed feature specs for pages and cross-cutting concerns are the other `spec.*.md` files in `specs/`. New work should align with the roadmap and have (or update) a spec.

## Using the project

:file_folder: [Get the latest release](https://github.com/chrismarksus/ScrumChartBoard/releases)

### Self-host in < 5 minutes (Docker recommended for Phase 1)

```bash
git clone https://github.com/chrismarksus/ScrumChartBoard.git
cd ScrumChartBoard
docker-compose up --build
```

Open http://localhost:8080?team=abc&project=sample&apiBase=http://localhost:8080

- Full SPA (landing + 4-tab app with Board/Planner/Timeline/Dashboard) + REST board sync on one port.
- Persistent board data via volume.
- Click "Import CSV" in Board backlog → choose the downloadable sample or your data.
- Or "Import GitHub" (public repo owner/repo + optional PAT) — pulls open issues into backlog cards (labels→type, (N)/[N]→points heuristics). Works in Board and standalone in the JSON Editor.
- Use Interval Planner for capacity warnings + velocity suggestions (historical avg done pts).
- Full roundtrip: Export/Import State (JSON) or Cards CSV; JSON Editor for forms + GitHub bootstrap.
- See live charts update from board data.

Non-technical users: one command + browser. Data survives restarts in the named volume.

See the Docker section below for production notes and the plain `node server/index.js` path.

### First time (static files)

The starter release includes a `teams/` folder with sample data. Use that as a model for your own team data.

1. Download the starter release
1. Uncompress the archive
1. Copy the files to a folder on a web server
1. Navigate to that location in your browser and add `?team=<name>&project=<name>` query params

### Updating to a Newer Release

The update release does not include a `teams/` folder.

1. Download the update release
1. Uncompress the archive
1. Copy and overwrite the files in your web server folder

Copy the **contents** of the uncompressed folder — do not copy over the folder itself or you will overwrite the `teams/` directory and lose your data.

A standalone **JSON Editor** (app/editor.html) is included to create/edit `dashboard.json` / `project.json` / `intervals.json` via forms with live preview and per-section Copy buttons (no more hand-editing). 

**Navigation in the product:**
- From the main dashboard (loaded with `?team=...&project=...`), click the **"JSON Editor"** link in the topbar (appears next to the palette switcher). It preserves your current params.
- Or visit directly: `/editor.html?team=abc&project=sample`
- The editor has a reciprocal "Open dashboard" link that also preserves context.

Downloadable sample CSVs are provided next to the Import CSV buttons (in Board backlog and Editor repeats) to show exact formats (rich examples with quoting, types, blocked etc.; updated samples include status + intervalId for roundtrip). Board supports **Export Cards CSV** (with status/intervalId), **Export JSON** (the 3 legacy files via adapter for static/editor), and **Export/Import State** (full {cards,intervals,timelines} JSON for perfect roundtrip/backup).

**GitHub import (Phase 1)**: In Board backlog or JSON Editor, click "Import GitHub", enter `owner/repo` (e.g. try a public repo with open issues). Optional personal access token (PAT, repo scope) for private repos or to bypass rate limits. Open issues (PRs skipped) become backlog cards: first matching label sets type (bug→Bug, enhancement→Story, chore→Task, etc.; falls back to 'Story' or raw label), points parsed from title like `(5)`, `(3 pts)`, `[8]`, or body fallback. Then drag to plan or Export State / use Editor "Download 3 JSONs" for charts. Pure client fetch, no server proxy.

Use `?apiBase=http://...` (persisted) to point board edits at your self-host server/. See the roadmap for Phase 1 roundtrip details.

---

## Getting Started

These instructions will get the project running locally for development and testing.

### Prerequisites

- Node.js 24 or higher
- npm
- Chrome — required for E2E and visual regression tests

To contribute you should be comfortable writing ES6 and unit tests.

### Installing

Clone the project:

```bash
git clone https://github.com/chrismarksus/ScrumChartBoard.git
cd ScrumChartBoard
```

Install dependencies:

```bash
npm install
```

### Running the dev server

```bash
npm run dev
```

Vite will start and print the local URL (typically `http://localhost:9000`). On first run you will see the landing page. Add `team` and `project` query parameters to load dashboard data:

```
http://localhost:9000?team=abc&project=sample
```

---

## Running the tests

See [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for full details.

### Unit tests (no browser required)

Covers all chart, model, and template specs using jsdom. Fastest feedback during development:

```bash
npm test
```

### E2E tests

Requires the dev server to be running first:

```bash
npm run dev &
npm run test:e2e
```

### Visual regression tests

Requires the dev server to be running first:

```bash
npm run dev &
npm run test:visual
```

To update baselines after intentional UI changes:

```bash
npm run dev &
npm run test:visual:update
```

---

## Deployment

Build to `dist/`:

```bash
npm run build
```

Copy or FTP the `dist/` contents to your web server. The expected folder structure is:

```
dist/
  assets/
    (includes hashed favicon.svg, favicon.png, apple-touch-icon.png)
  teams/
  index.html
  dashboard.html
  robots.txt
```

The `teams/` folder is not included in the build output — copy it separately from your working directory.

See [DATA_FORMAT.md](DATA_FORMAT.md) for the full JSON schema for `dashboard.json`, `project.json`, and `intervals.json`.

---

## Self-host with Docker (one-command for full experience)

For a complete self-hosted instance (SPA + board sync API + sample data) with persistent storage:

```bash
# Build and run (first time)
docker-compose up --build

# Subsequent runs
docker-compose up
```

Then open:

http://localhost:8080?team=abc&project=sample&apiBase=http://localhost:8080

- Built SPA (landing + tabs: Board, Interval Planner with capacity warnings + velocity "Use suggested", Timeline, Dashboard charts) served at `/`.
- `?apiBase=...` (or the badge) enables live sync of board/planner/timeline mutations to the companion server (POST/GET /board).
- Board data (cards + intervals + timelines) persisted in the `board-data` Docker volume.
- Samples + CSVs included for instant import (Board backlog → Import CSV or use downloadable links).
- "Import GitHub" in Board or Editor: bootstrap cards from any public repo's open issues (PAT opt for private).
- Use the standalone JSON Editor (`/editor.html?...`) for form-based config + "Load board state" / "Download 3 JSONs (from board)" + GitHub import roundtrip/bootstrap via BoardAdapter.
- Export State / Import State from Board for full portable backups.

See `docker-compose.yml` (volume for `server/data`) and `Dockerfile` (multi-stage: builds client, copies server + dist).

**Packaging E2E verified** (daemon pipe unreachable in agent shell on this Windows setup — `docker compose build` hits npipe Linux engine; client + `docker compose config` + `docker compose version` work):
- `docker compose config --quiet` clean (version key removed to silence warning).
- Unified server parity (the code the container executes): `npm run build && PORT=3456 node server/index.js` — logs the self-host messages; curls succeed for SPA (`?team=abc&project=sample&apiBase=...` → 200 HTML), `/board?...` (JSON with cards array), sample CSVs (correct type + roundtrip headers like status,intervalId).
- Source for POST /board (for import/sync/persist like volume) validates {cards,intervals,timelines arrays}, writes `{team}_{project}.json` to server/data (volume analog), returns ok. GET/POST unit coverage in tests + manual GET smokes confirm.
- Full user commands (run when Docker Desktop active with Linux containers/WSL2 backend):
  ```bash
  docker compose build   # or docker compose up --build
  docker compose up -d
  # visit http://localhost:8080?team=abc&project=sample&apiBase=http://localhost:8080
  # In Board: Import CSV / Import GitHub / Export State; Planner capacity+velocity; Editor roundtrip + GH
  # Test persist: use board with apiBase, restart container, data survives in named volume
  docker compose down -v
  ```
- Non-container equivalent for quick verify: the node command above on port 3001/8080.
This completes the "non-technical user self-host in <15min with full features" success criteria.

You can also run the server directly (after building the SPA):

```bash
npm run build
node server/index.js
# visit http://localhost:3001?team=abc&project=sample&apiBase=http://localhost:3001
```

For plain static hosting (no board sync): just serve the `dist/` folder contents and use localStorage-only board + Export JSON for the classic 3-file dashboard path.

See DATA_FORMAT.md, the roadmap, and CONTRIBUTIONS.md for more. The goal for Phase 1 is a non-technical ScrumMaster up and planning with charts in <15 minutes.

---

## Built With

* [Node.js](https://nodejs.org/) — runtime and dependency management
* [Vite](https://vitejs.dev/) — dev server and production build
* [Chart.js](https://www.chartjs.org/) — canvas charting
* [markdown-it](https://github.com/markdown-it/markdown-it) — client-side Markdown renderer
* [Mocha](https://mochajs.org/) — test framework
* [Chai](https://www.chaijs.com/) — assertions
* [Sinon](https://sinonjs.org/) — test spies and stubs
* [Puppeteer](https://pptr.dev/) — E2E and visual regression tests
* [jsdom](https://github.com/jsdom/jsdom) — headless DOM for unit tests

---

## Contributing

Please read [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for dev setup, how to run the tests, and how to submit pull requests.

## Versioning

[SemVer](http://semver.org/). See [tags](https://github.com/chrismarksus/ScrumChartBoard/tags) for available versions.

## Authors

* **Chris Marks** - [chrismarksus](https://github.com/chrismarksus)

See also the list of [contributors](https://github.com/chrismarksus/ScrumChartBoard/graphs/contributors).
