// Assembles a creature from DATA (src/kit/creatures/<name>.js) and the parts kit. Pure maths, no THREE.
// Each instance is { id, part, opts?, budget, at, rot, scale, mirror, on?, local?, pinned? }:
//   part   a name from the parts kit, opts its options, budget the triangles this instance may use
//   scale  a number or [x, y, z]; rot = Euler angles [x, y, z] in radians (applied X, then Y, then Z); mirror flips left-right
//   on     the id of the instance it is attached to, local = the attach point in THAT part's own space (metres, before its scale)
//   pinned = true: follows the parent's attach point but not its lean or scale (arms and legs hang from the shoulders and hips)
// Instances without `on` are placed in the world at `at`. Every instance is also a rig node (its pivot is where it attaches).
import { buildPart, meshPart } from './parts.js';

// ---- tiny 4x4 matrices (row-major arrays of 16)
const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const mul = (a, b) => { const o = new Array(16).fill(0); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c]; return o; };
const T = (p) => [1, 0, 0, p[0], 0, 1, 0, p[1], 0, 0, 1, p[2], 0, 0, 0, 1];
const S = (s) => [s[0], 0, 0, 0, 0, s[1], 0, 0, 0, 0, s[2], 0, 0, 0, 0, 1];
const Rx = (a) => [1, 0, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, 0, Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1];
const Ry = (a) => [Math.cos(a), 0, Math.sin(a), 0, 0, 1, 0, 0, -Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1];
const Rz = (a) => [Math.cos(a), -Math.sin(a), 0, 0, Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const rotM = (r) => mul(Rz(r[2]), mul(Ry(r[1]), Rx(r[0])));                 // X first, then Y, then Z
const apply = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
const det3 = (m) => m[0] * (m[5] * m[10] - m[6] * m[9]) - m[1] * (m[4] * m[10] - m[6] * m[8]) + m[2] * (m[4] * m[9] - m[5] * m[8]);
// normals use the inverse transpose of the upper 3x3 (cofactor matrix)
function normalMatrix(m) {
  const c = [m[5] * m[10] - m[6] * m[9], m[6] * m[8] - m[4] * m[10], m[4] * m[9] - m[5] * m[8], m[2] * m[9] - m[1] * m[10], m[0] * m[10] - m[2] * m[8], m[1] * m[8] - m[0] * m[9], m[1] * m[6] - m[2] * m[5], m[2] * m[4] - m[0] * m[6], m[0] * m[5] - m[1] * m[4]];
  return c;
}

const vec = (s) => (Array.isArray(s) ? s : [s, s, s]);

// world matrices for every instance, in order (a parent must come before its children)
function placeAll(spec) {
  const world = {}, pivots = {};
  for (const inst of spec.instances) {
    const own = mul(T(inst.local || inst.at || [0, 0, 0]), mul(rotM(inst.rot || [0, 0, 0]), mul(S(vec(inst.scale ?? 1)), inst.mirror ? S([-1, 1, 1]) : I4())));
    if (!inst.on) { world[inst.id] = own; pivots[inst.id] = inst.at || [0, 0, 0]; continue; }
    const P = world[inst.on]; if (!P) throw new Error(`${inst.id}: parent ${inst.on} must come first`);
    if (inst.pinned) {                                                           // only the attach point is inherited
      const at = apply(P, inst.local || [0, 0, 0]);
      world[inst.id] = mul(T(at), mul(rotM(inst.rot || [0, 0, 0]), mul(S(vec(inst.scale ?? 1)), inst.mirror ? S([-1, 1, 1]) : I4())));
      if (inst.parentMirror) { /* not used */ }
    } else world[inst.id] = mul(P, own);
    pivots[inst.id] = apply(world[inst.id], [0, 0, 0]);
  }
  for (const id of Object.keys(world)) pivots[id] = apply(world[id], [0, 0, 0]);
  return { world, pivots };
}

// Meshes every instance and moves it into the world. Returns { instances: [{id, on, pivot, mesh}], mesh (all merged by role), triangles, bounds }.
export function assemble(spec) {
  const { world, pivots } = placeAll(spec), out = [];
  for (const inst of spec.instances) {
    const part = buildPart(inst.part, inst.opts), m = meshPart(part, { scale: (inst.budget || part.budget) / part.budget });
    const M = world[inst.id], N = normalMatrix(M), flip = det3(M) < 0;
    const P = new Float32Array(m.positions.length), Nn = new Float32Array(m.normals.length);
    for (let v = 0; v < m.positions.length; v += 3) {
      const p = apply(M, [m.positions[v], m.positions[v + 1], m.positions[v + 2]]);
      const n = [N[0] * m.normals[v] + N[1] * m.normals[v + 1] + N[2] * m.normals[v + 2], N[3] * m.normals[v] + N[4] * m.normals[v + 1] + N[5] * m.normals[v + 2], N[6] * m.normals[v] + N[7] * m.normals[v + 1] + N[8] * m.normals[v + 2]];
      const l = Math.hypot(...n) || 1;
      P[v] = p[0]; P[v + 1] = p[1]; P[v + 2] = p[2]; Nn[v] = n[0] / l; Nn[v + 1] = n[1] / l; Nn[v + 2] = n[2] / l;
    }
    const idx = new Uint32Array(m.indices);
    if (flip) for (let t = 0; t < idx.length; t += 3) { const x = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = x; }
    out.push({ id: inst.id, part: inst.part, on: inst.on || null, pivot: pivots[inst.id], mesh: { positions: P, normals: Nn, indices: idx, groups: m.groups, triangles: m.triangles } });
  }
  // one merged mesh, grouped by material role
  const roles = [...new Set(out.flatMap((o) => o.mesh.groups.map((g) => g.role)))];
  const Pm = [], Nm = [], Im = [], groups = []; let base = 0;
  const pieces = out.map((o) => ({ o, base: (base += 0, 0) }));
  const vertexBase = []; let vb = 0; for (const o of out) { vertexBase.push(vb); vb += o.mesh.positions.length / 3; for (const x of o.mesh.positions) Pm.push(x); for (const x of o.mesh.normals) Nm.push(x); }
  for (const role of roles) { const start = Im.length; out.forEach((o, i) => { for (const g of o.mesh.groups) if (g.role === role) for (let k = g.start; k < g.start + g.count; k++) Im.push(o.mesh.indices[k] + vertexBase[i]); }); groups.push({ role, start, count: Im.length - start }); }
  const mesh = { positions: new Float32Array(Pm), normals: new Float32Array(Nm), indices: new Uint32Array(Im), groups, triangles: Im.length / 3 };
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let v = 0; v < Pm.length; v += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], Pm[v + k]); max[k] = Math.max(max[k], Pm[v + k]); }
  void pieces;
  return { instances: out, mesh, triangles: mesh.triangles, bounds: { min, max } };
}
