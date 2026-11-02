// Post-processing: bloom on bright emissives only (high threshold), colour grade (crimson/gold), vignette, FXAA edge smoothing.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

export const GRADE = { lift: [0.012, 0.004, 0.004], gain: [1.06, 0.98, 0.9], saturation: 0.92, vignette: 0.55, grain: 0.025 };

// runs after tone mapping (on display colours): shadows lean crimson, highlights lean gold, a little film grain
const Grade = {
  uniforms: { tDiffuse: { value: null }, lift: { value: new THREE.Vector3(...GRADE.lift) }, gain: { value: new THREE.Vector3(...GRADE.gain) },
    saturation: { value: GRADE.saturation }, vignette: { value: GRADE.vignette }, grain: { value: GRADE.grain }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 lift; uniform vec3 gain; uniform float saturation; uniform float vignette; uniform float grain; uniform float time; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb;
      float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, saturation);
      col = col * gain + lift * (1.0 - col);
      float d = distance(vUv, vec2(0.5)); col *= 1.0 - vignette * smoothstep(0.3, 0.85, d);
      col += (h(vUv * 1000.0 + time) - 0.5) * grain;
      gl_FragColor = vec4(col, c.a); }`,
};

export function createPost(renderer, scene, camera, preset) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.92);   // strength, radius, threshold (only very bright things glow)
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(Grade); composer.addPass(grade);
  let fxaa = null;
  if (preset.fxaa) { fxaa = new ShaderPass(FXAAShader); composer.addPass(fxaa); }
  return {
    composer,
    setSize(w, h, pr) {
      composer.setSize(w, h);
      bloom.resolution.set(w * preset.bloomScale, h * preset.bloomScale);
      if (fxaa) fxaa.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr));
    },
    render(t) { grade.uniforms.time.value = t % 100; composer.render(); },
  };
}
