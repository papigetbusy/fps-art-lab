# Creature reference index (one turnaround sheet per creature)

**Rules**
- Each creature has ONE sheet: `references/creatures/<slug>/turnaround.svg` (a JPEG embedded in an SVG) showing front | side | three-quarter of the same creature. No separate per-angle pictures, so the design can't drift.
- **Claude must NOT use a sheet until that creature's step is the current one in `NEXT.md`.** Draft sheets can still change.
- **Status:** 🔒 **locked** (owner approved; the base is frozen, variants = gear only, see `horned_fiend/DESIGN-LOCK.md`) · 📝 **draft** (Grok first pass) · ✏️ **owner-editing**.
- **Owner edit workflow:** the owner edits or replaces a draft (or asks Grok Bot for changes in chat) → Grok Bot puts the final sheet here and sets 🔒 locked plus a `DESIGN-LOCK.md` → only then does Grok write that creature's step into `NEXT.md`.
- The grid numbers drawn on the draft sheets are decoration. Use the **height** column below (from the game's size values).
- Source list: `crimson-plague/src/referee_data.js` (read only).

| # | Creature | Slug / sheet | Type | Height | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | Horned Fiend | `horned_fiend/turnaround.svg` (+ `variant-armored.svg`) | enemy | 2.2 m | 🔒 locked | Base frozen. Armored = gear only. Step 6 now |
| 2 | Bone Hound | `bone_hound/turnaround.svg` | enemy (fast) | ~1.1 m shoulder | 📝 draft | Horned skeletal hound, glowing red eyes. Also summoned by the Demon Lord |
| 3 | Rock Golem | `rock_golem/turnaround.svg` | enemy (tank) | ~2.6 m | 📝 draft | Cathedral stone, magma cracks, chains, runes |
| 4 | Goblin | `goblin/turnaround.svg` | enemy (swarm) | ~1.3 m | 📝 draft | Feral imp, needle grin, rusty dagger |
| 5 | Skeleton | `skeleton/turnaround.svg` | enemy (heavy) | ~2.1 m | 📝 draft | Horned undead knight, blue soul-fire eyes, greatsword. Summoned by the Lich King |
| 6 | Mushroom | `mushroom/turnaround.svg` | enemy (ranged spit) | ~1.5 m | 📝 draft | Fungal horror, toothed maw, green spore sacs |
| 7 | Eyeball | `eyeball/turnaround.svg` | enemy (flying ranged) | hovers ~1.3 m | 📝 draft | Giant slit eye, tooth lids, tentacles. Summoned by the Bat Lord |
| 8 | Flame Spirit | `flame_spirit/turnaround.svg` | enemy (flying fire) | ~2 m, hovers | 📝 draft | Charred horned skeleton in hellfire |
| 9 | Demon Lord | `demon_lord/turnaround.svg` | BOSS | ~3.2 m | 📝 draft | Fiend-family king: wings, demonic armour, flaming sword |
| 10 | Bat Lord | `bat_lord/turnaround.svg` | BOSS (flying) | ~3 m | 📝 draft | Vampiric bat demon, torn wings, cape |
| 11 | Lich King | `lich_king/turnaround.svg` | BOSS (caster) | ~3 m | 📝 draft | Crowned skeleton sorcerer, soul staff |
| 12 | Elder Dragon | `elder_dragon/turnaround.svg` | BOSS (largest) | ~4 m at head | 📝 draft | Obsidian scales, molten veins, club tail |

**Variants (gear/tint layers on a locked base, never new sheets unless the owner asks):** element variants Ember / Frost / Venom; elite affixes Armored / Swift / Brutal / Volatile.
