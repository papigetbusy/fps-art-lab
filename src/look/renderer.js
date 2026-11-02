// The shared look: renderer, environment, lights. Look-only numbers live in presets.js and here.
// Light plan: warm torch key (casts shadows), cool soft fill, crimson rim from behind, hemisphere + environment for ambient.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { pickPreset } from './presets.js';

export { PRESETS } from './presets.js';

// A big gradient dome instead of a flat background colour: dark at the top, a faint warm glow behind the subject.
function createBackdrop() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x070506) },
      horizon: { value: new THREE.Color(0x1b100d) },
      glow: { value: new THREE.Color(0x4a1610) },
    },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 glow; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y*0.5+0.5, 0.0, 1.0);
        vec3 c = mix(horizon, top, smoothstep(0.45, 0.95, h));
        float g = pow(max(dot(normalize(vDir.xz + 1e-5), normalize(vec2(0.4,0.9))),0.0), 3.0) * (1.0 - smoothstep(0.5, 0.75, h));
        gl_FragColor = vec4(c + glow*g*0.5, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), mat);
  dome.renderOrder = -1; dome.frustumCulled = false;
  return dome;
}

export function createLook(canvasParent, presetName) {
  const preset = pickPreset(presetName);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = preset.exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasParent.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(createBackdrop());
  scene.fog = new THREE.FogExp2(0x1a100d, 0.07);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;

  // ambient: cool sky, warm bounce from the stone floor
  const hemi = new THREE.HemisphereLight(0x5a6a8a, 0x2a1208, 0.5);
  scene.add(hemi);

  // warm torch key, from the front (the creature faces -Z) and above, the only light that casts shadows
  const key = new THREE.DirectionalLight(0xffb070, 2.6);
  key.position.set(2.5, 4, -3);
  key.castShadow = true;
  key.shadow.mapSize.set(preset.shadowMap, preset.shadowMap);
  const s = 2.6;
  Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 12 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.025;
  scene.add(key);

  // cool soft fill from the opposite side so shadows are never pure black
  const fill = new THREE.DirectionalLight(0x6a80b0, 0.5);
  fill.position.set(-3, 1.5, -2.5);
  scene.add(fill);

  // crimson rim from behind the creature: separates the silhouette from the dark background
  const rim = new THREE.DirectionalLight(0xff3040, 2.2);
  rim.position.set(-3, 2.5, 3.5);
  scene.add(rim);

  return { renderer, scene, preset, lights: { hemi, key, fill, rim } };
}
