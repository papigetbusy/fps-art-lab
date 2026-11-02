// Phase 1 lab: a turntable for one creature in the realistic dark-gothic look.
// The demon is a LAB PLACEHOLDER (src/lab/fiend_placeholder.js), only to judge lights, materials and post.
// Claude replaces it with the SDF-kit creature (CLAUDE.md tasks 2-7).
// URL options: ?light=candle|torch|both (default both), ?flicker=0 (freeze the flames), ?view=front|side|three|top (fixed camera, for render sheets), ?ui=0 (hide buttons), ?preset=phone|high, ?still=1 (no animation), ?sil=1 (flat white shape on black, for the silhouette score), ?kit=test (mesher test blob).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createLook } from '../src/look/renderer.js';
import { createMaterials } from '../src/look/materials.js';
import { createPost } from '../src/look/post.js';
import { buildFiend } from '../src/lab/fiend_placeholder.js';
import { buildStage } from '../src/lab/stage.js';
import { buildKitTest } from '../src/lab/kit_blob_view.js';
import { buildCandles } from '../src/lab/candles.js';
import { LIGHT_MODES } from '../src/look/candle.js';

const params = new URLSearchParams(location.search);
const presetName = params.get('preset') || (matchMedia('(pointer:coarse)').matches ? 'phone' : 'high');
const { renderer, scene, preset, lightMode } = createLook(document.body, presetName, params.get('light'));
const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.15, 0); controls.enableDamping = true; controls.minDistance = 1.5; controls.maxDistance = 9; controls.maxPolarAngle = Math.PI * 0.55;
const M = createMaterials();
const stage = buildStage(scene, M);
const candles = buildCandles(scene, M, preset);
const mode = LIGHT_MODES[lightMode], flickerOn = params.get('flicker') !== '0';
stage.setTorches(mode.torches); stage.setFlicker(flickerOn);
candles.setLevel(mode.candles); candles.setTorchLevel(mode.torches); candles.setFlicker(flickerOn);
const fiend = params.get('kit') === 'test' ? buildKitTest(M) : buildFiend(M);   // ?kit=test shows the Step 3 mesher test blob instead
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
let frames = 0;
const sil = params.get('sil') === '1';
if (sil) {                                                 // silhouette mode: only the creature, flat white, black background, no post
  scene.background = new THREE.Color(0x000000); scene.fog = null; scene.environment = null;
  scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const c of scene.children) if (c !== fiend.root) c.visible = false;
}
window.__lab = { renderer, scene, camera, setView, get frames() { return frames; } };                       // for the screenshot tools (tools/lib/browser.mjs)
renderer.setAnimationLoop(() => {
  const t = still ? 1.2 : clock.getElapsedTime();
  if (spin) fiend.root.rotation.y = t * 0.35;
  fiend.idle(t); stage.update(t); candles.update(t, camera, renderer.domElement.height);
  controls.update(); if (sil) renderer.render(scene, camera); else post.render(t);
  if (++frames === 3) window.__labReady = true;           // the tools wait for this before taking a picture
});
