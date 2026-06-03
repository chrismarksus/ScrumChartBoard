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

Vite will start and print the local URL (typically `http://localhost:9000`). Open that URL in a browser. On first run you will see the landing page. Add `team` and `project` query parameters to load the interactive app (Board + Planner + Timeline + Dashboard tabs):

```
http://localhost:9000?team=abc&project=sample
```

- Use `&tab=board|planner|timeline|dashboard` to deep-link a specific tab (URL updates on click, other params like `&apiBase=...` are preserved).
- The Board tab supports CSV import (with downloadable sample CSVs next to the button), "Import GitHub" (owner/repo + opt PAT; issues → backlog cards with label heuristics + points from title), drag-and-drop, inline title editing (dblclick), filter, and "Export JSON" (produces the three legacy files from live data). GitHub import is also available standalone from the JSON Editor.
- From the main dashboard (after loading with `?team=...&project=...`), use the **"JSON Editor"** link in the topbar (next to the palette switcher) to jump to the form editor. The link preserves your current team/project/apiBase. You can also visit `/editor.html?team=abc&project=sample` directly. The editor has a reciprocal "Open dashboard" link.
- For self-host server sync: append `&apiBase=http://localhost:3001` (or your server). A sync badge appears; board changes POST automatically. Start the companion server with `node server/index.js` (port 3001).
- For easy full self-host (SPA + API + samples + persistence in one container): see the Docker section in README.md. `docker-compose up --build` then http://localhost:8080?team=abc&project=sample&apiBase=http://localhost:8080 .

The server watches source files and hot-reloads on changes.

To expose the server on your local network (for phone/tablet access):

```bash
npm run dev:host
```

### AI Coding Assistant (Claude Code)

Prefix the command with `!` so the output appears directly in the conversation (works with Claude Code and similar agents):

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

### AI Coding Assistant (Claude Code)

Ask the AI coding assistant to run:

```
! npm test
```

This covers all unit specs instantly without starting a server. For E2E tests, start the dev server first, then ask the AI to run `npm run test:e2e`.

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

## Git Quick Reference

Most-used commands in this repo's workflow:

```bash
git status                          # check what's staged before committing
git checkout -b feat/<n>-<slug>     # create a feature branch (feat/, fix/, chore/)
git add <file>                      # stage specific files — avoid git add .
git commit -m "..."                 # commit after each logical change
git push -u origin <branch>         # push branch and set upstream in one shot
git pull origin master              # sync local master after a PR merges
git checkout master                 # switch back to master after branching
git diff                            # review staged + unstaged changes before committing
git reset --hard origin/master      # discard local commits and match remote master
git diff master...HEAD --stat       # survey all changes on the current branch at once
```

The three-dot form (`master...HEAD`) is the one most worth remembering — it shows everything on the current branch that hasn't been merged yet, exactly what you need before opening a PR.

### GitHub CLI (`gh`)

```bash
gh pr create --title "..." --body "..."       # open a PR with explicit title and body
gh pr create --fill                           # prefill title/body from branch name + commits (fast path)
gh pr checks <number> --watch                 # stream check status until all pass or fail
gh pr merge <number> --merge --delete-branch  # merge and delete the branch in one shot
gh run list --limit 5                         # see the most recent CI runs at a glance
gh run view <run-id> --log-failed             # jump straight to the failed step output
gh issue list --repo <owner>/<repo>           # find existing issues before creating a new one
gh issue create --repo <owner>/<repo> --title "..." --body "..."  # file a new issue
gh issue close <number> --repo <owner>/<repo> # close an issue after merging
gh release create v<x.x.x> --title "..." --notes "..."           # cut a release and trigger Pages deploy
```

### Bash

```bash
ls -la                   # list files with details including hidden files
cat <file>               # print file contents
mkdir -p <path>          # create directory including parents
rm -rf <path>            # recursive force delete
grep -n "pattern" <file> # search file with line numbers
find . -name "*.png"     # find files by name pattern
curl -sf <url>           # silent HTTP check (used in CI health-wait loops)
chmod +x <file>          # make a file executable
export VAR=value         # set an environment variable
npm run dev &            # run a process in the background
```

### PowerShell (Windows)

Common Unix commands don't exist in PowerShell — use these equivalents:

```powershell
Remove-Item <path>                          # rm
Remove-Item -Recurse -Force <path>          # rm -rf
Get-ChildItem                               # ls / find
Get-Content <file>                          # cat
Test-Path <path>                            # [ -f file ]
New-Item -ItemType Directory -Force <path>  # mkdir -p
(Get-Item <file>).Length                    # file size in bytes
$env:VAR_NAME                               # $VAR (read environment variable)
Select-String -Pattern "..." <file>         # grep
& "C:\path with spaces\tool.exe" arg1       # run executable with spaces in path
```

---

## Working with AI Coding Assistants

### Saving context / tokens

When debugging CI failures, go straight to the failure log instead of asking the AI coding assistant to read workflow files:

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

This is cheaper than a vague request like "the visual tests are too strict, can you loosen them", which causes the AI to search before it can act.

Start a new conversation when switching to an unrelated task. Context from earlier in a conversation is always in the window, even when stale — old debug output keeps costing tokens until you start fresh.

Keep `CLAUDE.md` lean — it is loaded on every conversation with the AI assistant, so any content that duplicates `CONTRIBUTIONS.md` or describes behaviour the AI could derive from the code is paid repeatedly. Periodic trimming compounds across every future session.

**Paste error output directly.** Instead of "the tests are failing", paste the actual error. The AI skips the diagnostic round-trip and goes straight to the fix.

**Batch related requests into one message.** Each turn has overhead regardless of length — "change X, Y, and Z" is cheaper than three separate messages.

**Don't ask the AI to verify its own work.** "Does it look right?" / "Are you sure?" causes re-reads. The edit tool errors on failure — if it didn't error, the change landed.

**Run quick checks yourself and only escalate failures.**

```
! npm test
! npm run lint
```

If they pass, move on. Only bring the AI assistant in if something breaks — and paste the output when you do.

**Don't ask for explanations of things you can read.** "What did you just change?" — the diff is right there. Asking the AI to narrate it generates tokens without adding information.

> **Note:** This project uses Claude Code (claude.ai/code) as the primary AI coding assistant. The tips above are tuned to its behavior and the `CLAUDE.md` + `.claude/commands/` setup.

---

## Code Style

ES6 classes with ES modules (`import`/`export default`). Single quotes enforced by ESLint (`npm run lint`). Keep new code consistent with existing patterns.
