# Claude steps: one task at a time

How to use: the owner pastes **one** step's "Paste to Claude" line. Claude finishes it, pushes, and sends the link. The owner checks and says go or gives notes, then moves to the next step.
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

### Step 3: Mesher (shapes → smooth 3D mesh)
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

### Step 4: Picture sheet (Claude's eyes)
- **Claude does:** `tools/sheet.mjs`:
  - opens `lab/?view=front|side|three|top&ui=0&still=1` headless (Playwright or Chrome `--screenshot`) and saves the 4 renders;
  - lays them next to `references/creatures/<name>/`;
  - adds a silhouette overlay and score;
  - writes `previews/<name>/sheet.png` plus `previews/<name>/index.html` (phone-viewable).
- **Done when:** `node tools/sheet.mjs placeholder` makes a sheet of the current demon, and the preview page works on GitHub Pages.
- **Auto-test (Claude-done when):** `node tools/sheet.mjs placeholder` writes the sheet + preview page; tests green.
- **Owner test:** **lab glance**: just confirm the 4-view sheet opens on the phone
- **Open:** [previews/placeholder/](https://papigetbusy.github.io/fps-art-lab/previews/placeholder/)
- **Owner does:** opens the preview link and checks you can see all 4 views clearly.
- **Paste to Claude:** `Do Step 4 in docs/claude-steps.md (picture sheet). Run it on the current placeholder demon and send me the preview link.`

### Step 5: Named parts kit
- **Claude does:** `src/kit/parts.js`, builders with sizes in metres: `torso`, `head`, `jaw`, `horn`, `limb`, `hand`/`claw`, `hoofFoot`, `tail`, `armourPlate`, `trimBand`, `gem`, `cloth`. Each maps to the material roles in `src/look/materials.js` (skin, horn, bone, claw, gold, iron, cloth, eye). Shows a "parts board" at `lab/?kit=parts`.
- **Done when:** every part renders in the gothic look, and there are tests per part (budget, faces −Z, sits at origin).
- **Auto-test (Claude-done when):** a test per part (budget, faces −Z, sits at origin); Claude reviews the parts board on its own sheet.
- **Owner test:** **lab glance**: flag any part that looks cheap
- **Open:** [lab/?kit=parts](https://papigetbusy.github.io/fps-art-lab/lab/?kit=parts)
- **Owner does:** looks at the parts board and says which parts look cheap.
- **Paste to Claude:** `Do Step 5 in docs/claude-steps.md (parts kit) and send me lab/?kit=parts.`

### Step 6: Horned Fiend v1
- **Needs first:** Horned Fiend reference pictures in `references/creatures/horned_fiend/` (front, side, back, details) in the realistic gothic style from Grok or the owner. As a stopgap, Claude may copy the old `crimson-plague/art-drop/monsters/fiend_*.jpg` (read only).
- **Claude does:**
  - writes `docs/creatures/horned_fiend.md` (part table, proportions in head-heights);
  - writes `src/kit/creatures/horned_fiend.js` as DATA;
  - runs the picture-sheet loop (render → 3 notes → fix) at least 3 rounds, keeping before/after sheets;
  - replaces the placeholder in the lab (the placeholder stays reachable at `?creature=placeholder`).
- **Done when:**
  - silhouette match ≥ 0.80 front and side;
  - ≤ 8k triangles;
  - phone stays smooth;
  - the sheets are published.
- **Auto-test (Claude-done when):** silhouette ≥ 0.80 front and side, ≤ 8k tris, ≥ 3 sheet rounds logged, tests green.
- **Owner test:** **careful human review** (small details: proportions, horns, face, hands, materials)
- **Open:** [lab/?view=front](https://papigetbusy.github.io/fps-art-lab/lab/?view=front), [lab/?view=side](https://papigetbusy.github.io/fps-art-lab/lab/?view=side), [lab/?view=three](https://papigetbusy.github.io/fps-art-lab/lab/?view=three), [lab/ (spin)](https://papigetbusy.github.io/fps-art-lab/lab/), [previews/horned_fiend/](https://papigetbusy.github.io/fps-art-lab/previews/horned_fiend/)
- **Owner does:** opens the lab and the sheets and gives 1–3 notes (proportions, horns, mood).
- **Paste to Claude:** `Do Step 6 in docs/claude-steps.md (Horned Fiend v1) using the references in references/creatures/horned_fiend. Show me the sheets before and after.`

### Step 7: Idle animation + rig + turntable polish
- **Claude does:** rig nodes (`root, torso, head, jaw, arm_l, arm_r, leg_l, leg_r, tail, eyes, hit_head`); idle with weight (breath, head look, shoulder roll, tail follow-through, claw flex); optional proportion sliders (`?sliders=1`).
- **Done when:** the idle feels heavy and alive, not floaty, and the rig test passes.
- **Auto-test (Claude-done when):** rig test green (every node present, every pose runs).
- **Owner test:** **careful human review** (does the idle feel heavy and alive?)
- **Open:** [lab/ (spin) and lab/?sliders=1](https://papigetbusy.github.io/fps-art-lab/lab/)
- **Owner does:** watches it spin on the phone and gives notes.
- **Paste to Claude:** `Do Step 7 in docs/claude-steps.md (idle animation and rig) and send me the lab link.`

### Step 8: Export .glb
- **Claude does:** `GLTFExporter` (button plus node script) → `exports/horned_fiend_v1.glb` with the rig nodes, matching Crimson Plague's art contract (origin at the feet, faces −Z, metres). A test checks the node names.
- **Done when:** the file loads back in the lab from the `.glb` and looks the same.
- **Auto-test (Claude-done when):** .glb export test green (node names, origin, facing); the re-loaded model matches.
- **Owner test:** **none**
- **Open:** nothing to open
- **Owner does:** nothing but the green tick.
- **Paste to Claude:** `Do Step 8 in docs/claude-steps.md (export the Horned Fiend as .glb).`

### Step 9: Style-lock variants (gothic)
- **Claude does:** `lab/?variant=A|B|C`, three takes on the same fiend and room (for example A: darker and foggier; B: more contrast and gold; C: colder stone with hotter embers). Only look numbers in `src/look/` change. Adds a side-by-side page `previews/variants/`.
- **Done when:** the variant page works on the phone.
- **Auto-test (Claude-done when):** all 3 variants render; comparison page live.
- **Owner test:** **careful human review**: you pick the look (style lock)
- **Open:** [lab/?variant=A](https://papigetbusy.github.io/fps-art-lab/lab/?variant=A), [lab/?variant=B](https://papigetbusy.github.io/fps-art-lab/lab/?variant=B), [lab/?variant=C](https://papigetbusy.github.io/fps-art-lab/lab/?variant=C), [previews/variants/](https://papigetbusy.github.io/fps-art-lab/previews/variants/)
- **Owner does:** **picks one** (or mixes: "A's fog with B's gold"). Claude writes the pick into `docs/art-direction.md` as the locked values.
- **Paste to Claude:** `Do Step 9 in docs/claude-steps.md (three gothic look variants) and send me the comparison page.`

### Step 10: Jet Set Radio player model test (player only)
- **Claude does:** `src/look/player_toon.js` (toon material plus outlines, used ONLY for players) and one placeholder JSR-style player character (chunky shoes and gloves, attitude pose) standing next to the gothic fiend, lit by the same lights. Two variants (outline thickness and colour). Nothing else in the scene goes toon.
- **Done when:** the player reads clearly and doesn't look pasted on; the fiend and room are unchanged.
- **Auto-test (Claude-done when):** toon/outline used only on the player (test checks no toon material on the world or monsters).
- **Owner test:** **careful human review**: does the JSR player fit next to the gothic fiend?
- **Open:** [lab/?player=1 (variants: &pv=1](https://papigetbusy.github.io/fps-art-lab/lab/?player=1),  &pv=2)
- **Owner does:** approves the mix or gives notes. **End of Phase 1 = owner review.**
- **Paste to Claude:** `Do Step 10 in docs/claude-steps.md (Jet Set Radio-style player next to the gothic fiend, player only).`

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
