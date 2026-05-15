import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:9000';
const outDir = join(__dirname, '..', 'screenshots');

await mkdir(outDir, { recursive: true });

const isCI = !!process.env.CI;
const browser = await puppeteer.launch({
  headless: isCI,
  devtools: !isCI,
  args: [
    ...(isCI ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] : ['--start-maximized']),
  ],
  defaultViewport: isCI ? { width: 1366, height: 768 } : null,
});

const page = await browser.pages().then(pages => pages[0]);
await page.goto(url, { waitUntil: 'networkidle2' });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = join(outDir, `screenshot-${timestamp}.png`);
await page.screenshot({ path: file, fullPage: true });

console.log(`Screenshot saved: ${file}`);
console.log('Browser open with DevTools — close it when done.');
