// Post-processing: multisampled scene, restrained bloom on bright emissives, ACES + sRGB output,
// then one small pass for the crimson/gold colour grade, vignette and anti-banding dither. Presets live in presets.js.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Runs after OutputPass, so colours here are already the final display (sRGB) values.
const Grade = {
  uniforms: {
    tDiffuse: { value: null }, vignette: { value: 0.45 }, saturation: { value: 1.06 },
    shadowLift: { value: 0.5 }, goldHighlights: { value: 0.5 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vignette, saturation, shadowLift, goldHighlights; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c += vec3(0.04, 0.008, 0.012) * (1.0 - smoothstep(0.0, 0.35, l)) * shadowLift;   // shadows lean crimson
      c = mix(vec3(l), c, saturation);
      c *= mix(vec3(1.0), vec3(1.05, 1.0, 0.9), smoothstep(0.4, 1.0, l) * goldHighlights); // highlights lean gold
      c *= 1.0 - vignette * smoothstep(0.35, 0.9, distance(vUv, vec2(0.5)));
      c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;                                        // hides banding in dark gradients
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export function createPost(renderer, scene, camera, preset) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: preset.msaa });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  const b = preset.bloom;
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), b.strength, b.radius, b.threshold);
  const baseSetSize = bloom.setSize.bind(bloom);
  bloom.setSize = (w, h) => baseSetSize(Math.max(2, Math.round(w * b.scale)), Math.max(2, Math.round(h * b.scale))); // phone: bloom at half resolution
  composer.addPass(bloom);

  composer.addPass(new OutputPass());
  const grade = new ShaderPass(Grade);
  Object.assign(grade.uniforms, Object.fromEntries(Object.entries(preset.grade).map(([k, v]) => [k, { value: v }])));
  composer.addPass(grade);
  return composer;
}
