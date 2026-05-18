# Dashboard

## Overview

The Dashboard is the chart-first view of sprint and project metrics for a single team/project combination. It is one of the four tabs in the main app (`index.html`) and is the default active tab on page load.

The Dashboard requires `?team=` and `?project=` query params. If either is absent, `main.js` immediately redirects to `landing.html`. When both are present, it fetches three JSON files from the server, computes all derived metrics through `Model`, renders the HTML template via `Templates.main()`, and instantiates up to twelve chart instances via `Scrum`.

---

## Navigation

The Dashboard tab is the rightmost and default-active tab in the main tab bar (see `spec.main_tabbar.md`). It renders into `#panel-dashboard → #main`.

Entry points:
- Direct URL: `/?team={team}&project={project}`
- "Start free" and "See sample dashboard" links on the landing page go to `./?team=abc&project=sample`
- Previously visited projects are stored in `localStorage` key `scrum_url_data_0001` and shown as links in the error state

---

## Data Loading

On load, three JSON files are fetched in parallel via `Promise.all`:

| File | Path | Purpose |
|------|------|---------|
| `dashboard.json` | `teams/{team}/dashboard.json` | Top-level config: dashboard name, team name, days per interval, intervals array |
| `project.json` | `teams/{team}/projects/{project}/project.json` | Project name, card status, card types, timelines, backlog link |
| `intervals.json` | `teams/{team}/projects/{project}/intervals.json` | Per-sprint data array |

The `Last-Modified` response header from whichever file is newer (`intervals.json` vs `project.json`) becomes the displayed "Updated" date.

After fetching, the three payloads are merged into a single object and passed to `Model`. `Model` computes all derived metrics. `Scrum` then renders the template and calls `draw()` to instantiate all charts.

---

## Layout

The dashboard renders inside `#main` as a `.container` using a 12-column grid layout (`class="row"` + column divisions). Sections in order:

### 1. Dashboard Header

Three stacked headings:
- `<h1>` — `dashboardName` (from `dashboard.json`)
- `<h2>` — `projectName` (from `project.json`)
- `<h5>` — `teamName` (from `dashboard.json`)

### 2. Sprint Reviews

Heading: "Sprint Reviews"

A row of anchor buttons (`<a class="button">`) — one per interval. Each link shows the interval label and date range (`label (dateStart - dateEnd)`). If the interval has a `review` URL, the button gets `class="button button-primary"` and `href` set to that URL; otherwise it renders as a plain (un-linked) button. Links open in a new tab (`target="_blank"`).

### 3. Project Section

Heading: "Project"

**Burnup chart** (`#burndown`, `<h5>` title "Burnup"):
- Plots `pointsCompleted` (cumulative) and `pointsEstimated` across all intervals
- Rendered by `Burndown` chart class (despite the element ID; it is a burnup visualization)
- Has an info `(i)` link that opens a popup overlay explaining the chart

**Timelines** (optional — only rendered if `project.json` has a `timelines` array):
- One `<canvas>` per timeline entry, sized by `item.timeline.length * 25 + 50` px height
- Each rendered by a `Timelines` chart instance
- A single info `(i)` popup covers all timeline charts

**Status and Types** (two-column row — each optional):
- `#status` (`<h4>` "Status") — donut/pie chart of card status counts; rendered by `Status` class. Only shown if `project.json` has `cardStatus`. Optional `cardStatusLabel` sets the center label.
- `#cardTypes` (`<h4>` "Types") — donut/pie chart of card type counts; rendered by `Types` class. Only shown if `project.json` has `cardTypes`. Optional `cardTypeLabel` sets the center label.

### 4. Team Section

Heading: "Team"

**Stat row** (three equal columns):

| Stat | Element ID | Value |
|------|-----------|-------|
| Cards | `#estimatedCards` | `{cardsEstimatedPercentage}%` — estimated / unestimated breakdown in footer |
| Velocity | `#velocity` | `{totalAverageVelocity}/{predictedVelocity}` — current / predicted |
| Capacity | `#daysCapacity` | `{totalPersonWorkDays}/{personWorkDays}/{timeboxes}` — total / workdays / timeboxes |

All three are text-only "text chart" divs (no canvas).

**Capacity chart** (`#daysWorked`, full width):
- Multi-line chart of capacity days per interval, rendered by `Lines` class
- Lines: Timeboxes, Holidays, Planned, Unplanned, Capacity — omitted if all values are zero for that series

**Points charts** (two-column row):
- `#pointsgoals` — percentage of points committed vs. completed per interval (Line chart)
- `#commitedvscompleted` — paired bars of points committed vs. completed per interval (TwoBars chart)

**Cards charts** (two-column row):
- `#cardsgoals` — percentage of cards committed vs. completed per interval (Line chart)
- `#cardscommitedvscompleted` — paired bars of cards committed vs. completed per interval (TwoBars chart)

**Issues / Blocked charts** (two-column row):
- `#issuesPerInterval` — line chart of issues per interval (Lines class)
- `#cardsBlocked` — line chart of blocked cards per interval (Lines class)

**Satisfaction chart** (`#satisfaction`, full width):
- Scatter/bubble chart of team and stakeholder satisfaction scores, rated 1–10 per sprint
- Team satisfaction: averaged from `satisfactionTeam` array per interval
- Stakeholder satisfaction: averaged from `satisfactionShareholders` array per interval
- Rendered by `Satisfaction` class

### 5. Backlog Link (optional)

Shown only if `project.json` includes a `backlog` URL. Renders a "Looking for the backlog?" paragraph with a primary button linking to that URL (new tab).

### 6. Updated Footer (optional)

Shown only if `dashboard.json` has both `updatedName` and `updatedDate`. Renders: `By: {name} Updated: {date}` in MM/DD/YYYY format.

### 7. Info Popups

Each chart with an `(i)` link has a corresponding `.overlay` popup rendered into `#popupContainer`. Popups are CSS-only (`:target` pseudo-class via anchor hash links). Each has a title, close `×` link, and explanatory content paragraph. Popup definitions live in `Model` and cover: Burnup, Timelines, Status, Points Committed vs. Completed, Sprint Goals (Points), Cards Committed vs. Completed, Sprint Goals (Cards), Card Type, Capacity, Velocity, Satisfaction, Cards, Issues Per Interval, Blocked Cards.

---

## Behavior

### Startup sequence

1. Inline `<script>` at top of `<body>` applies saved theme/palette classes to `<body>` before first paint (prevents flash)
2. `ThemeSwitcher` initializes — palette chips and mode toggle rendered into `#ls-palette-chips` and `.mode-toggle`; switching theme triggers a full page reload so charts re-render with updated colors
3. Tab-switching event listeners attached to all `.tab-btn` elements
4. `?team=` and `?project=` params read from the URL
5. If either is missing → `window.location.replace('./landing.html')`
6. If both present: `Store.sync()` runs in parallel with `GetData.setup()`; board, planner, and timeline panels initialize from `Store` data

### Chart rendering

`Scrum.setup()` calls `Templates.main(data)` to render the HTML skeleton (all chart `<div>` placeholders), sets `document.title` to `{projectName} ({teamName})`, then calls `draw()` which instantiates all chart objects and calls `render()` on each.

Charts re-render on `window resize` via a single registered listener (`Scrum.dboardWindowEvent`). The listener is removed on `pagehide` via `Scrum.destroy()`.

All chart colors are read from CSS custom properties (`--c-done`, `--c-inprogress`, `--c-todo`, `--c-satisfaction`, etc.) by `Colors.js` at render time, so charts automatically reflect the active palette.

### Project visit tracking

Each `{team, project}` pair is stored in `localStorage` key `scrum_url_data_0001` (array). This is used to populate the error state's "previously visited projects" list.

### Error state

If the JSON fetch fails (any of the three files returns a non-2xx response), `#main` is replaced with a `Templates.nodata()` error message:
- Heading: "DOH! There is not data available!"
- If `scrum_url_data_0001` has previous visits: lists them as links so the user can return to a working project
- Otherwise: suggests viewing the sample data at `./?team=abc&project=sample`

### Tab switching

Clicking a tab button:
1. Toggles `is-active` class on all `.tab-btn` elements
2. Sets `hidden` on all `.tab-panel` elements except the active one
3. If switching to Board/Planner/Timeline and that instance exists, calls its `.render()` method

The Dashboard panel (`#panel-dashboard`) has no re-render on tab switch — it renders once at load and persists.

---

## Out of Scope for MVP

- No URL `?tab=` param sync — the tab state is not reflected in or restored from the URL
- No per-interval drill-down view — clicking a chart does not navigate to sprint detail
- No real-time data refresh — data is fetched once at page load; no polling or websocket
- No print or export of charts
- No filtering, sorting, or date-range selection within the dashboard
- Slide deck review links are rendered but not playable inline (external links only)
- Notes popup (`#notesDescription`) is rendered in the template but its content is a placeholder ("content here"); notes per interval exist in the data model but are not surfaced in a dedicated UI
