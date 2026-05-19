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

## Working with Claude Code

### Saving context / tokens

When debugging CI failures, go straight to the failure log instead of asking Claude to read workflow files:

```
! gh run list --limit 5
! gh run view <run-id> --log-failed
```

When you only need specific values from a file, search rather than reading the whole file:

```
! grep -n "THRESHOLD\|SIZE_TOLERANCE" test/visual.js
```

To review what changed on the current branch without reading individual files:

```
! git diff master...HEAD --stat
! git diff master...HEAD -- <file>
```

Use `/compact` before switching to a new sub-problem — not just when context is already full. Compacting mid-session costs the same as compacting at the end, so doing it earlier keeps the next task cheaper.

Include the file path and line number in your request to skip the explore phase entirely:

> "Change the `THRESHOLD` constant at `test/visual.js:9` from `0.2` to `0.5`"

This is cheaper than a vague request like "the visual tests are too strict, can you loosen them", which causes Claude to search before it can act.

Start a new conversation when switching to an unrelated task. Context from earlier in a conversation is always in the window, even when stale — old debug output keeps costing tokens until you start fresh.

Keep `CLAUDE.md` lean — it is loaded on every conversation, so any content that duplicates `CONTRIBUTIONS.md` or describes behaviour Claude could derive from the code is paid repeatedly. Periodic trimming compounds across every future session.

**Paste error output directly.** Instead of "the tests are failing", paste the actual error. Claude skips the diagnostic round-trip and goes straight to the fix.

**Batch related requests into one message.** Each turn has overhead regardless of length — "change X, Y, and Z" is cheaper than three separate messages.

**Don't ask Claude to verify its own work.** "Does it look right?" / "Are you sure?" causes re-reads. The edit tool errors on failure — if it didn't error, the change landed.

**Run quick checks yourself and only escalate failures.**

```
! npm test
! npm run lint
```

If they pass, move on. Only bring Claude in if something breaks — and paste the output when you do.

**Don't ask for explanations of things you can read.** "What did you just change?" — the diff is right there. Asking Claude to narrate it generates tokens without adding information.

---

## Code Style

ES6 classes with ES modules (`import`/`export default`). Single quotes enforced by ESLint (`npm run lint`). Keep new code consistent with existing patterns.
