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
export function demonSkin(size = 256, seed = 3) {
  const rand = rng(seed), [c, g] = canvas(size), [b, h] = canvas(size);
  g.fillStyle = '#44120f'; g.fillRect(0, 0, size, size); h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) { const x = rand() * size, y = rand() * size, r = 6 + rand() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r); const d = rand() < 0.5; gr.addColorStop(0, d ? 'rgba(30,6,6,0.35)' : 'rgba(120,40,30,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 26; i++) { const col = `rgba(${20 + rand() * 30},4,6,0.5)`; let x = rand() * size, y = rand() * size; for (const t of [g, h]) { t.strokeStyle = t === g ? col : 'rgba(255,255,255,0.5)'; t.lineWidth = 1 + rand() * 1.5; t.beginPath(); t.moveTo(x, y); } for (let k = 0; k < 8; k++) { const nx = x + (rand() - 0.5) * 40, ny = y + (rand() - 0.5) * 40; for (const t of [g, h]) t.lineTo(nx, ny); x = nx; y = ny; } for (const t of [g, h]) t.stroke(); }
  speckle(h, size, 3000, 1.2, 0.5, rand, false);
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return { map, bump };
}

// soft round blob for contact shadows and flame sprites
export function radial(inner = 'rgba(0,0,0,0.85)', outer = 'rgba(0,0,0,0)', size = 128) {
  const [c, g] = canvas(size), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
