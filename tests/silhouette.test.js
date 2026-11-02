// Plain-sentence checks for the silhouette score used by the picture sheet.
import test from 'node:test';
import assert from 'node:assert/strict';
import { silhouetteScore, maskFromRGBA, normalize, bounds, keepLargest, maskFromFigure } from '../tools/lib/silhouette.js';
import { LIGHT_MODES, pickLightMode, flicker, FLAME, CANDLE_BUDGET } from '../src/look/candle.js';

const rect = (w, h, x0, y0, x1, y1) => { const data = new Uint8Array(w * h); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) data[y * w + x] = 1; return { w, h, data }; };

test('the same shape scores 1', () => assert.equal(silhouetteScore(rect(100, 100, 20, 10, 60, 90), rect(100, 100, 20, 10, 60, 90)), 1));
test('the same shape in another place and at another zoom still scores about 1 (bounding boxes are aligned)', () => {
  const s = silhouetteScore(rect(100, 100, 10, 10, 39, 69), rect(300, 300, 100, 50, 189, 229));
  assert.ok(s > 0.95, `score ${s}`);
});
test('a wide shape against a tall shape scores low', () => assert.ok(silhouetteScore(rect(100, 100, 0, 40, 99, 59), rect(100, 100, 40, 0, 59, 99)) < 0.3));
test('an empty picture scores 0 and does not crash', () => assert.equal(silhouetteScore(rect(10, 10, 0, 0, -1, -1), rect(10, 10, 2, 2, 5, 5)), 0));
test('flat white on black becomes a mask of exactly the white pixels', () => {
  const px = new Uint8Array(4 * 4 * 4).fill(0); for (let i = 0; i < 16; i++) px[i * 4 + 3] = 255;
  for (const i of [5, 6, 9, 10]) px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 255;
  const m = maskFromRGBA(px, 4, 4, 'light'); assert.equal(m.data.reduce((a, b) => a + b, 0), 4); assert.deepEqual(bounds(m), { x0: 1, y0: 1, x1: 2, y1: 2, w: 2, h: 2 });
});
test('normalising keeps the proportions of the shape', () => { const n = normalize(rect(200, 200, 0, 0, 99, 49), 64); const b = bounds(n); assert.equal(b.w, 64); assert.equal(b.h, 32); });

test('every light mode exists, and an unknown name falls back to "both"', () => {
  for (const k of ['candle', 'torch', 'both']) assert.ok(LIGHT_MODES[k]);
  assert.equal(pickLightMode('nonsense'), 'both'); assert.equal(pickLightMode(undefined), 'both');
});
test('candle mode has no torches, torch mode has no candles, both has both', () => {
  assert.equal(LIGHT_MODES.candle.torches, 0); assert.equal(LIGHT_MODES.torch.candles, 0);
  assert.ok(LIGHT_MODES.both.torches > 0 && LIGHT_MODES.both.candles > 0);
});
test('flame flicker is gentle: never more than the set depth from steady, and never a strobe', () => {
  let prev = flicker(0, 2);
  for (let t = 0; t < 20; t += 1 / 60) { const f = flicker(t, 2); assert.ok(Math.abs(f - 1) <= FLAME.depth + 1e-9); assert.ok(Math.abs(f - prev) < 0.03, "frame-to-frame jump"); prev = f; }
});
test('the phone preset uses fewer candle lights than the high preset', () => assert.ok(CANDLE_BUDGET.phone.pointLights < CANDLE_BUDGET.high.pointLights));

test('Specks are dropped but a big loose piece (a hand, a tail tip) stays', () => {
  const m = rect(60, 60, 5, 5, 30, 50), d = m.data; d[58 * 60 + 58] = 1; for (let y = 5; y < 12; y++) for (let x = 40; x < 46; x++) d[y * 60 + x] = 1;
  const k = keepLargest(m, 0.02); assert.equal(k.data[58 * 60 + 58], 0, 'speck gone'); assert.equal(k.data[6 * 60 + 41], 1, 'loose piece kept'); assert.equal(k.data[20 * 60 + 20], 1);
});
test('A dark figure on a black background becomes a mask, and the orange floor glow at the bottom is ignored', () => {
  const w = 10, h = 10, px = new Uint8Array(w * h * 4); for (let i = 0; i < w * h; i++) { px[i * 4] = 10; px[i * 4 + 1] = 10; px[i * 4 + 2] = 12; px[i * 4 + 3] = 255; }
  const put = (x, y, r, g, b) => { const i = (y * w + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; };
  put(4, 3, 90, 20, 30); put(4, 9, 80, 55, 25);                       // skin in the body, glow at the floor
  const m = maskFromFigure(px, w, h); assert.equal(m.data[3 * w + 4], 1); assert.equal(m.data[9 * w + 4], 0);
});

// ---- Step 6b: the solid outline
import { solidify, figureMask } from '../tools/lib/silhouette.js';
test('A solid outline fills holes inside a shape but keeps the empty space outside it', () => {
  const w = 20, h = 20, data = new Uint8Array(w * h);
  for (let y = 4; y < 16; y++) for (let x = 4; x < 16; x++) data[y * w + x] = 1;
  data[10 * w + 10] = 0;                                  // a pin-hole in the middle
  const out = solidify({ w, h, data }, 1);
  assert.equal(out.data[10 * w + 10], 1);
  assert.equal(out.data[1 * w + 1], 0);
});
test('The figure outline counts dark red skin as the figure and plain dark grey as the background', () => {
  const w = 12, h = 12, rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) { const inside = (i % w) > 3 && (i % w) < 8 && Math.floor(i / w) > 2 && Math.floor(i / w) < 9; rgba.set(inside ? [14, 4, 2, 255] : [15, 15, 15, 255], i * 4); }
  const m = figureMask(rgba, w, h, { floorFrom: 2 });
  assert.equal(m.data[5 * w + 5], 1);
  assert.equal(m.data[0], 0);
});
