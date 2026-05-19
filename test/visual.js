import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASE      = process.env.E2E_URL || 'http://localhost:9000';
const SAMPLE    = `${BASE}/dashboard.html?team=abc&project=sample&__vt__=1`;
const THRESHOLD     = 0.2 / 100; // 0.2% — tolerates sub-pixel rendering differences across OS/Chrome versions
const SIZE_TOLERANCE = 3;         // px — tolerates minor cross-platform line-height differences

const UPDATE    = process.argv.includes('--update-snapshots');

const DIR_BASELINE = path.resolve('screenshots/baseline');
const DIR_CURRENT  = path.resolve('screenshots/current');
const DIR_DIFF     = path.resolve('screenshots/diff');

const CI_ARGS = (process.env.CI || process.getuid?.() === 0)
  ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  : [];

let browser;
let page;
let passed = 0;
let failed = 0;

function ensureDirs() {
  for (const dir of [DIR_BASELINE, DIR_CURRENT, DIR_DIFF]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function setup() {
  browser = await puppeteer.launch({ headless: true, args: CI_ARGS });
  page    = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('scrum_theme_0001', JSON.stringify({ theme: 'light', palette: 'forest' }));
  });
}

async function teardown() {
  await browser.close();
}

function readPng(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function () { resolve(this); })
      .on('error', reject);
  });
}

async function waitForFonts() {
  await page.evaluate(() => document.fonts.ready);
}

async function freezeAnimations() {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; animation-duration: 0s !important; }'
  });
}

async function snap(name) {
  const currentPath  = path.join(DIR_CURRENT,  `${name}.png`);
  const baselinePath = path.join(DIR_BASELINE, `${name}.png`);
  const diffPath     = path.join(DIR_DIFF,      `${name}.png`);

  await page.screenshot({ path: currentPath, fullPage: true });

  if (UPDATE) {
    fs.copyFileSync(currentPath, baselinePath);
    console.log(`  ✎ baseline updated: ${name}`);
    return;
  }

  if (!fs.existsSync(baselinePath)) {
    console.error(`  ✘ ${name}: no baseline found — run with --update-snapshots first`);
    failed++;
    process.exitCode = 1;
    return;
  }

  const [img1, img2] = await Promise.all([readPng(baselinePath), readPng(currentPath)]);

  if (img1.width !== img2.width || Math.abs(img1.height - img2.height) > SIZE_TOLERANCE) {
    console.error(`  ✘ ${name}: size mismatch (${img1.width}x${img1.height} vs ${img2.width}x${img2.height})`);
    failed++;
    process.exitCode = 1;
    return;
  }

  const h    = Math.min(img1.height, img2.height);
  const diff = new PNG({ width: img1.width, height: h });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, h, { threshold: 0.1 });
  const totalPixels = img1.width * h;
  const diffRatio   = diffPixels / totalPixels;

  if (diffRatio > THRESHOLD) {
    diff.pack().pipe(fs.createWriteStream(diffPath));
    console.error(`  ✘ ${name}: ${(diffRatio * 100).toFixed(3)}% pixels differ (threshold ${(THRESHOLD * 100).toFixed(1)}%) — diff: ${diffPath}`);
    failed++;
    process.exitCode = 1;
  } else {
    console.log(`  ✔ ${name}`);
    passed++;
  }
}

// ── Scenarios ────────────────────────────────────────────────────────────────

async function scenarioDashboard() {
  await page.goto(SAMPLE, { waitUntil: 'networkidle2' });
  await waitForFonts();
  await freezeAnimations();
  await snap('dashboard');
}

async function scenarioNoData() {
  await page.goto(`${BASE}/dashboard.html`, { waitUntil: 'networkidle2' });
  await waitForFonts();
  await freezeAnimations();
  await snap('no-data');
}

async function scenarioOverlay() {
  await page.goto(SAMPLE, { waitUntil: 'networkidle2' });
  await waitForFonts();
  await freezeAnimations();
  const link = await page.$('a.description');
  if (link) {
    await link.click();
    await page.waitForSelector('.overlay:target', { timeout: 3000 }).catch(() => {});
  }
  await snap('overlay');
}

async function scenarioLanding() {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle2' });
  await waitForFonts();
  await freezeAnimations();
  await snap('landing');
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  ensureDirs();
  await setup();

  if (UPDATE) {
    console.log('\n  Capturing baselines...');
  } else {
    console.log('\n  Visual regression tests');
  }

  await scenarioDashboard();
  await scenarioNoData();
  await scenarioOverlay();
  await scenarioLanding();

  if (!UPDATE) {
    console.log(`\n  ${passed} passed, ${failed} failed\n`);
  } else {
    console.log('');
  }

  await teardown();
})();
