import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sphere, capsule, smoothUnion, mirrorX } from '../src/kit/sdf.js';

test("A sphere's distance is zero on its surface", () => {
  assert.ok(Math.abs(sphere([0, 0, 0], 1)([1, 0, 0])) < 1e-9);
});
test('A tapered capsule is thicker at its wide end', () => {
  const c = capsule([0, 0, 0], [0, 1, 0], 0.3, 0.1);
  assert.ok(c([0.2, 0, 0]) < 0 && c([0.2, 1, 0]) > 0);
});
test('Smooth union is never outside either shape where one shape is inside', () => {
  const a = sphere([0, 0, 0], 1), b = sphere([1.5, 0, 0], 1), u = smoothUnion(0.3, a, b);
  for (const p of [[0, 0, 0], [1.5, 0, 0], [0.75, 0, 0]]) assert.ok(u(p) <= Math.min(a(p), b(p)) + 1e-9);
});
test('Mirror on x makes a shape left/right symmetric', () => {
  const m = mirrorX(sphere([0.5, 0, 0], 0.2));
  assert.equal(m([0.5, 0, 0]), m([-0.5, 0, 0]));
});
