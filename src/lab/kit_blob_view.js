// Lab view for `?kit=test`: the Step 3 test blob, meshed from shape maths and lit by the shared gothic look.
// A small label shows the triangle count and how long meshing took (so the owner can judge phone speed).
import * as THREE from 'three';
import { testBlob } from '../kit/test_blob.js';
import { meshToBudget } from '../kit/mesher.js';
import { toGeometry } from '../kit/geometry.js';

export function buildKitTest(M) {
  const blob = testBlob();
  const t0 = performance.now();
  const root = new THREE.Group();
  let triangles = 0;
  const notes = [];
  for (const part of blob.parts) {                       // each part is meshed on its own grid (see test_blob.js)
    const mesh = meshToBudget(part.sdf, { ...part.bounds, shapes: part.shapes }, Math.floor(blob.budget * part.share));
    const { geometry, roles } = toGeometry(mesh);
    const object = new THREE.Mesh(geometry, roles.map((r) => M[r] || M.skin));
    object.castShadow = object.receiveShadow = true;
    root.add(object);
    triangles += mesh.triangles;
    notes.push(`${part.name} ${mesh.triangles} (cell ${(mesh.cell * 100).toFixed(1)} cm)`);
  }
  const ms = Math.round(performance.now() - t0);

  const label = document.createElement('div');
  label.textContent = `kit test: ${triangles} triangles = ${notes.join(' + ')}, meshed in ${ms} ms`;
  label.style.cssText = 'position:fixed;left:8px;bottom:8px;font:12px ui-monospace,monospace;color:#d4a84a;background:#0008;padding:4px 8px;border-radius:6px';
  document.body.appendChild(label);
  console.log(label.textContent);

  let base = null; // the lab sets root.position.y (standing on the dais) after this returns, so read it on the first frame
  return { root, idle(t) { if (base === null) base = root.position.y; root.position.y = base + Math.sin(t * 1.6) * 0.004; } }; // barely breathing: judge the surface, not the motion
}
