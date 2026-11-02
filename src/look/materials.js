// Material roles shared by every creature and prop: one gothic look, no per-model one-offs. Realistic PBR, no toon.
// Tuned for candle light: skin is wet (warm sheen and a tight highlight), horn and claw are glossy black, gold is aged, cloth is rotten.
import * as THREE from 'three';
import { demonSkin, flagstones, rottenCloth, waxTexture } from './textures.js';

export function createMaterials() {
  const skin = demonSkin(), stone = flagstones(), rot = rottenCloth(), wax = waxTexture();
  stone.map.repeat.set(6, 6); stone.bump.repeat.set(6, 6);
  return {
    // wet skin: dark blood-red under a clearcoat, so a candle gives a small hard highlight and a warm sheen on the lumps
    skin: new THREE.MeshPhysicalMaterial({ map: skin.map, bumpMap: skin.bump, bumpScale: 4.5, color: 0xa07068, roughness: 0.46, sheen: 0.35, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xb04024), clearcoat: 0.85, clearcoatRoughness: 0.16 }),   // wet: a hard little highlight on every pebble and tendon
    skinDark: new THREE.MeshPhysicalMaterial({ map: skin.map, bumpMap: skin.bump, bumpScale: 1.2, color: 0x6a4040, roughness: 0.45, sheen: 0.4, sheenColor: new THREE.Color(0xa03020), clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    horn: new THREE.MeshPhysicalMaterial({ color: 0x1a1410, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.3, bumpMap: skin.bump, bumpScale: 0.8 }),
    bone: new THREE.MeshPhysicalMaterial({ color: 0x8a7656, roughness: 0.68, clearcoat: 0.05, clearcoatRoughness: 0.6, bumpMap: skin.bump, bumpScale: 0.6 }),
    claw: new THREE.MeshPhysicalMaterial({ color: 0x120d0b, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xa87a32, metalness: 1, roughness: 0.4 }),            // aged: darker and rougher than polished gold
    iron: new THREE.MeshStandardMaterial({ color: 0x2c2825, metalness: 0.9, roughness: 0.5, bumpMap: skin.bump, bumpScale: 1.2 }),
    cloth: new THREE.MeshStandardMaterial({ map: rot.map, alphaMap: rot.alpha, alphaTest: 0.5, color: 0xffffff, roughness: 1, side: THREE.DoubleSide }),   // rotten: stained, with holes
    gem: new THREE.MeshPhysicalMaterial({ color: 0x2a0408, emissive: 0x4a0610, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, ior: 1.7 }),   // deep, dark garnet: a dull glow from inside, a small hard highlight on top
    wax,
    stone: new THREE.MeshStandardMaterial({ map: stone.map, bumpMap: stone.bump, bumpScale: 2.5, roughness: 0.9, color: 0x8a8a90 }),
    stoneWall: new THREE.MeshStandardMaterial({ color: 0x3a322c, roughness: 0.95 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x200000, emissive: 0xff3010, emissiveIntensity: 9 }),   // glows, so the candlelit dark shows the eyes first
    ember: new THREE.MeshStandardMaterial({ color: 0x200400, emissive: 0xff6a20, emissiveIntensity: 4 }),
  };
}
