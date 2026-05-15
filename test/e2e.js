import puppeteer from 'puppeteer';
import assert from 'assert';

const BASE = process.env.E2E_URL || 'http://localhost:9000';
const SAMPLE = `${BASE}?team=abc&project=sample`;

const CI_ARGS = process.env.CI
  ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  : [];

let browser;
let page;

async function setup() {
  browser = await puppeteer.launch({ headless: true, args: CI_ARGS });
  page = await browser.newPage();
}

async function teardown() {
  await browser.close();
}

async function run(label, fn) {
  try {
    await fn();
    console.log(`  ✔ ${label}`);
  } catch (err) {
    console.error(`  ✘ ${label}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// ── Smoke: dashboard loads with data ────────────────────────────────────────
async function smokeDashboard() {
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto(SAMPLE, { waitUntil: 'networkidle2' });

  await run('renders dashboard title', async () => {
    const title = await page.$eval('h1.headline', el => el.textContent.trim());
    assert.ok(title.length > 0, 'Expected dashboard title to be non-empty');
  });

  await run('renders project and team headings', async () => {
    const project = await page.$('h2.headline.project');
    const team    = await page.$('h5.headline.team');
    assert.ok(project, 'Missing h2.headline.project');
    assert.ok(team,    'Missing h5.headline.team');
  });

  await run('renders sprint review buttons', async () => {
    const buttons = await page.$$('#slideDecks .button');
    assert.ok(buttons.length > 0, 'Expected at least one sprint review button');
  });

  await run('renders chart canvases', async () => {
    const canvases = await page.$$('canvas');
    assert.ok(canvases.length > 0, 'Expected at least one chart canvas');
  });

  await run('renders burndown chart container', async () => {
    const el = await page.$('#burndown');
    assert.ok(el, 'Missing #burndown chart container');
  });

  await run('renders velocity tile', async () => {
    const el = await page.$('#velocity .number');
    assert.ok(el, 'Missing velocity number');
    const text = await page.$eval('#velocity .number', n => n.textContent.trim());
    assert.ok(text.length > 0, 'Velocity number is empty');
  });

  await run('renders capacity tile', async () => {
    const el = await page.$('#daysCapacity .number');
    assert.ok(el, 'Missing capacity number');
  });

  await run('renders estimated cards percentage', async () => {
    const el = await page.$('#estimatedCards .number');
    assert.ok(el, 'Missing estimated cards number');
  });

  await run('no console errors', async () => {
    assert.strictEqual(consoleErrors.length, 0,
      `Console errors: ${consoleErrors.join(', ')}`);
  });
}

// ── No-data state ────────────────────────────────────────────────────────────
async function noDataState() {
  await page.goto(BASE, { waitUntil: 'networkidle2' });

  await run('redirects to landing page when no params', async () => {
    const url = page.url();
    assert.ok(url.includes('landing.html'), `Expected redirect to landing.html, got: "${url}"`);
  });

  await run('shows sample data link', async () => {
    const link = await page.$('a[href*="team=abc"]');
    assert.ok(link, 'Expected a link to sample data');
  });
}

// ── Popup / overlay ──────────────────────────────────────────────────────────
async function popupOverlay() {
  await page.goto(SAMPLE, { waitUntil: 'networkidle2' });

  await run('overlay is hidden by default', async () => {
    const overlay = await page.$('.overlay');
    assert.ok(overlay, 'No .overlay element found');
    const opacity = await page.$eval('.overlay', el =>
      window.getComputedStyle(el).opacity
    );
    assert.strictEqual(opacity, '0', `Expected overlay opacity 0, got ${opacity}`);
  });

  await run('description link opens overlay', async () => {
    const link = await page.$('a.description');
    assert.ok(link, 'No .description link found');
    await link.click();
    await page.waitForFunction(
      () => document.querySelector('.overlay:target') !== null,
      { timeout: 2000 }
    );
    const targeted = await page.$('.overlay:target');
    assert.ok(targeted, 'Overlay did not become :target after clicking description link');
  });

  await run('close link dismisses overlay', async () => {
    const close = await page.$('.overlay:target .close');
    assert.ok(close, 'No .close link inside active overlay');
    const closeHref = await close.evaluate(el => el.getAttribute('href'));
    await page.evaluate(href => { window.location.hash = href.replace('#', ''); }, closeHref);
    await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
    const stillTargeted = await page.$('.overlay:target');
    assert.strictEqual(stillTargeted, null, 'Overlay should be dismissed after close');
  });
}

// ── Sprint tab active state ──────────────────────────────────────────────────
async function sprintTabs() {
  await page.goto(SAMPLE, { waitUntil: 'networkidle2' });

  await run('at least one sprint button is primary by default', async () => {
    const primary = await page.$('#slideDecks .button-primary');
    assert.ok(primary, 'Expected at least one .button-primary sprint button');
  });

  await run('non-primary button does not have button-primary class', async () => {
    const buttons = await page.$$('#slideDecks .button');
    if (buttons.length < 2) return;
    const classes = await buttons[0].evaluate(el => el.className);
    const isPrimary = classes.includes('button-primary');
    const allPrimary = await page.$$eval('#slideDecks .button',
      els => els.every(el => el.classList.contains('button-primary'))
    );
    assert.ok(!allPrimary, 'Not all buttons should be primary');
  });
}

// ── Landing page ─────────────────────────────────────────────────────────────
const LANDING = `${BASE}/landing.html`;

async function landingPage() {
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto(LANDING, { waitUntil: 'networkidle2' });

  await run('no console errors', async () => {
    assert.strictEqual(consoleErrors.length, 0,
      `Console errors: ${consoleErrors.join(', ')}`);
  });

  await run('dark mode toggle adds theme-dark class', async () => {
    await page.$eval('.ls-mode-span[data-mode="dark"]', el => el.click());
    const cls = await page.$eval('body', el => el.className);
    assert.ok(cls.includes('theme-dark'), `Expected theme-dark on body, got: "${cls}"`);
  });

  await run('palette chip updates body palette class', async () => {
    await page.$eval('.ls-chip[data-palette="electric"]', el => el.click());
    const cls = await page.$eval('body', el => el.className);
    assert.ok(cls.includes('palette-electric'), `Expected palette-electric on body, got: "${cls}"`);
  });

  await run('palette section card click marks it active', async () => {
    await page.$eval('.palette-card[data-palette="warm"]', el => el.click());
    const cls = await page.$eval('.palette-card[data-palette="warm"]', el => el.className);
    assert.ok(cls.includes('is-active'), `Expected is-active on warm palette card, got: "${cls}"`);
  });

  await run('footer GitHub link points to repo', async () => {
    const href = await page.$eval('.footer-links a[href*="github.com"]', el => el.getAttribute('href'));
    assert.strictEqual(href, 'https://github.com/chrismarksus/ScrumChartBoard',
      `Unexpected footer GitHub href: "${href}"`);
  });

  await run('final CTA GitHub link points to repo', async () => {
    const href = await page.$eval('.final-cta a[href*="github.com"]', el => el.getAttribute('href'));
    assert.strictEqual(href, 'https://github.com/chrismarksus/ScrumChartBoard',
      `Unexpected final CTA GitHub href: "${href}"`);
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  await setup();

  console.log('\n  Smoke — dashboard with data');
  await smokeDashboard();

  console.log('\n  No-data state');
  await noDataState();

  console.log('\n  Popup / overlay');
  await popupOverlay();

  console.log('\n  Sprint tab state');
  await sprintTabs();

  console.log('\n  Landing page');
  await landingPage();

  console.log('');
  await teardown();
})();
