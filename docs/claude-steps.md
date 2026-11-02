# Claude steps: one task at a time

How to use: the owner pastes **one** step's "Paste to Claude" line. Claude finishes it, pushes, and sends the link. The owner checks and says go or gives notes, then moves to the next step.
Style lock (`docs/art-direction.md`): **realistic dark gothic** for the world, monsters, guns and arenas. **Jet Set Radio style only for player models** (step 10). Every step follows `CLAUDE.md` (`.claude-wip.md`, plain-sentence tests, changelog line, never `git commit -a`, push only the task's files).

✅ **Step 1: Gothic lab polish.** Done and live at https://papigetbusy.github.io/fps-art-lab/lab/

---

## Phase 1: Creature lab

### ✅ Step 2: Shape maths (SDF kit). Done 2026-11-02
- **Claude does:** extends `src/kit/sdf.js`: rounded box, cone, torus, curve tube (tapered along a Catmull-Rom curve), smooth subtract and intersect, transforms (translate, rotate, scale), and a colour/material role carried per shape. Adds tests to `tests/kit.test.js`.
- **Done when:** `node --test tests/` passes, with new plain-sentence tests such as "A curve tube is thinner at its tip" and "Smooth subtract carves an eye socket". The green tick is on GitHub.
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
- **Owner does:** opens `lab/?kit=test` and says if the surface looks smooth and solid.
- **Paste to Claude:** `Do Step 3 in docs/claude-steps.md (mesher). Show the test blob at lab/?kit=test and send me the link.`

### Step 4: Picture sheet (Claude's eyes)
- **Claude does:** `tools/sheet.mjs`:
  - opens `lab/?view=front|side|three|top&ui=0&still=1` headless (Playwright or Chrome `--screenshot`) and saves the 4 renders;
  - lays them next to `references/creatures/<name>/`;
  - adds a silhouette overlay and score;
  - writes `previews/<name>/sheet.png` plus `previews/<name>/index.html` (phone-viewable).
- **Done when:** `node tools/sheet.mjs placeholder` makes a sheet of the current demon, and the preview page works on GitHub Pages.
- **Owner does:** opens the preview link and checks you can see all 4 views clearly.
- **Paste to Claude:** `Do Step 4 in docs/claude-steps.md (picture sheet). Run it on the current placeholder demon and send me the preview link.`

### Step 5: Named parts kit
- **Claude does:** `src/kit/parts.js`, builders with sizes in metres: `torso`, `head`, `jaw`, `horn`, `limb`, `hand`/`claw`, `hoofFoot`, `tail`, `armourPlate`, `trimBand`, `gem`, `cloth`. Each maps to the material roles in `src/look/materials.js` (skin, horn, bone, claw, gold, iron, cloth, eye). Shows a "parts board" at `lab/?kit=parts`.
- **Done when:** every part renders in the gothic look, and there are tests per part (budget, faces −Z, sits at origin).
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
- **Owner does:** opens the lab and the sheets and gives 1–3 notes (proportions, horns, mood).
- **Paste to Claude:** `Do Step 6 in docs/claude-steps.md (Horned Fiend v1) using the references in references/creatures/horned_fiend. Show me the sheets before and after.`

### Step 7: Idle animation + rig + turntable polish
- **Claude does:** rig nodes (`root, torso, head, jaw, arm_l, arm_r, leg_l, leg_r, tail, eyes, hit_head`); idle with weight (breath, head look, shoulder roll, tail follow-through, claw flex); optional proportion sliders (`?sliders=1`).
- **Done when:** the idle feels heavy and alive, not floaty, and the rig test passes.
- **Owner does:** watches it spin on the phone and gives notes.
- **Paste to Claude:** `Do Step 7 in docs/claude-steps.md (idle animation and rig) and send me the lab link.`

### Step 8: Export .glb
- **Claude does:** `GLTFExporter` (button plus node script) → `exports/horned_fiend_v1.glb` with the rig nodes, matching Crimson Plague's art contract (origin at the feet, faces −Z, metres). A test checks the node names.
- **Done when:** the file loads back in the lab from the `.glb` and looks the same.
- **Owner does:** nothing but the green tick.
- **Paste to Claude:** `Do Step 8 in docs/claude-steps.md (export the Horned Fiend as .glb).`

### Step 9: Style-lock variants (gothic)
- **Claude does:** `lab/?variant=A|B|C`, three takes on the same fiend and room (for example A: darker and foggier; B: more contrast and gold; C: colder stone with hotter embers). Only look numbers in `src/look/` change. Adds a side-by-side page `previews/variants/`.
- **Done when:** the variant page works on the phone.
- **Owner does:** **picks one** (or mixes: "A's fog with B's gold"). Claude writes the pick into `docs/art-direction.md` as the locked values.
- **Paste to Claude:** `Do Step 9 in docs/claude-steps.md (three gothic look variants) and send me the comparison page.`

### Step 10: Jet Set Radio player model test (player only)
- **Claude does:** `src/look/player_toon.js` (toon material plus outlines, used ONLY for players) and one placeholder JSR-style player character (chunky shoes and gloves, attitude pose) standing next to the gothic fiend, lit by the same lights. Two variants (outline thickness and colour). Nothing else in the scene goes toon.
- **Done when:** the player reads clearly and doesn't look pasted on; the fiend and room are unchanged.
- **Owner does:** approves the mix or gives notes. **End of Phase 1 = owner review.**
- **Paste to Claude:** `Do Step 10 in docs/claude-steps.md (Jet Set Radio-style player next to the gothic fiend, player only).`

---

## Phase 2: Tiny FPS arena A/B

### Step 11: Arena room + first-person controls
- **Claude does:** `arena/`, one torch-lit gothic hall built from kit pieces and lathe pillars, with phone controls (left stick, right-side look, fire and aim buttons) and desktop mouse/keys. Rules live in a small pure `src/referee/` (seeded, tested).
- **Done when:** you can walk around on the phone smoothly in the locked look.
- **Owner does:** walks around on the phone and gives notes.
- **Paste to Claude:** `Do Step 11 in docs/claude-steps.md (arena room and first-person controls).`

### Step 12: The gun
- **Claude does:** one ornate gothic gun from lathe, extrude and bevels (or a restyled CC0 Quaternius gun): PBR iron and gold, idle sway, recoil spring, smooth ADS, muzzle flash, shell ejection, impact sparks and decals. Player arms in JSR style only if the owner wants them.
- **Done when:** firing feels weighty and looks premium, with a clear sight picture.
- **Owner does:** shoots on the phone and gives notes.
- **Paste to Claude:** `Do Step 12 in docs/claude-steps.md (the gun with recoil, ADS and effects).`

### Step 13: Three enemies + the 30-second loop
- **Claude does:** three Horned Fiends (from the `.glb`) with chase, attack wind-up, hit react and death (dissolve to embers), 30 seconds of play, and hit and kill effects in the gothic style.
- **Done when:** one full 30-second fight plays on the phone with no stutter.
- **Owner does:** plays it and gives notes.
- **Paste to Claude:** `Do Step 13 in docs/claude-steps.md (three enemies and the 30-second fight).`

### Step 14: A/B against Crimson Plague
- **Claude does:** `previews/ab/`, matched screenshots (hall, monster close-up, aiming down sights, a fight moment): the old Crimson Plague look (taken from its live site, read only) next to the new arena. Adds a phone performance readout.
- **Done when:** the comparison page is live.
- **Owner does:** **says "yes, this one"** (or gives notes). That approves the style for the port.
- **Paste to Claude:** `Do Step 14 in docs/claude-steps.md (old-vs-new comparison page).`

---

## Phase 3: More content in the style (one step per item, same loop)
- **Step 15:** Demon Lord boss.
- **Step 16:** 2–3 more monsters.
- **Step 17:** 2 more guns.
- **Step 18:** hall kit (banners, doors, gates, props).
- **Step 19:** JSR player skins.
- **Paste to Claude:** `Do Step <n> in docs/claude-steps.md.`

## Phase 4: Reskin Crimson Plague (needs the owner's explicit go)
- **Step 20:** a written port plan in `papigetbusy/crimson-plague` (art contract, screen layer only, no gameplay changes), with Crimson Plague's own CLAUDE.md rules applied. Done when the owner approves the plan.
- **Step 21 onwards:** port piece by piece (look/post first, then monsters, guns, effects, player skins), each with a preview link.
