# Roadmap

**Style (owner-locked 2026-11-02):** realistic polished dark gothic for the world, monsters, guns and arenas. **Player models only** in Jet Set Radio style. See `docs/art-direction.md`.

## Phase 1: Turntable creature lab (CURRENT)
**Look to lock: gothic candle-lit horror.** Workflow: `WORKFLOW.md` (branch per step, lab test link, nothing to `main` until owner says "approved").
Goal: lock the shared look (renderer, lights, materials, post) and the shape kit plus self-render loop on ONE creature.
- Lab page `lab/`: turntable, idle animation, view buttons (front/side/three/top), phone and desktop presets.
- Kit: `src/kit/sdf.js`, `mesher.js`, `parts.js`, `creatures/horned_fiend.js`.
- Loop: `tools/sheet.mjs` contact sheet next to references, silhouette score.
- **Style lock:** the owner picks from 2–3 lab variants of the gothic look (light mood, grade, material finish) and 2 variants of the JSR player mix (outline thickness, colour), then writes the choices into `docs/art-direction.md`.
- **Done when:**
  - the owner says "this looks polished and gothic, not cheap", and approves the JSR player next to a monster on his phone;
  - silhouette match ≥ 0.80 front and side;
  - ≥ 50 fps on iPhone;
  - the `.glb` exports with rig nodes.

## Phase 2: Tiny FPS arena, style A/B
Goal: 30 seconds of first-person play in one gothic room (torch-lit hall or cathedral ruin). One gun, three enemies of the lab creature.
- Gun built with lathe/extrude/bevels or a restyled CC0 gun: idle sway, recoil springs, ADS, muzzle flash, shell ejection, impact sparks and decals.
- Full gothic look: shadows, AO, bloom, colour grade, vignette, FXAA/SMAA, fog, ember particles. JSR-style player arms or co-op friend model only. A "phone" preset and a "high" preset.
- A/B page: the same camera shots of Crimson Plague's current look next to the new look (screenshots taken from the live Crimson Plague link, read-only).
- **Done when:** the owner picks the new look on his phone and it stays ≥ 50 fps.

## Phase 3: More content in the style
More monsters, the Demon Lord boss, 2–3 guns, hall kit pieces (pillars, banners, torches), hit and death effects, animations.

## Phase 4: Reskin Crimson Plague (needs owner approval)
Port the look and assets into `crimson-plague` through its art contract and screen layer only. No gameplay changes.
