// One draw call for many soft glowing dots (flames, halos, embers, dust). Additive, depth-tested, ignores fog on purpose
// (flames must stay visible through the haze). Each dot has its own size (metres), colour and alpha, changed from JS every frame.
import * as THREE from 'three';

const VERT = `attribute float aSize; attribute float aAlpha; attribute vec3 aColor; uniform float uScale;
varying float vAlpha; varying vec3 vColor;
void main(){ vAlpha=aAlpha; vColor=aColor; vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*uScale/max(0.05,-mv.z); gl_Position=projectionMatrix*mv; }`;
const FRAG = `uniform sampler2D map; varying float vAlpha; varying vec3 vColor;
void main(){ vec4 t=texture2D(map,gl_PointCoord); gl_FragColor=vec4(vColor*t.rgb*t.a*vAlpha,1.0); }`;

export function makeGlow(count, texture) {
  const pos = new Float32Array(count * 3), size = new Float32Array(count), alpha = new Float32Array(count), col = new Float32Array(count * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: texture }, uScale: { value: 600 } }, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(g, mat); points.frustumCulled = false;
  const c = new THREE.Color();
  return {
    points, pos, size, alpha, count,
    setColor(i, hex) { c.set(hex); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; },
    // pixelsHigh = drawing-buffer height; fov in degrees. Converts metres to pixels for the current camera.
    setScale(pixelsHigh, fovDeg) { mat.uniforms.uScale.value = pixelsHigh / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)); },
    touch() { g.attributes.position.needsUpdate = g.attributes.aSize.needsUpdate = g.attributes.aAlpha.needsUpdate = g.attributes.aColor.needsUpdate = true; },
  };
}

// a teardrop flame picture and a soft round glow, drawn once on a canvas
export function flameTexture(size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.translate(size / 2, size * 0.58); x.scale(0.42, 1);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
  g.addColorStop(0, 'rgba(255,245,210,1)'); g.addColorStop(0.25, 'rgba(255,190,90,0.9)'); g.addColorStop(0.65, 'rgba(255,100,20,0.35)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = g; x.beginPath(); x.moveTo(0, -size * 0.5); x.bezierCurveTo(size * 0.45, -size * 0.1, size * 0.4, size * 0.4, 0, size * 0.42);
  x.bezierCurveTo(-size * 0.4, size * 0.4, -size * 0.45, -size * 0.1, 0, -size * 0.5); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function softTexture(size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
