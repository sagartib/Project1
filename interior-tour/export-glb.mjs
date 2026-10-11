// Exports the apartment model to output/apartment.glb (+ lights.json) for the Blender/Cycles renders.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const outDir = path.resolve(process.argv[2] || path.join(ROOT, 'build'));
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
page.on('pageerror', (e) => console.error('[page error]', e.message));
page.on('console', (msg) => { if (msg.type() === 'error') console.error('[console]', msg.text()); });
await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, (route) => route.fulfill({
  path: path.join(ROOT, 'node_modules/three', route.request().url().replace(/^.*three@[^/]+\//, '')), contentType: 'text/javascript' }));
await page.route(/fonts\./, (route) => route.abort());
await page.goto(`http://localhost:${server.address().port}/index.html?export=1&w=320&h=180`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 });
const { glb, lights } = await page.evaluate(() => window.exportGLB());
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'apartment.glb'), Buffer.from(glb, 'base64'));
fs.writeFileSync(path.join(outDir, 'lights.json'), JSON.stringify(lights, null, 1));
console.log('wrote', path.join(outDir, 'apartment.glb'), (Buffer.from(glb, 'base64').length / 1e6).toFixed(1), 'MB');
await browser.close();
server.close();
