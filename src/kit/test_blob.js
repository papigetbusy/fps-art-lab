// The Step 3 test blob, as data: a body with a head, an arm and a leg blended in smoothly, a gold belt, two eyes and two horns.
// It exists to judge the mesher (smooth joins, no stair-steps, material groups). It is NOT a creature.
// Sizes in metres, model space: +Y up, faces -Z, feet at y = 0.
//
// It is meshed as two PARTS, each on its own grid: a grid cell cannot hold a feature thinner than about two cells,
// so thin parts (horns, later claws and spikes) get a small, fine grid of their own, and the big soft mass gets a coarse one.
import { ellipsoid, sphere, capsule, curveTube, torus, mirrorX, smoothUnion, union, withRole } from './sdf.js';

export function testBlob() {
  const body = ellipsoid([0, 0.62, 0], [0.28, 0.34, 0.28]);
  const head = sphere([0, 0.98, -0.04], 0.16);
  const arm = mirrorX(smoothUnion(0.05, capsule([0.27, 0.8, 0], [0.5, 0.42, -0.14], 0.085, 0.05), capsule([0.5, 0.42, -0.14], [0.52, 0.12, -0.26], 0.05, 0.045)));
  const leg = mirrorX(capsule([0.14, 0.38, 0], [0.15, 0.04, -0.02], 0.11, 0.07));
  const skin = smoothUnion(0.1, body, head, arm, leg);                                          // one soft, blended mass
  const belt = torus([0, 0.5, 0], 0.27, 0.03);
  const eyes = mirrorX(sphere([0.065, 1.0, -0.19], 0.03));
  const horns = mirrorX(curveTube([[0.09, 1.08, -0.05], [0.16, 1.2, -0.08], [0.27, 1.32, -0.1], [0.3, 1.46, -0.06]], 0.045, 0.014));

  return {
    budget: 8000, // whole blob, monster budget from CLAUDE.md
    parts: [
      { name: 'mass', share: 0.8, sdf: union(skin, belt, eyes), bounds: { min: [-0.7, -0.05, -0.45], max: [0.7, 1.3, 0.35] },
        shapes: [withRole(skin, 'skin'), withRole(belt, 'gold'), withRole(eyes, 'eye')] },
      { name: 'horns', share: 0.2, sdf: horns, bounds: { min: [-0.45, 0.95, -0.3], max: [0.45, 1.6, 0.15] }, shapes: [withRole(horns, 'horn')] },
    ],
  };
}
