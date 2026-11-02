# STATUS (owner + Claude)

| Step | State |
|---|---|
| 1 Gothic lab polish | ✅ done, on main |
| 2 Shape maths | ✅ done, on main |
| 3 Mesher | ✅ done, on main |
| 4 Candle-lit chapel + picture sheet | ✅ approved, on main |
| 5 Parts kit | ✅ approved, on main (owner: head still looked like a dog, fixed in Step 6) |
| 6 Horned Fiend v1 | ▶️ **CURRENT**: redo it to match the 🔒 **owner-locked turnaround** exactly (head first). See `NEXT.md` and `references/creatures/horned_fiend/DESIGN-LOCK.md` |
| 7–10 | Then Phase 1 finishes (idle, glb, look-lock pick, JSR player, perf baseline) |
| Phases 2–7 | Monsters one by one → terrain/doors/levels → guns + shooting FX → everything else → arena proof → Crimson port. Full checklist: **`docs/FULL-ROADMAP.md`** |

**Look lock:** gothic candle-lit horror. The demon must be scary. Jet Set Radio style is for the player model only (Step 10).

## How it runs
1. The owner tells Claude: "go to the repo." Claude reads `CLAUDE.md` → `STATUS.md` → `NEXT.md`.
2. Claude does only the `NEXT.md` step on its step branch, pushes **that branch only**, sends the lab links listed in `NEXT.md`, and stops.
3. The owner checks the links with Grok Bot in chat and says **"approved"** (or gives notes).
4. Only after "approved" does Claude merge to `main`, in order (Step 4 first, then 5…). Grok Bot then updates `STATUS.md` and `NEXT.md` for the next step.
