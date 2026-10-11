// Renders the guided tour frame-by-frame in headless Chromium and encodes an MP4.
// Usage: node render.mjs [--fps 30] [--w 1280] [--h 720] [--from 0] [--to 148] [--stills t1,t2,...] [--out out/virtual-tour.mp4]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const fps = +(args.fps || 30), W = +(args.w || 1280), H = +(args.h || 720);
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const outFile = path.resolve(args.out || path.join(ROOT, 'output/virtual-tour.mp4'));
const framesDir = path.resolve(args.frames || path.join(ROOT, '.frames'));

// static server: serves the project; maps the CDN three.js imports to node_modules
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, (route) => {
  const rel = route.request().url().replace(/^.*three@[^/]+\//, '');
  route.fulfill({ path: path.join(ROOT, 'node_modules/three', rel), contentType: 'text/javascript' });
});
await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.continue().catch(() => route.abort()));
await page.goto(`http://localhost:${port}/index.html?render=1&w=${W}&h=${H}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 });
await page.evaluate(() => document.fonts.ready);

async function shot(t, file) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
}

if (args.stills) {
  const dir = path.resolve(args.outdir || path.join(ROOT, 'output/stills'));
  fs.mkdirSync(dir, { recursive: true });
  for (const t of args.stills.split(',').map(Number)) {
    const f = path.join(dir, `t${String(t).padStart(6, '0')}.jpg`);
    const s = Date.now();
    await shot(t, f);
    console.log('still', t, f, `${Date.now() - s}ms`);
  }
} else {
  const from = +(args.from || 0), to = +(args.to ?? (await page.evaluate(() => 148)));
  fs.mkdirSync(framesDir, { recursive: true });
  const n0 = Math.round(from * fps), n1 = Math.round(to * fps);
  const start = Date.now();
  for (let n = n0; n <= n1; n++) {
    const f = path.join(framesDir, `f${String(n).padStart(6, '0')}.jpg`);
    if (!fs.existsSync(f)) await shot(n / fps, f);
    if (n % 60 === 0) {
      const el = (Date.now() - start) / 1000, done = n - n0 + 1;
      console.log(`frame ${n}/${n1}  ${(el / done).toFixed(2)}s/frame  eta ${((n1 - n) * el / done / 60).toFixed(1)} min`);
    }
  }
  if (!args.noencode) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    execFileSync('ffmpeg', ['-y', '-framerate', String(fps), '-start_number', String(n0), '-i', path.join(framesDir, 'f%06d.jpg'),
      '-frames:v', String(n1 - n0 + 1), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: 'inherit' });
    console.log('wrote', outFile);
  }
}
await browser.close();
server.close();
