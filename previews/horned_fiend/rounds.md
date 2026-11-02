# Horned Fiend 1:1 match: rounds log (Step 6b)

Reference: `references/creatures/horned_fiend/turnaround.svg` (byte-identical to the one on `claude/phase-1-look-lock`; the repo holds only this one sheet, its eyes are small red glints).
Score = overlap / union of the silhouettes after aligning bounding boxes (front / side / three-quarter). Goal: front >= 0.80, side >= 0.80, three-quarter >= 0.70.

## Honest result: NOT DONE. Real lab sheet at the last round: front 0.776, side 0.715, three-quarter 0.683. Front, side and three-quarter are all below their goals.

## Two measuring bugs found and fixed first (they made the Step 6 scores look worse than the model was)
1. The reference outline dropped the dark legs and hooves and was full of holes, so the score punished a correct body. New `figureMask` + `solidify` in `tools/lib/silhouette.js` make a solid outline (dark red skin and brown hooves count as figure, inside holes are filled, the neighbouring figure in each crop is blanked). The same solid fill is applied to our render.
2. The lab's three-quarter camera looked from the wrong side (the sheet's figure faces left, ours faced right) and at a different angle. It now sits at (-4.5, 1.6, -2.6), the angle that best matches the sheet.

## Rounds (fast scorer = same cameras and maths in pure Node; "real" = `node tools/sheet.mjs horned_fiend` in the lab)
| Round | What changed | front / side / three |
|---|---|---|
| 0 | Step 6 model, old outline (real sheet) | 0.526 / 0.398 / 0.380 |
| 0b | same model, new solid outline + matched camera (fast) | 0.660 / 0.413 / 0.427 |
| 1 | fit placement and scale of body, head, horns, arms, legs, tail (fast) | 0.718 / 0.678 / 0.654 |
| 2 | limbs made slimmer through data (`bulge`, radii, joints in the part options) (fast) | 0.745 / 0.699 / 0.647 |
| 3 | torso widths and depths as data options (`pw aw cw sw pd ad cd rise`) (fast) | 0.790 / 0.749 / 0.703 |
| 4 | real lab sheet of round 3 (`round6b_01.png`) | 0.749 / 0.725 / 0.651 |
| 5 | chest bones removed (ribs and collar are shallow ridges), 9 small spine spikes, eyes bigger, new wet sinew skin map; refit at real resolution with floor, height and tail constraints | 0.784 / 0.727 / 0.690 (fast, real resolution) |
| 6 | real lab sheet of round 5 (`round6b_02.png`, current `sheet.png`) | **0.776 / 0.715 / 0.683** |
Scores stalled for the last three fitting rounds (+-0.01), so by the brief's rule the offending parts have to be rebuilt from the sheet's outline, not tweaked.

## Three concrete diffs of the last round, worst first
1. Side, legs: the sheet's shin and hock sit far back (at 0.32 m height the rear leg is at 0.25-0.33 m from the bounding-box left) but ours is at 0.47-0.52 m, about 0.2 m too far forward. The leg part has one bend, the sheet has the knee-hock-fetlock zig-zag. Biggest single error (about 7% of the union in the lowest two bands).
2. Side, body: our bounding box is 1.35 m wide against 1.23 m on the sheet; chest and head sit 0.08-0.10 m too far forward (at 1.67 m height: ours 0.75-1.15 m, sheet 0.64-1.07 m) and the tail overshoots backwards.
3. Front: the hips and waist are about 0.05 m too wide (ours-only 2% per band in the three middle bands) and the sheet's tail curl out to the left of the left hoof at floor level is not reproduced (the tail only swings back, not sideways).

## Checks from the brief's table (current state)
| Check | State |
|---|---|
| Silhouette front >= 0.80 | FAIL 0.776 |
| Silhouette side >= 0.80 | FAIL 0.715 |
| Silhouette three-quarter >= 0.70 | FAIL 0.683 |
| Eyes glow | pass: emissive 9 plus bloom, clearly visible in `?zoom=head` |
| Face | pass by measure: jaw tip 0.032 m past the brow (limit 0.0675 m = 0.25 HH); flat skull, sockets, nose slits, fangs. Judge the look yourself, my own render shows a flat skull face |
| Skin | improved (pebbled, tendon strands, clearcoat), still a texture on smooth blends, not modelled muscle strands; owner to judge |
| Limbs | thighs are now lean (radii and bulge fitted), but not measured to 10% on every limb |
| Torso | chest protrusions removed; ribs are shallow ridges only |
| Horns / tail / claws | tail reaches the floor (min height <= 0.1 m) and trails 0.95 m+; horn curl not matched 1:1 |
| Budget | 7.1k triangles, 133 tests green. Phone fps not measured on a real iPhone |
