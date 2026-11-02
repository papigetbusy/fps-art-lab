// Post-processing: bloom on bright emissives, tone mapping and sRGB output, vignette. Phone preset keeps it light.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const Vignette = {
  uniforms: { tDiffuse: { value: null }, strength: { value: 0.45 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float strength; varying vec2 vUv; void main(){ vec4 c=texture2D(tDiffuse,vUv); float d=distance(vUv,vec2(0.5)); c.rgb*=1.0-strength*smoothstep(0.35,0.85,d); gl_FragColor=c; }',
};

export function createPost(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.4, 0.85));
  composer.addPass(new OutputPass());
  composer.addPass(new ShaderPass(Vignette));
  return composer;
}
