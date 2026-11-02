// Phase 1 lab: a turntable for one creature in the realistic dark-gothic look.
// The demon is a LAB PLACEHOLDER (src/lab/fiend_placeholder.js), only to judge lights, materials and post.
// Claude replaces it with the SDF-kit creature (CLAUDE.md tasks 2-7).
// URL options: ?view=front|side|three|top (fixed camera, for render sheets), ?ui=0 (hide buttons), ?preset=phone|high, ?still=1 (no animation).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createLook } from '../src/look/renderer.js';
import { createMaterials } from '../src/look/materials.js';
import { createPost } from '../src/look/post.js';
import { buildFiend } from '../src/lab/fiend_placeholder.js';
import { buildStage } from '../src/lab/stage.js';

const params = new URLSearchParams(location.search);
const presetName = params.get('preset') || (matchMedia('(pointer:coarse)').matches ? 'phone' : 'high');
const { renderer, scene, preset } = createLook(document.body, presetName);
const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.15, 0); controls.enableDamping = true; controls.minDistance = 1.5; controls.maxDistance = 9; controls.maxPolarAngle = Math.PI * 0.55;
const M = createMaterials();
const stage = buildStage(scene, M);
const fiend = buildFiend(M);
fiend.root.position.y = 0.08;              // standing on the dais
scene.add(fiend.root);

// the model faces -Z, so "front" looks from -Z
const VIEWS = { front: [0, 1.35, -5.2], side: [5.2, 1.35, 0], three: [3.4, 1.8, -3.9], top: [0, 6.5, -0.01] };
let spin = false;
function setView(v) {
  if (v === 'spin') { spin = true; return; }
  spin = false; fiend.root.rotation.y = 0;
  camera.position.set(...VIEWS[v]); controls.target.set(0, v === 'top' ? 0.8 : 1.15, 0); controls.update();
}
setView(params.get('view') || 'three'); spin = !params.get('view');
document.querySelectorAll('#ui button').forEach((b) => b.onclick = () => setView(b.dataset.v));
if (params.get('ui') === '0') document.getElementById('ui').style.display = 'none';

const post = createPost(renderer, scene, camera, preset);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); post.setSize(w, h, renderer.getPixelRatio()); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const still = params.get('still') === '1';
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = still ? 1.2 : clock.getElapsedTime();
  if (spin) fiend.root.rotation.y = t * 0.35;
  fiend.idle(t); stage.update(t);
  controls.update(); post.render(t);
});
