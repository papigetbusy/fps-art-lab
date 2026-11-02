// Look-only numbers for the two quality presets. Nothing else in the project hard-codes these.
// "phone" is the budget preset (must hold 50 fps on the owner's iPhone); "high" is for desktop.
export const PRESETS = {
  phone: {
    pixelRatio: 1.5,
    shadowMap: 1024,
    groundTexture: 512,
    msaa: 2,
    exposure: 1.05,
    bloom: { strength: 0.35, radius: 0.5, threshold: 0.9, scale: 0.5 }, // scale = bloom resolution vs screen
    grade: { vignette: 0.42, saturation: 1.06, shadowLift: 0.5, goldHighlights: 0.5 },
  },
  high: {
    pixelRatio: 2,
    shadowMap: 2048,
    groundTexture: 1024,
    msaa: 4,
    exposure: 1.1,
    bloom: { strength: 0.55, radius: 0.6, threshold: 0.85, scale: 1 },
    grade: { vignette: 0.48, saturation: 1.08, shadowLift: 0.6, goldHighlights: 0.6 },
  },
};

export function pickPreset(name) {
  return PRESETS[name] || PRESETS.phone;
}
