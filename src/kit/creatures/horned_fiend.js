// The Horned Fiend v1 as DATA: which kit parts, where they attach, how big. Metres, +Y up, faces -Z, feet on y = 0.
// Reference (the only one): references/creatures/horned_fiend/turnaround.svg + proportions.md. Part table: docs/creatures/horned_fiend.md.
// Every instance is also a rig node (the lab idle moves head, jaw, arms and tail through these ids).
export const hornedFiend = {
  name: 'horned_fiend',
  budget: 8000,
  headHeight: 0.27,
  instances: [
    { id: "body", part: "torso", at: [0, 1.071, 0.045], rot: [-0.153, 0, 0], scale: [0.862, 0.81, 1.315], budget: 2000, opts: {pw: 1.179, aw: 1.158, cw: 1.029, sw: 0.887, pd: 1, ad: 1.163, cd: 0.741, rise: 0.061} },
    { id: "head", on: "body", part: "head", local: [-0.006, 0.91, -0.125], rot: [0.223, 0, 0], scale: [0.845, 0.96, 0.753], budget: 1200 },
    { id: "jaw", on: "head", part: "jaw", local: [0, 0.095, -0.02], rot: [-0.2, 0, 0], budget: 320 },
    { id: "hornR", on: "head", part: "horn", local: [0.088, 0.268, -0.024], rot: [0.058, 0.039, -0.1], scale: [1.041, 1.2, 1.155], budget: 340 },
    { id: "hornL", on: "head", part: "horn", local: [-0.088, 0.268, -0.024], rot: [0.058, -0.039, 0.1], scale: [1.041, 1.2, 1.155], mirror: true, budget: 340 },
    { id: "armR", on: "body", pinned: true, part: "limb", local: [0.356, 0.684, 0.129], rot: [-0.081, 0, 0.27], scale: [0.867, 1.14, 0.952], budget: 460, opts: {kind: "arm", joints: [[0, 0, 0], [0, -0.319, 0.041], [0.015, -0.636, -0.09]], radii: [0.081, 0.085, 0.08], bulge: 0.777} },
    { id: "armL", on: "body", pinned: true, part: "limb", local: [-0.356, 0.684, 0.129], rot: [-0.081, 0, -0.27], scale: [0.867, 1.14, 0.952], mirror: true, budget: 460, opts: {kind: "arm", joints: [[0, 0, 0], [0, -0.319, 0.041], [0.015, -0.636, -0.09]], radii: [0.081, 0.085, 0.08], bulge: 0.777} },
    { id: "handR", on: "armR", part: "hand", local: [0.015, -0.636, -0.09], scale: [1.365, 0.917, 1.188], mirror: true, budget: 470 },
    { id: "handL", on: "armL", part: "hand", local: [-0.015, -0.636, -0.09], scale: [1.365, 0.917, 1.188], mirror: true, budget: 470 },
    { id: "legR", on: "body", pinned: true, part: "leg", local: [0.139, 0.058, 0.07], rot: [0.018, 0, 0.14], scale: [0.939, 1.123, 1.137], budget: 500, opts: {kind: "leg", joints: [[0, 0, 0], [-0.006, -0.331, -0.14], [0, -0.83, 0.029]], radii: [0.117, 0.106, 0.057], bulge: 0.971} },
    { id: "legL", on: "body", pinned: true, part: "leg", local: [-0.139, 0.058, 0.07], rot: [0.018, 0, -0.14], scale: [0.939, 1.123, 1.137], mirror: true, budget: 500, opts: {kind: "leg", joints: [[0, 0, 0], [-0.006, -0.331, -0.14], [0, -0.83, 0.029]], radii: [0.117, 0.106, 0.057], bulge: 0.971} },
    { id: "footR", on: "legR", part: "hoofFoot", local: [0, -0.83, 0.029], scale: [1.384, 1.107, 1.061], budget: 220 },
    { id: "footL", on: "legL", part: "hoofFoot", local: [0, -0.83, 0.029], scale: [1.384, 1.107, 1.061], budget: 220 },
    { id: "tail", on: "body", pinned: true, part: "tail", local: [0, 0.019, 0.04], scale: [0.923, 0.925, 0.662], budget: 320, rot: [0.131, -0.083, 0] },
  ],
};
