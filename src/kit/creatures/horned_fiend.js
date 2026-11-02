// The Horned Fiend v1 as DATA: which kit parts, where they attach, how big. Metres, +Y up, faces -Z, feet on y = 0.
// Reference (the only one): references/creatures/horned_fiend/turnaround.svg + proportions.md. Part table: docs/creatures/horned_fiend.md.
// Every instance is also a rig node (the lab idle moves head, jaw, arms and tail through these ids).
export const hornedFiend = {
  name: 'horned_fiend',
  budget: 8000,                 // triangles for the whole creature (CLAUDE.md); the instance budgets below add up to less
  headHeight: 0.27,             // HH, from proportions.md
  instances: [
    // body: lean and hunched, narrow waist, shoulders about 0.6 m wide
    { id: 'body', part: 'torso', at: [0, 1.03, 0], rot: [-0.2, 0, 0], scale: [1.0, 0.9, 1.4], budget: 2000 },
    // head pushed forward on a thin neck, tilted a little down; jaw hangs open a little; ram horns from above the brow
    { id: 'head', on: 'body', part: 'head', local: [0, 0.88, -0.1], rot: [0.1, 0, 0], scale: [0.88, 0.96, 0.8], budget: 1200 },
    { id: 'jaw', on: 'head', part: 'jaw', local: [0, 0.095, -0.02], rot: [-0.2, 0, 0], budget: 320 },
    { id: 'hornR', on: 'head', part: 'horn', local: [0.082, 0.278, 0.0], rot: [0, 0, -0.1], scale: 1.2, budget: 340 },
    { id: 'hornL', on: 'head', part: 'horn', local: [-0.082, 0.278, 0.0], rot: [0, 0, 0.1], scale: 1.2, mirror: true, budget: 340 },
    // arms hang from the shoulders, long: the claws reach the knees
    { id: 'armR', on: 'body', pinned: true, part: 'limb', local: [0.34, 0.7, 0], rot: [0, 0, 0.27], scale: [1.0, 1.25, 1.0], budget: 460 },
    { id: 'armL', on: 'body', pinned: true, part: 'limb', local: [-0.34, 0.7, 0], rot: [0, 0, -0.27], scale: [1.0, 1.25, 1.0], mirror: true, budget: 460 },
    { id: 'handR', on: 'armR', part: 'hand', local: [0, -0.66, -0.12], scale: [1.18, 0.9, 1.18], mirror: true, budget: 470 },
    { id: 'handL', on: 'armL', part: 'hand', local: [0, -0.66, -0.12], scale: [1.18, 0.9, 1.18], mirror: true, budget: 470 },
    // legs: digitigrade, hip at 1.03 m so the hooves stand on the floor
    { id: 'legR', on: 'body', pinned: true, part: 'leg', local: [0.14, 0, 0.02], rot: [0, 0, 0.15], scale: [0.95, 1, 1.15], budget: 500 },
    { id: 'legL', on: 'body', pinned: true, part: 'leg', local: [-0.14, 0, 0.02], rot: [0, 0, -0.15], scale: [0.95, 1, 1.15], mirror: true, budget: 500 },
    { id: 'footR', on: 'legR', part: 'hoofFoot', local: [0, -0.86, 0.08], scale: [1.45, 1.05, 1.45], budget: 220 },
    { id: 'footL', on: 'legL', part: 'hoofFoot', local: [0, -0.86, 0.08], scale: [1.45, 1.05, 1.45], budget: 220 },
    // tail: from the base of the spine to the floor, trailing back
    { id: 'tail', on: 'body', pinned: true, part: 'tail', local: [0, 0.02, 0.15], scale: [1, 1, 0.6], budget: 320 },
  ],
};
