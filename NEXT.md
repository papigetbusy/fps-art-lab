# NEXT: the one step Claude does now

> Read `STATUS.md` first. Do ONLY this step. Push the step branch only. **Never `main`** until the owner says "approved" in chat. Send the lab links below, then STOP.

## Current step: Step 5 — Named parts kit (gothic candle-lit horror)
(Step 4 is built and provisionally liked but NOT approved/merged, so Step 5 stacks on it.)

### Branch
```
git fetch origin
git checkout -b claude/step-5-parts origin/claude/step-4-candle-sheet
```
(If `claude/step-5-parts` already exists locally from an earlier try, keep working on it. It was **never pushed**, so push it now.)

### Brief
**Owner feedback (4:27 AM ET):** much better, but it needs a **scary dark feel**. Push darker: less fill, deeper shadows, colder haze outside the candle pools, wetter skin, sharper horns and claws, red eye glow. Also add `&perf=1` (fps / triangles / draw calls) if it's quick, since all later steps will use it.
The owner wants the demon **scary**. These parts are what the Horned Fiend will be built from, so nothing cute, rounded or toy-like.
- `src/kit/parts.js`: builders, sizes in metres, built on the Step 2 shape maths + Step 3 mesher (no voxels): `torso`, `head`, `jaw`, `horn`, `limb`, `hand`/`claw`, `hoofFoot`, `tail`, `armourPlate`, `trimBand`, `gem`, `cloth`.
  - Horns: ridged, curved, tapering to a sharp tip. Claws: long, hooked, sharp. Head/jaw: heavy brow, deep eye sockets, teeth. Limbs/torso: sinew and muscle masses, not tubes.
- `src/look/materials.js` roles: wet skin (warm sheen in candlelight), horn, bone, claw, aged gold, iron, rotting cloth, eye glow (emissive), wax.
- Lab parts board at `lab/index.html?kit=parts`: each part on a plinth with a small label, lit by the Step 4 candles. `&part=<name>` shows one part large on the turntable. `&light=candle|torch|both` keeps working.
- Look: gothic candle-lit horror (`docs/art-direction.md`). Flame-lit pools, deep darkness, haze, crimson rim. No Roblox, toy, plastic or toon.
- Check your own picture sheet of the board, write 3 notes (cheap, plastic or not scary), and fix them before you send links.
- Tests: one plain-sentence test per part (under triangle budget, faces −Z, sits at origin, has a material role). `node --test tests/` green.
- Add one changelog line and mark Step 5 "built, awaiting owner approved" in `STATUS.md`.

### Push
```
git push -u origin claude/step-5-parts
```
Never push or merge to `main`.

### Lab links to send when done (open each one first and confirm it renders)
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&light=both
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=horn&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=claw&light=candle
- https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=head&light=candle

Then reply with the links plus 2 plain sentences, and **STOP**. Wait for the owner.
