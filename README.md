# FPS Art Lab

A separate project to find a **polished Jet Set Radio-style cel-shaded look** (anime/JoJo flavour) for a first-person shooter, made entirely in code with free tools. When the owner signs off on the style, it gets ported into [Crimson Plague](https://github.com/papigetbusy/crimson-plague) as a reskin (art, animations, effects). The gameplay there stays as it is.

- **Claude** writes all the code. **Grok / the owner** provide reference art.
- Free only: three.js (modern, ES modules), optional Blender headless, CC0 packs (Kenney, Quaternius, KayKit) as bases to restyle.
- No Meshy, no Unity, no paid assets.

**Start here:** `CLAUDE.md` (Claude's brief), `docs/art-direction.md` (the look), `docs/roadmap.md` (phases).

Play / preview (GitHub Pages, once enabled): https://papigetbusy.github.io/fps-art-lab/

| Folder | What lives there |
|---|---|
| `lab/` | Phase 1: turntable creature lab page |
| `arena/` | Phase 2: tiny FPS arena for the old-vs-new A/B (not built yet) |
| `src/kit/` | the shape kit (signed distance fields, mesher, named parts) |
| `src/look/` | renderer, lights, materials, post-processing: the shared look |
| `references/` | reference pictures from Grok / the owner |
| `tools/` | render sheets, comparisons |
| `tests/` | plain-sentence checks (`node --test tests/`) |
| `docs/` | art direction, roadmap, changelog |
