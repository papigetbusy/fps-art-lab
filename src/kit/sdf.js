// Shape maths: signed distance functions. Pure, no THREE, so node tests and tools can use it.
// Distance < 0 inside, 0 on the surface, > 0 outside. Units: metres.
export const len = (x, y, z) => Math.hypot(x, y, z);
export const sphere = (c, r) => (p) => len(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - r;
export const ellipsoid = (c, r) => (p) => {
  const k0 = len((p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]);
  const k1 = len((p[0] - c[0]) / (r[0] * r[0]), (p[1] - c[1]) / (r[1] * r[1]), (p[2] - c[2]) / (r[2] * r[2]));
  return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
};
// tapered capsule from a (radius ra) to b (radius rb): limbs, horns, fingers
export const capsule = (a, b, ra, rb = ra) => (p) => {
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const L2 = ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2;
  const h = Math.max(0, Math.min(1, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / L2));
  return len(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (ra + (rb - ra) * h);
};
export const smoothUnion = (k, ...fs) => (p) => fs.reduce((d, f) => {
  const e = f(p), h = Math.max(k - Math.abs(d - e), 0) / k;
  return Math.min(d, e) - h * h * k * 0.25;
}, Infinity);
export const smoothSubtract = (k, base, cut) => (p) => {
  const d1 = base(p), d2 = -cut(p), h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.max(d1, d2) + h * h * k * 0.25;
};
export const mirrorX = (f) => (p) => f([Math.abs(p[0]), p[1], p[2]]);
