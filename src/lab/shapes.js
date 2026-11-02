// Small geometry helpers for hand-built placeholders: tapered tubes along curves, limbs between two points.
import * as THREE from 'three';

// a tube along points whose radius goes from r0 to r1 (horns, tails, claws, fingers)
export function taperTube(points, r0, r1, seg = 24, radial = 10, curvePow = 1) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, r = r0 + (r1 - r0) * Math.pow(t, curvePow);
    curve.getPointAt(t, c);
    for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  return geo;
}

// a tapered limb from a to b (radius ra at a, rb at b), with rounded ends
export function limb(a, b, ra, rb, radial = 16) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const g = new THREE.CylinderGeometry(rb, ra, len, radial, 4, true);
  const capA = new THREE.SphereGeometry(ra, radial, 10); capA.translate(0, -len / 2, 0);
  const capB = new THREE.SphereGeometry(rb, radial, 10); capB.translate(0, len / 2, 0);
  const out = mergeSimple([g, capA, capB]);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  out.applyQuaternion(q); out.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return out;
}

// merge non-indexed copies of geometries that share position/normal/uv
export function mergeSimple(geos) {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  const total = parts.reduce((n, g) => n + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}

// a lathe from (radius, height) pairs: barrels, torsos, pillars, braziers
export function lathe(profile, seg = 32) { return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg); }
