// Procedural textures painted on small canvases (no downloads). Look-only.
import * as THREE from 'three';

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function canvas(size) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
function speckle(g, size, n, r, alpha, rand, light) {
  for (let i = 0; i < n; i++) { const v = light ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${alpha * rand()})`; g.beginPath(); g.arc(rand() * size, rand() * size, r * (0.3 + rand()), 0, 7); g.fill(); }
}

// worn flagstones: colour map + bump map from the same layout
export function flagstones(size = 512, seed = 7) {
  const rand = rng(seed), [c, g] = canvas(size), [b, h] = canvas(size);
  g.fillStyle = '#16110f'; g.fillRect(0, 0, size, size); h.fillStyle = '#000'; h.fillRect(0, 0, size, size);
  const rows = 4, rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rand() * rowH;
    while (x < size) {
      const w = rowH * (0.8 + rand() * 0.9), gap = 5;
      const l = 30 + rand() * 18, tint = rand() * 6;
      g.fillStyle = `rgb(${l + tint + 6},${l + 2},${l - 2})`; g.fillRect(x + gap, r * rowH + gap, w - gap * 2, rowH - gap * 2);
      h.fillStyle = `rgb(${150 + rand() * 60},${150},${150})`; h.fillRect(x + gap, r * rowH + gap, w - gap * 2, rowH - gap * 2);
      x += w;
    }
  }
  speckle(g, size, 1800, 2.2, 0.25, rand, false); speckle(g, size, 900, 1.6, 0.06, rand, true);
  speckle(h, size, 2500, 2, 0.35, rand, false);
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(0,0,0,${0.2 + rand() * 0.3})`; g.lineWidth = 1; g.beginPath(); let px = rand() * size, py = rand() * size; g.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (rand() - 0.5) * 30; py += (rand() - 0.5) * 30; g.lineTo(px, py); } g.stroke(); }
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; }
  return { map, bump };
}

// leathery demon skin: mottled colour and a pore/vein bump
export function demonSkin(size = 512, seed = 3) {
  // Step 6b: lean, wet, sinewy skin like the turnaround: small leathery pebbles, long tendon strands and creases, redder in the sinew, near-black in the cracks.
  const rand = rng(seed), [c, g] = canvas(size), [b, h] = canvas(size);
  g.fillStyle = '#3a0f0d'; g.fillRect(0, 0, size, size); h.fillStyle = '#707070'; h.fillRect(0, 0, size, size);
  for (let i = 0; i < 120; i++) { const x = rand() * size, y = rand() * size, r = 14 + rand() * 50, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rand() < 0.5 ? 'rgba(14,3,3,0.4)' : 'rgba(130,34,26,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }   // blotchy light and dark patches
  const wrapDraw = (fn) => { for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) fn(ox, oy); };         // tile edges match, so box-mapped skin has no seams
  // pebbles: a dome with a dark rim, in both the colour and the bump map
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size, y = rand() * size, r = 3 + rand() * 5.5, sq = 0.65 + rand() * 0.5, rot = rand() * 3.14;
    wrapDraw((ox, oy) => { if (x + ox < -r || y + oy < -r || x + ox > size + r || y + oy > size + r) return;
      const gb = h.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); gb.addColorStop(0, 'rgba(255,255,255,0.55)'); gb.addColorStop(0.6, 'rgba(180,180,180,0.25)'); gb.addColorStop(1, 'rgba(0,0,0,0.55)');
      h.fillStyle = gb; h.beginPath(); h.ellipse(x + ox, y + oy, r, r * sq, rot, 0, 7); h.fill();
      g.strokeStyle = 'rgba(8,1,1,0.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + ox, y + oy, r, r * sq, rot, 0, 7); g.stroke(); });
  }
  // tendons and sinew: long, slightly wavy strands running mostly along the limb, raised and a little redder and glossier
  for (let i = 0; i < 70; i++) {
    let x = rand() * size, y = rand() * size; const len = 80 + rand() * 220, lw = 1.5 + rand() * 3.5, drift = (rand() - 0.5) * 0.5; const pts = [[x, y]];
    for (let k = 0; k < 10; k++) { x += drift * 10 + (rand() - 0.5) * 8; y += len / 10; pts.push([x, y]); }
    wrapDraw((ox, oy) => { for (const [t, col, w2] of [[h, 'rgba(255,255,255,0.45)', lw], [h, 'rgba(0,0,0,0.4)', lw + 2.2], [g, 'rgba(150,40,30,0.38)', lw]]) {
      if (t === h && col.startsWith('rgba(0')) { t.strokeStyle = col; t.lineWidth = w2; t.beginPath(); pts.forEach(([px, py], j) => (j ? t.lineTo(px + ox + 3, py + oy) : t.moveTo(px + ox + 3, py + oy))); t.stroke(); continue; }
      t.strokeStyle = col; t.lineWidth = w2; t.beginPath(); pts.forEach(([px, py], j) => (j ? t.lineTo(px + ox, py + oy) : t.moveTo(px + ox, py + oy))); t.stroke(); } });
  }
  // creases
  for (let i = 0; i < 40; i++) { let x = rand() * size, y = rand() * size; const pts = [[x, y]]; for (let k = 0; k < 6; k++) { x += (rand() - 0.5) * 50; y += (rand() - 0.5) * 50; pts.push([x, y]); }
    wrapDraw((ox, oy) => { for (const [t, col] of [[g, 'rgba(6,1,2,0.6)'], [h, 'rgba(0,0,0,0.6)']]) { t.strokeStyle = col; t.lineWidth = 1.2 + rand() * 1.2; t.beginPath(); pts.forEach(([px, py], j) => (j ? t.lineTo(px + ox, py + oy) : t.moveTo(px + ox, py + oy))); t.stroke(); } }); }
  speckle(h, size, 4000, 1.0, 0.35, rand, false);
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return { map, bump };
}

// soft round blob for contact shadows and flame sprites
export function radial(inner = 'rgba(0,0,0,0.85)', outer = 'rgba(0,0,0,0)', size = 128) {
  const [c, g] = canvas(size), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// rotten cloth: stained dark crimson weave with torn holes (colour map + alpha map, used with alphaTest)
export function rottenCloth(size = 256, seed = 9) {
  const rand = rng(seed), [c, g] = canvas(size), [a, h] = canvas(size);
  g.fillStyle = '#3a0a0e'; g.fillRect(0, 0, size, size); h.fillStyle = '#fff'; h.fillRect(0, 0, size, size);
  for (let i = 0; i < 160; i++) { const x = rand() * size, y = rand() * size, r = 10 + rand() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rand() < 0.6 ? 'rgba(10,2,2,0.5)' : 'rgba(110,70,40,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; for (let i = 0; i < size; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, size); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(size, i); g.stroke(); }
  h.fillStyle = '#000'; for (let i = 0; i < 14; i++) { const x = rand() * size, y = rand() * size, rx = 3 + rand() * 12, ry = 3 + rand() * 12; h.beginPath(); h.ellipse(x, y, rx, ry, rand() * 3, 0, 7); h.fill(); }
  const map = new THREE.CanvasTexture(c), alpha = new THREE.CanvasTexture(a);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, alpha]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return { map, alpha };
}

// candle wax: a pale, slightly greasy material with drip streaks (moved here from the candle code so every prop shares it)
export function waxTexture() {
  const rand = rng(5), [c, x] = canvas(64); c.height = 128; x.fillStyle = '#d9cbb0'; x.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 22; i++) { const px = rand() * 64, len = 20 + rand() * 80; x.fillStyle = `rgba(${rand() < 0.5 ? '255,248,225' : '170,150,115'},0.35)`; x.fillRect(px, 0, 2 + rand() * 4, len); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 1.5, color: 0xcdbd9c, roughness: 0.5, emissive: 0x3a1a08, emissiveIntensity: 0.6 });
}
