# FULL ROADMAP: from the art lab to a reskinned Crimson Plague

**Look:** gothic candle-lit horror (scary, dark, flame-lit). Jet Set Radio style is for player models only.
**Gate on EVERY step:** Claude builds on `claude/step-<n>-<name>`, pushes that branch only, sends raw.githack **lab links**, and stops. The owner checks the links in Grok Bot chat and says **"approved"** → only then does Claude merge to `main`. One step at a time. Grok Bot writes each step into `NEXT.md`.
Lab link format: `https://raw.githack.com/papigetbusy/fps-art-lab/<branch>/lab/index.html?<params>`

Order (owner, 2026-11-02): **monsters one by one → terrain, doors, levels → guns + shooting effects → everything else → port into Crimson Plague.**

---

## Phase 1: Creature lab + look lock (CURRENT)
- [x] 1 Gothic lab polish · [x] 2 Shape maths · [x] 3 Mesher
- [ ] 4 Candle-lit chapel + picture sheet (built; owner likes it; awaiting "approved")
- [ ] 5 Parts kit, scary materials (see `NEXT.md`)
- [ ] 6 Horned Fiend v1: the first scary monster and the template for all others
- [ ] 7 Idle + rig · [ ] 8 Export `.glb`
- [ ] 9 **Look lock**: variants A/B/C, owner picks (darkness, haze, candle count, gold, red)
- [ ] 10 JSR player next to the fiend (player only)
- [ ] 10b **Perf baseline**: lab `?perf=1` shows fps, draw calls and triangles on the owner's iPhone

## Phase 2: Monsters, one per step, in the lab
Each monster = 1 step (or 2 for bosses), with the same loop: refs in `references/creatures/<name>/` → part table → picture sheet (silhouette ≥ 0.80) → lab link → **owner approved** → animations → `.glb` → **owner approved**.
Required animations per monster: idle, walk/run, attack wind-up + strike, hit react, death (dissolve to embers/ash), plus a spawn/emerge.
Lab links per monster: `?creature=<name>`, `&view=front|side|three`, `&anim=idle|walk|attack|hit|death`, `&perf=1`.

Regular enemies (from `crimson-plague/src/referee_data.js`):
- [ ] Horned Fiend (done in Phase 1, Step 6–8)
- [ ] Bone Hound
- [ ] Rock Golem
- [ ] Goblin
- [ ] Skeleton
- [ ] Mushroom
- [ ] Eyeball
- [ ] Flame Spirit

Variant and elite looks (shader/material tints + small extras, NOT new models), lab `?creature=<name>&variant=<id>`:
- [ ] Element variants: Ember, Frost, Venom (`referee_variants.js`)
- [ ] Elite affixes: Armored, Swift, Brutal, Volatile (`referee_data.js`)

Bosses (2 steps each: model, then attack moves + FX), lab `?creature=<boss>&anim=<move>`:
- [ ] Demon Lord
- [ ] Bat Lord
- [ ] Lich King
- [ ] Elder Dragon (biggest: separate perf check)
- [ ] Boss extras/adds and boss FX (`referee_boss_extras.js`, `screen/boss_fx.js`)

## Phase 3: Terrain, doors, levels
Lab adds `?scene=room&set=<id>` (a sample room built from kit pieces) and `?scene=corridor`.
Wall sets (`crimson-plague/src/screen/wall_sets.js`), one step each:
- [ ] Blood · [ ] Bog · [ ] Frost · [ ] Ember · [ ] Void
Each set = walls, floor, ceiling, trim, pillars, banners, torches/candles, carpet; tileable textures in an atlas.
Props and pieces:
- [ ] Doors: the floor-exit door (locked → opens after 10 waves), side doors, open/close animation
- [ ] Gates (`floorgen_gates.js`) and lock visuals (`locks_view.js`)
- [ ] Chests + chest glow, barrels, crates
- [ ] Traps: spikes, vents, pulse traps (`trap_view.js`), lava
- [ ] Shop floor dressing
- [ ] Level test: one generated floor (rooms + winding corridors) in the new look, walkable, `?scene=floor&seed=1&perf=1`, with minimap/compass still readable

## Phase 4: Guns + shooting effects
Gun lab `?gun=<id>&view=fp|three` (first-person view with hands, plus turntable).
Guns (`crimson-plague/src/referee_weapons.js`), grouped by family and one step per family. Each family gets one hero model; the others are variations of its parts:
- [ ] Pistols: Service Pistol, Machine Pistol, Duelist, Hand Cannon
- [ ] SMGs: Compact SMG, Tactical SMG, Bullpup SMG, Drum SMG
- [ ] Shotguns: Pump Shotgun, Combat Shotgun, Double Barrel, Blunderbuss
- [ ] Rifles: Gothic Rifle, Bolt Rifle, Marksman Rifle, Rail Rifle, Anti-Materiel
- [ ] Heavy: Belt MG, Drum LMG, Chaingun, Minigun
- [ ] Rarity looks: Common, Uncommon, Rare, Epic, Legendary (trim, gems, glow)
- [ ] Gun skins: Crimson, Gilded, Frostbite, Venom, Voidlight, Hellforged, Infernal, Silver, Plain steel, Radiation
- [ ] Gloved hands (JSR player style) + idle sway, reload, recoil spring, ADS per family
Shooting effects (`screen/fx_plan.js`, `referee_gunfx.js`), lab `?gun=<id>&fx=<name>`:
- [ ] Muzzle flash, tracer/bullet, shell ejection
- [ ] Hit on flesh, hit on wall (sparks + decal), crit, kill, blast/explosion, screen shake
- [ ] Element shots: fire, ice, storm, void, plague

## Phase 5: Everything else
- [ ] **Hit feedback**: monster hit flash + colour per damage type (normal white flash, crit gold, fire/burn orange, ice/freeze blue, poison/venom green, void purple, plague crimson), damage numbers
- [ ] Ailment looks on monsters: burn, freeze, poison
- [ ] Class ability FX: Gunslinger (Fan the Hammer, Quickdraw, Ricochet, Dead Eye, Bullet Storm), Assassin (Cloak, Shadowstep, Bleed, Predator, Death Mark), Witch (Hex, Plague, Soul Siphon, Raise Dead, Crimson Plague)
- [ ] Loot: drops, pickup orbs, rarity beams
- [ ] UI reskin + optimise: HUD, party HUD, minimap, compass, gun card, gun list, loot view, gear menu, stash, codex/bestiary, skin pickers, touch layout, gamepad focus, menus (phone first, fewer DOM redraws)
- [ ] Player models (JSR): co-op friend model + skins, friend gun

## Phase 6: Arena proof (old vs new, perf gate)
- [ ] 30-second fight in one new-look room: 3 monsters, 1 gun, full FX, on the owner's iPhone with `?perf=1`
- [ ] A/B page: old Crimson look vs new
- [ ] **Owner approved + perf passes** → port may start

## Phase 7: Port into Crimson Plague (owner's explicit go, piece by piece)
Rules: art and screen layer only, no gameplay, loot or referee changes. Every piece sits behind `?art=new` until approved, so the old look stays as a fallback. Crimson Plague's own CLAUDE.md, tests and sign-off rules apply.
- [ ] P0 Port plan + new art contract v2 (budgets below) in crimson-plague, owner approved
- [ ] P1 Renderer, lights, post, candle-lit look (`world_view.js`, `world_bake.js`) behind `?art=new`
- [ ] P2 Monsters one by one (swap the `src/models/*` voxel models for `.glb` from the lab; keep the rig node names)
- [ ] P3 Bosses
- [ ] P4 Wall sets, doors, gates, props, traps
- [ ] P5 Guns, hands, gun FX
- [ ] P6 Hit flashes, ailments, class FX, loot
- [ ] P7 UI
- [ ] P8 Full phone playtest (co-op too) → owner approved → `?art=new` becomes default → old voxel code removed later

---

## Performance budget (stops lag and stutter on the phone)
The old art contract allowed gun ≤ 3,000 tris and monster ≤ 1,500 tris with Lambert lighting. The new look costs more, so the new budgets are:

| Item | Budget |
|---|---|
| Regular monster | ≤ 8k tris (LOD1 ≤ 2k, LOD2 ≤ 600 for far/hordes) |
| Boss | ≤ 20k tris (Elder Dragon included), LOD1 ≤ 6k |
| First-person gun + hands | ≤ 10k tris |
| Wall-set room on screen | ≤ 150k tris total visible |
| Draw calls | ≤ 150 on phone (instance repeated props, merge static walls per room) |
| Textures | ≤ 1024 px, one atlas per wall set / monster family, compressed (KTX2) |
| Real-time shadow lights | 1 on phone (others baked or fake candle pools); candles are emissive + light cards, not real lights |
| Post on phone | ACES + grade + vignette + FXAA; bloom at half resolution; no SSAO on phone (bake AO) |
| Particles | Pooled; ≤ 500 live on phone |
| Target | ≥ 50 fps iPhone, no frame > 33 ms during a 30-wave horde |

**What causes stutter, and the fix:**
- Shaders compiling the first time a monster, gun or effect appears → pre-warm everything at floor load (`renderer.compile`).
- Making meshes during play (the SDF mesher is slow) → mesh once in the lab, ship `.glb`, never mesh in the game.
- Too many lights (every candle a real light) → fake the candle glow; at most ~4 real lights.
- Hordes → instancing + LODs + a monster cap (the game already has one).
- Garbage from new objects every shot → pool bullets, decals and particles.
- Big textures → atlases + compression.
- Co-op → same budgets per player; effects from other players are cheaper.
Every content step in the lab reports its tris/draw calls with `?perf=1`. A step fails if it breaks the budget.
