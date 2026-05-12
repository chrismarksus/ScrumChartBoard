# ScrumChartBoard

A no-database web page that renders charts to visualize data a scrum master would care about. It loads 3 JSON files into the browser via Ajax request.

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

- Node.js 16 or higher
- npm
- Bower (`npm install -g bower`) — manages front-end runtime dependencies
- Chrome — required for the full browser test suite

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
npm install && bower install
```

### Running the dev server

```bash
npx gulp serve
```

BrowserSync will start and print the local URL (typically `http://localhost:9000`). On first run you will see the no-data page. Add `team` and `project` query parameters matching your `teams/` folder structure to load your data:

```
http://localhost:9000?team=abc&project=sample
```

---

## Running the tests

See [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for full details including Claude Code instructions and Linux/WSL Chrome setup.

### Node.js runner (no browser required)

Covers all chart and model specs using jsdom. The fastest way to get feedback during development:

```bash
node test/node-runner.js
```

### Full browser suite

Requires Chrome. Covers the complete suite including Scrum integration:

```bash
# Terminal 1
npx gulp serve:test

# Terminal 2 — use the port printed by BrowserSync
npx mocha-headless-chrome -f http://localhost:9000/
```

---

## Using Docker

```bash
docker run -it --rm --name scrumchartboard -v $(pwd):/myproject -p 9000:9000 node bash
```

**On Windows** with Vagrant or Docker you may see a symlink error. Install dependencies with:

```bash
npm --no-bin-links i -g gulp bower
npm --no-bin-links i
```

To find the container's IP address on Windows:

```bash
docker-machine ip
```

---

## Deployment

Build to `./dist/`:

```bash
npx gulp
```

Copy or FTP the `dist/` contents to your web server. The expected folder structure is:

```
dist/
  scripts/
  styles/
  teams/
  template/
  favicon.ico
  index.html
  robots.txt
```

The `teams/` folder is not included in the build output — copy it separately from your working directory.

See [DATA_FORMAT.md](DATA_FORMAT.md) for the full JSON schema for `dashboard.json`, `project.json`, and `intervals.json`.

---

## Built With

* [Node](https://nodejs.org/en/) - Build tooling and dependency management
* [Bower](https://bower.io/) - Front-end dependency management
* [flotr2](http://www.humblesoftware.com/flotr2/) - Chart library
* [jQuery](https://jquery.com/) - DOM and Ajax
* [Handlebars](http://handlebarsjs.com/) - Template engine
* [Skeleton](http://getskeleton.com/) - CSS grid framework
* [markdown-it](https://github.com/markdown-it/markdown-it) - Client-side Markdown renderer
* [Mocha](https://mochajs.org/) - Test framework
* [Blanket](http://blanketjs.org/) - Client-side code coverage
* [Gulp](http://gulpjs.com/) - Task runner
* [BrowserSync](https://browsersync.io/) - Dev server with live reload

---

## Contributing

Please read [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for dev setup, how to run the tests, and how to submit pull requests.

## Versioning

[SemVer](http://semver.org/). See [tags](https://github.com/chrismarksus/ScrumChartBoard/tags) for available versions.

## Authors

* **Chris Marks** - [chrismarksus](https://github.com/chrismarksus)

See also the list of [contributors](https://github.com/chrismarksus/ScrumChartBoard/graphs/contributors).
