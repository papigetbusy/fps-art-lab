// Plain-sentence checks for the silhouette score used by the picture sheet.
import test from 'node:test';
import assert from 'node:assert/strict';
import { silhouetteScore, maskFromRGBA, normalize, bounds } from '../tools/lib/silhouette.js';
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
