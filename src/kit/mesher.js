// Mesher: turns a shape (a signed distance function from sdf.js) into a smooth triangle mesh.
// Pure maths, no THREE, so node tests and tools can use it.
//
// How it works, in plain words:
//  1. Measure the shape at every point of a 3D grid (cells of `cell` metres).
//  2. Wherever the shape's surface passes through a grid cell, put one vertex in that cell (Surface Nets).
//     Neighbouring cells share their vertices, so the mesh is welded by construction.
//  3. Push each vertex exactly onto the surface, and take its normal from the shape itself.
//     Normals come from the maths, not from the triangles, so shading is smooth and there are no stair-steps.
//  4. Triangles are grouped by material role (skin, horn, gold ...) so each group can use its own material.
// `meshToBudget` finds the cell size that fits a triangle budget: the shape is re-measured coarser, which keeps
// the surface clean (unlike chopping triangles off). Features thinner than about one cell (horn tips) can vanish,
// so give thin parts their own small grid (parts kit, step 5).
import { ROLES, roleAt } from './sdf.js';

const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
const CORNER = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]]; // corner n = x + 2y + 4z

// opts: { min:[x,y,z], max:[x,y,z]  (box in metres that contains the whole shape, with a little margin),
//         cell = 0.02, project = true, shapes = null (tagged shapes, for material groups), defaultRole = 'skin' }
export function meshSdf(f, opts) {
  const { min, max, cell = 0.02, project = true, shapes = null, defaultRole = 'skin' } = opts;
  const nx = Math.max(1, Math.ceil((max[0] - min[0]) / cell)), ny = Math.max(1, Math.ceil((max[1] - min[1]) / cell)), nz = Math.max(1, Math.ceil((max[2] - min[2]) / cell));
  const sx = nx + 1, sy = ny + 1, sz = nz + 1, strideZ = sx * sy;
  const P = [0, 0, 0];

  // 1. measure the shape at every grid point
  const field = new Float32Array(sx * sy * sz);
  for (let k = 0; k < sz; k++) for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) {
    P[0] = min[0] + i * cell; P[1] = min[1] + j * cell; P[2] = min[2] + k * cell;
    field[i + sx * j + strideZ * k] = f(P);
  }

  // 2. one vertex in every cell the surface passes through, at the average of its edge crossings
  const cellVert = new Int32Array(nx * ny * nz).fill(-1);
  const pos = [];
  const c = new Float64Array(8), off = [0, 1, sx, sx + 1, strideZ, strideZ + 1, strideZ + sx, strideZ + sx + 1];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const base = i + sx * j + strideZ * k;
    let inside = 0;
    for (let n = 0; n < 8; n++) { c[n] = field[base + off[n]]; if (c[n] < 0) inside++; }
    if (inside === 0 || inside === 8) continue;
    let gx = 0, gy = 0, gz = 0, hits = 0;
    for (const [a, b] of EDGES) {
      if ((c[a] < 0) === (c[b] < 0)) continue;
      const t = c[a] / (c[a] - c[b]);
      gx += CORNER[a][0] + t * (CORNER[b][0] - CORNER[a][0]);
      gy += CORNER[a][1] + t * (CORNER[b][1] - CORNER[a][1]);
      gz += CORNER[a][2] + t * (CORNER[b][2] - CORNER[a][2]);
      hits++;
    }
    cellVert[i + nx * (j + ny * k)] = pos.length / 3;
    pos.push(min[0] + (i + gx / hits) * cell, min[1] + (j + gy / hits) * cell, min[2] + (k + gz / hits) * cell);
  }

  // 3. a quad across every grid edge where the surface crosses; wound so the front faces point out of the shape
  const tri = [];
  const emit = (a, b, d2, e) => { // quad a,b,d2,e in order; split along the shorter diagonal
    const dist2 = (u, v) => (pos[3 * u] - pos[3 * v]) ** 2 + (pos[3 * u + 1] - pos[3 * v + 1]) ** 2 + (pos[3 * u + 2] - pos[3 * v + 2]) ** 2;
    if (dist2(a, d2) <= dist2(b, e)) tri.push(a, b, d2, a, d2, e); else tri.push(a, b, e, b, d2, e);
  };
  const cid = (i, j, k) => cellVert[i + nx * (j + ny * k)];
  for (let k = 0; k <= nz; k++) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const here = field[i + sx * j + strideZ * k] < 0;
    const quad = (a, b, d2, e) => (here ? emit(a, b, d2, e) : emit(a, e, d2, b));
    if (i < nx && j >= 1 && j < ny && k >= 1 && k < nz && (field[i + 1 + sx * j + strideZ * k] < 0) !== here) quad(cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k));
    if (j < ny && i >= 1 && i < nx && k >= 1 && k < nz && (field[i + sx * (j + 1) + strideZ * k] < 0) !== here) quad(cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1));
    if (k < nz && i >= 1 && i < nx && j >= 1 && j < ny && (field[i + sx * j + strideZ * (k + 1)] < 0) !== here) quad(cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k));
  }

  // 4. push vertices onto the surface and take smooth normals from the shape's own gradient
  const nv = pos.length / 3, positions = new Float32Array(nv * 3), normals = new Float32Array(nv * 3);
  const e = Math.max(cell * 0.25, 1e-4), q = [0, 0, 0];
  const gradient = (x, y, z) => {
    q[0] = x + e; q[1] = y; q[2] = z; const gx = f(q); q[0] = x - e; const gx2 = f(q);
    q[0] = x; q[1] = y + e; const gy = f(q); q[1] = y - e; const gy2 = f(q);
    q[1] = y; q[2] = z + e; const gz = f(q); q[2] = z - e; const gz2 = f(q);
    return [gx - gx2, gy - gy2, gz - gz2];
  };
  for (let v = 0; v < nv; v++) {
    let x = pos[3 * v], y = pos[3 * v + 1], z = pos[3 * v + 2];
    if (project) {
      q[0] = x; q[1] = y; q[2] = z;
      const d = f(q), g = gradient(x, y, z), g2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
      if (g2 > 1e-12) {
        const s = (d * 2 * e) / g2, step = Math.hypot(g[0], g[1], g[2]) * Math.abs(s);
        const k = step > cell ? cell / step : 1;            // never move more than one cell
        x -= g[0] * s * k; y -= g[1] * s * k; z -= g[2] * s * k;
      }
    }
    const g = gradient(x, y, z), gl = Math.hypot(g[0], g[1], g[2]) || 1;
    positions[3 * v] = x; positions[3 * v + 1] = y; positions[3 * v + 2] = z;
    normals[3 * v] = g[0] / gl; normals[3 * v + 1] = g[1] / gl; normals[3 * v + 2] = g[2] / gl; // gradient points outward
  }

  // 4b. repair normals that point away from all their neighbours (the shape is thinner than a cell there, so the
  //     gradient flips); they take the neighbours' average instead. Ordinary creases are far below this limit.
  const acc = new Float64Array(nv * 3);
  for (let t = 0; t < tri.length; t += 3) for (let s = 0; s < 3; s++) {
    const a = 3 * tri[t + s], b = 3 * tri[t + (s + 1) % 3];
    for (let n = 0; n < 3; n++) { acc[a + n] += normals[b + n]; acc[b + n] += normals[a + n]; }
  }
  for (let v = 0; v < nv; v++) {
    const al = Math.hypot(acc[3 * v], acc[3 * v + 1], acc[3 * v + 2]);
    if (al < 1e-9) continue;
    const ax = acc[3 * v] / al, ay = acc[3 * v + 1] / al, az = acc[3 * v + 2] / al;
    if (normals[3 * v] * ax + normals[3 * v + 1] * ay + normals[3 * v + 2] * az < 0.5) { normals[3 * v] = ax; normals[3 * v + 1] = ay; normals[3 * v + 2] = az; }
  }

  // 5. group triangles by material role
  const nt = tri.length / 3;
  let indices = new Uint32Array(tri), groups;
  if (shapes && shapes.length && nt > 0) {
    const vertRole = new Array(nv);
    for (let v = 0; v < nv; v++) vertRole[v] = roleAt(shapes, [positions[3 * v], positions[3 * v + 1], positions[3 * v + 2]]) || defaultRole;
    const triRole = new Array(nt);
    for (let t = 0; t < nt; t++) {
      const a = vertRole[tri[3 * t]], b = vertRole[tri[3 * t + 1]], d = vertRole[tri[3 * t + 2]];
      triRole[t] = a === b || a === d ? a : b === d ? b : a;       // majority of the three corners
    }
    const order = [...new Set(triRole)].sort((u, w) => ROLES.indexOf(u) - ROLES.indexOf(w));
    const sorted = [];
    groups = [];
    for (const role of order) {
      const start = sorted.length;
      for (let t = 0; t < nt; t++) if (triRole[t] === role) sorted.push(tri[3 * t], tri[3 * t + 1], tri[3 * t + 2]);
      groups.push({ role, start, count: sorted.length - start });
    }
    indices = new Uint32Array(sorted);
  } else {
    groups = nt > 0 ? [{ role: defaultRole, start: 0, count: tri.length }] : [];
  }
  return { positions, normals, indices, groups, cell, triangles: nt };
}

// Finds the cell size so the mesh has at most `budget` triangles (and uses most of it).
// Triangle count grows as 1 / cell^2, so one coarse pilot run gives a good first guess; then nudge until it fits.
export function meshToBudget(f, opts, budget, { maxPasses = 12 } = {}) {
  const { min, max } = opts;
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  let cell = size / 30, mesh = meshSdf(f, { ...opts, cell });
  if (mesh.triangles === 0) return mesh;                       // nothing inside the box
  cell *= Math.min(4, Math.max(0.05, Math.sqrt(mesh.triangles / (budget * 0.92))));
  mesh = meshSdf(f, { ...opts, cell });
  for (let n = 0; n < maxPasses && mesh.triangles > budget; n++) { cell *= 1.04; mesh = meshSdf(f, { ...opts, cell }); }
  return mesh;
}
