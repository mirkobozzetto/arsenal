# ship: usage

Execute a spec. ship is the terminal executor of `brief -> propose -> ship`: it consumes a finalized brief folder or an Accepted proposal and implements it. It can also ship a bare prompt directly, building a small inline contract first. Either way it hands back a user-run verification bundle + a trace ledger, and never runs your build/test toolchain by default.

## Invocation

```
/ship docs/brief/<slug>/            # CASE A: brief folder (brief.md status: ready)
/ship docs/proposals/0007-foo/PROPOSAL.md   # CASE B: propose (status: Accepted)
/ship -a docs/brief/<slug>/         # autonomous (non-safety gates auto-picked)
/ship --yolo docs/brief/<slug>/     # ship may run SAFE verification commands itself
/ship -m solo docs/brief/<slug>/    # force solo tier
/ship -r docs/brief/<slug>/         # resume from existing trace.md
```

### Direct ship (no brief/propose)

Hand ship a bare prompt and it offers a choice:

```
/ship add a rate limiter to the POST /login route
```

1. Ship direct (default): ship runs a short interview, structures your prompt into context / task / requirements / success, builds a small inline contract, confirms it, then executes.
2. Write a brief first: ship points you to `/brief <idea>` for a durable what/why spec.
3. Write an proposal first: ship points you to `/propose <title>` for a design doc.

`-a` skips the questions and ships direct. The interview never becomes a full brief; for that, use `/brief`. Note: `--yolo` is unrelated, it only lets ship run the SAFE verification commands itself.

## Flags

| Flag | Meaning |
|------|---------|
| `-h` / `--help` | This guide |
| `-a` / `--auto` | Skip non-safety confirmations. DB / destructive / security ops STILL ask. |
| `-e` / `--economy` | Force solo tier, no fan-out |
| `-r` / `--resume` | Continue from trace.md stepsCompleted |
| `--yolo` | After listing commands + how, run the SAFE verification set to completion. Destructive/DB/deploy stay user-only always. |
| `-m teams\|subagents\|solo` | Force the engine tier (override the probe) |
| `--no-commit` | Turn off progressive commits (default: one commit per finished task) |
| `--tasks <ids>` | Run only these spec tasks (`T01-T06`, `1.0-3.0`, commas allowed) |

## Partial runs

One spec sometimes needs more than one run: the plan spans two repos, or you
deliberately slice it. `--tasks` scopes a run, and each scoped run keeps its
own `contract-<tag>.md` / `trace-<tag>.md` / `verification-bundle-<tag>.md`
in the spec folder, so runs never overwrite each other and `-r` resumes the
right one. A task whose dependency belongs to another run is refused until
that run has shipped it.

## Engine tiers (auto-selected, bounded by the spec's dependency DAG)

1. `teams`: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` AND >=2 disjoint-file groups.
2. `subagents`: independent groups exist but no teams flag.
3. `solo`: single dependency chain / economy / the always-available floor.

ultracode is NOT a tier. ship cannot read or set the effort level. If the spec looks complex and you have not enabled it, ship SUGGESTS `/effort ultracode|xhigh` at the engine-confirm gate. You toggle it.

## What ship writes (never feature code beyond the spec)

- `contract.md`: locked definition of done.
- `verification-bundle.md`: the commands YOU run, stack-detected.
- `trace.md`: per-task ledger, single source of truth for resume.
- For brief: the `tasks.md` checkboxes (reconciled from trace.md once, at finish). Never mutates an Accepted PROPOSAL.md.

## Git flow (progressive commits + PR gate)

- At plan time ship asks ONCE where commits land: a new `ship/<slug>` branch
  (recommended) or the current branch. That answer authorizes the run's
  commits (a scoped grant keeps the git guard quiet for `git commit` only).
- Each finished task is committed on its own (explicit paths, Conventional
  Commits, no signature); the short sha lands in trace.md.
- ship NEVER pushes mid-run. At finish, if verification is green, it writes
  a plain-words validation user story (what to test, how). Once you validate
  it, ship creates the PR directly (`gh pr create`, base `dev` if it exists,
  else `main`; Graphite -> `gt submit`).
- `--no-commit` restores the old hands-off behavior.

## Gates (minimal)

1. Ingest gate: refuse if brief `status != ready` or propose `status != Accepted`.
2. Engine-confirm: announce tier; suggest ultracode if complex.
3. Risk-boundary: only on irreversible ops (DB/migration/deletion/dep-removal/public-API/security). DB + destructive ALWAYS ask, even with -a.
4. Verification-run: default asks before running; `--yolo` runs safe set after listing.
5. HALT: task fails self-check 3x, an propose BLOCKER blocks a task, an open
   spec question blocks a task, or the edit scope spans two git repos
   (one ship run per repo).

Resume keeps its git context: `work_branch` and `commit_mode` live in
trace.md, so `-r` returns to the same branch and re-arms the commit grant
instead of prompting on every commit.

One feature, one run: a brief whose HOW moved into a proposal is marked
`superseded`, so `/next` shows one target and ship refuses to build both.
