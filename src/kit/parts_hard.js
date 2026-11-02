// Horn, claw, tail, armourPlate, trimBand, gem and cloth: the sharp, hard and hanging parts of the Horned Fiend kit.
// Pure shape maths and plain mesh code, sizes in metres, +Y up, front is -Z. Nothing here is soft or rounded on purpose.
import { ellipsoid, sphere, cone, torus, rotate, union, subtract, intersect, smoothUnion, withRole, catmull } from './sdf.js';
import { sweepTube, spike, sub3, add3, mul3, norm3, cross3 } from './part_tools.js';

const tag = (f, role) => withRole(f, role);

// ---------------------------------------------------------------- horn
// Origin: the root of the horn (the left side one; mirror for the right). It sweeps out (+X), up and forward (-Z) and curls in to a needle tip.
// Six heavy rings stand out along the length like a ram's. 0.6 m long. A swept mesh, so the tip is a true point.
export function horn() {
  const pts = [[0, 0, 0], [0.05, 0.12, -0.02], [0.13, 0.27, -0.08], [0.2, 0.41, -0.2], [0.17, 0.53, -0.36]];
  return {
    name: 'horn', budget: 300, facing: { bbox: true },
    notes: 'root at the origin, sweeps out, up and forward, curls in to a needle point; six ridges',
    meshes: [() => sweepTube(pts, 0.052, 0, { sides: 6, rings: 26, ridges: 6, amp: 0.012, pow: 0.9, role: 'horn' })],
  };
}

// ---------------------------------------------------------------- claw
// Origin: the root of the claw, pointing down (-Y) and hooking forward (-Z). 0.22 m long, thick at the root, a needle at the end.
export function claw() {
  const pts = [[0, 0, 0], [0, -0.06, -0.025], [0, -0.13, -0.085], [0, -0.17, -0.17]];
  return {
    name: 'claw', budget: 160, facing: { bbox: true },
    notes: 'root at the origin, hangs down and hooks toward -Z, a true needle point',
    meshes: [() => sweepTube(pts, 0.024, 0, { sides: 6, rings: 14, pow: 0.8, role: 'claw' })],
  };
}

// ---------------------------------------------------------------- tail
// Origin: the base of the spine. It drops, then sweeps back (+Z) and curls up in an S, 1.4 m long, ridged like a spine,
// and ends in a barbed spearhead (a long blade and two swept-back barbs).
export function tail() {
  const pts = [[0, 0, 0], [0, -0.12, 0.22], [0, -0.22, 0.5], [0.08, -0.2, 0.82], [0.2, -0.08, 1.08], [0.3, 0.1, 1.24]];
  const T = catmull(pts, 1), d = norm3(sub3(T, catmull(pts, 0.96))), s = norm3(cross3(d, [0, 1, 0]));
  const back = sub3(T, mul3(d, 0.03));
  return {
    name: 'tail', budget: 280, facing: { back: true },
    notes: 'base at the origin, drops then sweeps back (+Z) 1.4 m in an S that curls up, ridged, ends in a barbed spearhead',
    meshes: [
      () => sweepTube(pts, 0.075, 0.016, { sides: 6, rings: 20, ridges: 10, amp: 0.012, role: 'skin' }),
      () => spike(back, add3(T, mul3(d, 0.18)), 0.032, 'bone'),
      ...[1, -1].map((sg) => () => spike(back, add3(add3(T, mul3(s, 0.11 * sg)), mul3(d, -0.07)), 0.022, 'bone')),
    ],
  };
}

// ---------------------------------------------------------------- armourPlate (pauldron)
// Origin: the middle of the shoulder joint. A thick, battered iron cap over the shoulder with a central blade and a side spike,
// and a ring of aged gold round its lower edge. (Thin sheet metal would vanish on a 280-triangle grid, so the plate is thick on purpose.)
export function armourPlate() {
  const shell = subtract(sphere([0, -0.02, 0], 0.2), sphere([0, -0.055, 0], 0.15));
  const cap = intersect(shell, (p) => -0.03 - p[1]);
  const iron = cap;
  const rim = rotate(torus([0, -0.03, 0], 0.175, 0.02), [0, 0, 0]);
  return {
    name: 'armourPlate', budget: 300, facing: { bbox: true },
    notes: 'shoulder joint at the origin, a thick iron dome over it, a blade on top, a spike on the outer side (+X), a gold rim round the lower edge',
    grids: [
      { name: 'plate', share: 0.72, sdf: iron, shapes: [tag(iron, 'iron')], bounds: { min: [-0.24, -0.06, -0.24], max: [0.34, 0.34, 0.24] } },
      { name: 'rim', share: 0.28, sdf: rim, shapes: [tag(rim, 'gold')], bounds: { min: [-0.22, -0.07, -0.22], max: [0.22, 0.01, 0.22] } },
    ],
  };
}

// ---------------------------------------------------------------- trimBand
// Origin: the centre of the ring, lying flat. A heavy gold band with eight outward spikes: belts, collars, bracers (set R for the size).
export function trimBand({ R = 0.2 } = {}) {
  const ring = torus([0, 0, 0], R, 0.03);
  const spikes = union(...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return cone([Math.cos(a) * R, 0, Math.sin(a) * R], [Math.cos(a) * (R + 0.075), 0.01, Math.sin(a) * (R + 0.075)], 0.032, 0.002); }));
  const band = smoothUnion(0.02, ring, spikes);
  return {
    name: 'trimBand', budget: 220, facing: { bbox: true },
    notes: 'ring centred on the origin, flat, aged gold, eight outward spikes',
    grids: [{ name: 'band', share: 1, sdf: band, shapes: [tag(band, 'gold')], bounds: { min: [-R - 0.12, -0.07, -R - 0.12], max: [R + 0.12, 0.07, R + 0.12] } }],
  };
}

// ---------------------------------------------------------------- gem
// Origin: the centre of the stone. A polished cabochon (domed, flat back) in a gold setting, dome toward -Z. Set into belts and brows.
export function gem() {
  const stone = intersect(ellipsoid([0, 0, 0], [0.05, 0.05, 0.024]), (p) => p[2] - 0.006);
  const setting = rotate(torus([0, 0, 0], 0.058, 0.013), [Math.PI / 2, 0, 0]);
  return {
    name: 'gem', budget: 200, facing: { bbox: true },
    notes: 'centre of the stone at the origin, dome toward -Z, flat back, gold ring round it',
    grids: [
      { name: 'stone', share: 0.6, sdf: stone, shapes: [tag(stone, 'gem')], bounds: { min: [-0.07, -0.07, -0.05], max: [0.07, 0.07, 0.02] } },
      { name: 'setting', share: 0.4, sdf: setting, shapes: [tag(setting, 'gold')], bounds: { min: [-0.08, -0.08, -0.03], max: [0.08, 0.08, 0.03] } },
    ],
  };
}

// ---------------------------------------------------------------- cloth
// Origin: the belt line, centre front. A torn loincloth, 0.36 m wide and about 0.5 m long, hanging from the waist (-Y) in folds that bulge
// toward -Z, with a ragged hem (every strip a different length, one torn deep). Plain mesh code (a thin sheet cannot come from the shape maths).
export function cloth({ width = 0.36, drop = 0.5, cols = 9, rows = 9, seed = 4 } = {}) {
  const build = () => {
    let s = seed >>> 0; const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const len = []; for (let c = 0; c <= cols; c++) len.push(drop * (0.7 + 0.3 * rand()));
    len[Math.floor(cols * 0.62)] *= 0.62;                                                        // one deep tear
    const pos = [];
    for (let c = 0; c <= cols; c++) for (let r = 0; r <= rows; r++) {
      const u = c / cols - 0.5, v = r / rows;
      pos.push(u * width * (1 + 0.18 * v) + Math.sin(v * 3 + c) * 0.006 * v, -v * len[c], -(0.045 * Math.sin(u * 17 + 0.8) * v + 0.03 * v * v + 0.004));
    }
    const idx = [], at = (c, r) => c * (rows + 1) + r;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { const a = at(c, r), b = at(c, r + 1), d = at(c + 1, r), e = at(c + 1, r + 1); idx.push(a, d, b, b, d, e); }   // front faces look toward -Z
    const nrm = new Float64Array(pos.length);
    for (let t = 0; t < idx.length; t += 3) {
      const [i, j, k] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3];
      const u = [pos[j] - pos[i], pos[j + 1] - pos[i + 1], pos[j + 2] - pos[i + 2]], w = [pos[k] - pos[i], pos[k + 1] - pos[i + 1], pos[k + 2] - pos[i + 2]];
      const n = cross3(u, w); for (const q of [i, j, k]) for (let m = 0; m < 3; m++) nrm[q + m] += n[m];
    }
    for (let v = 0; v < nrm.length; v += 3) { const l = Math.hypot(nrm[v], nrm[v + 1], nrm[v + 2]) || 1; nrm[v] /= l; nrm[v + 1] /= l; nrm[v + 2] /= l; }
    return { positions: new Float32Array(pos), normals: new Float32Array(nrm), indices: new Uint32Array(idx), groups: [{ role: 'cloth', start: 0, count: idx.length }], triangles: idx.length / 3 };
  };
  return { name: 'cloth', budget: 190, facing: { bbox: true }, direct: build, notes: 'belt line at the origin, hangs down (-Y), folds bulge toward -Z, ragged hem; a plain mesh, double-sided material' };
}
