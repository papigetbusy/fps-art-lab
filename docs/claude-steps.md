# Claude steps: one task at a time

How to use: the owner pastes **one** step's "Paste to Claude" line. Claude finishes it on its own branch, pushes **that branch only** (never `main` before the owner says "approved" — see `WORKFLOW.md`), and sends the lab test link. The owner checks and says go or gives notes, then moves to the next step.
Style lock (`docs/art-direction.md`): **realistic dark gothic** for the world, monsters, guns and arenas. **Jet Set Radio style only for player models** (step 10). Every step follows `CLAUDE.md` (`.claude-wip.md`, plain-sentence tests, changelog line, never `git commit -a`, push only the task's files).

## Testing rule (owner, 2026-11-02)
- **Plumbing** (shape maths, mesher internals, export, CI): automated tests only. Claude reports "green" in one sentence. **The owner does not open the lab for these.**
- **The owner opens the lab when something takes shape and needs a human eye** for small details and feel: proportions, horns, face, materials, lighting mood, idle feel, style variants, the JSR player mix, gun feel, the arena fight.
- Owner test levels: **none** (green tick is enough) · **lab glance** (30 seconds: does it open, does anything look wrong) · **careful human review** (take time, zoom in, give 1–3 notes, approve or not).
- Claude always checks its own screenshots first (picture sheet from Step 4 on). It only asks for a careful review once its own notes are minor.
- Every step lists exactly what to open. Links start at https://papigetbusy.github.io/fps-art-lab/

✅ **Step 1: Gothic lab polish.** Done and live at https://papigetbusy.github.io/fps-art-lab/lab/

---

## Phase 1: Creature lab

### ✅ Step 2: Shape maths (SDF kit). Done 2026-11-02
- **Claude does:** extends `src/kit/sdf.js`: rounded box, cone, torus, curve tube (tapered along a Catmull-Rom curve), smooth subtract and intersect, transforms (translate, rotate, scale), and a colour/material role carried per shape. Adds tests to `tests/kit.test.js`.
- **Done when:** `node --test tests/` passes, with new plain-sentence tests such as "A curve tube is thinner at its tip" and "Smooth subtract carves an eye socket". The green tick is on GitHub.
- **Auto-test (Claude-done when):** `node --test tests/` green + green tick. Claude reports "green".
- **Owner test:** **none**
- **Open:** nothing to open
- **Owner does:** checks the green tick. Nothing to look at yet.
- **Paste to Claude:** `Read CLAUDE.md and docs/claude-steps.md in papigetbusy/fps-art-lab and do Step 2 (shape maths). Push when tests are green and tell me in two plain sentences.`

### ✅ Step 3: Mesher (shapes → smooth 3D mesh)
- **Claude does:** `src/kit/mesher.js`:
  - Surface Nets (or marching cubes) over a bounded grid, welded vertices, smooth normals;
  - simplification to a triangle budget;
  - vertex colours or material groups from each shape's role.
  - A lab toggle `?kit=test` shows a test blob (sphere + horn + smooth-blended limb) in the gothic lighting.
- **Done when:**
  - tests pass ("A sphere meshes closed", "A mesh stays under its triangle budget");
  - the test blob shows smooth joins and no stair-steps on the lab page;
  - it stays fast on a phone.
- **Auto-test (Claude-done when):** mesher tests green (closed mesh, under budget, normals point out); Claude checks its own screenshot of `lab/?kit=test` for stair-steps.
- **Owner test:** **none** (optional lab glance only if curious)
- **Open:** [lab/?kit=test](https://papigetbusy.github.io/fps-art-lab/lab/?kit=test)
- **Owner does:** nothing. Claude reports green and checks its own screenshot; open the link only if curious.
- **Paste to Claude:** `Do Step 3 in docs/claude-steps.md (mesher). Check the test blob at lab/?kit=test yourself and tell me when it's green.`

## Remaining Phase 1 (Steps 4–10): lock the gothic candle-lit horror look
Rules for every step below (see `WORKFLOW.md`):
- Branch `claude/step-<n>-<name>`; push the branch only. **Do not merge to `main` until the owner says "approved".**
- Send a **lab test link**: `https://raw.githack.com/papigetbusy/fps-art-lab/<branch>/lab/index.html?<params>` (check it renders headless first). Previews are extra.
- Look target is **gothic candle-lit horror** (`docs/art-direction.md`): flame-lit pools, deep darkness, haze, wax, soot, embers, crimson rim. No Roblox/toy, no toon/JSR outside the player (Step 10).
- On "approved": merge, mark ✅, changelog line.

### 🟡 Step 4 (built, provisionally liked — waiting for owner "approved", NOT merged): Candle-lit chapel + picture sheet (Claude's eyes)
- **Claude does:** turns the lab room into a **candle-lit horror chapel** (candle clusters + 1–2 torches as key lights with soft flicker, haze, wax, soot, embers; look numbers in `src/look/`). Adds `?light=candle|torch|both` and `?flicker=0`. Then `tools/sheet.mjs` (headless renders of `lab/?view=front|side|three|top&ui=0&still=1` → `previews/<name>/sheet.png` + `index.html`, references row, silhouette score).
- **Auto-test:** tests green; `node tools/sheet.mjs placeholder` writes the sheet; phone preset steady.
- **Owner test:** **careful human review** of the candle-lit mood (first look at the horror lighting).
- **Lab test links:** `lab/index.html?light=candle`, `?light=both`, `?view=three&still=1`, plus `previews/placeholder/`.
- **Paste to Claude:** `Do Step 4 in docs/claude-steps.md on branch claude/step-4-candle-sheet. Don't merge to main. Send me the lab test links.`

### Step 5: Named parts kit (gothic candle-lit horror materials)
- **Branch:** `claude/step-5-parts`, created **from `claude/step-4-candle-sheet`** (Step 4 isn't merged yet; this stacks on its candle-lit chapel). Push this branch only. **Never `main`** until the owner says "approved" (Step 4 merges first, then Step 5).
- **Owner note (2026-11-02):** likes the candle-lit feel; wants the demon **scary**. Parts must be built to support that: sharp silhouettes, sinew, wet sheen, glowing eyes, cruel horns and claws, no cute/toy rounding.
- **Claude does:**
  - `src/kit/parts.js`: builders with sizes in metres for `torso`, `head`, `jaw`, `horn`, `limb`, `hand`/`claw`, `hoofFoot`, `tail`, `armourPlate`, `trimBand`, `gem`, `cloth`. Built on the Step 2/3 shape maths + mesher, not voxels.
  - Material roles in `src/look/materials.js`: wet skin (warm sheen in candlelight), horn, bone, claw, aged gold, iron, rotting cloth, eye glow (emissive), wax.
  - A **parts board** in the lab at `?kit=parts`: every part on a plinth with a small label, lit by the Step 4 candles; `&part=<name>` shows one part large on the turntable; `&light=` from Step 4 still works.
  - Runs its own picture sheet on the board and fixes the 3 worst notes (cheap/plastic/toy-looking parts) before sending links.
- **Auto-test (Claude-done when):** a plain-sentence test per part (under triangle budget, faces −Z, sits at origin, has a material role); `node --test tests/` green.
- **Owner test:** **lab glance** — flag any part that looks cheap, plastic or not scary.
- **Lab test links** (send all, after checking they render):
  - `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&light=candle`
  - `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&light=both`
  - `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=horn&light=candle`
  - `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=claw&light=candle`
  - `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-5-parts/lab/index.html?kit=parts&part=head&light=candle`
- **Paste to Claude:** `Do Step 5 in docs/claude-steps.md on branch claude/step-5-parts (from claude/step-4-candle-sheet). Push the branch only, never main. Send me the lab test links.`

### Step 6: Horned Fiend v1 (candle-lit horror)
- **Needs first:** refs in `references/creatures/horned_fiend/` (Grok supplies; stopgap: old `crimson-plague/art-drop/monsters/fiend_*.jpg`, read only, noted as stopgap).
- **Claude does:** `docs/creatures/horned_fiend.md` + `src/kit/creatures/horned_fiend.js` as DATA; ≥ 3 sheet rounds (render → 3 notes → fix); fiend tuned to be revealed by candlelight (eyes glow, rim, wet skin). Placeholder stays at `?creature=placeholder`.
- **Auto-test:** silhouette ≥ 0.80 front/side, ≤ 8k tris, ≥ 3 rounds logged, tests green.
- **Owner test:** **careful human review** (proportions, horns, face, hands, materials, scariness).
- **Lab test links:** `lab/index.html?creature=horned_fiend`, `&view=front`, `&view=side`, `&view=three`, plus `previews/horned_fiend/`.
- **Paste to Claude:** `Do Step 6 in docs/claude-steps.md on branch claude/step-6-horned-fiend using references/creatures/horned_fiend. Don't merge to main. Send me the lab test links and before/after sheets.`

### Step 7: Idle animation + rig
- **Claude does:** rig nodes (`root, torso, head, jaw, arm_l, arm_r, leg_l, leg_r, tail, eyes, hit_head`); heavy, creepy idle (breath, slow head turn toward camera, shoulder roll, tail follow-through, claw flex); `?sliders=1` proportion sliders; candle flicker plays over it.
- **Auto-test:** rig test green (all nodes, all poses run).
- **Owner test:** **careful human review** (heavy, alive, unsettling — not floaty).
- **Lab test links:** `lab/index.html?creature=horned_fiend&anim=idle`, `&sliders=1`
- **Paste to Claude:** `Do Step 7 in docs/claude-steps.md on branch claude/step-7-idle-rig. Don't merge to main. Send me the lab test links.`

### Step 8: Export .glb
- **Claude does:** `GLTFExporter` → `exports/horned_fiend_v1.glb` (rig nodes, origin at feet, faces −Z, metres); lab can load it back.
- **Auto-test:** export test green (node names, origin, facing).
- **Owner test:** **lab glance** (optional): the reloaded .glb looks the same.
- **Lab test link:** `lab/index.html?creature=horned_fiend&src=glb`
- **Paste to Claude:** `Do Step 8 in docs/claude-steps.md on branch claude/step-8-glb. Don't merge to main. Send me the lab test link.`

### Step 9: Style-lock variants (candle-lit horror)
- **Claude does:** `lab/?variant=A|B|C`, same fiend and chapel, look numbers only (e.g. A: darkest, few candles, heavy haze; B: many candles, more gold glints; C: cold moon fill + hot candle pools). Side-by-side `previews/variants/`.
- **Auto-test:** all 3 render; comparison page works.
- **Owner test:** **careful human review — you pick the locked look** (or a mix). Claude writes the pick into `docs/art-direction.md`.
- **Lab test links:** `lab/index.html?variant=A`, `?variant=B`, `?variant=C`, plus `previews/variants/`.
- **Paste to Claude:** `Do Step 9 in docs/claude-steps.md on branch claude/step-9-variants. Don't merge to main. Send me the three lab test links.`

### Step 10: Jet Set Radio player next to the fiend (player only)
- **Claude does:** `src/look/player_toon.js` (toon + outline, players ONLY) and one placeholder JSR-style player beside the fiend in the locked candle-lit chapel, lit by the same candles. Two variants (outline thickness/colour). Nothing else goes toon.
- **Auto-test:** test proves no toon material on world/monsters.
- **Owner test:** **careful human review**: does the JSR player fit the candle-lit horror world? **End of Phase 1.**
- **Lab test links:** `lab/index.html?player=1&pv=1`, `?player=1&pv=2`
- **Paste to Claude:** `Do Step 10 in docs/claude-steps.md on branch claude/step-10-player. Don't merge to main. Send me the lab test links.`

---

## Phase 2: Tiny FPS arena A/B

### Step 11: Arena room + first-person controls
- **Claude does:** `arena/`, one torch-lit gothic hall built from kit pieces and lathe pillars, with phone controls (left stick, right-side look, fire and aim buttons) and desktop mouse/keys. Rules live in a small pure `src/referee/` (seeded, tested).
- **Done when:** you can walk around on the phone smoothly in the locked look.
- **Auto-test (Claude-done when):** referee tests green; Claude's own phone-size smoke test shows a steady frame rate.
- **Owner test:** **lab glance**: walk around and say if the controls feel OK
- **Open:** [arena/](https://papigetbusy.github.io/fps-art-lab/arena/)
- **Owner does:** walks around on the phone and gives notes.
- **Paste to Claude:** `Do Step 11 in docs/claude-steps.md (arena room and first-person controls).`

### Step 12: The gun
- **Claude does:** one ornate gothic gun from lathe, extrude and bevels (or a restyled CC0 Quaternius gun): PBR iron and gold, idle sway, recoil spring, smooth ADS, muzzle flash, shell ejection, impact sparks and decals. Player arms in JSR style only if the owner wants them.
- **Done when:** firing feels weighty and looks premium, with a clear sight picture.
- **Auto-test (Claude-done when):** gun tests green (sight clear, anchors, budget).
- **Owner test:** **careful human review**: weight, recoil, ADS, effects
- **Open:** [arena/](https://papigetbusy.github.io/fps-art-lab/arena/)
- **Owner does:** shoots on the phone and gives notes.
- **Paste to Claude:** `Do Step 12 in docs/claude-steps.md (the gun with recoil, ADS and effects).`

### Step 13: Three enemies + the 30-second loop
- **Claude does:** three Horned Fiends (from the `.glb`) with chase, attack wind-up, hit react and death (dissolve to embers), 30 seconds of play, and hit and kill effects in the gothic style.
- **Done when:** one full 30-second fight plays on the phone with no stutter.
- **Auto-test (Claude-done when):** loop tests green (30 s fight runs, enemies die, no errors).
- **Owner test:** **careful human review**: play a full fight
- **Open:** [arena/](https://papigetbusy.github.io/fps-art-lab/arena/)
- **Owner does:** plays it and gives notes.
- **Paste to Claude:** `Do Step 13 in docs/claude-steps.md (three enemies and the 30-second fight).`

### Step 14: A/B against Crimson Plague
- **Claude does:** `previews/ab/`, matched screenshots (hall, monster close-up, aiming down sights, a fight moment): the old Crimson Plague look (taken from its live site, read only) next to the new arena. Adds a phone performance readout.
- **Done when:** the comparison page is live.
- **Auto-test (Claude-done when):** comparison page live with matched shots + fps readout.
- **Owner test:** **careful human review**: say "yes, this one" (approves the style)
- **Open:** [previews/ab/](https://papigetbusy.github.io/fps-art-lab/previews/ab/)
- **Owner does:** **says "yes, this one"** (or gives notes). That approves the style for the port.
- **Paste to Claude:** `Do Step 14 in docs/claude-steps.md (old-vs-new comparison page).`

---

## Phase 3: More content in the style (one step per item, same loop)
- **Testing:** auto-tests for each item; the owner gives a **careful human review** of each new monster, gun, boss and skin on its preview link (`previews/<name>/` and the lab or arena).
- **Step 15:** Demon Lord boss.
- **Step 16:** 2–3 more monsters.
- **Step 17:** 2 more guns.
- **Step 18:** hall kit (banners, doors, gates, props).
- **Step 19:** JSR player skins.
- **Paste to Claude:** `Do Step <n> in docs/claude-steps.md.`

## Phase 4: Reskin Crimson Plague (needs the owner's explicit go)
- **Testing:** all of Crimson Plague's own tests and smoke scripts stay green (automatic). The owner gives a **careful human review** of each ported piece on the Crimson Plague cheat build / live link before it ships.
- **Step 20:** a written port plan in `papigetbusy/crimson-plague` (art contract, screen layer only, no gameplay changes), with Crimson Plague's own CLAUDE.md rules applied. Done when the owner approves the plan.
- **Step 21 onwards:** port piece by piece (look/post first, then monsters, guns, effects, player skins), each with a preview link.
