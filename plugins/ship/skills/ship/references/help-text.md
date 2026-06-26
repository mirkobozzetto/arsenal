# ship: usage

Execute a spec. ship is the terminal executor of `prd -> rfc -> ship`: it consumes a finalized prd folder or an Accepted RFC and implements it. It can also ship a bare prompt directly, building a small inline contract first. Either way it hands back a user-run verification bundle + a trace ledger, and never runs your build/test toolchain by default.

## Invocation

```
/ship docs/prd/<slug>/            # CASE A: prd folder (prd.md status: ready)
/ship docs/rfcs/0007-foo/RFC.md   # CASE B: rfc (status: Accepted)
/ship -a docs/prd/<slug>/         # autonomous (non-safety gates auto-picked)
/ship --yolo docs/prd/<slug>/     # ship may run SAFE verification commands itself
/ship -m solo docs/prd/<slug>/    # force solo tier
/ship -r docs/prd/<slug>/         # resume from existing trace.md
```

### Direct ship (no prd/rfc)

Hand ship a bare prompt and it offers a choice:

```
/ship add a rate limiter to the POST /login route
```

1. Ship direct (default): ship runs a short interview, structures your prompt into context / task / requirements / success, builds a small inline contract, confirms it, then executes.
2. Write a PRD first: ship points you to `/prd <idea>` for a durable what/why spec.
3. Write an RFC first: ship points you to `/rfc <title>` for a design doc.

`-a` skips the questions and ships direct. The interview never becomes a full PRD; for that, use `/prd`. Note: `--yolo` is unrelated, it only lets ship run the SAFE verification commands itself.

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
- For prd: the `tasks.md` checkboxes (reconciled from trace.md once, at finish). Never mutates an Accepted RFC.md.

## Gates (minimal)

1. Ingest gate: refuse if prd `status != ready` or rfc `status != Accepted`.
2. Engine-confirm: announce tier; suggest ultracode if complex.
3. Risk-boundary: only on irreversible ops (DB/migration/deletion/dep-removal/public-API/security). DB + destructive ALWAYS ask, even with -a.
4. Verification-run: default asks before running; `--yolo` runs safe set after listing.
5. HALT: task fails self-check 3x, or an rfc BLOCKER blocks a task.
