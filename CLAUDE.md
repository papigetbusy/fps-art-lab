# Claude brief: FPS Art Lab

You are the code half of this project. The owner is not a programmer: explain in plain language, one sentence per choice. He checks work on his iPhone (held sideways) through the GitHub Pages link and the green tick.

## Why this project exists
The owner made Crimson Plague (a first-person horde shooter, `papigetbusy/crimson-plague`) with you. The **gameplay is good. The look is the problem.** It reads as Roblox / cheap: chunky 5 cm voxels typed as coordinates without seeing them, flat ambient Lambert lighting, no tone mapping, no post-processing, details that turn into noise. Your job here is to **find and lock a polished, premium look in a clean separate repo**, then later reskin Crimson Plague with it.

**Do not touch `crimson-plague` or `crusader-tactics` from this project.** The reskin is a later phase that the owner has to approve.

## The look we want (full detail in `docs/art-direction.md`)
- **Polished, grounded, premium dark-gothic FPS.** Think modern indie and AA shooters with a strong art direction: readable silhouettes, believable materials, cinematic light.
- **Anti-Roblox rules:** no voxels, no visible blocky stair-steps, no flat unlit colours, no random per-block colour noise, no toy proportions, no plastic-everywhere materials.
- Palette stays Crimson Plague's: dark stone, deep crimson, aged gold, with emissive accents (embers, gems, eyes).
- **Light does the work:** ACES tone mapping, correct sRGB, a hemisphere/environment light, warm key light, rim light, shadows from the key light, AO, and subtle bloom, colour grade, vignette and fog.

## Tech rules
- three.js **current release** as ES modules through the import map in each HTML page (jsDelivr). No build step needed, so Pages serves the files directly. Never use the old r128 `examples/js` globals.
- Use `MeshStandardMaterial` / `MeshPhysicalMaterial` with a `RoomEnvironment` PMREM, so materials read as metal, stone, skin or cloth. Toon shading only if `docs/art-direction.md` changes to allow it.
- **Shapes come from code, never typed voxels:**
  - `src/kit/sdf.js` holds the shape maths: signed distance fields (tapered capsules, ellipsoids, rounded boxes, curve tubes, smooth union and subtract, mirror).
  - `src/kit/mesher.js` turns them into a mesh: Surface Nets or marching cubes, then weld, smooth normals and simplify to budget.
  - `src/kit/parts.js` holds named parts: horn, limb, torso, head, claw, tail, plate, trim, gem.
  - Hard-surface objects (guns, armour, props) use `LatheGeometry`, `ExtrudeGeometry` with bevels, and `TubeGeometry`.
- **Creatures are data:** `src/kit/creatures/<name>.js` lists parts, sizes in metres, colour and material roles, and rig nodes. No raw coordinate dumps.
- Free assets: CC0 only (Kenney, Quaternius, KayKit, Poly Haven textures and HDRIs), credited in `docs/credits.md`. You may restyle them. Optional Blender headless scripts in `tools/blender/` (AO or normal bakes, retopo), never required to run the site.
- **Budgets (phone first):**
  - Monster ≤ 8k triangles (LOD1 ≤ 2k); gun ≤ 10k.
  - Textures ≤ 1024 px.
  - Stay ≥ 50 fps on the owner's iPhone with the "phone" post preset.
- Keep files small and focused, never a monolith. Look-only numbers live in `src/look/`. When the arena has rules, they live in a pure, seeded `src/referee/` with no browser, clock or unseeded random, like Crimson Plague.
- Every check is a plain-sentence test in `tests/` (`node --test tests/`).

## The self-render loop (mandatory for every model change)
1. **Reference:** pictures in `references/creatures/<name>/` (front, side, back, details) from Grok or the owner. Never invent final art without references; placeholders must be marked as placeholders.
2. **Part breakdown:** `docs/creatures/<name>.md`, a table of parts (primitive, rig node, size in metres, material role) and proportions in head-heights.
3. **Code:** edit the creature spec (data), not raw geometry.
4. **Render sheet:** `node tools/sheet.mjs <name>` writes `previews/<name>/sheet.png`:
   - row 1: front, side, three-quarter and top renders, lit with the real look;
   - row 2: the reference pictures;
   - row 3: silhouette overlay and a score per view.
5. **Look before you edit again:** open the PNG and write 3 notes (biggest silhouette error, biggest proportion error, material or readability issue). Then change the fewest numbers that fix note 1.
6. **Repeat** until silhouette match ≥ 0.80 front and side and the notes are minor. Publish `previews/<name>/index.html`, add the changelog line, and send the owner the link.

## Working rules
- Start of every turn: `git status`, read `.claude-wip.md` if it exists. Before your first edit on a task, write `.claude-wip.md` (the request in the owner's words, the plan as `- [ ]` steps). Delete it when the push is green.
- Never `git commit -a`. Add only this task's files. Commit messages in plain words. Push only when the owner asked for the work.
- Work only on the current phase in `docs/roadmap.md`.
- Log every finished piece of work as one plain line at the top of `docs/changelog.md`.

## Your first tasks (in order, each a small push)
1. Make the starter lab page look *good* with a placeholder: renderer, ACES, sRGB, RoomEnvironment, key/rim/hemi lights, soft shadows, ground with contact shadow, bloom and vignette via `EffectComposer`, phone/desktop presets. Files: `src/look/*`.
2. `src/kit/sdf.js` and its tests ("A sphere's distance is zero on its surface", "Smooth union never cuts inside either shape").
3. `src/kit/mesher.js` (Surface Nets, weld, normals, simplify to budget) and its tests ("A sphere meshes closed and under budget").
4. `tools/sheet.mjs`: headless render sheet (Playwright screenshots of `lab/?view=front|side|three|top`) next to the reference, plus silhouette score. Build this BEFORE any creature.
5. `src/kit/parts.js` with named parts, plus material roles (stone, skin, horn, aged gold, ember glow).
6. First creature, the **Horned Fiend** (refs: copy from `crimson-plague/art-drop/monsters/fiend_*.jpg` into `references/creatures/horned_fiend/`, reading only, never editing that repo). Write the breakdown, the spec, and sheet iterations, with before/after sheets kept in `previews/`.
7. Idle animation (breath, head sway, secondary motion on tail and horns), a turntable, and optional proportion sliders.
8. `GLTFExporter` → `exports/horned_fiend_v1.glb` with rig nodes `root, torso, head, arm_l, arm_r, leg_l, leg_r, eyes, hit_head` (matches Crimson Plague's art contract for the later port).
9. Owner review #1 → Phase 2 (tiny FPS arena, see `docs/roadmap.md`).
