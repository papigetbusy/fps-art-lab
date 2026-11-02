# Art direction: polished realistic dark-gothic FPS (owner-locked, 2026-11-02)

## One line
Premium, grounded, cinematic **realistic dark-gothic** shooter for the world, lighting, monsters, guns and arenas. **Nothing looks like Roblox, a toy or a voxel game.**
**One exception:** player characters (your own hands/body where visible, co-op friends, skins) use a **Jet Set Radio-style** look.

## Primary: realistic dark gothic (everything except player models)
### Do
- **Silhouette first:** every monster and gun reads as a black shape at phone size. Big, medium and small forms in roughly a 60/30/10 split.
- **Believable materials (PBR, `MeshStandardMaterial` / `MeshPhysicalMaterial` + environment map):**
  - stone is rough;
  - aged gold is metallic with worn edges;
  - monster skin has warmth (sheen/rim);
  - horn and bone are semi-glossy;
  - cloth is matte;
  - iron is dark and oily.
- **Cinematic light:**
  - a warm torch key, cool fill from the environment, a crimson rim on enemies;
  - soft shadows, AO in creases, fog depth, restrained bloom on emissives (embers, gems, eyes);
  - ACES tone mapping and a crimson/gold colour grade, vignette.
- **Motion sells quality:**
  - weapons: weight in idle sway, recoil with recovery springs, smooth ADS;
  - monsters: anticipation and follow-through;
  - effects: embers, sparks, heat haze, impact decals.
- **Bevels:** no razor-sharp CG edges. Small bevels catch highlights.
- Palette: dark stone (#1a1614 to #3a332e), deep crimson (#5a0a12 to #9a1420), aged gold (#8a6a2a to #d4a84a), emissive ember (#ff6a20), blood-red eye glow.

### Don't
- Voxels, blocky stair-steps, per-block colour noise.
- Flat ambient lighting, unlit materials everywhere, pure black shadows.
- Toy proportions, plastic shine on everything, cartoon outlines on the world, monsters or guns.
- Graffiti/JSR colours in the environment, over-bloom, rainbow colours.

## Exception: player models in Jet Set Radio style
Applies ONLY to player characters (first-person arms/gloves if the owner wants them, co-op friends, the skin picker, menus).
- Chunky stylised proportions: long legs, big shoes and gloves, attitude poses.
- Hard cel shading (2–3 bands, `MeshToonMaterial`), bold ink outlines (inverted hull, tinted darker than the base, not pure black).
- Saturated signature colour pairs per skin. A little anime/JoJo flair is fine on player poses and emotes.
- **Must sit well in the gothic world:** the players are lit by the same scene lights (toon ramp reads the key light), and their outlines fade a little with fog distance. Their colours are tuned so they stand out but don't look pasted on. Test them in the lab next to a gothic monster.
- Readability: player colours never use the enemy-danger reds.

## Mood reference (describe, don't copy)
Gothic cathedral ruins lit by torches, ember-filled air, ornate gold-trimmed weapons with real weight, demonic creatures with sinew, horn and plates. Stylish street-style JSR heroes fighting through it.

## Later: port to Crimson Plague
The approved look gets ported as a reskin: gothic world, monsters, guns and effects, plus the JSR player skins. Crimson Plague's gameplay, loot and rules stay the same.
