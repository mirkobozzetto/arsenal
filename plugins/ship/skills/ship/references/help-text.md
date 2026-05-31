# ship: usage

Execute a predetermined spec. ship is the terminal executor of `prd -> rfc -> ship`. It consumes a finalized prd folder or an Accepted RFC, implements it, and hands back a user-run verification bundle + a trace ledger. It never re-authors the spec and never runs build/test toolchain by default.

## Invocation

```
/ship docs/prd/<slug>/            # CASE A: prd folder (prd.md status: ready)
/ship docs/rfcs/0007-foo/RFC.md   # CASE B: rfc (status: Accepted)
/ship -a docs/prd/<slug>/         # autonomous (non-safety gates auto-picked)
/ship --yolo docs/prd/<slug>/     # ship may run SAFE verification commands itself
/ship -m solo docs/prd/<slug>/    # force solo tier
/ship -r docs/prd/<slug>/         # resume from existing trace.md
```

A bare prompt (no spec artifact) -> ship derives a MINIMAL inline spec (task list + acceptance items), confirms it, then executes. For a full durable product spec, run `/prd` first.

## Flags

| Flag | Meaning |
|------|---------|
| `-h` / `--help` | This guide |
| `-a` / `--auto` | Skip non-safety confirmations. DB / destructive / security ops STILL ask. |
| `-e` / `--economy` | Force solo tier, no fan-out |
| `-r` / `--resume` | Continue from trace.md stepsCompleted |
| `--yolo` | After listing commands + how, run the SAFE verification set to completion. Destructive/DB/deploy stay user-only always. |
| `-m teams\|subagents\|solo` | Force the engine tier (override the probe) |

## Engine tiers (auto-selected, bounded by the spec's dependency DAG)

1. `teams`: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` AND >=2 disjoint-file groups.
2. `subagents`: independent groups exist but no teams flag.
3. `solo`: single dependency chain / economy / the always-available floor.

ultracode is NOT a tier. ship cannot read or set the effort level. If the spec looks complex and you have not enabled it, ship SUGGESTS `/effort ultracode|xhigh` at the engine-confirm gate. You toggle it.

## What ship writes (never feature code beyond the spec)

- `contract.md`: locked definition of done.
- `verification-bundle.md`: the commands YOU run, stack-detected.
- `trace.md`: per-task ledger, single source of truth for resume.
- For prd: the `tasks.md` checkboxes (mutated on confirm). Never mutates an Accepted RFC.md.

## Gates (minimal)

1. Ingest gate: refuse if prd `status != ready` or rfc `status != Accepted`.
2. Engine-confirm: announce tier; suggest ultracode if complex.
3. Risk-boundary: only on irreversible ops (DB/migration/deletion/dep-removal/public-API/security). DB + destructive ALWAYS ask, even with -a.
4. Verification-run: default asks before running; `--yolo` runs safe set after listing.
5. HALT: task fails self-check 3x, or an rfc BLOCKER blocks a task.
