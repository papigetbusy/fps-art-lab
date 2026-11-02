// Material roles shared by every creature and prop: one gothic look, no per-model one-offs. Realistic PBR, no toon.
import * as THREE from 'three';
import { demonSkin, flagstones } from './textures.js';

export function createMaterials() {
  const skin = demonSkin(), stone = flagstones();
  stone.map.repeat.set(6, 6); stone.bump.repeat.set(6, 6);
  return {
    skin: new THREE.MeshPhysicalMaterial({ map: skin.map, bumpMap: skin.bump, bumpScale: 1.2, roughness: 0.62, sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xd05a40), clearcoat: 0.15, clearcoatRoughness: 0.6 }),
    skinDark: new THREE.MeshPhysicalMaterial({ map: skin.map, bumpMap: skin.bump, bumpScale: 1.2, color: 0x6a5050, roughness: 0.7, sheen: 0.3, sheenColor: new THREE.Color(0xa03020) }),
    horn: new THREE.MeshPhysicalMaterial({ color: 0x1c1612, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.35 }),
    bone: new THREE.MeshStandardMaterial({ color: 0xb8a888, roughness: 0.55 }),
    claw: new THREE.MeshPhysicalMaterial({ color: 0x0e0b0a, roughness: 0.25, clearcoat: 0.8 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xb8893a, metalness: 1, roughness: 0.34 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x2a2624, metalness: 0.85, roughness: 0.45 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0x4a0a10, roughness: 0.92, side: THREE.DoubleSide }),
    stone: new THREE.MeshStandardMaterial({ map: stone.map, bumpMap: stone.bump, bumpScale: 2.5, roughness: 0.9, color: 0x8a8a90 }),
    stoneWall: new THREE.MeshStandardMaterial({ color: 0x3a322c, roughness: 0.95 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x200000, emissive: 0xff3010, emissiveIntensity: 6 }),
    ember: new THREE.MeshStandardMaterial({ color: 0x200400, emissive: 0xff6a20, emissiveIntensity: 4 }),
  };
}
