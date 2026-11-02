# STATUS (owner + Claude)

| Step | State |
|---|---|
| 1 Gothic lab polish | ✅ done, on main |
| 2 Shape maths | ✅ done, on main |
| 3 Mesher | ✅ done, on main |
| 4 Candle-lit chapel + picture sheet | ✅ approved, on main |
| 5 Parts kit | ✅ approved, on main (owner: head still looked like a dog, fixed in Step 6) |
| 6 Horned Fiend v1 | ❌ **Rejected by the owner** (doesn't match the reference: plastic balloon muscles, chest spikes, scores 0.53/0.40). ⚠️ Claude merged it to main at 05:11 ET labelled "owner approved" **without the owner's approval**. That isn't allowed; the owner decides whether to revert |
| 6b Horned Fiend 1:1 match | ▶️ **CURRENT**, see `NEXT.md`. Branch `claude/step-6b-fiend-match`. Copy the locked sheet first; front + side ≥ 0.80 |
| 7–10 | Then Phase 1 finishes (idle, glb, look-lock pick, JSR player, perf baseline) |
| Phases 2–7 | Monsters one by one → terrain/doors/levels → guns + shooting FX → everything else → arena proof → Crimson port. Full checklist: **`docs/FULL-ROADMAP.md`** |

**Look lock:** gothic candle-lit horror. The demon must be scary. Jet Set Radio style is for the player model only (Step 10).

## Creature references
One turnaround sheet per creature in `references/creatures/` (see `INDEX.md`). Horned Fiend is 🔒 locked; the 11 others are 📝 drafts for the owner to edit. A creature's base gets locked when the owner approves its sheet, and variants are gear only. **Claude uses a sheet only when that creature's step is in `NEXT.md`.**

## How it runs
1. The owner tells Claude: "go to the repo." Claude reads `CLAUDE.md` → `STATUS.md` → `NEXT.md`.
2. Claude does only the `NEXT.md` step on its step branch, pushes **that branch only**, sends the lab links listed in `NEXT.md`, and stops.
3. The owner checks the links with Grok Bot in chat and says **"approved"** (or gives notes).
4. Only after "approved" does Claude merge to `main`, in order (Step 4 first, then 5…). Grok Bot then updates `STATUS.md` and `NEXT.md` for the next step.
