// Candle-lit chapel dressing: candle clusters and a candelabra (the key light), wax pools, soot, haze, embers and dust.
// All look numbers (colours, flicker depth, light budget) live in src/look/candle.js. Layout here is data, not typed geometry.
import * as THREE from 'three';
import { lathe } from './shapes.js';
import { radial } from '../look/textures.js';
import { makeGlow, flameTexture, softTexture } from './glow.js';
import { FLAME, flicker } from '../look/candle.js';

function rng(seed) { let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }

// Where the light comes from. x, z in metres on the floor; n = candles in the cluster. Lights are used in this order,
// as many as the preset allows (phone 3, high 6); the rest of the clusters are glow only.
const KEY_STAND = { x: -1.7, z: -1.6, height: 1.05 };                 // candelabra: the shadow-casting key
const CLUSTERS = [[-2.4, 0.6, 6], [1.9, 2.2, 6], [-1.2, 2.4, 6], [2.7, -0.3, 5], [0.9, -2.6, 5], [3.0, 1.2, 5]];
const DAIS_RING = { count: 9, radius: 1.18, from: -0.2, to: Math.PI + 0.2 };   // a few small candles along the back half of the dais
const TORCH_SPOTS = [[-2.4, 1.78, 1.24], [2.4, 1.78, 1.24]];               // brazier flames (see stage.js), for embers

function waxMaterial() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d'), r = rng(5);
  x.fillStyle = '#d9cbb0'; x.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 22; i++) { const px = r() * 64, len = 20 + r() * 80; x.fillStyle = `rgba(${r() < 0.5 ? '255,248,225' : '170,150,115'},0.35)`; x.fillRect(px, 0, 2 + r() * 4, len); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 1.5, color: 0xcdbd9c, roughness: 0.5, emissive: 0x3a1a08, emissiveIntensity: 0.6 });
}

export function buildCandles(scene, M, preset, { stoneY = 0.08 } = {}) {
  const budget = preset.candle, root = new THREE.Group(); scene.add(root);
  const R = rng(11), candles = [];                     // { x, y, z, h, r, cluster }
  const lightClusters = CLUSTERS.slice(0, budget.pointLights);

  // --- layout: every candle is a position, a height and a radius
  const addCluster = (cx, cz, n, ci) => { for (let i = 0; i < n; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * 0.28; candles.push({ x: cx + Math.cos(a) * d, y: 0, z: cz + Math.sin(a) * d, h: 0.08 + R() * 0.38, r: 0.016 + R() * 0.014, cluster: ci }); } };
  CLUSTERS.forEach(([x, z, n], i) => addCluster(x, z, n, i));
  const keyCi = CLUSTERS.length;
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4; candles.push({ x: KEY_STAND.x + Math.cos(a) * 0.1, y: KEY_STAND.height, z: KEY_STAND.z + Math.sin(a) * 0.1, h: 0.2 + R() * 0.1, r: 0.026, cluster: keyCi }); }
  for (let i = 0; i < DAIS_RING.count; i++) { const a = DAIS_RING.from + (i / (DAIS_RING.count - 1)) * (DAIS_RING.to - DAIS_RING.from) + (R() - 0.5) * 0.1;
    candles.push({ x: Math.cos(a) * DAIS_RING.radius, y: stoneY, z: Math.sin(a) * DAIS_RING.radius, h: 0.05 + R() * 0.1, r: 0.014 + R() * 0.006, cluster: -1 }); }

  // --- wax bodies: one InstancedMesh, one draw call
  const wax = waxMaterial();
  const body = new THREE.InstancedMesh(lathe([[0, 0], [1, 0], [1.05, 0.5], [1, 0.97], [0.7, 0.985], [0.2, 0.99], [0, 0.99]], 12), wax, candles.length);
  body.castShadow = true; body.receiveShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  candles.forEach((c, i) => { m.compose(p.set(c.x, c.y, c.z), q, s.set(c.r, c.h, c.r)); body.setMatrixAt(i, m); });
  root.add(body);
  // wick glints and the pooled wax at the foot of each floor cluster
  const poolMat = new THREE.MeshStandardMaterial({ map: radial('rgba(205,188,150,0.95)', 'rgba(205,188,150,0)', 128), transparent: true, depthWrite: false, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 });
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), poolMat, candles.length);
  candles.forEach((c, i) => { const w = c.r * (c.y > 0.5 ? 6 : 9); m.compose(p.set(c.x, c.y + 0.003, c.z), q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, R() * 6)), s.set(w, w, 1)); pools.setMatrixAt(i, m); });
  pools.receiveShadow = true; root.add(pools);

  // the candelabra: iron stem, foot, and a dish under the three candles
  const stand = new THREE.Group(); stand.position.set(KEY_STAND.x, 0, KEY_STAND.z); root.add(stand);
  const stem = new THREE.Mesh(lathe([[0.2, 0], [0.2, 0.04], [0.09, 0.09], [0.035, 0.2], [0.03, 0.45], [0.05, 0.5], [0.03, 0.56], [0.03, 0.9], [0.06, 0.95], [0.16, 1.0], [0.17, 1.03], [0.0, 1.03]], 18), M.iron);
  stem.castShadow = stem.receiveShadow = true; stand.add(stem);

  // --- glow layers (flames, halos, haze, embers, dust): four draw calls in all
  const flameTex = flameTexture(), soft = softTexture();
  const flames = makeGlow(candles.length, flameTex), halos = makeGlow(candles.length + CLUSTERS.length + 1, soft);
  candles.forEach((c, i) => { flames.pos.set([c.x, c.y + c.h + 0.028, c.z], i * 3); flames.setColor(i, FLAME.color); halos.pos.set([c.x, c.y + c.h + 0.035, c.z], i * 3); halos.setColor(i, FLAME.color); });
  const hazeAt = [...CLUSTERS.map(([x, z]) => [x, 0.55, z]), [KEY_STAND.x, KEY_STAND.height + 0.3, KEY_STAND.z]];
  hazeAt.forEach((h, j) => { const i = candles.length + j; halos.pos.set(h, i * 3); halos.setColor(i, 0xff7a30); });
  root.add(halos.points, flames.points);

  const embers = makeGlow(budget.embers, soft), EH = 1.6;          // embers rise 1.6 m, drift, fade
  const eSrc = [], eSeed = [];
  for (let i = 0; i < embers.count; i++) { const useTorch = R() < 0.6; const src = useTorch ? TORCH_SPOTS[i % 2] : [candles[(R() * candles.length) | 0].x, candles[0].y + 0.5, 0]; if (!useTorch) { const c = candles[(R() * candles.length) | 0]; src[0] = c.x; src[1] = c.y + c.h; src[2] = c.z; }
    eSrc.push({ p: src.slice(), torch: useTorch, side: i % 2 }); eSeed.push(R()); embers.setColor(i, R() < 0.5 ? 0xff7a28 : 0xffb050); }
  root.add(embers.points);
  const dust = makeGlow(60, soft), dr = rng(23);
  for (let i = 0; i < dust.count; i++) { dust.pos.set([(dr() - 0.5) * 8, 0.2 + dr() * 3.3, (dr() - 0.5) * 7], i * 3); dust.size[i] = 0.014 + dr() * 0.012; dust.setColor(i, 0xffc890); }
  root.add(dust.points);

  // --- real lights: one shadow-casting spot at the candelabra, a few point lights at clusters (budget by preset)
  const keyLight = new THREE.SpotLight(FLAME.light, 40, 12, 0.75, 1, 2);
  keyLight.position.set(KEY_STAND.x, KEY_STAND.height + 0.3, KEY_STAND.z); keyLight.target.position.set(0, 1.0, 0);
  keyLight.castShadow = true; keyLight.shadow.mapSize.set(preset.shadows, preset.shadows); keyLight.shadow.bias = -0.0004; keyLight.shadow.normalBias = 0.03; keyLight.shadow.radius = 5;
  keyLight.shadow.camera.near = 0.4; keyLight.shadow.camera.far = 9;
  root.add(keyLight, keyLight.target);
  const pointLights = lightClusters.map(([x, z]) => { const l = new THREE.PointLight(FLAME.light, 4, 7, 2); l.position.set(x, 0.55, z); root.add(l); return l; });

  // --- soot: dark smears on the back wall and on the floor round the braziers; they only darken, never glow
  const sootTex = radial('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 128);
  const sootMat = new THREE.MeshBasicMaterial({ map: sootTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  [[-2.4, 2.6, 2.4, 4.2], [2.4, 2.6, 2.4, 4.2], [-0.2, 3.2, 3.5, 3.2]].forEach(([x, y, w, h]) => { const s2 = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sootMat); s2.position.set(x, y, 4.47); s2.rotation.y = Math.PI; root.add(s2); });
  TORCH_SPOTS.forEach(([x, , z]) => { const s2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), sootMat); s2.rotation.x = -Math.PI / 2; s2.position.set(x, 0.004, z + 0.35); root.add(s2); });

  // --- per-frame
  let level = 1, flickerOn = true;
  const seeds = candles.map((_, i) => i * 1.37);
  function update(t, camera, pixelsHigh) {
    if (!root.visible) return;
    const tt = flickerOn ? t : 0;
    flames.setScale(pixelsHigh, camera.fov); halos.setScale(pixelsHigh, camera.fov); embers.setScale(pixelsHigh, camera.fov); dust.setScale(pixelsHigh, camera.fov);
    candles.forEach((c, i) => {
      const f = flickerOn ? flicker(t, seeds[i], FLAME.depth * 2.2) : 1;
      flames.size[i] = 0.1 * f; flames.alpha[i] = 0.95 * Math.min(1.1, f);
      halos.size[i] = 0.3 * f; halos.alpha[i] = 0.1;
    });
    hazeAt.forEach((_, j) => { const i = candles.length + j; halos.size[i] = j === CLUSTERS.length ? 2.2 : 1.5; halos.alpha[i] = 0.035 * level; });
    keyLight.intensity = 40 * level * flicker(tt, 1.1); pointLights.forEach((l, i) => { l.intensity = 4 * level * flicker(tt, 3 + i * 2.3); });
    const eg = embers; for (let i = 0; i < eg.count; i++) { const u = (tt * (0.12 + eSeed[i] * 0.2) + eSeed[i] * 7) % 1, s0 = eSrc[i];
      eg.pos[i * 3] = s0.p[0] + Math.sin(tt * 1.3 + eSeed[i] * 20) * 0.15 * u; eg.pos[i * 3 + 1] = s0.p[1] + u * EH; eg.pos[i * 3 + 2] = s0.p[2] + Math.cos(tt * 1.1 + eSeed[i] * 17) * 0.15 * u;
      eg.size[i] = 0.02 * (1 - u * 0.6); eg.alpha[i] = (1 - u) * (s0.torch ? torchLevel : level) * 0.9; }
    for (let i = 0; i < dust.count; i++) { dust.pos[i * 3 + 1] += 0; dust.alpha[i] = 0.3 * level * (0.6 + 0.4 * Math.sin(tt * 0.7 + i)); dust.pos[i * 3] += Math.sin(tt * 0.1 + i) * 0.00005; }
    flames.touch(); halos.touch(); embers.touch(); dust.touch();
  }
  let torchLevel = 0;
  return {
    update, keyLight, root,
    setLevel(v) { level = v; root.visible = v > 0; keyLight.visible = v > 0; pointLights.forEach((l) => (l.visible = v > 0)); },
    setTorchLevel(v) { torchLevel = v; },
    setFlicker(on) { flickerOn = on; },
  };
}
