import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const svg = await readFile(new URL('../public/social-card.svg', import.meta.url), 'utf8');
const inter = (await readFile(new URL('../src/assets/fonts/inter-latin-ng.woff2', import.meta.url))).toString('base64');
const fraunces = (await readFile(new URL('../src/assets/fonts/fraunces-latin-ng.woff2', import.meta.url))).toString('base64');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'chrome' : undefined, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900}@font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${fraunces}) format('woff2');font-weight:600}html,body{margin:0;width:1200px;height:630px}svg{display:block}</style>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await writeFile(new URL('../public/social-card.png', import.meta.url), png);
  console.log('Generated public/social-card.png (1200 × 630).');
} finally {
  await browser.close();
}
