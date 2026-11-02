// Silhouette maths for the picture sheet. Pure (no browser, no files), so `node --test` can check it.
// A mask is { w, h, data } where data[i] is 1 inside the shape, 0 outside.

// Turns RGBA pixels into a mask. mode 'light' = bright pixels are the shape (our flat white-on-black renders),
// 'alpha' = opaque pixels are the shape, 'corner' = anything unlike the top-left corner colour is the shape (reference pictures).
export function maskFromRGBA(rgba, w, h, mode = 'light', threshold = 60) {
  const data = new Uint8Array(w * h);
  const cr = rgba[0], cg = rgba[1], cb = rgba[2];
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2], a = rgba[i * 4 + 3];
    if (mode === 'light') data[i] = (r + g + b) / 3 > 128 && a > 128 ? 1 : 0;
    else if (mode === 'alpha') data[i] = a > 128 ? 1 : 0;
    else data[i] = a > 128 && Math.abs(r - cr) + Math.abs(g - cg) + Math.abs(b - cb) > threshold ? 1 : 0;
  }
  return { w, h, data };
}

export function bounds(m) {
  let x0 = m.w, y0 = m.h, x1 = -1, y1 = -1;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.data[y * m.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Crops to the shape, scales it (keeping its proportions) so its taller side fills `size`, and centres it on a size x size grid.
// This is what "bounding-box alignment" means: two pictures at different zoom or position can still be compared.
export function normalize(m, size = 128) {
  const b = bounds(m), out = { w: size, h: size, data: new Uint8Array(size * size) };
  if (!b) return out;
  const k = size / Math.max(b.w, b.h), ow = Math.round(b.w * k), oh = Math.round(b.h * k), ox = Math.floor((size - ow) / 2), oy = Math.floor((size - oh) / 2);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    const sx = b.x0 + Math.min(b.w - 1, Math.floor(x / k)), sy = b.y0 + Math.min(b.h - 1, Math.floor(y / k));
    out.data[(oy + y) * size + ox + x] = m.data[sy * m.w + sx];
  }
  return out;
}

// Intersection over union of two masks after alignment: 1 = identical shape, 0 = nothing in common.
export function silhouetteScore(a, b, size = 128) {
  const A = normalize(a, size), B = normalize(b, size);
  let inter = 0, union = 0;
  for (let i = 0; i < A.data.length; i++) { const p = A.data[i], q = B.data[i]; if (p && q) inter++; if (p || q) union++; }
  return union === 0 ? 0 : inter / union;
}

// A picture of the comparison: both = white, ours only = red, reference only = blue. Returns RGBA at size x size.
export function overlayRGBA(a, b, size = 128) {
  const A = normalize(a, size), B = normalize(b, size), out = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const p = A.data[i], q = B.data[i]; const [r, g, bl] = p && q ? [235, 235, 235] : p ? [220, 50, 50] : q ? [60, 110, 230] : [12, 10, 10];
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = bl; out[i * 4 + 3] = 255;
  }
  return out;
}
export function maskToRGBA(m, size = 128) { const A = normalize(m, size), out = new Uint8ClampedArray(size * size * 4); for (let i = 0; i < size * size; i++) { const v = A.data[i] ? 225 : 12; out[i * 4] = v; out[i * 4 + 1] = v; out[i * 4 + 2] = v; out[i * 4 + 3] = 255; } return out; }

// Mask for a picture of a dark figure on a near-black, softly lit background (the Horned Fiend turnaround sheet):
// bright-enough pixels are the figure, except in the bottom strip where an orange floor glow lies, where only dark-red skin counts.
export function maskFromFigure(rgba, w, h, { glowFromY = 0.84, minLight = 30 } = {}) {
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, r = rgba[i], g = rgba[i + 1], b = rgba[i + 2], light = (r + g + b) / 3;
    const body = light > minLight || (r > 38 && r > g * 1.4);
    data[y * w + x] = y / h > glowFromY ? (body && r > 52 && g < r * 0.42 && b < r * 0.6 ? 1 : 0) : (body ? 1 : 0);
  }
  return { w, h, data };
}

// Drops stray specks: keeps the biggest connected blob and any other blob at least `minFrac` of its size (a hand or a tail tip that
// the mask cut loose stays; label text, noise and floor glints go). Diagonal neighbours count as connected.
export function keepLargest(m, minFrac = 0.01) {
  const { w, h, data } = m, label = new Int32Array(w * h), sizes = [0], stack = [];
  let n = 0;
  for (let s0 = 0; s0 < w * h; s0++) {
    if (!data[s0] || label[s0]) continue;
    n++; let size = 0; label[s0] = n; stack.push(s0);
    while (stack.length) {
      const p = stack.pop(); size++;
      const x = p % w, y = (p - x) / w;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = yy * w + xx; if (data[q] && !label[q]) { label[q] = n; stack.push(q); }
      }
    }
    sizes.push(size);
  }
  const big = Math.max(0, ...sizes), out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (label[i] && sizes[label[i]] >= big * minFrac) out[i] = 1;
  return { w, h, data: out };
}
