// Helpers shared by the parts (parts_body.js, parts_hard.js). Pure maths, no THREE.
// A PART is data: { name, budget, grids: [{ name, share, sdf, shapes, bounds }], facing, notes }
//  - budget  = most triangles the part may use in the finished monster (see PART_BUDGETS in parts.js)
//  - grids   = the part is meshed in one or more grids. Thin features (claw tips, teeth, eyes) get their own fine grid,
//              because one grid cannot hold anything thinner than about two of its cells (see mesher.js).
//  - facing  = how the "faces -Z" test finds the front: { role } (that role's vertices lie in front of the centre) or { bbox }
import { capsule, catmull } from './sdf.js';
import { meshToBudget } from './mesher.js';

export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const norm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// the box that holds a list of points, grown by pad metres (and mirrored in X if mirror is true)
export function boundsOf(points, pad = 0.05, mirror = false) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of points) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
  if (mirror) { const m = Math.max(Math.abs(min[0]), Math.abs(max[0])); min[0] = -m; max[0] = m; }
  return { min: min.map((v) => v - pad), max: max.map((v) => v + pad) };
}

export const curveLength = (pts, n = 40) => { let L = 0, prev = catmull(pts, 0); for (let i = 1; i <= n; i++) { const q = catmull(pts, i / n); L += Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]); prev = q; } return L; };

// A tube along a smooth curve that tapers to a point, with optional ridges (rings) around it: horns, tails, claws.
//   r0 / r1 = radius at the start / tip, pow > 1 stays thick longer before tapering,
//   ridges = how many rings, amp = how far they stand out (metres), tMin / tMax = only the part of the tube between these
//   positions (0 = start, 1 = tip), which is how the same tube is split into a coarse grid and a fine tip grid.
export function ridgedTube(pts, r0, r1, { ridges = 0, amp = 0, pow = 1, tMin = 0, tMax = 1, samples = 28 } = {}) {
  const S = [], R = [];
  for (let i = 0; i <= samples; i++) { const t = i / samples; S.push(catmull(pts, t)); R.push(r0 + (r1 - r0) * Math.pow(t, pow)); }
  const L = curveLength(pts), caps = [];
  for (let i = 0; i < samples; i++) caps.push(capsule(S[i], S[i + 1], R[i], R[i + 1]));
  return (p) => {
    let best = Infinity, bt = 0;
    for (let i = 0; i < samples; i++) { const d = caps[i](p); if (d < best) { best = d; bt = i; } }
    // position along the tube of the nearest point (continuous): project on the winning segment
    const a = S[bt], b = S[bt + 1], ab = sub3(b, a), ap = sub3(p, a), h = Math.min(1, Math.max(0, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2] || 1)));
    const t = (bt + h) / samples;
    let d = best;
    if (ridges > 0 && amp > 0) { const c = 0.5 + 0.5 * Math.cos(6.2831853 * ridges * t); d -= amp * (1 - t) * c * c; }
    if (tMin > 0) d = Math.max(d, (tMin - t) * L);
    if (tMax < 1) d = Math.max(d, (t - tMax) * L);
    return d;
  };
}

// the coarse and fine grids for one ridged tube: the thick part on a coarse grid, the thin tip on a fine one
export function splitTube(name, pts, r0, r1, opts, { split = 0.62, shares = [0.5, 0.5], role, pad = 0.04, extra = [] }) {
  const all = []; for (let i = 0; i <= 24; i++) all.push(catmull(pts, i / 24));
  const tipPts = all.filter((_, i) => i / 24 >= split - 0.04);
  const base = ridgedTube(pts, r0, r1, { ...opts, tMax: split }), tip = ridgedTube(pts, r0, r1, { ...opts, tMin: split });
  return [
    { name: name + ' base', share: shares[0], sdf: base, shapes: [Object.assign(base, { role })], bounds: boundsOf(all.filter((_, i) => i / 24 <= split + 0.04), r0 + pad) },
    { name: name + ' tip', share: shares[1], sdf: tip, shapes: [Object.assign(tip, { role })], bounds: boundsOf(tipPts, Math.max(r1 * 2, 0.03) + pad * 0.5) },
  ];
}

// A tube swept along a smooth curve, tapering to a needle point: the way to make anything sharp (horns, claws, teeth, barbs, spines).
// The shape maths and the mesher cannot hold a feature thinner than about two grid cells, so sharp tips are plain swept meshes:
// `sides` corners round the tube, `rings` slices along it (4+ rings per ridge so ridges show). The last ring is a single sharp point.
// Normals are smoothed across the tube, so it shades round, not faceted. Returns the same mesh shape as the mesher.
export function sweepTube(pts, r0, r1 = 0, { sides = 6, rings = 16, pow = 1, ridges = 0, amp = 0, role = 'skin' } = {}) {
  const C = [], T = [], N = [], B = [], R = [];
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1), c = catmull(pts, t), a = catmull(pts, Math.max(0, t - 0.01)), b = catmull(pts, Math.min(1, t + 0.01));
    const tan = norm3(sub3(b, a));
    let n;
    if (i === 0) { const ref = Math.abs(tan[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; n = norm3(cross3(ref, tan)); }          // first frame: any perpendicular
    else { const pn = N[i - 1], k = pn[0] * tan[0] + pn[1] * tan[1] + pn[2] * tan[2]; n = norm3([pn[0] - tan[0] * k, pn[1] - tan[1] * k, pn[2] - tan[2] * k]); }   // then carried along (no twisting)
    C.push(c); T.push(tan); N.push(n); B.push(cross3(tan, n));
    let r = r0 + (r1 - r0) * Math.pow(t, pow);
    if (ridges > 0 && amp > 0) { const q = 0.5 + 0.5 * Math.cos(6.2831853 * ridges * t); r += amp * (1 - t) * q * q; }
    R.push(i === rings - 1 ? 0 : r);
  }
  const pos = [], idx = [];
  for (let i = 0; i < rings - 1; i++) for (let j = 0; j < sides; j++) { const th = (j / sides) * 6.2831853, cs = Math.cos(th), sn = Math.sin(th); for (let k = 0; k < 3; k++) pos.push(C[i][k] + (N[i][k] * cs + B[i][k] * sn) * R[i]); }
  const startCenter = pos.length / 3; pos.push(...C[0]);
  const apex = startCenter + 1; pos.push(...C[rings - 1]);
  const at = (i, j) => i * sides + (j % sides);
  for (let i = 0; i < rings - 2; i++) for (let j = 0; j < sides; j++) { const a = at(i, j), b = at(i, j + 1), c = at(i + 1, j), d = at(i + 1, j + 1); idx.push(a, b, c, b, d, c); }
  for (let j = 0; j < sides; j++) { idx.push(startCenter, at(0, j + 1), at(0, j)); idx.push(apex, at(rings - 2, j), at(rings - 2, j + 1)); }
  const nrm = new Float64Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const i = idx[t] * 3, j = idx[t + 1] * 3, k = idx[t + 2] * 3;
    const n = cross3([pos[j] - pos[i], pos[j + 1] - pos[i + 1], pos[j + 2] - pos[i + 2]], [pos[k] - pos[i], pos[k + 1] - pos[i + 1], pos[k + 2] - pos[i + 2]]);
    for (const q of [i, j, k]) for (let m = 0; m < 3; m++) nrm[q + m] += n[m];
  }
  for (let v = 0; v < nrm.length; v += 3) { const l = Math.hypot(nrm[v], nrm[v + 1], nrm[v + 2]) || 1; nrm[v] /= l; nrm[v + 1] /= l; nrm[v + 2] /= l; }
  return { positions: new Float32Array(pos), normals: new Float32Array(nrm), indices: new Uint32Array(idx), groups: [{ role, start: 0, count: idx.length }], triangles: idx.length / 3 };
}
// a short straight spike: a tooth, spine or barb from base to tip
export const spike = (base, tip, r, role = 'bone', sides = 4) => sweepTube([base, tip], r, 0, { sides, rings: 3, role });

// Meshes a whole part: every grid on its own, joined into one mesh with one material group per grid-and-role.
// opts.scale makes the triangle budget smaller or larger (for LODs and for fitting a whole monster in 8k).
export function meshPart(part, { scale = 1 } = {}) {
  if (part.direct) { const m = part.direct(); return { ...m, grids: [{ name: part.name, triangles: m.triangles }] }; }
  const P = [], N = [], I = [], groups = [], grids = [];
  let vertexBase = 0, indexBase = 0;
  const addMesh = (m, name, cell) => {
    grids.push({ name, triangles: m.triangles, cell });
    if (m.triangles === 0) return;
    for (let i = 0; i < m.positions.length; i++) { P.push(m.positions[i]); N.push(m.normals[i]); }
    for (let i = 0; i < m.indices.length; i++) I.push(m.indices[i] + vertexBase);
    for (const gr of m.groups) groups.push({ role: gr.role, start: gr.start + indexBase, count: gr.count });
    vertexBase += m.positions.length / 3; indexBase += m.indices.length;
  };
  let swept = 0;
  (part.meshes || []).forEach((make, i) => { const m = make(); swept += m.triangles; addMesh(m, 'swept ' + (i + 1)); });   // sharp pieces first: their cost is fixed
  const pool = Math.max(0, part.budget * scale - swept);                                                             // the grids share what is left
  for (const g of part.grids || []) addMesh(meshToBudget(g.sdf, { min: g.bounds.min, max: g.bounds.max, shapes: g.shapes }, Math.max(8, Math.floor(pool * g.share))), g.name);
  return { positions: new Float32Array(P), normals: new Float32Array(N), indices: new Uint32Array(I), groups, triangles: I.length / 3, grids };
}

// plain numbers about a meshed part, for tests and the parts board
export function partStats(mesh) {
  const P = mesh.positions, n = P.length / 3, min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], c = [0, 0, 0];
  for (let v = 0; v < n; v++) for (let k = 0; k < 3; k++) { const x = P[3 * v + k]; if (x < min[k]) min[k] = x; if (x > max[k]) max[k] = x; c[k] += x; }
  return { min, max, size: max.map((m, k) => m - min[k]), centroid: c.map((x) => x / Math.max(1, n)) };
}
// where the vertices of one material role sit on average (null if the part has none)
export function roleCentroid(mesh, role) {
  const used = new Set(), c = [0, 0, 0]; let n = 0;
  for (const g of mesh.groups) if (g.role === role) for (let i = g.start; i < g.start + g.count; i++) used.add(mesh.indices[i]);
  for (const v of used) { for (let k = 0; k < 3; k++) c[k] += mesh.positions[3 * v + k]; n++; }
  return n ? c.map((x) => x / n) : null;
}
