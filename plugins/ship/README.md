# ship

The **build** stage of the `prd → rfc → ship` pipeline. `ship` executes a predetermined spec: it does not re-write one. Give it a finalized PRD or an Accepted RFC and it implements the spec, then hands you a verification bundle to run and a trace ledger you can resume from.

**Compatibility:** native install on Claude Code v2.1+. The skill is plain markdown: any agent that can read markdown skills and spawn subagents can use it from `plugins/ship/skills/ship/`.

---

## What it does

`ship` takes one of three inputs, auto-detected:

| Input | Run-gate | Notes |
|-------|----------|-------|
| A `prd` folder `docs/prd/<slug>/` | `prd.md` is `status: ready` | Parses `tasks.md` + the PRD's acceptance criteria. |
| An `RFC.md` | frontmatter `status: Accepted` | Builds the DAG from the impl-plan task table; never mutates the RFC. |
| A bare prompt | your confirmation | Derives a **minimal inline contract** (task list + acceptance items), then builds. |

It then:

1. **Locks a contract** (`contract.md`): the definition of done, one row per acceptance criterion.
2. **Picks an engine**: `teams` (coordinated agents, needs `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` + ≥2 disjoint-file groups) → `subagents` (parallel, no coordination) → `solo`. Fan-out is always bounded by the spec's dependency graph.
3. **Implements** within the contract's edit scope, checkpointing only at risky boundaries (DB/migration, deletion, dependency removal, public-API break, security change; these always ask, even with `-a`).
4. **Verifies** read-only and writes a `verification-bundle.md` of the exact commands **you** run, plus a `trace.md` ledger.

It **never runs your tests/builds/typechecks by default**: that stays yours. It is toolchain-agnostic: it detects pnpm/bun/yarn/npm, cargo, go, uv, ... from your lockfile and writes the bundle accordingly.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install ship@arsenal
```

## Usage

```bash
/ship docs/prd/oauth-login/          # execute a finalized PRD
/ship docs/rfcs/0007-auth/RFC.md     # execute an Accepted RFC
/ship add a rate limiter to the API  # bare prompt -> inline contract -> build
/ship -h                             # full help
```

### Flags

| Flag | Meaning |
|------|---------|
| `-a` / `--auto` | Skip non-safety confirmations. DB / destructive / security ops still ask. |
| `-e` / `--economy` | Force solo tier, no fan-out. |
| `-r` / `--resume` | Continue from an existing `trace.md`. |
| `--yolo` | After **listing** the commands, run the SAFE verification set itself. Destructive/DB/deploy stay yours, always. |
| `-m teams\|subagents\|solo` | Force the engine tier. |

### ultracode

`ship` cannot read or set the effort level beyond detecting it via `$CLAUDE_EFFORT`. If a spec looks complex and you haven't enabled it, `ship` *suggests* `/effort xhigh|ultracode` (you toggle it).

## Dependencies

- Exa MCP for any web lookup (no native WebSearch/WebFetch).
- `git` write-guard friendly: `ship` never commits/pushes; it hands off and you ship the commit.
- Removal uses `trash`, never destructive deletes; never modifies a database without an explicit prompt.

## What it writes

`contract.md` · `verification-bundle.md` · `trace.md` (single source of truth for resume). During the build, `trace.md` is the only live ledger; for a PRD the `tasks.md` checkboxes are reconciled from it **once, at finish** (every `done` row flips `[ ] -> [x]`, byte-preserving, no per-unit confirm), so the count stays honest even under `-a`. It never mutates an Accepted `RFC.md`.
