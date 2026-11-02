// Phase 1 lab: turntable for one creature. The creature below is a PLACEHOLDER built from primitives,
// only to show the look (lights, materials, post). Claude replaces it with the SDF kit creature (see CLAUDE.md, tasks 2-7).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createLook } from '../src/look/renderer.js';
import { createMaterials } from '../src/look/materials.js';
import { createPost } from '../src/look/post.js';

const params = new URLSearchParams(location.search);
const { renderer, scene } = createLook(document.body, params.get('preset') || (matchMedia('(pointer:coarse)').matches ? 'phone' : 'high'));
const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0); controls.enableDamping = true;
const M = createMaterials();

// ground: dark stone disc with a soft contact shadow
const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 64), M.stone);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// placeholder creature (rounded primitives, real materials), 2.2 m tall, faces -Z
const creature = new THREE.Group(); scene.add(creature);
const add = (geo, mat, x, y, z, parent = creature) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const torso = add(new THREE.CapsuleGeometry(0.32, 0.5, 8, 24), M.skin, 0, 1.25, 0); torso.scale.set(1.15, 1, 0.8);
const head = new THREE.Group(); head.position.set(0, 1.85, -0.05); creature.add(head);
add(new THREE.SphereGeometry(0.2, 32, 24), M.skin, 0, 0, 0, head);
for (const s of [-1, 1]) {
  const horn = add(new THREE.ConeGeometry(0.05, 0.35, 16), M.horn, s * 0.14, 0.2, 0.02, head); horn.rotation.z = -s * 0.5; horn.rotation.x = -0.3;
  add(new THREE.SphereGeometry(0.03, 12, 8), M.ember, s * 0.07, 0.03, -0.18, head);
  const arm = add(new THREE.CapsuleGeometry(0.08, 0.6, 6, 16), M.skin, s * 0.45, 1.2, 0); arm.rotation.z = s * 0.15;
  add(new THREE.CapsuleGeometry(0.11, 0.65, 6, 16), M.skinDark, s * 0.17, 0.45, 0);
  add(new THREE.TorusGeometry(0.1, 0.02, 8, 24), M.gold, s * 0.45, 1.5, 0).rotation.x = Math.PI / 2;
}
add(new THREE.TorusGeometry(0.36, 0.03, 12, 48), M.gold, 0, 0.95, 0).rotation.x = Math.PI / 2;

const VIEWS = { front: [0, 1.2, -4.2], side: [4.2, 1.2, 0], three: [3, 1.6, -3], top: [0, 5, -0.01] };
let spin = !params.get('view');
function setView(v) { if (v === 'spin') { spin = true; return; } spin = false; camera.position.set(...VIEWS[v]); creature.rotation.y = 0; }
setView(params.get('view') || 'three'); if (!params.get('view')) spin = true;
document.querySelectorAll('#ui button').forEach((b) => b.onclick = () => setView(b.dataset.v));
if (params.get('ui') === '0') document.getElementById('ui').style.display = 'none';

const composer = createPost(renderer, scene, camera);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (spin) creature.rotation.y = t * 0.4;
  torso.scale.y = 1 + Math.sin(t * 1.6) * 0.015;                     // breathing
  head.rotation.y = Math.sin(t * 0.7) * 0.12; head.rotation.x = Math.sin(t * 1.1) * 0.04;
  controls.update(); composer.render();
});
