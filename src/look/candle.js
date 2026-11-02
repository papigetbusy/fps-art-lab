// Candle-lit horror look: the numbers and the light-mode switch. Pure (no THREE), so node tests can read it.
// Look target (docs/art-direction.md): light comes from flame (candles and a few torches), warm and low, with deep
// readable darkness between the pools. A cold, very weak fill only keeps shapes readable; a crimson rim separates monsters.

// ?light=candle | torch | both   (default both). Intensities are multipliers on the lab's base lights (see renderer.js LOOK).
export const LIGHT_MODES = {
  candle: { exposure: 1.3, background: 0x070404, fog: { color: 0x120a07, density: 0.09 }, envIntensity: 0.1, hemi: 0.1,
    key: { color: 0x8ea4d0, intensity: 0.25, shadow: false }, fill: 0.15, rim: 1.4, torches: 0, candles: 1 },
  torch: { exposure: 1.05, background: 0x0a0706, fog: { color: 0x0e0908, density: 0.075 }, envIntensity: 0.18, hemi: 0.35,
    key: { color: 0xffc89a, intensity: 3.0, shadow: true }, fill: 0.6, rim: 2.2, torches: 1, candles: 0 },
  both: { exposure: 1.25, background: 0x070404, fog: { color: 0x100907, density: 0.08 }, envIntensity: 0.12, hemi: 0.12,
    key: { color: 0x8ea4d0, intensity: 0.3, shadow: false }, fill: 0.2, rim: 1.6, torches: 0.7, candles: 1 },
};
export const LIGHT_NAMES = Object.keys(LIGHT_MODES);
export const DEFAULT_LIGHT = 'both';
export const pickLightMode = (name) => (LIGHT_MODES[name] ? name : DEFAULT_LIGHT);

// the flame itself: about 1900 K, so orange with a pale core
export const FLAME = { color: 0xff9a3c, core: 0xffe2a8, light: 0xff8a3a, depth: 0.09 };

// how many real lights each preset may use for candles (every extra light costs phone speed)
export const CANDLE_BUDGET = { phone: { pointLights: 3, embers: 90 }, high: { pointLights: 6, embers: 220 } };

// Flame flicker: slow, gentle, never a strobe. Returns a multiplier around 1 that stays within 1 +- depth.
export function flicker(t, seed = 0, depth = FLAME.depth) {
  return 1 + depth * (0.5 * Math.sin(6.28318 * 0.9 * t + seed) + 0.3 * Math.sin(6.28318 * 2.3 * t + seed * 1.7) + 0.2 * Math.sin(6.28318 * 5.1 * t + seed * 2.9));
}

// Applies a light mode to the lab's scene and lights. env = { renderer, scene, lights: { hemi, key, fill, rim }, base }
// where base holds the lab's base intensities (LOOK in renderer.js).
export function applyLightMode(env, modeName) {
  const m = LIGHT_MODES[pickLightMode(modeName)], { renderer, scene, lights, base } = env;
  renderer.toneMappingExposure = m.exposure;
  scene.background.set(m.background);
  scene.fog.color.set(m.fog.color); scene.fog.density = m.fog.density;
  scene.environmentIntensity = m.envIntensity;
  lights.hemi.intensity = m.hemi;
  lights.key.color.set(m.key.color); lights.key.intensity = m.key.intensity; lights.key.castShadow = m.key.shadow;
  lights.fill.intensity = m.fill; lights.rim.intensity = m.rim;
  return m;
}
