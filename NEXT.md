# NEXT: the one step Claude does now

> Read `STATUS.md` first. Do ONLY this step. Push the step branch only. **Never `main`.** "Approved" counts only when the owner types it in chat **after** seeing your links. Never write "owner approved" yourself. Send the lab links below, then STOP.

## ⚠️ Rule violation to fix in your habits
Step 6 was merged to `main` at 05:11 ET (`74a5b2c`, "owner approved") **one minute after you pushed it, before the owner saw it**. He has since rejected it. Do not do that again. Do not revert `main` yourself either; the owner decides that.

## Current step: Step 6b, Horned Fiend 1:1 match (REDO)
Owner review of the Step 6 lab (front + three-quarter): **it does not look like the reference.**
- Smooth, plastic, **ballooned muscles**, worst on the **thighs** (balloon quads). The reference is lean, wet and sinewy.
- **Jagged chest protrusions** that aren't on the sheet.
- Silhouette drift. Your own scores were front 0.53 / side 0.40 / three-quarter 0.38 against a 0.80 target, and you still called it done.
- You used the **old** turnaround (without glowing eyes).

### 0. Copy the locked reference FIRST (before any other edit)
```
git fetch origin
git checkout -b claude/step-6b-fiend-match origin/main
git checkout origin/claude/phase-1-look-lock -- references/creatures/horned_fiend/
git commit -m "Use the current locked Horned Fiend turnaround (glowing eyes)" references/creatures/horned_fiend/
```
Check it: `references/creatures/horned_fiend/turnaround.svg` must be byte-identical to the one on `claude/phase-1-look-lock`, and its eyes must visibly glow when you open it. Point `tools/sheet.mjs` at THIS file only.

### 1. The target is a 1:1 match, not "inspired by"
The fiend in the lab must look like the **same creature** as the sheet: the same outline, the same limb thickness, the same horn curl, the same face. When the lab render and the sheet sit side by side, a stranger must say "same monster".

### 2. DONE only when ALL of these pass (any one failing = NOT done)
| Check | Pass condition |
|---|---|
| Silhouette front | overlay score **≥ 0.80** against the locked sheet |
| Silhouette side | overlay score **≥ 0.80** against the locked sheet |
| Silhouette three-quarter | ≥ 0.70 (report it) |
| Eyes | clearly **glowing** red-orange (emissive + bloom), visible at phone size in the candle-lit room |
| Face | flat **skull** demon face: heavy brow, sunken sockets, nose slits, fangs. Side-view jaw ≤ 0.25 HH past the brow. **No dog snout** |
| Skin | **wet, sinewy, ridged** (muscle strands, tendons, ribs visible, glossy wet sheen). **No smooth plastic blobs** |
| Limbs | thigh, calf, forearm and upper-arm widths match the sheet within ~10% of height-normalised width. **No balloon quads.** Lean, long, digitigrade legs, hooves |
| Torso | narrow waist, visible ribs/abs as on the sheet. **No jagged chest spikes or protrusions** that the sheet doesn't have |
| Horns / tail / claws | horn curl, span and length as on the sheet; tail reaches the floor with a spike tip; long hooked claws to mid-thigh |
| Budget | ≤ 8k tris, phone preset smooth, tests green |

**FAIL conditions (do not send links if any is true):** a score below target · smooth/plastic skin · thighs visibly thicker than the sheet's · any part not on the sheet · old reference used · eyes not glowing.

### 3. Loop per round (no shortcuts)
1. `node tools/sheet.mjs horned_fiend` → ONE sheet with front + side + three-quarter renders in row 1, the locked reference views in row 2, and overlays + scores in row 3.
2. Open the PNG and write **3 concrete diffs**, worst first, each with a measured number (e.g. "side: thigh 0.19 m wide vs sheet 0.13 m"; "front: chest spikes not on sheet"; "side: jaw 0.4 HH past brow").
3. Fix **only the worst diff** by changing the creature data (sizes/positions/blend) or the skin material, not by adding parts.
4. Re-render and log the round (scores before → after) in `previews/horned_fiend/rounds.md`, keeping every round PNG.
5. Repeat. Expect 10+ rounds. If scores stall for 3 rounds, rebuild the offending part from the sheet's measured outline instead of tweaking.
- Skin: use a normal/bump detail map or SDF ridge noise for sinew and tendon strands, high-gloss wet clearcoat on `MeshPhysicalMaterial`, dark crimson-charcoal base with redder sinew. Smooth blends are only for joining parts, never for the surface look.

### 4. Push
`git push -u origin claude/step-6b-fiend-match`. **Never `main`.** Then stop and wait for the owner's own "approved".

### 5. Lab links to send (open each one headless first and confirm it renders)
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/lab/index.html?creature=horned_fiend&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/lab/index.html?creature=horned_fiend&view=front&still=1&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/lab/index.html?creature=horned_fiend&view=side&still=1&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/lab/index.html?creature=horned_fiend&view=three&still=1&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/lab/index.html?creature=horned_fiend&view=front&zoom=head&still=1&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6b-fiend-match/previews/horned_fiend/ (final sheet + rounds log)

Reply with: the links, the final scores (front / side / three-quarter), and 2 plain sentences. Then **STOP**.
