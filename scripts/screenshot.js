import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:9000';
const outDir = join(__dirname, '..', 'screenshots');

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: false,
  devtools: true,
  args: ['--start-maximized'],
  defaultViewport: null,
});

const page = await browser.pages().then(pages => pages[0]);
await page.goto(url, { waitUntil: 'networkidle2' });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = join(outDir, `screenshot-${timestamp}.png`);
await page.screenshot({ path: file, fullPage: true });

console.log(`Screenshot saved: ${file}`);
console.log('Browser open with DevTools — close it when done.');
