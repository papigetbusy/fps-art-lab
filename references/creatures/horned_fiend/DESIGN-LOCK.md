# 🔒 Horned Fiend: DESIGN LOCK (owner, 2026-11-02)

**The owner locked this design:** `references/creatures/horned_fiend/turnaround.svg` (the embedded JPEG: front, side and three-quarter on one sheet). His words: "that reference is perfect."

- **This sheet is the design.** The fiend in the lab must match it: silhouette, head, horns, proportions, skin.
- **The head must match exactly:** flat skull demon face, heavy brow, deep sunken red eyes, nose slits, short gaunt jaw with needle fangs, ram horns curling back then forward. **Not a dog**: no snout (see `proportions.md`).
- **Order:** (1) match the silhouette and head; (2) only then are **small detail tweaks** allowed, and only ones the owner asks for. Every tweak is written here as a dated line below, so the design never drifts.
- No other fiend pictures are used. Grok Bot will not regenerate this sheet. Any new angles (back view, close-ups) must be derived from this sheet and approved by the owner.

## ⛔ HARD RULE: the base never changes once locked (owner, 2026-11-02)
- The base fiend in `turnaround.svg` (skeleton, proportions, head, horns, glowing eyes, digitigrade legs, hooves, tail) is **frozen**. No variant, tweak or later step may change it.
- **Variants are equipment layers only:** armour, cloth, gems, material/emissive tints, attached to the frozen base rig nodes. Remove the layer and the exact base fiend is underneath.
- If a variant picture disagrees with the base body, **the base wins**, and only the gear shape is taken from the variant picture.
- The only way to change the base is the owner explicitly saying so. It then gets a dated tweak-log line, and Grok Bot updates `turnaround.svg`.

## Variants of the SAME locked fiend (not new creatures)
- **Armored elite** (`armored` affix): `variant-armored.svg` (v2). **Demonic armour**, not plain plate: blackened iron with jagged spikes, hooked barbs and thorn ridges; a ribcage-shaped chest plate; horned-skull shoulder pauldrons with curved spikes; clawed vambraces; spiked knee guards; barbed tail plates; molten red-orange cracks and infernal runes in the metal; dull aged-gold edges.
  - **Feet:** armoured foot-guards shaped like a human foot (heel, arch, toe section) strapped over the frozen hooves, with the cloven hoof tips still showing at the front. This is gear over the base feet; the base legs and hooves underneath don't change.
  - Head, horns and glowing eyes stay uncovered and identical to `turnaround.svg`.
  - Build it as armour meshes attached to the base rig (`armourPlate`, `trimBand`, `cloth`, plus spike/barb parts), toggled by `?variant=armored`. **No second body.** The base wins wherever the picture differs.
  - Built AFTER the base fiend is approved (a later step), not in Step 6.

## Approved tweaks log (newest first)
- 2026-11-02 · **Base frozen**: hard rule added; variants are equipment layers only.
- 2026-11-02 · **Armored variant v2**: demonic armour (spikes, barbs, skull pauldrons, molten runes) and human-foot-shaped foot-guards with the hooves still showing. `variant-armored.svg` replaced. **Base `turnaround.svg` unchanged.**
- 2026-11-02 · **Glowing eyes**: `turnaround.svg` updated (v2) with clearly glowing red-orange emissive eyes and a soft halo. Nothing else changed. Eyes are required on the base fiend and every variant.
- 2026-11-02 · **Armored variant** added as a documented variant (`variant-armored.svg`), same locked design.
