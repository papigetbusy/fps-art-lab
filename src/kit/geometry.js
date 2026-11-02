// Turns a mesh from mesher.js into a three.js BufferGeometry with one material group per role.
// Returns { geometry, roles }: roles[i] is the material role of group i, so a caller can do roles.map((r) => M[r]).
import * as THREE from 'three';

// The mesher makes no texture coordinates, so shapes are projected onto the flat side they face most (box projection).
// Fine for the mottled skin and stone textures; real creatures may need proper unwrapping later.
function boxUV(positions, normals, metresPerTile) {
  const n = positions.length / 3, uv = new Float32Array(n * 2), s = 1 / metresPerTile;
  for (let v = 0; v < n; v++) {
    const x = positions[3 * v], y = positions[3 * v + 1], z = positions[3 * v + 2];
    const ax = Math.abs(normals[3 * v]), ay = Math.abs(normals[3 * v + 1]), az = Math.abs(normals[3 * v + 2]);
    if (ax >= ay && ax >= az) { uv[2 * v] = z * s; uv[2 * v + 1] = y * s; }
    else if (ay >= az) { uv[2 * v] = x * s; uv[2 * v + 1] = z * s; }
    else { uv[2 * v] = x * s; uv[2 * v + 1] = y * s; }
  }
  return uv;
}

export function toGeometry(mesh, { metresPerTile = 0.6 } = {}) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(boxUV(mesh.positions, mesh.normals, metresPerTile), 2));
  geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
  mesh.groups.forEach((g, i) => geometry.addGroup(g.start, g.count, i));
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return { geometry, roles: mesh.groups.map((g) => g.role) };
}
