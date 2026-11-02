// The shared look: renderer, environment, lights. Look-only numbers live here.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const PRESETS = {
  phone: { pixelRatio: 1, shadows: 1024 },
  high: { pixelRatio: 2, shadows: 2048 },
};

export function createLook(canvasParent, presetName) {
  const preset = PRESETS[presetName] || PRESETS.phone;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasParent.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0a09);
  scene.fog = new THREE.FogExp2(0x140e0c, 0.06);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  scene.add(new THREE.HemisphereLight(0x8a7060, 0x1a0a08, 0.6));
  const key = new THREE.DirectionalLight(0xffb070, 2.4);              // warm torch key
  key.position.set(2.5, 4, 3); key.castShadow = true;
  key.shadow.mapSize.set(preset.shadows, preset.shadows);
  key.shadow.camera.left = key.shadow.camera.bottom = -3; key.shadow.camera.right = key.shadow.camera.top = 3;
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3040, 2.0);               // crimson rim from behind
  rim.position.set(-3, 2.5, -3.5); scene.add(rim);

  return { renderer, scene, preset };
}
