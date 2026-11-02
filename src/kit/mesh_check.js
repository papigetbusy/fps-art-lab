// Checks on a mesh from mesher.js: is it one solid, watertight piece, how smooth is it, how much room does it take.
// Pure maths (no THREE). Used by the tests now and by the picture-sheet tool later.

export function analyze(mesh) {
  const { positions: P, normals: N, indices: I } = mesh;
  const nt = I.length / 3, nv = P.length / 3;

  // edges: every edge of a solid, closed mesh is used exactly once in each direction
  const dir = new Map();
  let degenerate = 0;
  for (let t = 0; t < nt; t++) {
    const a = I[3 * t], b = I[3 * t + 1], c = I[3 * t + 2];
    if (a === b || b === c || a === c) { degenerate++; continue; }
    for (const [u, v] of [[a, b], [b, c], [c, a]]) { const key = u * nv + v; dir.set(key, (dir.get(key) || 0) + 1); }
  }
  let boundaryEdges = 0, nonManifoldEdges = 0;
  for (const [key, n] of dir) {
    const u = Math.floor(key / nv), v = key % nv, back = dir.get(v * nv + u) || 0;
    if (n > 1) nonManifoldEdges++;
    if (back === 0) boundaryEdges++;
  }

  // pieces: vertices joined through shared triangles
  const parent = new Int32Array(nv).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const used = new Uint8Array(nv);
  for (let t = 0; t < nt; t++) {
    const a = I[3 * t], b = I[3 * t + 1], c = I[3 * t + 2];
    used[a] = used[b] = used[c] = 1;
    parent[find(b)] = find(a); parent[find(c)] = find(a);
  }
  const roots = new Set();
  for (let v = 0; v < nv; v++) if (used[v]) roots.add(find(v));

  // signed volume (positive when the faces point outward) and the biggest normal jump along any edge, in degrees
  let volume = 0, maxNormalJump = 0;
  for (let t = 0; t < nt; t++) {
    const a = 3 * I[3 * t], b = 3 * I[3 * t + 1], c = 3 * I[3 * t + 2];
    volume += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      const d = N[u] * N[v] + N[u + 1] * N[v + 1] + N[u + 2] * N[v + 2];
      maxNormalJump = Math.max(maxNormalJump, Math.acos(Math.min(1, Math.max(-1, d))) * 180 / Math.PI);
    }
  }
  return { triangles: nt, vertices: nv, degenerate, boundaryEdges, nonManifoldEdges, closed: nt > 0 && boundaryEdges === 0 && nonManifoldEdges === 0, components: roots.size, volume, maxNormalJump };
}
