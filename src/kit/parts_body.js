// Body parts of the Horned Fiend kit: torso, head, jaw, limb, hand, hoofFoot. Pure shape maths, sizes in metres.
// Model space: +Y up, the creature faces -Z. Each part's origin is the joint it hangs from (see each note).
// Look: lean, heavy, sinewy and wrong. Big muscle masses separated by creases, bone showing through, deep eye sockets.
import { ellipsoid, sphere, capsule, cone, mirrorX, rotate, union, intersect, smoothUnion, smoothSubtract, withRole } from './sdf.js';
import { boundsOf, sweepTube, spike, sub3, add3, mul3 } from './part_tools.js';

const tag = (f, role) => withRole(f, role);

// ---------------------------------------------------------------- torso
// Origin: centre of the pelvis. The spine runs up +Y to the neck (y 0.86), the chest faces -Z, shoulders at y 0.7, x +-0.34.
export function torso() {
  const pelvis = ellipsoid([0, 0.02, 0.02], [0.2, 0.13, 0.15]);
  const abdomen = ellipsoid([0, 0.25, 0.0], [0.15, 0.2, 0.12]);
  const ribcage = ellipsoid([0, 0.53, 0.0], [0.27, 0.27, 0.19]);
  const pecs = mirrorX(ellipsoid([0.12, 0.57, -0.1], [0.14, 0.1, 0.1]));
  const lats = mirrorX(ellipsoid([0.2, 0.42, 0.1], [0.1, 0.19, 0.08]));
  const traps = mirrorX(capsule([0.05, 0.84, 0.03], [0.28, 0.72, 0.03], 0.055, 0.08));
  const shoulders = mirrorX(sphere([0.33, 0.7, 0.0], 0.1));
  const abs = mirrorX(smoothUnion(0.03, ...[0, 1, 2].map((i) => ellipsoid([0.058, 0.12 + i * 0.085, -0.105], [0.052, 0.036, 0.04]))));
  const neck = capsule([0, 0.74, 0.02], [0, 0.9, 0.0], 0.085, 0.07);
  const skin = smoothUnion(0.06, pelvis, abdomen, ribcage, pecs, lats, traps, shoulders, neck);
  const fleshed = smoothUnion(0.03, skin, abs);
  // bone shows through: collar bones, breastbone, three ribs a side, spine spikes down the back
  const collar = mirrorX(capsule([0.03, 0.8, -0.14], [0.3, 0.76, -0.04], 0.022, 0.026));
  const sternum = capsule([0, 0.44, -0.19], [0, 0.78, -0.165], 0.026, 0.022);
  const ribs = mirrorX(union(...[0, 1, 2].map((i) => capsule([0.05, 0.4 + i * 0.075, -0.19], [0.23, 0.37 + i * 0.075, -0.09], 0.022, 0.016))));
  const bone = union(collar, sternum, ribs);
  return {
    name: 'torso', budget: 1520, facing: { role: 'bone' },
    meshes: [0, 1, 2, 3, 4].map((i) => () => spike([0, 0.14 + i * 0.13, 0.14 + (i > 2 ? 0.02 : 0)], [0, 0.2 + i * 0.13, 0.27 + (i > 2 ? 0.02 : 0)], 0.034, 'bone', 5)),
    notes: 'pelvis at the origin, neck at y 0.9, chest and ribs face -Z, spine spikes down the back (+Z)',
    grids: [
      { name: 'flesh', share: 0.75, sdf: fleshed, shapes: [tag(fleshed, 'skin')], bounds: { min: [-0.5, -0.2, -0.3], max: [0.5, 1.0, 0.28] } },
      { name: 'bone', share: 0.25, sdf: bone, shapes: [tag(bone, 'bone')], bounds: { min: [-0.36, 0.3, -0.28], max: [0.36, 0.84, 0.02] } },
    ],
  };
}

// ---------------------------------------------------------------- head
// Origin: the base of the neck, centred. A SKULL, not a snout: brow, cheekbones and upper jaw all sit in nearly the same flat plane
// (front of the face about z -0.12), the nose is two slits, the cheeks are hollow and the eyes sink deep under a heavy brow.
// Skull top at y 0.33, chin line at y 0.03 (about 0.30 m, scale to taste). Small pointed ear fins sweep back; two needle fangs hang from the upper jaw.
export function head() {
  const cranium = ellipsoid([0, 0.205, 0.045], [0.104, 0.118, 0.125]);
  const brow = mirrorX(capsule([0.0, 0.232, -0.088], [0.1, 0.244, -0.052], 0.036, 0.03));              // heavy, overhanging: the furthest-forward bone of the face
  const cheekbone = mirrorX(ellipsoid([0.076, 0.148, -0.066], [0.036, 0.04, 0.04]));
  const maxilla = ellipsoid([0, 0.095, -0.078], [0.058, 0.045, 0.048]);                                 // upper jaw, flush with the face, no muzzle
  const bridge = ellipsoid([0, 0.17, -0.086], [0.022, 0.06, 0.026]);                                    // flat nose bridge
  const chinPlate = ellipsoid([0, 0.05, -0.07], [0.05, 0.03, 0.04]);
  const neck = capsule([0, -0.06, 0.06], [0, 0.1, 0.035], 0.052, 0.05);                                 // thin and sinewy
  const nape = ellipsoid([0, 0.05, 0.085], [0.08, 0.08, 0.05]);
  const knobs = mirrorX(sphere([0.082, 0.278, 0.0], 0.04));                                             // where the horns grow from
  const skull = smoothUnion(0.03, cranium, brow, cheekbone, maxilla, bridge, chinPlate, neck, nape);
  const hollows = mirrorX(ellipsoid([0.066, 0.108, -0.082], [0.026, 0.042, 0.034]));                    // sunken cheeks under the bones: gaunt
  const sockets = mirrorX(ellipsoid([0.05, 0.19, -0.084], [0.034, 0.03, 0.042]));
  const nostrils = mirrorX(ellipsoid([0.011, 0.122, -0.108], [0.0055, 0.022, 0.012]));                  // two thin vertical slits
  const carved = smoothSubtract(0.012, smoothSubtract(0.016, smoothSubtract(0.02, smoothUnion(0.03, skull, knobs), sockets), hollows), nostrils);
  const eyes = mirrorX(rotate(ellipsoid([0.05, 0.19, -0.074], [0.017, 0.0125, 0.012]), [0, 0, 0.32], [0.05, 0.19, -0.074]));   // small, red, set deep
  const earBase = (sg) => [0.1 * sg, 0.17, 0.05];
  return {
    name: 'head', budget: 1050, facing: { role: 'eye' },
    notes: 'neck base at the origin, FLAT skull face (front at z about -0.12), heavy brow, hollow cheeks, deep sockets, two nose slits, small glowing eyes, ear fins swept back, two long fangs',
    meshes: [
      ...[1, -1].flatMap((sg) => [
        () => spike([0.032 * sg, 0.082, -0.112], [0.034 * sg, 0.0, -0.118], 0.012, 'bone', 5),                // long upper needle fangs
        () => spike([0.012 * sg, 0.082, -0.118], [0.013 * sg, 0.038, -0.12], 0.007, 'bone'),
        () => spike(earBase(sg), [0.215 * sg, 0.215, 0.2], 0.026, 'skin', 4),                                 // pointed ear fin, swept back and up
      ]),
    ],
    grids: [
      { name: 'skull', share: 0.92, sdf: carved, shapes: [tag(carved, 'skin'), tag(knobs, 'horn')], bounds: { min: [-0.2, -0.12, -0.18], max: [0.2, 0.36, 0.24] } },
      { name: 'eyes', share: 0.08, sdf: eyes, shapes: [tag(eyes, 'eye')], bounds: { min: [-0.1, 0.16, -0.12], max: [0.1, 0.23, -0.05] } },
    ],
  };
}

// ---------------------------------------------------------------- jaw
// Origin: the jaw hinge, centred (it sits at about y 0.09, z -0.02 in head space). Short and gaunt: the chin is only 0.14 m toward -Z,
// so with the mouth a little open the tip stays within 0.25 HH of the brow. Needle fangs rise from the chin; a row of small teeth behind them.
export function jaw() {
  const rami = mirrorX(capsule([0.07, 0.01, 0.0], [0.05, -0.03, -0.09], 0.022, 0.018));
  const chinBar = mirrorX(capsule([0.05, -0.03, -0.09], [0.015, -0.04, -0.13], 0.018, 0.016));
  const chin = ellipsoid([0, -0.04, -0.132], [0.03, 0.02, 0.026]);
  const hinge = mirrorX(sphere([0.07, 0.01, 0.0], 0.03));
  const lower = smoothUnion(0.02, rami, chinBar, chin, hinge);
  const mouth = ellipsoid([0, 0.02, -0.08], [0.04, 0.02, 0.06]);
  const shell = smoothSubtract(0.015, lower, mouth);
  const tongue = ellipsoid([0, -0.01, -0.08], [0.022, 0.012, 0.05]);
  return {
    name: 'jaw', budget: 300, facing: { role: 'bone' },
    notes: 'hinge at the origin, chin 0.14 m toward -Z (short, gaunt), two long needle fangs rising from the chin, small teeth behind',
    meshes: [
      ...[1, -1].map((sg) => () => spike([0.03 * sg, -0.035, -0.115], [0.034 * sg, 0.075, -0.12], 0.012, 'bone', 5)),
      ...[1, -1].flatMap((sg) => [0, 1].map((i) => () => spike([0.046 * sg, -0.02, -0.05 - i * 0.03], [0.046 * sg, 0.015, -0.05 - i * 0.03], 0.008, 'bone'))),
    ],
    grids: [{ name: 'jaw', share: 1, sdf: shell, shapes: [tag(shell, 'skin'), tag(tongue, 'skinDark')], bounds: { min: [-0.12, -0.09, -0.19], max: [0.12, 0.05, 0.06] } }],
  };
}

// ---------------------------------------------------------------- limb
// kind 'arm': origin at the shoulder, hangs down (-Y), the elbow points back and the forearm comes forward (-Z).
// kind 'leg': origin at the hip; digitigrade (walks on its toes): the knee points forward, the shin slopes back to a high ankle.
// Sinew and muscle: separate bulges blended with a tight crease, so the limb is lumps and cords, not a tube.
export function limb({ kind = 'arm' } = {}) {
  const arm = kind === 'arm';
  const J = arm ? [[0, 0, 0], [0.01, -0.36, 0.05], [0, -0.66, -0.12]] : [[0, 0, 0], [0, -0.45, -0.17], [0, -0.86, 0.08]];
  const R = arm ? [0.085, 0.062, 0.042] : [0.125, 0.078, 0.04];
  const [S, E, W] = J;
  const tilt = (a, b) => Math.atan2(-(b[2] - a[2]), -(b[1] - a[1]));                                   // how far a segment leans forward
  const mid = (a, b, t) => add3(a, mul3(sub3(b, a), t));
  const blob = (a, b, t, off, rad) => { const c = add3(mid(a, b, t), off); return rotate(ellipsoid(c, [rad[0] * 1.25, rad[1], rad[2] * 1.25]), [tilt(a, b), 0, 0], c); };   // bulges stand proud of the bone, so the limb reads as muscle
  const parts = [capsule(S, E, R[0], R[1]), capsule(E, W, R[1] * 0.9, R[2]), sphere(E, R[1] * 1.05)];
  if (arm) parts.push(sphere([0, -0.0, 0], 0.098), blob(S, E, 0.42, [0, 0, -0.04], [0.068, 0.12, 0.064]), blob(S, E, 0.45, [0, 0, 0.055], [0.062, 0.12, 0.056]), blob(E, W, 0.3, [0, 0, -0.03], [0.062, 0.12, 0.056]), blob(E, W, 0.35, [0.0, 0, 0.04], [0.05, 0.12, 0.046]));
  else parts.push(sphere([0, 0.0, 0.0], 0.13), blob(S, E, 0.45, [0, 0, -0.05], [0.115, 0.2, 0.1]), blob(S, E, 0.5, [0, 0, 0.06], [0.09, 0.19, 0.08]), blob(E, W, 0.22, [0, 0, 0.06], [0.075, 0.14, 0.075]), sphere(add3(E, [0, 0, -0.045]), 0.08));
  const flesh = smoothUnion(0.028, ...parts);
  const all = [S, E, W, add3(E, [0, 0.07, 0.16])];
  return {
    name: arm ? 'limb' : 'leg', kind, budget: 400, facing: { bbox: true },
    meshes: [() => (arm ? spike(add3(E, [0, 0.02, 0.04]), add3(E, [0, 0.08, 0.17]), 0.036, 'bone', 5) : spike(add3(W, [0, 0.05, 0.03]), add3(W, [0, 0.17, 0.16]), 0.034, 'bone', 5))],   // elbow spike / hock spur
    notes: arm ? 'shoulder at the origin, hangs down, elbow spike back, wrist at (0,-0.66,-0.12)' : 'hip at the origin, digitigrade: knee forward, ankle at (0,-0.86,0.08) with a hock spur behind',
    grids: [
      { name: 'flesh', share: 1, sdf: flesh, shapes: [tag(flesh, 'skin')], bounds: boundsOf(all, 0.2, true) },
    ],
  };
}

// ---------------------------------------------------------------- hand
// Origin: the wrist, the hand hangs down (-Y). Palm, three thick fingers and a thumb (on +X), each ending in a long hooked claw that curls forward (-Z).
export function hand() {
  const palm = ellipsoid([0, -0.075, 0.0], [0.058, 0.078, 0.032]);
  const knuckles = union(...[-0.034, 0, 0.034].map((x) => sphere([x, -0.14, -0.006], 0.021)));
  const finger = (x, k = 1) => capsule([x, -0.13, -0.006], [x * 1.1, -0.2 * k, -0.045 * k], 0.021, 0.014);
  const fingers = union(...[-0.034, 0, 0.034].map((x) => finger(x)));
  const thumb = capsule([0.05, -0.05, -0.01], [0.078, -0.12, -0.05], 0.022, 0.014);
  const flesh = smoothUnion(0.025, palm, knuckles, fingers, thumb);
  const tips = [[-0.034 * 1.1, -0.2, -0.045], [0, -0.2, -0.045], [0.034 * 1.1, -0.2, -0.045], [0.078, -0.12, -0.05]];
  const all = [...tips, [0, -0.3, -0.22], [0.1, -0.1, -0.1], [-0.07, 0.02, 0.04]];
  return {
    name: 'hand', budget: 480, facing: { role: 'claw' },
    meshes: tips.map((t, i) => () => { const L = i === 3 ? 0.8 : 1; return sweepTube([t, add3(t, [0, -0.035 * L, -0.03]), add3(t, [0, -0.062 * L, -0.07 * L]), add3(t, [0, -0.065 * L, -0.12 * L])], 0.0135, 0, { sides: 4, rings: 6, pow: 0.8, role: 'claw' }); }),
    notes: 'wrist at the origin, hangs down, four thick digits each with a hooked claw curling toward -Z',
    grids: [
      { name: 'palm', share: 1, sdf: flesh, shapes: [tag(flesh, 'skin')], bounds: boundsOf(all.slice(0, 4).concat([[0, 0.05, 0.04], [0.09, -0.1, -0.06]]), 0.05) },
    ],
  };
}

// ---------------------------------------------------------------- hoofFoot
// Origin: the ankle. The foot is a cloven hoof on a long cannon bone; the ground is at y -0.17, the toes point to -Z.
export function hoofFoot() {
  const cannon = capsule([0, 0, 0.0], [0, -0.1, -0.05], 0.04, 0.032);
  const fetlock = sphere([0, -0.1, -0.055], 0.04);
  const toes = mirrorX(capsule([0.0, -0.1, -0.055], [0.034, -0.145, -0.14], 0.032, 0.03));
  const flesh = smoothUnion(0.02, cannon, fetlock, toes);
  const hoofAt = (c) => rotate(ellipsoid(c, [0.03, 0.04, 0.06]), [0.5, 0, 0], c);
  const hooves = mirrorX(hoofAt([0.036, -0.13, -0.135]));
  const ground = (p) => -0.17 - p[1];                                                                  // flat underside: stands on the floor
  const hard = intersect(hooves, ground);
  return {
    name: 'hoofFoot', budget: 220, facing: { bbox: true },
    meshes: [1, -1].map((sg) => () => spike([0.034 * sg, -0.1, -0.005], [0.042 * sg, -0.16, 0.07], 0.02, 'claw')),
    notes: 'ankle at the origin, ground at y -0.17, cloven hoof with two toes pointing -Z and two dew claws behind',
    grids: [
      { name: 'foot', share: 0.55, sdf: flesh, shapes: [tag(flesh, 'skin')], bounds: { min: [-0.1, -0.19, -0.2], max: [0.1, 0.07, 0.06] } },
      { name: 'hoof', share: 0.45, sdf: hard, shapes: [tag(hard, 'claw')], bounds: { min: [-0.1, -0.19, -0.2], max: [0.1, -0.03, 0.09] } },
    ],
  };
}
