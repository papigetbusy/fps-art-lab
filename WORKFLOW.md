# Workflow (owner-locked, 2026-11-02)

## Rule 1: Nothing goes live until the owner signs off
- Claude **never pushes or merges feature/lab code to `main`** on its own. `main` deploys the live lab (GitHub Pages), so `main` = owner-approved only.
- Claude works each step on its own branch: `claude/step-<n>-<short-name>` (e.g. `claude/step-4-picture-sheet`), pushes **that branch only**, and sends the owner the **branch test link** (below).
- The owner tests the link and replies **"approved"** (or gives notes). Only after "approved" does Claude merge that branch into `main` (fast-forward or PR merge) so the live lab updates.
- Docs/brief updates from Grok Bot also go on a branch until the owner signs off.

## Rule 2: Grok Bot is the brain, Claude is the hands
- The owner tells **Grok Bot** what he wants. Grok Bot turns it into briefs **inside this repo** (`CLAUDE.md`, `docs/claude-steps.md`, `docs/art-direction.md`, `references/`). Grok Bot does **not** write game/lab code.
- **Claude writes all code.** It reads the repo brief, does exactly the named step, then stops.
- Grok Bot tracks progress, supplies references/art, writes the next paste line, and holds at the owner's review gates.

## Test links: every step is seen inside the creature lab
Pages only serves `main`, so branch work is previewed through raw.githack (serves the branch files with the right types, no build needed):

`https://raw.githack.com/papigetbusy/fps-art-lab/<branch>/lab/index.html?<params>`

Example: `https://raw.githack.com/papigetbusy/fps-art-lab/claude/step-6-horned-fiend/lab/index.html?view=front`

- Every Phase 1 step must end with at least one **lab test link** like that (the `lab/` page with the step's `?` params). Preview pages (`previews/...`) are extra, never a replacement.
- Claude opens its own link headless first and confirms it renders before sending it. If githack caches an old version, add `&v=<commit-sha>`.
- After sign-off and merge, the same params work on the live lab: `https://papigetbusy.github.io/fps-art-lab/lab/?<params>`.

## The loop per step
1. Owner → Grok: "next step" or notes.
2. Grok updates the brief in the repo and gives the owner a paste line.
3. Owner pastes it to Claude. Claude builds on `claude/step-<n>-...`, tests green, pushes the branch, sends the lab test link + 2 plain sentences.
4. Owner checks (level per step: none / lab glance / careful review) → "approved" or notes.
5. On "approved": Claude merges to `main`, marks the step ✅ in `docs/claude-steps.md`, adds the changelog line.
