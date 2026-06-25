# next

The **resume** lens of the `prd → rfc → ship` pipeline. `/next` answers "what is left to do and how do I pick it up", and a bundled SessionStart hook surfaces the same board automatically so context survives `/clear` and new sessions.

**Compatibility:** native install on Claude Code v2.1+. The skill is plain markdown + one zero-dependency Node script: any agent that can read markdown skills and run `node` can use it from `plugins/next/skills/next/`.

---

## What it does

`/next` scans the repo's spec artifacts and derives an open-work board from their frontmatter (the artifact is the source of truth, so there is no separate ledger to drift):

| Artifact | Open when | Resume with |
|----------|-----------|-------------|
| `docs/prd/<slug>/prd.md` | `status: ready` or `in_progress` | `/ship docs/prd/<slug>` |
| `docs/rfcs/.../RFC.md` | `status: Accepted` | `/ship <path>/RFC.md` |

It ranks the open items (in-progress first, then ready/Accepted), shows `tasks.md` progress per PRD, and recommends the single best next command. It is read-only: it routes to `ship`, it never builds.

Because the board is derived on read, it self-prunes the instant `ship` flips a status to `shipped`. That loop-close is what keeps a finished item from lingering as a stale "ready".

## How the pieces fit

- **Write side** (`prd`, `rfc`, `ship`): stamp `status` + `next_action` + `resume_cmd`; `ship` flips the status to `shipped` on finish and stamps `in_progress` on a halt. See `skills/next/references/state-contract.md`.
- **Read side** (this plugin): one scanner (`skills/next/scripts/scan.cjs`) backs both `/next` (full board) and the SessionStart hook (`--banner`), so the on-demand query and the auto clock-in can never diverge.

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install next@arsenal
```

Installing the plugin also registers the SessionStart hook (`hooks/hooks.json`). If you load the skill by symlink instead of installing the plugin, add the hook to your settings to get the auto clock-in:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/next/scripts/scan.cjs\" --banner" } ] }
    ]
  }
}
```

The hook prints plain text to stdout (added to context), so it coexists with other raw-text SessionStart hooks.

## Usage

```bash
/next                         # the open board + the recommended next command
/next --all                   # also show in-authoring and done items
/next <feature>               # drill into one artifact (status, remaining tasks, why)
node scan.cjs --json <root>   # structured output; pass extra roots to scan sibling repos
```

## Notes

- Items historically marked `Accepted`/`ready` but already built will show as open until reconciled: set `status: shipped` on them once. New work closes the loop automatically via `ship`.
- The pre-clear capture relies on continuous writes (each `prd`/`rfc`/`ship` step stamps state) plus the SessionStart re-inject, not on catching `/clear` with a hook (`SessionEnd` on `/clear` is unreliable per anthropics/claude-code #6428, #33458).
