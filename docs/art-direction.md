# Art direction: Jet Set Radio-style cel-shaded FPS (locked by the owner, 2026-11-02)

## One line
A first-person shooter that looks like **Jet Set Radio**: chunky, stylised, cel-shaded characters with bold outlines and graffiti energy. **Anime and JoJo's Bizarre Adventure** add flavour. Polished, not cheap. Not Roblox, not voxel, not realistic.

## Primary reference: Jet Set Radio (characters first)
- **Proportions:** stylised and exaggerated, never toy-like:
  - long legs, big chunky shoes and gloves, small waists, expressive heads;
  - strong leaning, attitude-filled poses;
  - monsters push the same shape language into demonic forms (huge hands and claws, tiny waists, big horns).
- **Shading:** hard cel shading with 2–3 tone bands per material, no soft gradients. A crisp rim highlight, and flat, saturated base colours.
- **Bold ink outlines:** thick around the silhouette (inverted-hull method or a post-process edge pass), thinner on inner creases. Outlines are dark tinted versions of the base colour, not pure black.
- **Graffiti / street energy:** spray-paint decals, stickers, tags, halftone dots, paint drips. Effects (muzzle flashes, hits, deaths) are drawn like comic or anime effects: shapes, speed lines, ink splashes, not realistic smoke.

## Secondary flavour: anime + JoJo
- **JoJo:** dramatic, strong poses on idle and spawn, bold eyeliner-style ink on faces, striking colour palettes per character. "ゴゴゴ"-style menace symbols and impact text as on-screen effects (for kills, crits and boss arrivals).
- **Anime:** speed lines on sprint and slide, smear frames on melee and fast moves, impact frames (a brief high-contrast flash) on big hits, expressive eyes.

## Palette: two jobs at once
1. **JSR vibrancy (the default):** saturated pinks, cyans, lime, orange and yellow, against a warm sky or sunset backdrop. Each enemy type gets its own signature colour pair.
2. **Combat readability (non-negotiable for a shooter):**
   - enemies always contrast with the background (complementary colour, or a brighter value plus their outline);
   - danger (enemy attacks, projectiles, telegraphs) uses one reserved colour family (hot red/magenta + white core) that the environment never uses;
   - player effects use another family (cyan/yellow);
   - the background stays a step less saturated and lower in contrast than the characters, so characters always pop.
- **Crimson Plague link:** crimson and gold can stay as a "gothic graffiti" accent family (crimson tags on stone, gold chains and bling), restyled into flat cel colours. The owner can choose how much survives when the style is locked.

## Do
- Read clearly as a black silhouette at phone size.
- Cel bands + ink outlines + flat colour on everything, including guns, props and the world.
- Chunky, hand-made-looking shapes with clean curves (SDF/smooth-blend kit), not voxels.
- Animation with snap and overshoot: squash and stretch, held key poses (anime "limited animation" feel), springy weapon motion.
- Comic and anime effects: speed lines, halftone, ink splashes, bold hit sparks, stylised text pops.

## Don't
- Voxels, blocky stair-steps, per-block colour noise (the Roblox feel).
- Realistic PBR, physical metal and skin, photo textures, gritty realism.
- Soft gradient shading with no outline (that looks like an unfinished render).
- Muddy, desaturated scenes where enemies blend into walls.
- Thin, noisy details that disappear at phone size.

## Technical look recipe (three.js)
- `MeshToonMaterial` with a 3-step `gradientMap` (nearest filter), or a custom cel shader with stepped light + rim.
- Outlines: an inverted-hull back-face mesh per character (thickness scaled by distance), plus an optional edge-detection pass (depth/normal) for world geometry.
- Post (phone-safe): FXAA, light bloom on emissive paint only, an optional halftone/paper overlay. No heavy tone mapping that dulls colours (use `NoToneMapping` or tuned AgX/neutral; test on the phone).
- Textures: mostly flat colour plus hand-drawn decals (graffiti, stickers) as small PNG atlases. No photographic textures.

## Later: port to Crimson Plague
The approved style (toon materials, outlines, kit models, animations, effects) gets ported as a reskin. Crimson Plague's gameplay, loot and rules stay the same.
