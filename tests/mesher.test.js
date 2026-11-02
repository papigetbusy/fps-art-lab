import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sphere, smoothUnion, union, withRole } from '../src/kit/sdf.js';
import { meshSdf, meshToBudget } from '../src/kit/mesher.js';
import { analyze } from '../src/kit/mesh_check.js';
import { testBlob } from '../src/kit/test_blob.js';

const R = 0.3, ball = sphere([0, 0, 0], R), box = { min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] };
const ballMesh = meshSdf(ball, { ...box, cell: 0.02 });
const radius = (m, v) => Math.hypot(m.positions[3 * v], m.positions[3 * v + 1], m.positions[3 * v + 2]);

test('A sphere meshes closed, in one piece, with no degenerate triangles', () => {
  const a = analyze(ballMesh);
  assert.ok(a.closed && a.components === 1 && a.degenerate === 0);
});
test('A meshed sphere has the right size and its faces point outward', () => {
  const exact = (4 / 3) * Math.PI * R ** 3, a = analyze(ballMesh);
  assert.ok(a.volume > 0, 'faces point outward');
  assert.ok(Math.abs(a.volume - exact) / exact < 0.01, 'within 1% of the true volume');
});
test("Every vertex of a meshed sphere sits on the sphere's surface", () => {
  for (let v = 0; v < ballMesh.positions.length / 3; v++) assert.ok(Math.abs(radius(ballMesh, v) - R) < 0.001);
});
test("A sphere's normals are unit length and point straight out", () => {
  for (let v = 0; v < ballMesh.normals.length / 3; v++) {
    const nx = ballMesh.normals[3 * v], ny = ballMesh.normals[3 * v + 1], nz = ballMesh.normals[3 * v + 2];
    assert.ok(Math.abs(Math.hypot(nx, ny, nz) - 1) < 1e-4);
    assert.ok((nx * ballMesh.positions[3 * v] + ny * ballMesh.positions[3 * v + 1] + nz * ballMesh.positions[3 * v + 2]) / radius(ballMesh, v) > 0.99);
  }
});
test('A mesh stays under its triangle budget and uses most of it', () => {
  for (const budget of [1000, 2000, 8000]) {
    const m = meshToBudget(ball, box, budget);
    assert.ok(m.triangles <= budget, `${m.triangles} > ${budget}`);
    assert.ok(m.triangles >= budget * 0.6, `${m.triangles} uses too little of ${budget}`);
  }
});
test('A smaller budget makes a coarser mesh of the same size', () => {
  const small = analyze(meshToBudget(ball, box, 500)), exact = (4 / 3) * Math.PI * R ** 3;
  assert.ok(small.closed && Math.abs(small.volume - exact) / exact < 0.04);
});
test('Two blended spheres mesh as one smooth piece with no stair-steps', () => {
  const blend = smoothUnion(0.12, sphere([-0.15, 0, 0], 0.2), sphere([0.15, 0, 0], 0.2));
  const a = analyze(meshSdf(blend, { ...box, cell: 0.02 }));
  assert.ok(a.closed && a.components === 1);
  assert.ok(a.maxNormalJump < 20, `normals jump ${a.maxNormalJump.toFixed(1)} degrees between neighbours`);
});
test('Two separate spheres mesh as two pieces', () => {
  assert.equal(analyze(meshSdf(union(sphere([-0.3, 0, 0], 0.15), sphere([0.3, 0, 0], 0.15)), { ...box, cell: 0.02 })).components, 2);
});
test('Meshing the same shape twice gives the identical mesh', () => {
  const again = meshSdf(ball, { ...box, cell: 0.02 });
  assert.deepEqual(again.positions, ballMesh.positions); assert.deepEqual(again.indices, ballMesh.indices);
});
test('A box with nothing in it meshes to nothing instead of crashing', () => {
  const far = { min: [3, 3, 3], max: [4, 4, 4] };
  assert.equal(meshSdf(ball, { ...far, cell: 0.1 }).triangles, 0);
  assert.equal(meshToBudget(ball, far, 1000).triangles, 0);
});
test('Triangle groups cover every triangle once, each with its own material role', () => {
  const skin = withRole(sphere([0, 0, 0], 0.25), 'skin'), gold = withRole(sphere([0.3, 0, 0], 0.12), 'gold');
  const m = meshSdf(union(skin, gold), { ...box, cell: 0.02, shapes: [skin, gold] });
  assert.deepEqual(m.groups.map((g) => g.role), ['skin', 'gold']);
  let next = 0;
  for (const g of m.groups) { assert.equal(g.start, next); next += g.count; assert.ok(g.count > 0); }
  assert.equal(next, m.indices.length);
});

test('The test blob stays under the monster budget and has skin, horn, gold and eye groups', () => {
  const blob = testBlob(), roles = new Set();
  let total = 0;
  for (const p of blob.parts) {
    const m = meshToBudget(p.sdf, { ...p.bounds, shapes: p.shapes }, Math.floor(blob.budget * p.share));
    total += m.triangles; for (const g of m.groups) roles.add(g.role);
  }
  assert.ok(total <= blob.budget, `${total} triangles`);
  for (const role of ['skin', 'horn', 'gold', 'eye']) assert.ok(roles.has(role), role);
});
test('The test blob horns mesh closed as two separate horns', () => {
  const blob = testBlob(), p = blob.parts.find((x) => x.name === 'horns');
  const a = analyze(meshToBudget(p.sdf, { ...p.bounds, shapes: p.shapes }, 1600));
  assert.ok(a.closed && a.components === 2);
});
test('The test blob body is one solid piece with unit-length normals and (almost) no stray edges', () => {
  const blob = testBlob(), p = blob.parts.find((x) => x.name === 'mass');
  const m = meshToBudget(p.sdf, { ...p.bounds, shapes: p.shapes }, 6400), a = analyze(m);
  assert.equal(a.components, 1); assert.equal(a.boundaryEdges, 0);
  assert.ok(a.nonManifoldEdges <= 4, `${a.nonManifoldEdges} doubled edges`); // naive Surface Nets can double an edge where the skin just grazes a cell corner
  for (let v = 0; v < m.normals.length / 3; v++) assert.ok(Math.abs(Math.hypot(m.normals[3 * v], m.normals[3 * v + 1], m.normals[3 * v + 2]) - 1) < 1e-4);
});
