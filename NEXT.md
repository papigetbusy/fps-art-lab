# NEXT: the one step Claude does now

> Read `STATUS.md` first. Do ONLY this step. Push the step branch only. **Never `main`** until the owner says "approved" in chat. Send the lab links below, then STOP.

## Current step: Step 6, redo the Horned Fiend to MATCH the locked turnaround exactly
Owner feedback on Step 5: parts are a little better, but **the head looks like a dog, not a demon.**

### 🔒 Design lock
The owner says the turnaround is **perfect** and has locked it (`references/creatures/horned_fiend/DESIGN-LOCK.md`). **Redo the fiend's head and body until the lab matches the sheet**: front, side and three-quarter. Don't stop at "close". Small detail tweaks come later, only when the owner asks.

**Success = all of these:**
- Lab `view=front`, `view=side` and `view=three` match the sheet's three views side by side (silhouette ≥ 0.80 front and side, and the head reads the same at a glance).
- Skull demon face: brow, sunken **glowing** red-orange eyes (emissive + a small bloom halo, matching the updated sheet), nose slits, fangs, ram horns curling back then forward.
- Side-view jaw check passes (≤ 0.25 HH past the brow). **No dog snout.**
- Iterate the picture sheet (render → 3 notes → fix) as many rounds as it takes, with the head first. Put the final sheet next to the turnaround in `previews/horned_fiend/`.

**Not in this step:** the armored variant (`variant-armored.svg`) is a later pass. Don't build armour now, and don't let it change the body or head.

### References: use ONLY these
- `references/creatures/horned_fiend/turnaround.svg`: ONE sheet with front, side and three-quarter views of the same fiend (an SVG wrapping a JPEG; decode it or screenshot it for your picture sheet)
- `references/creatures/horned_fiend/DESIGN-LOCK.md` + `proportions.md`: locked numbers and the **NOT-a-dog rules**
Do not use any other fiend images (no old crimson-plague art-drop pictures).

### Branch
```
git fetch origin
git checkout -b claude/step-6-horned-fiend origin/main
```

### Brief
- `docs/creatures/horned_fiend.md` (part table from `proportions.md`) + `src/kit/creatures/horned_fiend.js` as DATA built from the Step 5 parts.
- Head first: flat skull face, heavy brow, deep sunken red eyes, nose slits, short gaunt jaw with needle fangs, ram horns curling back then forward. Fix the parts kit's `head`/`jaw` if they force a snout.
- Picture-sheet loop ≥ 3 rounds against the turnaround (front, side, three-quarter). Silhouette ≥ 0.80 front and side. Log the side-view jaw check (the jaw must not stick out more than 0.25 HH past the brow).
- Gothic candle-lit horror: candle underlight, crimson rim, wet skin, darkness. Scary.
- ≤ 8k tris. Tests green. The placeholder stays at `?creature=placeholder`.
- Changelog line; mark Step 6 "built, awaiting owner approved" in `STATUS.md`.

### Push
`git push -u origin claude/step-6-horned-fiend`. Never `main`.

### Lab links to send (open each one first and confirm it renders)
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?creature=horned_fiend&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?creature=horned_fiend&view=front&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?creature=horned_fiend&view=side&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?creature=horned_fiend&view=three&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?creature=horned_fiend&view=front&still=1 (head close-up, if the lab has zoom: `&zoom=head`)
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/previews/horned_fiend/ (before/after sheets)

Reply with the links + 2 plain sentences, then **STOP**.
