// Lab view for `?kit=parts`: every part of the Step 5 kit on its own plinth, lit by the chapel candles, with a small label.
// `&part=<name>` shows that one part large on the turntable instead.
import * as THREE from 'three';
import { PART_NAMES, buildPart, meshPart, partStats } from '../kit/parts.js';
import { toGeometry } from '../kit/geometry.js';
import { lathe } from './shapes.js';

const ROWS = [['torso', 'head', 'jaw', 'limb', 'leg', 'hand', 'claw'], ['hoofFoot', 'horn', 'tail', 'armourPlate', 'trimBand', 'gem', 'cloth']];

function partObject(name, M) {
  const part = buildPart(name), mesh = meshPart(part), { geometry, roles } = toGeometry(mesh);
  const object = new THREE.Mesh(geometry, roles.map((r) => M[r] || M.skin));
  object.castShadow = object.receiveShadow = true;
  return { object, part, mesh, stats: partStats(mesh) };
}

export function buildPartsBoard(M, { part: only } = {}) {
  const t0 = performance.now(), root = new THREE.Group(), labels = [];
  const plinthMat = M.stoneWall;
  const plinth = (h, r = 0.3) => { const m = new THREE.Mesh(lathe([[0, 0], [r + 0.06, 0], [r + 0.06, 0.05], [r, 0.08], [r - 0.03, 0.12], [r - 0.03, h - 0.08], [r + 0.02, h - 0.04], [r + 0.02, h], [0, h]], 24), plinthMat); m.castShadow = m.receiveShadow = true; return m; };
  let total = 0;

  if (only && PART_NAMES.includes(only)) {                                       // one part, large, on the turntable
    const { object, mesh, stats } = partObject(only, M), s = 1.3 / Math.max(...stats.size);
    const holder = new THREE.Group(); holder.scale.setScalar(s); object.position.set(0, 0, 0); holder.add(object);
    holder.position.set(-(stats.min[0] + stats.size[0] / 2) * s, 0.52 - stats.min[1] * s, -(stats.min[2] + stats.size[2] / 2) * s);
    root.add(holder, plinth(0.42, 0.34));
    total = mesh.triangles;
    var summary = `part ${only}: ${mesh.triangles} triangles (${mesh.grids.map((g) => g.triangles).join(' + ')}), shown at x${s.toFixed(1)}`;
  } else {
    ROWS.forEach((row, ri) => row.forEach((name, ci) => {
      const { object, mesh, stats } = partObject(name, M);
      const x = (ci - 3) * 0.86, z = ri === 0 ? 0.9 : -0.55, h = ri === 0 ? 0.62 : 0.42;
      const big = Math.max(...stats.size), s = big < 0.7 ? Math.min(3.5, 0.78 / big) : Math.min(1.15, 1.1 / big);
      const holder = new THREE.Group(); holder.scale.setScalar(s); holder.add(object);
      holder.position.set(x - (stats.min[0] + stats.size[0] / 2) * s, h + 0.04 - stats.min[1] * s, z - (stats.min[2] + stats.size[2] / 2) * s);
      const p = plinth(h); p.position.set(x, 0, z);
      root.add(p, holder);
      labels.push({ text: `${name}  ${mesh.triangles} tris${s > 1.01 ? `  x${s.toFixed(1)}` : ''}`, at: new THREE.Vector3(x, h + 0.04 + stats.size[1] * s + 0.1, z) });
      total += mesh.triangles;
    }));
    summary = `parts board: ${PART_NAMES.length} parts, ${total} triangles in all (one of each; the finished fiend uses a set that fits 8k)`;
  }
  const ms = Math.round(performance.now() - t0);

  const box = document.createElement('div');
  box.textContent = `${summary}, meshed in ${ms} ms`;
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;font:12px ui-monospace,monospace;color:#d4a84a;background:#0008;padding:4px 8px;border-radius:6px';
  document.body.appendChild(box); console.log(box.textContent);
  const els = labels.map((l) => { const d = document.createElement('div'); d.textContent = l.text; d.style.cssText = 'position:fixed;font:11px ui-monospace,monospace;color:#e8d4a8;background:#0007;padding:1px 6px;border-radius:4px;transform:translate(-50%,-100%);pointer-events:none;white-space:nowrap'; document.body.appendChild(d); return d; });

  const v = new THREE.Vector3();
  return {
    root, board: !only,
    idle() {},
    onFrame(camera, w, h) {                                                      // keeps the HTML labels over their parts
      labels.forEach((l, i) => { v.copy(l.at).project(camera); els[i].style.left = ((v.x * 0.5 + 0.5) * w) + 'px'; els[i].style.top = ((-v.y * 0.5 + 0.5) * h) + 'px'; els[i].style.display = v.z < 1 ? '' : 'none'; });
    },
  };
}
