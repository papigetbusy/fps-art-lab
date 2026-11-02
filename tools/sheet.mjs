// Picture sheet: node tools/sheet.mjs <name> [--size 480x270]
// Writes previews/<name>/sheet.png (+ index.html, scores.json):
//   row 1  front, side, three-quarter, top renders, lit with the real look (light=both, phone preset)
//   row 2  the reference pictures from references/creatures/<name>/ (front.png, side.png, three.png, top.png), or a "no reference yet" tile
//   row 3  silhouette overlay (ours red, reference blue, both white) and an overlap score; ours alone when there is no reference
// Silhouette renders come from the same lab with ?sil=1 (flat white on black), so the score does not depend on lighting.
import fs from 'node:fs';
import path from 'node:path';
import { serveRepo, openBrowser, openLab, ROOT } from './lib/browser.mjs';

const name = process.argv[2];
if (!name) { console.error('usage: node tools/sheet.mjs <name> [--size 480x270]'); process.exit(1); }
const sizeArg = process.argv.includes('--size') ? process.argv[process.argv.indexOf('--size') + 1] : '480x270';
const [TW, TH] = sizeArg.split('x').map(Number);
const VIEWS = ['front', 'side', 'three', 'top'], SCORED = ['front', 'side'], MIN = 0.8;
const outDir = path.join(ROOT, 'previews', name), refDir = path.join(ROOT, 'references', 'creatures', name);
fs.mkdirSync(outDir, { recursive: true });
const lab = name === 'placeholder' ? '' : `&creature=${name}`;          // creatures other than the placeholder arrive in Step 6

const server = await serveRepo(), browser = await openBrowser();
const b64 = (f) => fs.readFileSync(f).toString('base64');
try {
  // one page per kind; switch the camera with the lab's own setView so the shaders compile only once
  const shots = { lit: {}, sil: {} };
  for (const kind of ['lit', 'sil']) {
    const page = await openLab(browser.context, server.url, `view=front&still=1&ui=0&preset=phone&light=both&flicker=0${kind === 'sil' ? '&sil=1' : ''}${lab}`, { width: TW * 2, height: TH * 2 });
    for (const v of VIEWS) {
      await page.evaluate((view) => { window.__lab.setView(view); window.__f0 = window.__lab.frames; }, v);
      await page.waitForFunction(() => window.__lab.frames >= window.__f0 + 3, null, { timeout: 120000 });
      shots[kind][v] = (await page.screenshot({ timeout: 120000 })).toString('base64');
    }
    if (page.problems.length) console.error('page problems:', page.problems);
    await page.close();
  }
  const refs = {};
  for (const v of VIEWS) for (const ext of ['png', 'jpg', 'jpeg', 'webp']) { const f = path.join(refDir, `${v}.${ext}`); if (fs.existsSync(f)) { refs[v] = { b64: b64(f), mime: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg' }; break; } }
  const isPlaceholder = name === 'placeholder';

  // compose in a page (canvas), using the same pure silhouette maths the tests cover
  const page = await browser.context.newPage(); await page.goto(`${server.url}/tools/README.md`);   // any page on the same server, so the script can import the pure maths
  await page.setContent('<canvas id=c></canvas>'); await page.goto(`${server.url}/index.html`).catch(() => {});
  const result = await page.evaluate(async ({ shots, refs, TW, TH, VIEWS, SCORED, MIN, name, isPlaceholder, base }) => {
    const S = await import(base + '/tools/lib/silhouette.js');
    const load = (mime, b) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = `data:${mime};base64,${b}`; });
    const pixels = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data }; };
    const PAD = 12, LABEL = 26, ROWS = 3, W = PAD + VIEWS.length * (TW + PAD), H = LABEL + ROWS * (TH + LABEL + PAD) + 40;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = '#0b0807'; g.fillRect(0, 0, W, H); g.font = '600 16px sans-serif'; g.textBaseline = 'middle';
    g.fillStyle = '#d9b36a'; g.fillText(`${name}${isPlaceholder ? '  (PLACEHOLDER: lab stand-in, not final art)' : ''}   |   light=both, phone preset`, PAD, 16);
    const cell = (r, i) => [PAD + i * (TW + PAD), LABEL + r * (TH + LABEL + PAD) + LABEL];
    const label = (r, i, text, col = '#c9b89a') => { const [x, y] = cell(r, i); g.fillStyle = col; g.font = '14px sans-serif'; g.fillText(text, x, y - 12); };
    const fit = (img, x, y) => { const k = Math.min(TW / img.width, TH / img.height), w = img.width * k, h = img.height * k; g.drawImage(img, x + (TW - w) / 2, y + (TH - h) / 2, w, h); };
    const scores = {};
    for (let i = 0; i < VIEWS.length; i++) {
      const v = VIEWS[i], lit = await load('image/png', shots.lit[v]), sil = await load('image/png', shots.sil[v]);
      let [x, y] = cell(0, i); g.fillStyle = '#000'; g.fillRect(x, y, TW, TH); fit(lit, x, y); label(0, i, `${v}  (render)`);
      const ours = (({ w, h, d }) => S.maskFromRGBA(d, w, h, 'light'))(pixels(sil));
      [x, y] = cell(1, i); g.fillStyle = '#16100e'; g.fillRect(x, y, TW, TH);
      let theirs = null;
      if (refs[v]) { const ri = await load(refs[v].mime, refs[v].b64); fit(ri, x, y); label(1, i, `${v}  (reference)`); const p = pixels(ri); theirs = S.maskFromRGBA(p.d, p.w, p.h, 'corner'); }
      else { g.fillStyle = '#6d5f50'; g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText(isPlaceholder ? 'no reference (placeholder)' : 'NO REFERENCE YET', x + TW / 2, y + TH / 2); g.textAlign = 'left'; label(1, i, `${v}  (reference)`); }
      [x, y] = cell(2, i); g.fillStyle = '#0c0a0a'; g.fillRect(x, y, TW, TH);
      const N = 128, rgba = theirs ? S.overlayRGBA(ours, theirs, N) : S.maskToRGBA(ours, N), small = document.createElement('canvas'); small.width = small.height = N;
      small.getContext('2d').putImageData(new ImageData(rgba, N, N), 0, 0); g.imageSmoothingEnabled = false; const k = Math.min(TW, TH) / N; g.drawImage(small, x + (TW - N * k) / 2, y, N * k, N * k); g.imageSmoothingEnabled = true;
      let text = `${v}  silhouette: ours alone`, col = '#c9b89a';
      if (theirs) { const sc = S.silhouetteScore(ours, theirs); scores[v] = Math.round(sc * 1000) / 1000; const need = SCORED.includes(v); const pass = !need || sc >= MIN; text = `${v}  match ${sc.toFixed(2)}${need ? (pass ? '  OK (>= ' + MIN + ')' : '  BELOW ' + MIN) : ''}`; col = pass ? '#8fd18f' : '#ff7a7a'; }
      label(2, i, text, col);
    }
    g.fillStyle = '#8a7a66'; g.font = '13px sans-serif'; g.fillText('row 3: ours = red, reference = blue, overlap = white. Score = overlap / union after aligning the bounding boxes.', PAD, H - 18);
    return { png: cv.toDataURL('image/png').split(',')[1], scores };
  }, { shots, refs, TW, TH, VIEWS, SCORED, MIN, name, isPlaceholder, base: server.url });
  fs.writeFileSync(path.join(outDir, 'sheet.png'), Buffer.from(result.png, 'base64'));
  fs.writeFileSync(path.join(outDir, 'scores.json'), JSON.stringify({ name, placeholder: isPlaceholder, scores: result.scores, needs: { front: MIN, side: MIN } }, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} picture sheet</title>
<style>body{margin:0;background:#0b0807;color:#d9c9a8;font:16px/1.5 system-ui,sans-serif}main{max-width:1000px;margin:0 auto;padding:16px}img{width:100%;height:auto;border:1px solid #3a2a22}a{color:#e0b060}</style></head><body><main>
<h1>${name} picture sheet</h1>${isPlaceholder ? '<p><b>PLACEHOLDER</b>: this is the lab stand-in demon, not final art. It is here to prove the sheet works.</p>' : ''}
<img src="sheet.png" alt="Front, side, three-quarter and top renders, reference pictures, and silhouette overlays"><p>Silhouette scores: <code>${JSON.stringify(result.scores)}</code> (front and side need 0.80 or more).</p>
<p><a href="../../lab/index.html?light=both">Open the live lab</a> · <a href="../../lab/index.html?light=candle">candles only</a> · <a href="../../lab/index.html?light=torch">torches only</a></p></main></body></html>\n`);
  console.log(JSON.stringify({ sheet: path.relative(ROOT, path.join(outDir, 'sheet.png')), scores: result.scores }));
} finally { await browser.close(); await server.close(); }
