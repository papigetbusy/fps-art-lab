// LAB PLACEHOLDER: a gothic horned demon built from hand-placed shapes (not the final kit creature).
// It exists to judge the look: lighting, materials, proportions. Model space: feet at y = 0, +Y up, faces -Z, about 2.2 m tall.
// Rig nodes follow the art contract: root, torso, head, arm_l, arm_r, leg_l, leg_r, tail, eyes.
import * as THREE from 'three';
import { taperTube, limb, lathe } from './shapes.js';

export function buildFiend(M) {
  const root = new THREE.Group(); root.name = 'root';
  const mesh = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const node = (name, x, y, z, parent) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; };

  // pelvis + belt
  const hips = node('hips', 0, 1.02, 0.02, root);
  mesh(new THREE.SphereGeometry(0.2, 24, 16), M.skin, hips).scale.set(1.25, 0.8, 0.95);
  const belt = mesh(new THREE.TorusGeometry(0.235, 0.035, 10, 40), M.iron, hips); belt.rotation.x = Math.PI / 2; belt.scale.set(1.08, 0.9, 1);
  const buckle = mesh(lathe([[0, 0], [0.06, 0], [0.065, 0.015], [0.04, 0.03], [0, 0.032]], 6), M.gold, hips); buckle.rotation.x = -Math.PI / 2; buckle.position.set(0, 0, -0.245);
  // torn crimson loincloth, front and back
  for (const z of [-1, 1]) {
    const cloth = new THREE.PlaneGeometry(0.26, 0.5, 4, 8), p = cloth.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setZ(i, Math.sin(y * 6 + x * 9) * 0.015 + (y < -0.15 ? (Math.abs(x) * 0.15) : 0)); if (y < -0.2) p.setY(i, y - Math.abs(Math.sin(x * 40)) * 0.06); }
    cloth.computeVertexNormals(); const c = mesh(cloth, M.cloth, hips); c.position.set(0, -0.22, z * 0.21); c.rotation.x = z * 0.12;
  }

  // legs: digitigrade (thigh forward, shin back, long hoof-foot) for a demonic stance
  for (const s of [-1, 1]) {
    const leg = node(s < 0 ? 'leg_l' : 'leg_r', s * 0.15, 1.0, 0.02, root);
    mesh(limb([0, 0, 0], [s * 0.04, -0.42, -0.14], 0.12, 0.085), M.skin, leg);                   // heavy thigh
    mesh(limb([s * 0.04, -0.42, -0.14], [s * 0.05, -0.78, 0.1], 0.08, 0.055), M.skinDark, leg); // shin angled back
    mesh(limb([s * 0.05, -0.78, 0.1], [s * 0.05, -0.97, -0.02], 0.055, 0.045), M.skinDark, leg); // ankle
    const foot = mesh(limb([s * 0.05, -0.97, -0.02], [s * 0.05, -0.985, -0.2], 0.05, 0.035), M.skinDark, leg);
    for (const dx of [-0.035, 0, 0.035]) mesh(taperTube([[s * 0.05 + dx, -0.98, -0.19], [s * 0.05 + dx * 1.3, -0.99, -0.27], [s * 0.05 + dx * 1.4, -1.0, -0.31]], 0.02, 0.002, 8, 6), M.claw, leg);
    void foot;
  }

  // torso: lathe chest, wide shoulders, narrow waist, leaning slightly forward
  const torso = node('torso', 0, 1.08, 0.02, root); torso.rotation.x = 0.12;
  const chest = mesh(lathe([[0.001, 0], [0.17, 0.02], [0.19, 0.18], [0.27, 0.38], [0.31, 0.52], [0.27, 0.62], [0.12, 0.68], [0.001, 0.69]], 32), M.skin, torso);
  chest.scale.set(1.15, 1, 0.78);
  for (const s of [-1, 1]) { const pec = mesh(new THREE.SphereGeometry(0.13, 20, 14), M.skin, torso); pec.position.set(s * 0.11, 0.46, -0.1); pec.scale.set(1.1, 0.75, 0.5); pec.rotation.z = s * 0.25; }   // flat pecs
  // spine ridge of bone spikes down the back
  for (let i = 0; i < 6; i++) { const sp = mesh(new THREE.ConeGeometry(0.03 - i * 0.003, 0.12 - i * 0.01, 8), M.bone, torso); sp.position.set(0, 0.62 - i * 0.1, 0.2 - i * 0.005); sp.rotation.x = 1.1; }
  // left pauldron: layered iron plates with gold trim and a horn spike
  const paul = node('pauldron', -0.33, 0.6, 0, torso);
  for (let i = 0; i < 3; i++) { const plate = mesh(new THREE.SphereGeometry(0.17 - i * 0.025, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), M.iron, paul); plate.position.y = -i * 0.06; plate.scale.set(1.1, 0.7, 1); const trim = mesh(new THREE.TorusGeometry(0.16 - i * 0.025, 0.012, 6, 32), M.gold, paul); trim.rotation.x = Math.PI / 2; trim.position.y = -i * 0.06 + 0.005; trim.scale.set(1.1, 1, 1); }
  mesh(taperTube([[0, 0.08, 0], [-0.06, 0.22, 0.02], [-0.04, 0.3, 0.06]], 0.035, 0.003, 10, 8), M.horn, paul);

  // arms: long, heavy forearms, big clawed hands
  for (const s of [-1, 1]) {
    const arm = node(s < 0 ? 'arm_l' : 'arm_r', s * 0.36, 0.56, 0, torso);
    mesh(new THREE.SphereGeometry(0.13, 20, 14), M.skin, arm);                                       // deltoid
    mesh(limb([0, 0, 0], [s * 0.1, -0.36, 0.02], 0.1, 0.075), M.skin, arm);                          // upper arm
    const fore = node('fore', s * 0.1, -0.36, 0.02, arm); fore.rotation.x = -0.35;
    mesh(limb([0, 0, 0], [s * 0.03, -0.36, 0], 0.085, 0.06), M.skinDark, fore);                       // forearm
    const bracer = mesh(new THREE.CylinderGeometry(0.07, 0.078, 0.14, 16, 1, true), M.iron, fore); bracer.position.set(s * 0.02, -0.26, 0);
    for (const y of [-0.19, -0.33]) { const r = mesh(new THREE.TorusGeometry(0.075, 0.01, 6, 24), M.gold, fore); r.rotation.x = Math.PI / 2; r.position.set(s * 0.02, y, 0); }
    const hand = node('hand', s * 0.03, -0.38, 0, fore);
    mesh(new THREE.SphereGeometry(0.065, 16, 12), M.skinDark, hand).scale.set(0.9, 1.1, 0.7);
    for (let f = 0; f < 4; f++) { const dz = -0.04 + f * 0.028; mesh(taperTube([[s * 0.01, -0.05, dz], [s * 0.03, -0.13, dz - 0.02], [s * 0.02, -0.2, dz - 0.05], [s * 0.0, -0.24, dz - 0.09]], 0.018, 0.012, 10, 8), M.skinDark, hand); mesh(taperTube([[s * 0.0, -0.24, dz - 0.09], [s * -0.01, -0.27, dz - 0.13], [s * -0.01, -0.28, dz - 0.17]], 0.012, 0.001, 8, 6), M.claw, hand); }
  }

  // neck + head: heavy brow, long jaw, cheek ridges, swept-back horns
  mesh(limb([0, 0.62, -0.02], [0, 0.78, -0.08], 0.11, 0.09), M.skin, torso);
  const head = node('head', 0, 0.84, -0.1, torso);
  const skull = mesh(new THREE.SphereGeometry(0.15, 32, 24), M.skin, head); skull.scale.set(0.95, 1.05, 1.1);
  const brow = mesh(new THREE.CapsuleGeometry(0.04, 0.18, 6, 16), M.skinDark, head); brow.rotation.z = Math.PI / 2; brow.position.set(0, 0.04, -0.13);
  const jaw = node('jaw', 0, -0.06, -0.02, head);
  const jawM = mesh(new THREE.SphereGeometry(0.11, 24, 16), M.skin, jaw); jawM.scale.set(0.95, 0.6, 1.25); jawM.position.set(0, -0.04, -0.06);
  mesh(new THREE.BoxGeometry(0.15, 0.03, 0.06), new THREE.MeshStandardMaterial({ color: 0x120404, roughness: 1 }), jaw).position.set(0, -0.01, -0.17);   // mouth gap
  for (let i = 0; i < 6; i++) { const x = -0.06 + i * 0.024; const t = mesh(new THREE.ConeGeometry(0.008, 0.035, 6), M.bone, jaw); t.position.set(x, 0.005, -0.18); t.rotation.x = Math.PI; }
  for (const s of [-1, 1]) {
    mesh(new THREE.ConeGeometry(0.012, 0.06, 6), M.bone, jaw).position.set(s * 0.055, 0.02, -0.17);                // fangs
    mesh(new THREE.CapsuleGeometry(0.025, 0.08, 4, 10), M.skinDark, head).position.set(s * 0.1, -0.02, -0.09);      // cheekbones
    // big ram-like horns sweeping back and up, plus small brow horns
    mesh(taperTube([[s * 0.09, 0.09, -0.04], [s * 0.2, 0.17, 0.02], [s * 0.3, 0.25, 0.14], [s * 0.3, 0.42, 0.24], [s * 0.24, 0.55, 0.22]], 0.05, 0.004, 32, 12, 0.8), M.horn, head);
    mesh(taperTube([[s * 0.05, 0.08, -0.12], [s * 0.07, 0.15, -0.1], [s * 0.08, 0.2, -0.04]], 0.018, 0.002, 10, 8), M.horn, head);
    const ear = mesh(new THREE.ConeGeometry(0.03, 0.12, 8), M.skinDark, head); ear.position.set(s * 0.15, 0.02, 0.02); ear.rotation.z = -s * 1.2;
  }
  const eyes = node('eyes', 0, 0.015, -0.155, head);
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.018, 12, 8), M.eye, eyes); e.position.x = s * 0.05; e.scale.set(1.4, 0.6, 0.6); e.castShadow = false; }
  node('hit_head', 0, 0, 0, head);

  // tail: long, tapering, ending in a bone barb
  const tail = node('tail', 0, 1.0, 0.22, root);
  mesh(taperTube([[0, 0, 0], [0, -0.15, 0.25], [0.15, -0.55, 0.5], [0.35, -0.9, 0.45], [0.45, -0.98, 0.2]], 0.06, 0.012, 40, 10), M.skinDark, tail);
  const barb = mesh(new THREE.ConeGeometry(0.04, 0.14, 4), M.bone, tail); barb.position.set(0.47, -0.99, 0.14); barb.rotation.set(Math.PI / 2, 0, 0.3);

  const parts = { hips, torso, head, jaw, tail, eyes, arms: [root.getObjectByName('arm_l'), root.getObjectByName('arm_r')] };
  // idle: slow breathing, head looks around, arms hang heavy and sway, tail swishes, eyes pulse
  function idle(t) {
    const br = Math.sin(t * 1.4);
    torso.scale.set(1 + br * 0.012, 1 + br * 0.008, 1 + br * 0.015); torso.rotation.x = 0.12 + br * 0.015;
    head.rotation.set(Math.sin(t * 0.6) * 0.06 - 0.05, Math.sin(t * 0.37) * 0.35, Math.sin(t * 0.5) * 0.05);
    jaw.rotation.x = 0.06 + Math.max(0, Math.sin(t * 0.8)) * 0.08;
    parts.arms.forEach((a, i) => { const s = i ? 1 : -1; a.rotation.set(Math.sin(t * 1.1 + i) * 0.06, 0, s * (0.12 + br * 0.02)); });
    tail.rotation.set(Math.sin(t * 0.9) * 0.08, Math.sin(t * 0.7) * 0.4, 0);
    M.eye.emissiveIntensity = 5 + Math.sin(t * 3) * 1.5;
  }
  return { root, parts, idle };
}
