// Headless browser helper for the picture-sheet tools: serves the repo, opens lab pages in Chromium, takes screenshots.
// Needs Playwright (`npm i -D playwright`, or any install that `import 'playwright'` can find).
//
// three.js normally comes from jsDelivr (the import map in lab/index.html). If the CDN is not reachable from where this
// runs, set THREE_DIR to a local three.js checkout (a folder that has build/ and examples/jsm/) and the CDN requests are
// answered from there instead. Nothing in the site itself changes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// require() (not import) so Playwright is found through NODE_PATH and global installs as well as node_modules
const { chromium } = createRequire(import.meta.url)('playwright');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.css': 'text/css', '.md': 'text/plain' };

// a tiny static server for the repo, on a free port
export function serveRepo(root = ROOT) {
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const index = path.join(file, 'index.html');
      if (file.startsWith(root) && fs.existsSync(index)) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(fs.readFileSync(index)); }
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) })));
}

// Chromium with software WebGL (SwiftShader), so it works on machines without a GPU
export async function openBrowser({ threeDir = process.env.THREE_DIR } = {}) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  if (threeDir) {
    await context.route(/^https:\/\/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, (route) => {
      const rel = new URL(route.request().url()).pathname.replace(/^\/npm\/three@[^/]+\//, '');
      const file = path.join(threeDir, rel);
      if (fs.existsSync(file)) route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
      else route.fulfill({ status: 404, body: 'missing in THREE_DIR: ' + rel });
    });
  }
  return { context, close: () => browser.close() };
}

// Opens lab/index.html?<query> and waits until the lab says it has drawn frames. Returns the page.
export async function openLab(context, baseUrl, query, { width = 1280, height = 720, timeout = 180000 } = {}) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  const problems = [];
  page.on('pageerror', (e) => problems.push('error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  await page.goto(`${baseUrl}/lab/index.html?${query}`);
  await page.waitForFunction(() => window.__labReady === true, null, { timeout });
  page.problems = problems;
  return page;
}

// a few numbers the lab exposes, to check the phone budget without a phone
export function labStats(page) {
  return page.evaluate(() => {
    const { renderer, scene, camera } = window.__lab;
    renderer.info.reset(); renderer.render(scene, camera);   // one plain scene pass, so the numbers are the scene's own (the composer's last pass is only 1 call)
    let lights = 0, shadowLights = 0;
    scene.traverse((o) => { if (o.isLight) { lights++; if (o.castShadow) shadowLights++; } });
    return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lights, shadowLights, textures: renderer.info.memory.textures };
  });
}
