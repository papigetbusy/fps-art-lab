// Shape maths: signed distance functions (SDFs). Pure, no THREE, so node tests and tools can use it.
// A shape is a function p -> distance, where p = [x, y, z] in metres.
// Distance < 0 inside, 0 on the surface, > 0 outside. Model space: +Y up, the creature faces -Z.
// Shapes may carry a material role (skin, horn, bone, claw, gold, iron, cloth, eye ...) so the mesher can paint them.

export const len = (x, y, z) => Math.hypot(x, y, z);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// ---- primitives ----
export const sphere = (c, r) => (p) => len(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - r;

// ellipsoid with radii r = [rx, ry, rz] (good approximate distance, exact on the surface)
export const ellipsoid = (c, r) => (p) => {
  const k0 = len((p[0] - c[0]) / r[0], (p[1] - c[1]) / r[1], (p[2] - c[2]) / r[2]);
  const k1 = len((p[0] - c[0]) / (r[0] * r[0]), (p[1] - c[1]) / (r[1] * r[1]), (p[2] - c[2]) / (r[2] * r[2]));
  return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
};

// tapered capsule from a (radius ra) to b (radius rb): limbs, fingers, horn segments
export const capsule = (a, b, ra, rb = ra) => (p) => {
  const ba = sub(b, a), pa = sub(p, a);
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
  return len(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (ra + (rb - ra) * h);
};

// box centred at c with half-sizes h = [hx, hy, hz] and rounded edges of radius r (armour plates, buckles)
export const roundBox = (c, h, r = 0) => (p) => {
  const qx = Math.abs(p[0] - c[0]) - h[0] + r, qy = Math.abs(p[1] - c[1]) - h[1] + r, qz = Math.abs(p[2] - c[2]) - h[2] + r;
  return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};

// capped cone from a (radius ra) to b (radius rb), flat ends (spikes, teeth, braziers). Exact (Inigo Quilez).
export const cone = (a, b, ra, rb = 0) => (p) => {
  const ba = sub(b, a), pa = sub(p, a), baba = dot(ba, ba), paba = dot(pa, ba) / baba;
  const x = Math.sqrt(Math.max(dot(pa, pa) - paba * paba * baba, 0));
  const cax = Math.max(0, x - (paba < 0.5 ? ra : rb)), cay = Math.abs(paba - 0.5) - 0.5;
  const k = rb - ra, f = clamp((k * (x - ra) + paba * baba) / (k * k + baba), 0, 1);
  const cbx = x - ra - f * k, cby = paba - f;
  const s = cbx < 0 && cay < 0 ? -1 : 1;
  return s * Math.sqrt(Math.min(cax * cax + cay * cay * baba, cbx * cbx + cby * cby * baba));
};

// torus lying flat (in the XZ plane) centred at c: ring radius R, tube radius r (gold bands, rings, belts)
export const torus = (c, R, r) => (p) => {
  const qx = Math.hypot(p[0] - c[0], p[2] - c[2]) - R;
  return Math.hypot(qx, p[1] - c[1]) - r;
};

// Catmull-Rom point at t in [0,1] on points pts (centripetal-free uniform version, ends clamped)
export function catmull(pts, t) {
  const n = pts.length - 1, f = clamp(t, 0, 1) * n, i = Math.min(Math.floor(f), n - 1), u = f - i;
  const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n)];
  const u2 = u * u, u3 = u2 * u;
  return [0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3));
}

// tube along a smooth curve through pts, radius r0 at the start to r1 at the tip (horns, tails, tentacles, claws)
// pow > 1 keeps it thick longer before tapering.
export const curveTube = (pts, r0, r1, segments = 16, pow = 1) => {
  const samples = [], radii = [];
  for (let i = 0; i <= segments; i++) { const t = i / segments; samples.push(catmull(pts, t)); radii.push(r0 + (r1 - r0) * Math.pow(t, pow)); }
  const parts = [];
  for (let i = 0; i < segments; i++) parts.push(capsule(samples[i], samples[i + 1], radii[i], radii[i + 1]));
  return (p) => { let d = Infinity; for (const f of parts) { const e = f(p); if (e < d) d = e; } return d; };
};

// ---- combining ----
export const union = (...fs) => (p) => { let d = Infinity; for (const f of fs) d = Math.min(d, f(p)); return d; };
export const subtract = (base, cut) => (p) => Math.max(base(p), -cut(p));
export const intersect = (a, b) => (p) => Math.max(a(p), b(p));

// smooth versions: k is the blend width in metres (0.02 = tight crease, 0.1 = soft muscle blend)
export const smoothUnion = (k, ...fs) => (p) => fs.reduce((d, f) => {
  const e = f(p), h = Math.max(k - Math.abs(d - e), 0) / k;
  return Math.min(d, e) - h * h * k * 0.25;
}, Infinity);
export const smoothSubtract = (k, base, cut) => (p) => {
  const d1 = base(p), d2 = -cut(p), h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.max(d1, d2) + h * h * k * 0.25;
};
export const smoothIntersect = (k, a, b) => (p) => {
  const d1 = a(p), d2 = b(p), h = Math.max(k - Math.abs(d1 - d2), 0) / k;
  return Math.max(d1, d2) + h * h * k * 0.25;
};

// ---- transforms (move the shape, not the point you ask about) ----
export const mirrorX = (f) => (p) => f([Math.abs(p[0]), p[1], p[2]]);
export const translate = (f, t) => (p) => f([p[0] - t[0], p[1] - t[1], p[2] - t[2]]);
// uniform scale only, so distances stay correct
export const scale = (f, s) => (p) => f([p[0] / s, p[1] / s, p[2] / s]) * s;
// rotate the shape by Euler angles [rx, ry, rz] (radians, applied X then Y then Z) around pivot c
export const rotate = (f, angles, c = [0, 0, 0]) => {
  const [ax, ay, az] = angles, cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
  return (p) => {
    // inverse rotation (Z^-1, then Y^-1, then X^-1) of the point relative to the pivot
    let x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
    [x, y] = [x * cz + y * sz, -x * sz + y * cz];
    [x, z] = [x * cy - z * sy, x * sy + z * cy];
    [y, z] = [y * cx + z * sx, -y * sx + z * cx];
    return f([x + c[0], y + c[1], z + c[2]]);
  };
};

// ---- material roles ----
export const ROLES = ['skin', 'skinDark', 'horn', 'bone', 'claw', 'gold', 'iron', 'cloth', 'eye', 'ember', 'stone'];
// tag a shape with a material role (returns a new function, the original is untouched)
export const withRole = (f, role) => { if (!ROLES.includes(role)) throw new Error('unknown role ' + role); const g = (p) => f(p); g.role = role; return g; };
// which role paints point p: the role of the nearest tagged shape (used by the mesher for vertex colours / groups)
export const roleAt = (shapes, p) => { let best = null, d = Infinity; for (const s of shapes) { const e = s(p); if (e < d) { d = e; best = s.role || null; } } return best; };
