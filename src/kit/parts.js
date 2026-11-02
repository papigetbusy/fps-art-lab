// The Horned Fiend parts kit (Step 5): named parts built from the shape maths (sdf.js) and the mesher (mesher.js). No voxels.
// Every part is DATA: { name, budget, grids, facing, notes } (see part_tools.js). `meshPart(part)` turns one into a mesh.
//   torso head jaw limb leg hand claw hoofFoot horn tail armourPlate trimBand gem cloth
// Sizes are in metres, +Y up, the front is -Z, and each part's origin is the joint or root it hangs from (see its `notes`).
// Left and right: build one and mirror it (x -> -x) when assembling; parts that come in pairs are modelled on the +X side.
import { torso, head, jaw, limb, hand, hoofFoot } from './parts_body.js';
import { horn, claw, tail, armourPlate, trimBand, gem, cloth } from './parts_hard.js';
export { meshPart, partStats, roleCentroid } from './part_tools.js';

export const PARTS = {
  torso: (o) => torso(o), head, jaw,
  limb: (o) => limb({ ...o, kind: 'arm' }), leg: (o) => limb({ ...o, kind: 'leg' }),
  hand, claw, hoofFoot, horn, tail, armourPlate, trimBand, gem, cloth,
};
export const PART_NAMES = Object.keys(PARTS);
export const buildPart = (name, opts) => { if (!PARTS[name]) throw new Error('unknown part ' + name); return PARTS[name](opts); };

// One Horned Fiend uses these many of each part (claws are part of the hands; plates, band, gem and cloth are for other creatures).
// The finished monster must fit 8k triangles in total (CLAUDE.md), so the per-part budgets add up to that, not more.
export const FIEND_LOADOUT = { torso: 1, head: 1, jaw: 1, limb: 2, leg: 2, hand: 2, hoofFoot: 2, horn: 2, tail: 1 };
export const loadoutBudget = () => Object.entries(FIEND_LOADOUT).reduce((sum, [name, n]) => sum + n * buildPart(name).budget, 0);
