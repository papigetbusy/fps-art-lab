// Lab view for a creature made from data (src/kit/creatures/<name>.js): assembles the parts, builds a rig of THREE groups
// (one per instance, pivoting where it attaches), and gives the lab a gentle idle: breathing, a slow head turn, a jaw that works, arms and tail drifting.
import * as THREE from 'three';
import { assemble } from '../kit/assemble.js';
import { toGeometry } from '../kit/geometry.js';
import { hornedFiend } from '../kit/creatures/horned_fiend.js';

export const CREATURES = { horned_fiend: hornedFiend };

export function buildCreature(M, name = 'horned_fiend') {
  const spec = CREATURES[name]; if (!spec) throw new Error('unknown creature ' + name);
  const t0 = performance.now(), built = assemble(spec), root = new THREE.Group(), nodes = {};
  for (const inst of built.instances) {                              // one rig node per instance; the rest pose is baked into the geometry
    const g = new THREE.Group(); g.name = inst.id; nodes[inst.id] = g;
    const P = inst.pivot, parent = inst.on ? built.instances.find((i) => i.id === inst.on) : null;
    g.position.set(P[0] - (parent ? parent.pivot[0] : 0), P[1] - (parent ? parent.pivot[1] : 0), P[2] - (parent ? parent.pivot[2] : 0));
    const mesh = inst.mesh, local = new Float32Array(mesh.positions);
    for (let v = 0; v < local.length; v += 3) { local[v] -= P[0]; local[v + 1] -= P[1]; local[v + 2] -= P[2]; }
    const { geometry, roles } = toGeometry({ ...mesh, positions: local });
    const object = new THREE.Mesh(geometry, roles.map((r) => M[r] || M.skin));
    object.castShadow = object.receiveShadow = true; g.add(object);
    (parent ? nodes[parent.id] : root).add(g);
  }
  const ms = Math.round(performance.now() - t0);
  const label = document.createElement('div');
  label.textContent = `${name}: ${built.triangles} triangles (limit ${spec.budget}), height ${(built.bounds.max[1] - built.bounds.min[1]).toFixed(2)} m, built in ${ms} ms`;
  label.style.cssText = 'position:fixed;left:8px;bottom:8px;font:12px ui-monospace,monospace;color:#d4a84a;background:#0008;padding:4px 8px;border-radius:6px';
  document.body.appendChild(label); console.log(label.textContent);

  const rest = Object.fromEntries(Object.entries(nodes).map(([k, g]) => [k, g.rotation.clone()]));
  return {
    root, nodes, built, name,
    idle(t) {                                                         // small, slow, a little wrong: it breathes and watches
      const set = (id, x = 0, y = 0, z = 0) => { const n = nodes[id]; if (n) n.rotation.set(rest[id].x + x, rest[id].y + y, rest[id].z + z); };
      const b = Math.sin(t * 1.3);
      set('body', b * 0.012, Math.sin(t * 0.35) * 0.03, 0);
      set('head', Math.sin(t * 0.5) * 0.03 + b * 0.01, Math.sin(t * 0.27 + 1) * 0.12, Math.sin(t * 0.4) * 0.02);
      set('jaw', -0.05 - 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9)), 0, 0);
      set('armR', Math.sin(t * 0.8) * 0.03, 0, Math.sin(t * 1.1) * 0.015); set('armL', Math.sin(t * 0.8 + 1.5) * 0.03, 0, -Math.sin(t * 1.1) * 0.015);
      set('tail', 0, Math.sin(t * 0.6) * 0.1, 0);
    },
  };
}
