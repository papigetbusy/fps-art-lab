// Lab stage: a small torch-lit gothic chapel corner so the creature is judged in context.
// Worn flagstone floor, a raised stone dais with a gold inlay ring, two fluted pillars with braziers, a soft contact shadow.
import * as THREE from 'three';
import { lathe } from './shapes.js';
import { radial } from '../look/textures.js';
import { flicker } from '../look/candle.js';

export function buildStage(scene, M) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M.stone);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const dais = new THREE.Mesh(lathe([[0, 0.08], [1.25, 0.08], [1.3, 0.05], [1.36, 0.0]], 64), M.stone.clone());
  dais.material.map = M.stone.map.clone(); dais.material.map.repeat.set(2, 2); dais.material.map.needsUpdate = true;
  dais.receiveShadow = true; scene.add(dais);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.012, 6, 96), M.gold); ring.rotation.x = Math.PI / 2; ring.position.y = 0.082; scene.add(ring);
  // soft contact shadow under the creature (adds grounding where the shadow map is blurry)
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: radial('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.083; scene.add(blob);

  const torches = [];
  const flameTex = radial('rgba(255,200,120,1)', 'rgba(255,80,10,0)');
  for (const [x, z] of [[-2.4, 1.6], [2.4, 1.6]]) {
    const pillar = new THREE.Group(); pillar.position.set(x, 0, z); scene.add(pillar);
    const base = new THREE.Mesh(lathe([[0.42, 0], [0.42, 0.18], [0.34, 0.24], [0.3, 0.32]], 24), M.stoneWall); base.castShadow = base.receiveShadow = true; pillar.add(base);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 3.2, 20, 1), M.stoneWall); shaft.position.y = 1.9; shaft.castShadow = shaft.receiveShadow = true; pillar.add(shaft);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, f = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.1, 0.04), M.stoneWall); f.position.set(Math.cos(a) * 0.27, 1.9, Math.sin(a) * 0.27); f.rotation.y = -a; pillar.add(f); }
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 32), M.gold); band.rotation.x = Math.PI / 2; band.position.y = 1.2; pillar.add(band);
    const bowl = new THREE.Mesh(lathe([[0.02, 0], [0.12, 0.02], [0.22, 0.14], [0.24, 0.2], [0.2, 0.2]], 20), M.iron); bowl.position.set(0, 1.25, -0.36); bowl.castShadow = true; pillar.add(bowl);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.2), M.iron); arm.position.set(0, 1.27, -0.26); pillar.add(arm);
    const coals = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.ember); coals.position.set(0, 1.4, -0.36); coals.scale.y = 0.4; pillar.add(coals);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); flame.position.set(0, 1.62, -0.36); flame.scale.set(0.5, 0.75, 1); pillar.add(flame);
    const light = new THREE.PointLight(0xff8a3a, 6, 7, 2); light.position.set(0, 1.75, -0.4); pillar.add(light);
    torches.push({ light, flame, seed: x });
  }
  // dark back wall far behind (catches a little torch light, gives depth through the fog)
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), M.stoneWall); wall.position.set(0, 3.5, 4.5); wall.rotation.y = Math.PI; wall.receiveShadow = true; scene.add(wall);

  // torch level: 0 = unlit braziers (dark coals), 1 = full torches. Set once from ?light=
  let level = 1, flickerOn = true;
  function setTorches(v) { level = v; for (const tr of torches) { tr.light.visible = tr.flame.visible = v > 0; } }
  function setFlicker(on) { flickerOn = on; }
  function update(t) {
    for (const tr of torches) {
      const f = flickerOn ? flicker(t, tr.seed, 0.16) : 1;
      tr.light.intensity = 6 * level * f; tr.flame.scale.set(0.45 * f, 0.75 * (0.9 + (f - 1) * 0.5), 1);
    }
  }
  return { update, setTorches, setFlicker };
}
