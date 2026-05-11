# Contributing

## Prerequisites

- Node.js 4+
- npm
- Bower (`npm install -g bower`)
- Chrome (for running the full browser test suite)

## Setup

```bash
git clone https://github.com/chrismarksus/ScrumChartBoard.git
cd ScrumChartBoard
npm install && bower install
```

---

## Running the App

### Bash / Linux

Start the dev server:

```bash
npx gulp serve
```

BrowserSync will start and print the local URL (typically `http://localhost:9000`). Open that URL in a browser. On first run you will see the no-data page. Add `team` and `project` query parameters to load your data:

```
http://localhost:9000?team=myTeam&project=myProject
```

The server watches source files and reloads the browser automatically on changes.

### Claude Code

Prefix the command with `!` so the output appears directly in the conversation:

```
! npx gulp serve
```

Claude Code can then use its built-in browser tools to navigate to the URL printed by BrowserSync and interact with the running app.

---

## Running the Tests

There are two ways to run tests depending on whether a browser is available.

### Full browser suite (Bash / Linux)

Requires Chrome to be installed with its shared libraries present. Start the test server, then run the suite against it:

```bash
# Terminal 1 – start the test server
npx gulp serve:test

# Terminal 2 – run tests headlessly
npx mocha-headless-chrome -f http://localhost:9000/
```

BrowserSync may pick a different port if 9000 is busy — check its startup output for the actual URL.

### Non-DOM tests only (Bash / Linux)

Runs Colors, Helper, GetData, and Model specs in Node.js without a browser. Useful in headless environments where Chrome is not available:

```bash
node test/node-runner.js
```

### Claude Code

Start the test server in the conversation:

```
! npx gulp serve
```

Wait for BrowserSync to print its URL, then ask Claude to run the tests:

> "Run the tests against http://localhost:9000"

Claude will use its browser tools to navigate to the test page, wait for Mocha to finish, and report the pass/fail summary. Alternatively, Claude can run the Node.js runner directly:

```
! node test/node-runner.js
```

---

## Chrome dependency note (Linux / WSL)

If `npx mocha-headless-chrome` fails with a shared library error, install the missing system packages:

```bash
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2t64
```

On Ubuntu 22.04 or earlier substitute `libasound2` for `libasound2t64`.

---

## Build

Compile to `dist/` for deployment:

```bash
npx gulp
```

---

## Code style

ES6. No linter is enforced beyond the `.eslintConfig` in `package.json` (single quotes, browser + Node globals). Keep new code consistent with the style around it.
