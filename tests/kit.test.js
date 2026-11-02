import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sphere, ellipsoid, capsule, roundBox, cone, torus, curveTube, catmull, union, subtract, intersect,
  smoothUnion, smoothSubtract, smoothIntersect, mirrorX, translate, scale, rotate, withRole, roleAt } from '../src/kit/sdf.js';

const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;

test("A sphere's distance is zero on its surface", () => { assert.ok(near(sphere([0, 0, 0], 1)([1, 0, 0]), 0)); });
test('An ellipsoid is zero on the end of each of its radii', () => {
  const e = ellipsoid([0, 0, 0], [0.3, 0.5, 0.2]);
  for (const p of [[0.3, 0, 0], [0, 0.5, 0], [0, 0, 0.2]]) assert.ok(near(e(p), 0, 1e-9));
});
test('A tapered capsule is thicker at its wide end', () => {
  const c = capsule([0, 0, 0], [0, 1, 0], 0.3, 0.1);
  assert.ok(c([0.2, 0, 0]) < 0 && c([0.2, 1, 0]) > 0);
});
test('A rounded box is zero on its face and inside at its centre', () => {
  const b = roundBox([0, 0, 0], [0.5, 0.2, 0.1], 0.02);
  assert.ok(near(b([0.5, 0, 0]), 0)); assert.ok(b([0, 0, 0]) < 0);
});
test('A rounded box corner is cut off by its rounding', () => {
  const sharp = roundBox([0, 0, 0], [1, 1, 1], 0), round = roundBox([0, 0, 0], [1, 1, 1], 0.2);
  assert.ok(sharp([0.99, 0.99, 0.99]) < 0 && round([0.99, 0.99, 0.99]) > 0);
});
test('A cone is wide at its base and has a sharp tip', () => {
  const c = cone([0, 0, 0], [0, 1, 0], 0.2, 0);
  assert.ok(near(c([0.2, 0.0001, 0]), 0, 1e-3)); assert.ok(near(c([0, 1, 0]), 0, 1e-9)); assert.ok(c([0.05, 0.9, 0]) > 0);
});
test('A torus is hollow in the middle', () => {
  const t = torus([0, 0, 0], 0.5, 0.05);
  assert.ok(near(t([0.55, 0, 0]), 0)); assert.ok(t([0, 0, 0]) > 0.4);
});
test('A curve passes through its first and last points', () => {
  const pts = [[0, 0, 0], [0.1, 0.2, 0], [0.3, 0.3, 0.1]];
  assert.deepEqual(catmull(pts, 0).map((v) => +v.toFixed(9)), pts[0]); assert.deepEqual(catmull(pts, 1).map((v) => +v.toFixed(9)), pts[2]);
});
test('A curve tube is thinner at its tip', () => {
  const horn = curveTube([[0, 0, 0], [0.1, 0.2, 0], [0.15, 0.45, 0.1]], 0.06, 0.005);
  assert.ok(horn([0.04, 0, 0]) < 0, 'base is thick');
  assert.ok(horn([0.19, 0.45, 0.1]) > 0, 'tip is thin');
});
test('Union keeps both shapes and subtract carves one out of the other', () => {
  const a = sphere([0, 0, 0], 1), b = sphere([1.5, 0, 0], 1);
  assert.ok(union(a, b)([1.5, 0, 0]) < 0);
  assert.ok(subtract(a, b)([0.9, 0, 0]) > 0 && subtract(a, b)([-0.5, 0, 0]) < 0);
  assert.ok(intersect(a, b)([0.75, 0, 0]) < 0 && intersect(a, b)([-0.5, 0, 0]) > 0);
});
test('Smooth union is never outside either shape where one shape is inside', () => {
  const a = sphere([0, 0, 0], 1), b = sphere([1.5, 0, 0], 1), u = smoothUnion(0.3, a, b);
  for (const p of [[0, 0, 0], [1.5, 0, 0], [0.75, 0, 0]]) assert.ok(u(p) <= Math.min(a(p), b(p)) + 1e-9);
});
test('Smooth union fills the crease where two limbs meet', () => {
  const a = capsule([0, 0, 0], [0, 1, 0], 0.1), b = capsule([0, 0.5, 0], [0.6, 0.5, 0], 0.1), crease = [0.12, 0.62, 0];
  assert.ok(union(a, b)(crease) > 0 && smoothUnion(0.12, a, b)(crease) < 0);
});
test('Smooth subtract carves an eye socket', () => {
  const head = sphere([0, 0, 0], 0.15), socket = sphere([0.05, 0.02, -0.15], 0.04), carved = smoothSubtract(0.02, head, socket);
  assert.ok(head([0.05, 0.02, -0.13]) < 0 && carved([0.05, 0.02, -0.13]) > 0);
  assert.ok(carved([0, 0, 0]) < 0, 'the rest of the head is still solid');
});
test('Smooth intersect is never bigger than the hard intersect', () => {
  const a = sphere([0, 0, 0], 1), b = sphere([1, 0, 0], 1), s = smoothIntersect(0.2, a, b), h = intersect(a, b);
  for (const p of [[0.5, 0, 0], [0.5, 0.8, 0], [0, 0, 0]]) assert.ok(s(p) >= h(p) - 1e-9);
});
test('Mirror on x makes a shape left/right symmetric', () => {
  const m = mirrorX(sphere([0.5, 0, 0], 0.2));
  assert.equal(m([0.5, 0, 0]), m([-0.5, 0, 0]));
});
test('Translate moves a shape and scale keeps distances in metres', () => {
  const s = translate(sphere([0, 0, 0], 0.1), [0, 1, 0]);
  assert.ok(near(s([0, 1.1, 0]), 0));
  const big = scale(sphere([0, 0, 0], 0.1), 2);
  assert.ok(near(big([0.2, 0, 0]), 0) && near(big([0.5, 0, 0]), 0.3));
});
test('Rotating a horn 90 degrees about Z turns it from pointing up to pointing sideways', () => {
  const horn = capsule([0, 0, 0], [0, 1, 0], 0.05), turned = rotate(horn, [0, 0, -Math.PI / 2]);
  assert.ok(horn([0, 0.9, 0]) < 0 && turned([0.9, 0, 0]) < 0 && turned([0, 0.9, 0]) > 0);
});
test('Each shape carries its material role and the nearest shape paints a point', () => {
  const skin = withRole(sphere([0, 0, 0], 0.2), 'skin'), horn = withRole(capsule([0, 0.2, 0], [0, 0.5, 0], 0.03), 'horn');
  assert.equal(skin.role, 'skin'); assert.equal(roleAt([skin, horn], [0, 0.45, 0]), 'horn'); assert.equal(roleAt([skin, horn], [0.1, 0, 0]), 'skin');
  assert.throws(() => withRole(skin, 'plastic'));
});
