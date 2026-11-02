// Plain-sentence checks for the Step 6 Horned Fiend (data in src/kit/creatures/horned_fiend.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assemble } from '../src/kit/assemble.js';
import { hornedFiend } from '../src/kit/creatures/horned_fiend.js';
import { readFileSync } from 'node:fs';

const HH = 0.27;                                   // one head-height in metres (proportions.md)
const fiend = assemble(hornedFiend);
const byId = Object.fromEntries(fiend.instances.map((i) => [i.id, i]));
const vertsOf = (inst) => { const p = inst.mesh.positions; const out = []; for (let i = 0; i < p.length; i += 3) out.push([p[i], p[i + 1], p[i + 2]]); return out; };
const minZ = (inst) => Math.min(...vertsOf(inst).map((v) => v[2]));

test('The Horned Fiend stays under 8000 triangles', () => { assert.ok(fiend.triangles <= 8000, `${fiend.triangles}`); });
test('The Horned Fiend is about 2.2 metres tall including the horns', () => {
  const h = fiend.bounds.max[1] - fiend.bounds.min[1];
  assert.ok(h >= 2.0 && h <= 2.35, `${h}`);
});
test('Every body piece is its own rig node with a name', () => {
  for (const id of ['body', 'head', 'jaw', 'hornR', 'hornL', 'armR', 'armL', 'handR', 'handL', 'legR', 'legL', 'footR', 'footL', 'tail']) assert.ok(byId[id], id);
});
test('The jaw tip sticks out no more than a quarter head-height past the brow (demon skull, not a dog snout)', () => {
  const reach = minZ(byId.head) - minZ(byId.jaw);   // positive = jaw further forward than the head front
  console.log(`jaw check: jaw tip is ${reach.toFixed(3)} m past the brow (limit ${(0.25 * HH).toFixed(4)} m)`);
  assert.ok(reach <= 0.25 * HH, `${reach}`);
});
test('The claws hang to about knee height', () => {
  const lowest = Math.min(...vertsOf(byId.handR).map((v) => v[1]));
  assert.ok(lowest >= 0.3 && lowest <= 0.75, `${lowest}`);
});
test('The tail reaches the floor and trails behind the body', () => {
  const v = vertsOf(byId.tail);
  assert.ok(Math.min(...v.map((p) => p[1])) <= 0.2);
  assert.ok(Math.max(...v.map((p) => p[2])) >= 0.8);
});
test('The placeholder creature is still there for ?creature=placeholder', () => {
  const main = readFileSync(new URL('../lab/main.js', import.meta.url), 'utf8');
  assert.ok(/placeholder/.test(main) && /buildFiend/.test(main));
});
