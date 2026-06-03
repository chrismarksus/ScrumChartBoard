'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app      = express();
const DATA_DIR = path.join(__dirname, 'data');
const PORT     = process.env.PORT || 3001;

// CORS — allow the Vite dev server and any local origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '2mb' }));

// Sanitise a path segment to prevent directory traversal
function safe(s) {
  return String(s).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

function boardFile(team, project) {
  return path.join(DATA_DIR, `${safe(team)}_${safe(project)}.json`);
}

function validateParams(req, res) {
  const { team, project } = req.query;
  if (!team || !project) {
    res.status(400).json({ error: 'team and project query params are required' });
    return null;
  }
  return { team, project };
}

const EMPTY_BOARD = () => ({ cards: [], intervals: [], timelines: [] });

// GET /board?team=X&project=Y
app.get('/board', (req, res) => {
  const params = validateParams(req, res);
  if (!params) return;

  const file = boardFile(params.team, params.project);
  if (!fs.existsSync(file)) return res.json(EMPTY_BOARD());

  try {
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    res.status(500).json({ error: 'Failed to read board data' });
  }
});

// POST /board?team=X&project=Y
app.post('/board', (req, res) => {
  const params = validateParams(req, res);
  if (!params) return;

  const { cards, intervals, timelines } = req.body || {};
  if (!Array.isArray(cards) || !Array.isArray(intervals) || !Array.isArray(timelines)) {
    return res.status(400).json({ error: 'Body must contain cards, intervals, and timelines arrays' });
  }

  const file = boardFile(params.team, params.project);
  try {
    fs.writeFileSync(file, JSON.stringify({ cards, intervals, timelines }, null, 2));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to save board data' });
  }
});

// Serve sample teams/ data (json + csv) for the legacy GetData paths.
// Prefers dist/teams (after `npm run build`), falls back to test/teams for local self-host without build.
app.use('/teams', (req, res, next) => {
  let filePath = path.join(__dirname, '../dist/teams', req.url);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(process.cwd(), 'test/teams', req.url);
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    let contentType = 'application/octet-stream';
    if (ext === '.json') contentType = 'application/json';
    else if (ext === '.csv') contentType = 'text/csv; charset=utf-8';
    res.setHeader('Content-Type', contentType);
    res.end(fs.readFileSync(filePath));
  } else {
    next();
  }
});

// Serve the built static SPA (dist/) + API on the *same port* for easy self-host.
// Place *after* API routes so /board etc are handled by the API handlers above.
// SPA fallback serves index.html for client-side routes.
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { index: false }));
  app.get('*', (req, res) => {
    // Don't catch API paths
    if (req.path.startsWith('/board') || req.path.startsWith('/teams')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.listen(PORT, () => {
  console.log(`ScrumChartBoard server listening on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
  if (fs.existsSync(distPath)) {
    console.log(`Also serving built SPA from dist/ (open http://localhost:${PORT}?team=abc&project=sample )`);
    console.log(`For live board sync from the SPA, use ?apiBase=http://localhost:${PORT}`);
  }
});

module.exports = app;
