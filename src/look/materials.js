// Material roles shared by every creature and gun. One look, no per-model one-offs.
import * as THREE from 'three';
export function createMaterials() {
  return {
    skin: new THREE.MeshPhysicalMaterial({ color: 0x5a1a16, roughness: 0.55, sheen: 0.6, sheenColor: 0xff5a40 }),
    skinDark: new THREE.MeshStandardMaterial({ color: 0x2a0c0a, roughness: 0.7 }),
    horn: new THREE.MeshPhysicalMaterial({ color: 0x2a221c, roughness: 0.35, clearcoat: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc89a3e, metalness: 1, roughness: 0.32 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.92 }),
    ember: new THREE.MeshStandardMaterial({ color: 0x220400, emissive: 0xff4a10, emissiveIntensity: 3 }),
  };
}
