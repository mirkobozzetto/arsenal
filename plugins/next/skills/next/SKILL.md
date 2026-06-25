---
name: next
description: Report unfinished prd/rfc/ship work in this repo and the exact command to resume each, ranked by what to do now. Use when the user asks "what's next", "what's left", "where do I resume", "/next", "la suite", or to re-orient after a context reset. Reads artifact frontmatter as the source of truth; never implements.
argument-hint: "[--all] [feature]"
allowed-tools:
  - Bash
  - Read
  - Glob
---

<objective>
Answer "what is left to do and how do I resume it" by scanning this repo's prd/rfc artifacts, classifying open vs done from their frontmatter, and emitting the single best next command. Read-only. This skill routes; it never builds (that is ship).
</objective>

<how_it_works>
The state lives in the artifacts themselves, not a separate ledger:
- prd: `docs/prd/<slug>/prd.md` frontmatter `status` (draft -> ready -> shipped) + `tasks.md` checkboxes for progress.
- rfc: `docs/rfcs/.../RFC.md` frontmatter `status` (Draft -> Review -> Accepted -> shipped).
- OPEN = prd `ready`/`in_progress` or rfc `Accepted`. DONE = `shipped`/`superseded`/`Rejected` (hidden). WIP = still authoring (`draft`/`Review`).
- `resume_cmd` in frontmatter wins; otherwise it is derived from the path (`/ship <folder-or-RFC.md>`).

Because the board is DERIVED on read, it self-prunes the instant `ship` flips a status. No file to keep in sync. See `references/state-contract.md` for the exact frontmatter fields prd/rfc/ship maintain.
</how_it_works>

<steps>
1. Run the scanner from the repo root. Locate `scripts/scan.cjs` under THIS skill's base directory (shown when the skill loads); when installed as a plugin it is `${CLAUDE_PLUGIN_ROOT}/skills/next/scripts/scan.cjs`:
   `node <this-skill-dir>/scripts/scan.cjs [--all] [<extra-repo-roots>]`
   - default: the OPEN board + the recommended `Next:` command.
   - `--all`: also show in-authoring and done items.
   - `--json`: structured output (for tooling).
   - pass extra repo paths to scan sibling repos in one shot.
2. Render the result as-is. Keep it short. Do NOT re-read every artifact body; the frontmatter scan is enough.
3. If a feature argument is given, open that artifact (prd.md + tasks.md, or RFC.md) and report: status, done-vs-remaining tasks, the next unchecked task, and the why from the spec.
4. Recommend ONE next action: the top-ranked open item's resume command. Hand off; do not run it.
</steps>

<notes>
- Stale "Accepted"/"ready" items that are actually already built mean the loop was not closed historically (ship now flips status on finish). Offer a one-time reconcile: set `status: shipped` on the already-done artifacts so the board reflects reality.
- The same scanner backs the SessionStart hook (`--banner`), so the auto clock-in and `/next` never diverge.
</notes>
