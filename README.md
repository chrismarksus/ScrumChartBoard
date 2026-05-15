# ScrumChartBoard

A no-database web app that renders charts to visualize data a scrum master would care about. It loads three JSON files into the browser via fetch and renders Scrum metric charts using Chart.js.

This project started as a single HTML page with links to images generated in Excel. I eventually started filling out JSON files and having JavaScript render the charts. I still use Excel to generate backlog data that I transfer to JSON files in the `teams/` folder manually.

I use this to track team stats at work, as a practice project to stay current in JavaScript development, and to explore best practices in Scrum, DevOps, and Continuous Delivery.

## Using the project

:file_folder: [Get the latest release](https://github.com/chrismarksus/ScrumChartBoard/releases)

### First time

The starter release includes a `teams/` folder with sample data. Use that as a model for your own team data.

1. Download the starter release
1. Uncompress the archive
1. Copy the files to a folder on a web server
1. Navigate to that location in your browser

### Updating to a Newer Release

The update release does not include a `teams/` folder.

1. Download the update release
1. Uncompress the archive
1. Copy and overwrite the files in your web server folder

Copy the **contents** of the uncompressed folder — do not copy over the folder itself or you will overwrite the `teams/` directory and lose your data.

---

## Getting Started

These instructions will get the project running locally for development and testing. See [Deployment](#deployment) for production notes.

### Prerequisites

- Node.js 24 or higher
- npm
- Chrome — required for E2E and visual regression tests

To contribute you should be comfortable writing ES6 and unit tests.

### Installing

Clone the project:

```bash
cd my/projects
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

Build to `./dist/`:

```bash
npm run build
```

Copy or FTP the `dist/` contents to your web server. The expected folder structure is:

```
dist/
  assets/
  teams/
  favicon.ico
  index.html
  landing.html
  robots.txt
```

The `teams/` folder is not included in the build output — copy it separately from your working directory.

See [DATA_FORMAT.md](DATA_FORMAT.md) for the full JSON schema for `dashboard.json`, `project.json`, and `intervals.json`.

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
