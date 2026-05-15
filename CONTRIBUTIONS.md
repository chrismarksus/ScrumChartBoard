# Contributing

## Prerequisites

- Node.js 24+
- npm
- Chrome (for E2E and visual regression tests)

## Setup

```bash
git clone https://github.com/chrismarksus/ScrumChartBoard.git
cd ScrumChartBoard
npm install
```

---

## Running the App

Start the dev server:

```bash
npm run dev
```

Vite will start and print the local URL (typically `http://localhost:9000`). Open that URL in a browser. On first run you will see the landing page. Add `team` and `project` query parameters to load dashboard data:

```
http://localhost:9000?team=abc&project=sample
```

The server watches source files and hot-reloads on changes.

### Claude Code

Prefix the command with `!` so the output appears directly in the conversation:

```
! npm run dev
```

---

## Running the Tests

### Lint

```bash
npm run lint
```

### Unit tests (no browser required)

Runs all specs — Colors, ThemeSwitcher, Templates, Helper, GetData, Model, all chart classes, and Scrum — in Node.js without a browser. Uses [jsdom](https://github.com/jsdom/jsdom) for the DOM environment. Fastest feedback during development:

```bash
npm test
```

### E2E tests

Uses Puppeteer to drive Chrome. Requires the dev server to be running first:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

### Visual regression tests

Compares screenshots against baselines in `screenshots/baseline/`. Requires the dev server to be running first:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:visual
```

To update baselines after intentional UI changes:

```bash
npm run test:visual:update
```

Commit the updated `screenshots/baseline/*.png` files along with your change.

### Claude Code

Ask Claude to run:

```
! npm test
```

This covers all unit specs instantly without starting a server. For E2E tests, start the dev server first, then ask Claude to run `npm run test:e2e`.

---

## Screenshots

Take a screenshot of the running app (opens Chrome):

```bash
npm run screenshot
npm run screenshot -- "http://localhost:9000?team=abc&project=sample"
```

---

## Build

Compile to `dist/` for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Workflow

Every change should have a GitHub issue.

1. Search for an existing issue: `gh issue list --repo chrismarksus/ScrumChartBoard`
2. If none exists, create one: `gh issue create --repo chrismarksus/ScrumChartBoard --title "..." --body "..."`
3. Reference the issue number in your commit message (e.g. `closes #42`)
4. After pushing, close the issue: `gh issue close <number> --repo chrismarksus/ScrumChartBoard`

---

## Code Style

ES6 classes with ES modules (`import`/`export default`). Single quotes enforced by ESLint (`npm run lint`). Keep new code consistent with existing patterns.
