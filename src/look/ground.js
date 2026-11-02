// Ground: a dark flagstone disc that fades into the dark, plus a soft contact shadow under the subject.
// The stone texture is generated in code (no downloads): irregular flagstone cells, thin worn seams, gentle mottling.
import * as THREE from 'three';

function rng(seed) { // small seeded random so the floor looks the same every load
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// smooth value noise, tileable over a 64-cell lattice
function makeNoise(seed) {
  const r = rng(seed), N = 64, g = new Float32Array(N * N).map(() => r());
  const at = (x, y) => g[((y % N) + N) % N * N + (((x % N) + N) % N)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return (at(xi, yi) * (1 - u) + at(xi + 1, yi) * u) * (1 - v) + (at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u) * v;
  };
}

function makeFlagstone(n = 512, cells = 8) {
  const r = rng(11), noise = makeNoise(5);
  const pts = [];
  for (let gy = 0; gy < cells; gy++) for (let gx = 0; gx < cells; gx++) {
    pts.push({ x: (gx + 0.15 + 0.7 * r()) / cells, y: (gy + 0.15 + 0.7 * r()) / cells, tone: 0.95 + 0.1 * r() });
  }
  const colour = document.createElement('canvas'); colour.width = colour.height = n;
  const height = document.createElement('canvas'); height.width = height.height = n;
  const cc = colour.getContext('2d'), hc = height.getContext('2d');
  const ci = cc.createImageData(n, n), hi = hc.createImageData(n, n);
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    const u = px / n, v = py / n;
    let f1 = 9, f2 = 9, tone = 1;
    const cx = Math.floor(u * cells), cy = Math.floor(v * cells);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const gx = cx + ox, gy = cy + oy;
      const p = pts[((gy % cells) + cells) % cells * cells + (((gx % cells) + cells) % cells)];
      const dx = p.x + Math.floor(gx / cells) - u, dy = p.y + Math.floor(gy / cells) - v;
      const d = Math.hypot(dx, dy);
      if (d < f1) { f2 = f1; f1 = d; tone = p.tone; } else if (d < f2) f2 = d;
    }
    const edge = f2 - f1;                                   // 0 on a seam, grows toward a stone's middle
    const seam = smooth(0.0, 0.012, edge);                  // thin dark joint
    const bevel = 0.8 + 0.2 * smooth(0.0, 0.05, edge);      // worn, rounded stone edge
    const m = noise(u * 18, v * 18) * 0.6 + noise(u * 52, v * 52) * 0.3 + noise(u * 130, v * 130) * 0.1;
    const wear = 0.82 + 0.36 * m;                           // gentle mottling, not per-block noise
    const k = (0.2 + 0.8 * seam) * bevel * wear * tone;
    const i = (py * n + px) * 4;
    ci.data[i] = 62 * k + 6; ci.data[i + 1] = 53 * k + 5; ci.data[i + 2] = 47 * k + 5; ci.data[i + 3] = 255; // dark warm stone (sRGB)
    const h = 255 * (seam * bevel * (0.85 + 0.15 * m));
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = h; hi.data[i + 3] = 255;
  }
  cc.putImageData(ci, 0, 0); hc.putImageData(hi, 0, 0);
  const map = new THREE.CanvasTexture(colour); map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(height);
  for (const t of [map, bump]) { t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return { map, bump };
}

function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, col] of stops) grad.addColorStop(at, col);
  g.fillStyle = grad; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function createGround({ radius = 3.2, textureSize = 512 } = {}) {
  const group = new THREE.Group();
  const { map, bump } = makeFlagstone(textureSize);
  const fade = radialTexture([[0, '#fff'], [0.55, '#fff'], [1, '#000']]); // floor melts into the dark at its rim
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 96),
    new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: 0.86, metalness: 0, alphaMap: fade, transparent: true }),
  );
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  group.add(floor);

  // contact shadow: a soft dark blob right under the feet, on top of the real shadow, to ground the subject
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(0,0,0,0.75)'], [0.5, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false, toneMapped: false }),
  );
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.003; blob.renderOrder = 1;
  group.add(blob);

  // call with the subject's footprint in metres (width, depth) so the blob fits it
  group.setContactShadow = (width, depth) => blob.scale.set(width * 1.5, depth * 1.5, 1);
  group.setContactShadow(1.0, 0.7);
  return group;
}
