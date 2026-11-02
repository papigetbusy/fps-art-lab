# Art direction: polished dark-gothic FPS

## One line
Premium, grounded, cinematic dark-gothic shooter. **Nothing should look like Roblox, a toy, or a voxel game.**

## Do
- **Silhouette first:** every monster and gun is readable as a black shape at phone size. Big, medium and small forms in roughly a 60/30/10 split.
- **Believable materials (PBR):**
  - stone is rough;
  - aged gold is metallic with worn edges;
  - skin has subtle subsurface-like warmth (sheen or rim);
  - horn and bone are semi-glossy;
  - cloth is matte.
- **Cinematic light:**
  - a warm torch key, cool fill from the environment, a crimson rim on enemies;
  - soft shadows, AO in creases, volumetric-feeling fog, restrained bloom on emissives;
  - ACES tone mapping and a crimson/gold colour grade.
- **Motion sells quality:**
  - weapons: weight on idle sway, recoil with recovery springs, smooth ADS;
  - monsters: anticipation and follow-through;
  - effects: embers, sparks, heat haze, impact decals.
- **Bevels:** no razor-sharp CG edges. Small bevels catch highlights.
- Palette: dark stone (#1a1614 to #3a332e), deep crimson (#5a0a12 to #9a1420), aged gold (#8a6a2a to #d4a84a), emissive ember (#ff6a20) and blood-red eye glow.

## Don't
- Voxels, blocky stair-steps, per-block colour noise.
- Flat ambient lighting, unlit `MeshBasicMaterial` everywhere, pure black shadows.
- Toy proportions, oversized heads and hands, plastic shine on everything.
- Over-bloom, rainbow colours, cartoon outlines.

## Reference mood (describe, don't copy)
Gothic cathedral ruins lit by torches, ember-filled air, ornate gold-trimmed weapons with real weight, demonic creatures with sinew, horn and plates.

## Later: port to Crimson Plague
The approved look (materials, lights, post, kit models, animations, effects) gets ported as a reskin. Crimson Plague's gameplay, loot and rules do not change.
