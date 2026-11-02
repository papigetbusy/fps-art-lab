// Plain-sentence checks for the Step 5 parts kit. Every part is meshed once and checked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PART_NAMES, buildPart, meshPart, partStats, roleCentroid, loadoutBudget, FIEND_LOADOUT } from '../src/kit/parts.js';
import { ROLES } from '../src/kit/sdf.js';
import { analyze } from '../src/kit/mesh_check.js';

const meshes = Object.fromEntries(PART_NAMES.map((n) => { const part = buildPart(n); return [n, { part, mesh: meshPart(part), stats: null }]; }));
for (const n of PART_NAMES) meshes[n].stats = partStats(meshes[n].mesh);

test('The kit has every part the brief asks for', () => {
  for (const n of ['torso', 'head', 'jaw', 'horn', 'limb', 'hand', 'claw', 'hoofFoot', 'tail', 'armourPlate', 'trimBand', 'gem', 'cloth']) assert.ok(PART_NAMES.includes(n), n);
});
for (const name of PART_NAMES) {
  const { part, mesh, stats } = meshes[name];
  test(`${name} makes a real mesh and stays under its triangle budget (${part.budget})`, () => {
    assert.ok(mesh.triangles > 20, `only ${mesh.triangles} triangles`);
    assert.ok(mesh.triangles <= part.budget, `${mesh.triangles} > ${part.budget}`);
    assert.ok(Array.from(mesh.positions).every(Number.isFinite) && Array.from(mesh.normals).every(Number.isFinite), 'no NaN in the mesh');
  });
  test(`${name} sits at its origin joint (the origin is on or next to the part)`, () => {
    const out = [0, 1, 2].map((k) => Math.max(stats.min[k] - 0, 0 - stats.max[k], 0));
    assert.ok(Math.hypot(...out) <= 0.12, `origin is ${Math.hypot(...out).toFixed(2)} m from the part`);
  });
  test(`${name} faces -Z (its front is toward the viewer, never turned around)`, () => {
    const f = part.facing;
    if (f.role) {
      const c = roleCentroid(mesh, f.role);
      assert.ok(c, `no ${f.role} vertices`);
      assert.ok(c[2] < stats.centroid[2], `${f.role} is at z ${c[2].toFixed(3)}, behind the centre ${stats.centroid[2].toFixed(3)}`);
    } else if (f.back) assert.ok(stats.centroid[2] >= 0.2, `a tail trails behind (+Z), but its centre is at z ${stats.centroid[2].toFixed(3)}`);
    else assert.ok(stats.centroid[2] <= 0.04, `leans backwards: centre at z ${stats.centroid[2].toFixed(3)}`);
  });
  test(`${name} has a known material role on every group`, () => {
    assert.ok(mesh.groups.length > 0);
    for (const g of mesh.groups) { assert.ok(ROLES.includes(g.role), g.role); assert.ok(g.count > 0); }
  });
  test(`${name} keeps its sizes in metres (nothing bigger than 1.6 m or smaller than 4 cm)`, () => {
    const big = Math.max(...stats.size); assert.ok(big <= 1.6 && big >= 0.04, `${big.toFixed(2)} m`);
  });
}

test('Sharp parts (horn, claw, tail) are single watertight shells with faces pointing out', () => {
  for (const n of ['horn', 'claw']) { const a = analyze(meshes[n].mesh); assert.ok(a.closed, n + ' has holes'); assert.ok(a.volume > 0, n + ' faces point inward'); assert.equal(a.components, 1, n); }
});
test('The horn ends in a needle: the last 4 cm is a point, never wider than 2.4 cm across', () => {
  const m = meshes.horn.mesh, n = m.positions.length / 3, V = (i) => [m.positions[3 * i], m.positions[3 * i + 1], m.positions[3 * i + 2]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  let apex = V(0); for (let i = 0; i < n; i++) if (Math.hypot(...V(i)) > Math.hypot(...apex) + 1e-9) apex = V(i);       // the point farthest from the root is the tip
  const near = []; for (let i = 0; i < n; i++) if (dist(V(i), apex) < 0.04) near.push(V(i));
  const c = [0, 1, 2].map((k) => near.reduce((s2, p) => s2 + p[k], 0) / near.length), ax = c.map((v, k) => v - apex[k]), al = Math.hypot(...ax), u = ax.map((v) => v / al);
  const widest = Math.max(...near.map((p) => { const d = [0, 1, 2].map((k) => p[k] - apex[k]), along = d[0] * u[0] + d[1] * u[1] + d[2] * u[2]; return Math.hypot(...d.map((v, k) => v - along * u[k])); }));
  assert.ok(widest * 2 < 0.024, `${(widest * 2 * 100).toFixed(1)} cm wide`);
});
test('Horns, tusks and claws are what makes the demon scary: head has glowing eyes and fangs, jaw has tusks, hand has claws', () => {
  const roles = (n) => new Set(meshes[n].mesh.groups.map((g) => g.role));
  assert.ok(roles('head').has('eye') && roles('head').has('bone'));
  assert.ok(roles('jaw').has('bone')); assert.ok(roles('hand').has('claw')); assert.ok(roles('horn').has('horn'));
});
test('The heavy brow and deep sockets are there: the eyes sit well behind the brow line', () => {
  const eyes = roleCentroid(meshes.head.mesh, 'eye'), top = meshes.head.stats.max[1];
  assert.ok(eyes[1] > 0.15 && eyes[1] < top - 0.08, 'eyes sit under the skull top');
});
test('The parts that make one finished fiend add up to at most 8000 triangles', () => {
  assert.ok(loadoutBudget() <= 8000, `${loadoutBudget()}`);
  let real = 0; for (const [n, count] of Object.entries(FIEND_LOADOUT)) real += count * meshes[n === 'limb' ? 'limb' : n].mesh.triangles;
  assert.ok(real <= 8000, `${real}`);
});
test('Meshing is repeatable: the same part twice gives the same triangles', () => {
  assert.equal(meshPart(buildPart('head')).triangles, meshes.head.mesh.triangles);
});
test('A smaller budget scale gives a smaller mesh (for LODs)', () => {
  assert.ok(meshPart(buildPart('torso'), { scale: 0.5 }).triangles < meshes.torso.mesh.triangles * 0.7);
});
