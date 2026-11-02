// The shared look: renderer, environment, lights, presets. Look-only numbers live here.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { applyLightMode, pickLightMode, CANDLE_BUDGET } from './candle.js';

export const PRESETS = {
  phone: { pixelRatio: 1.5, shadows: 1024, bloomScale: 0.35, fxaa: true },
  high: { pixelRatio: 2, shadows: 2048, bloomScale: 0.5, fxaa: true },
};

export const LOOK = {
  exposure: 1.05,
  fog: { color: 0x0e0908, density: 0.075 },
  background: 0x0a0706,
  envIntensity: 0.18,
  hemi: { sky: 0x6a5a58, ground: 0x140806, intensity: 0.35 },
  key: { color: 0xffc89a, intensity: 3.0, pos: [2.2, 4.6, -2.6] },     // warm torch key from the front-right, above
  rim: { color: 0xff2030, intensity: 2.2, pos: [-2.6, 2.6, 3.2] },    // crimson rim from behind
  fill: { color: 0x7088b0, intensity: 0.6, pos: [-3, 1.5, -2] },     // cool, weak fill so shadows are not black
};

export function createLook(parent, presetName, lightName) {
  const preset = { ...(PRESETS[presetName] || PRESETS.phone) };
  preset.name = PRESETS[presetName] ? presetName : 'phone';
  preset.candle = CANDLE_BUDGET[preset.name];
  const lightMode = pickLightMode(lightName);
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = LOOK.exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  parent.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(LOOK.background);
  scene.fog = new THREE.FogExp2(LOOK.fog.color, LOOK.fog.density);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = LOOK.envIntensity;

  const hemi = new THREE.HemisphereLight(LOOK.hemi.sky, LOOK.hemi.ground, LOOK.hemi.intensity); scene.add(hemi);
  const key = new THREE.DirectionalLight(LOOK.key.color, LOOK.key.intensity);
  key.position.set(...LOOK.key.pos); key.castShadow = true;
  key.shadow.mapSize.set(preset.shadows, preset.shadows);
  Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 3, bottom: -1, near: 0.5, far: 12 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(LOOK.rim.color, LOOK.rim.intensity); rim.position.set(...LOOK.rim.pos); scene.add(rim);
  const fill = new THREE.DirectionalLight(LOOK.fill.color, LOOK.fill.intensity); fill.position.set(...LOOK.fill.pos); scene.add(fill);

  const lights = { hemi, key, rim, fill };
  applyLightMode({ renderer, scene, lights, base: LOOK }, lightMode);   // ?light=candle|torch|both (src/look/candle.js)
  return { renderer, scene, preset, lights, lightMode };
}
