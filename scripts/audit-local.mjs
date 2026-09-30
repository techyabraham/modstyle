import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = resolve('dist');
const temp = resolve('.lhci-tmp');
await mkdir(temp, { recursive: true });
const lighthouseFolder = (await readdir('node_modules/.pnpm')).find(name => name.startsWith('lighthouse@'));
if (!lighthouseFolder) throw new Error('Install @lhci/cli first');
const lighthousePath = resolve('node_modules/.pnpm', lighthouseFolder, 'node_modules/lighthouse/core/index.js');
const { default: lighthouse } = await import(pathToFileURL(lighthousePath).href);

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  let path;
  try { path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const relative = path === '/' ? 'index.html' : path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
  const file = resolve(output, relative);
  if (file !== output && !file.startsWith(`${output}/`) && !file.startsWith(`${output}\\`)) { response.writeHead(403).end(); return; }
  try { const body = await readFile(file); response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(body); }
  catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const sitePort = server.address().port;

const probe = createServer();
await new Promise(done => probe.listen(0, '127.0.0.1', done));
const debugPort = probe.address().port;
await new Promise(done => probe.close(done));
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-extensions', `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${join(temp, `chrome-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); if (response.ok) { ready = true; break; } }
    catch { /* Chrome has not opened its debugging port yet. */ }
    await new Promise(done => setTimeout(done, 250));
  }
  if (!ready) throw new Error('Chrome debugging port did not open');
  const reports = [];
  for (let index = 0; index < 3; index++) {
    const result = await lighthouse(`http://127.0.0.1:${sitePort}/`, {
      port: debugPort, output: 'json', logLevel: 'error', formFactor: 'mobile',
      throttling: { cpuSlowdownMultiplier: 4 },
    });
    if (!result) throw new Error('Lighthouse returned no result');
    reports.push(result.lhr);
    await writeFile(join(temp, `report-${index + 1}.json`), JSON.stringify(result.lhr));
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)]));
    console.log(`Run ${index + 1}: ${JSON.stringify(scores)}`);
  }
  const median = values => [...values].sort((a, b) => a - b)[1];
  const categories = Object.fromEntries(Object.keys(reports[0].categories).map(key => [key, median(reports.map(report => Math.round(report.categories[key].score * 100)))]));
  const audits = Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map(key => [key, median(reports.map(report => report.audits[key].numericValue))]));
  const resources = Object.fromEntries(['total', 'script', 'stylesheet'].map(key => [key, median(reports.map(report => report.audits['resource-summary'].details.items.find(item => item.resourceType === key).transferSize))]));
  const summary = { categories, audits, resources };
  await writeFile(join(temp, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Median: ${JSON.stringify(summary)}`);
  const limits = [
    ['Performance score', categories.performance, 90, 'min'],
    ['Accessibility score', categories.accessibility, 95, 'min'],
    ['Best Practices score', categories['best-practices'], 95, 'min'],
    ['SEO score', categories.seo, 95, 'min'],
    ['LCP ms', audits['largest-contentful-paint'], 2500, 'max'],
    ['CLS', audits['cumulative-layout-shift'], 0.1, 'max'],
    ['Total blocking time ms', audits['total-blocking-time'], 200, 'max'],
    ['Transfer bytes', resources.total, 800000, 'max'],
    ['Script bytes', resources.script, 60000, 'max'],
    ['Stylesheet bytes', resources.stylesheet, 40000, 'max'],
  ];
  const failures = limits.filter(([, actual, limit, direction]) => direction === 'min' ? actual < limit : actual > limit);
  if (failures.length) throw new Error(`Lighthouse budget failed: ${JSON.stringify(failures)}`);
} finally {
  chrome.kill();
  server.close();
}
