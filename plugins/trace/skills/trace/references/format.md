# trace ledger format

## Location

`<project_root>/.claude/trace.md` - one per project. The hook also keeps
`<project_root>/.claude/.trace-state` (a JSON snapshot of the last working-tree
state) so it never logs the same change twice. Both live under `.claude/`, which
is why the hook excludes `.claude/` paths from its own detection: the ledger's
writes must not re-trigger it.

## Entry shape

One line per work block, newest at the bottom:

```
- [<context>] <iso-date> | done: <what> | files: <paths> | status: <s>
```

- `context` - `prd:<slug>` | `rfc:<NNNN>` | `<top-dir>` | `chat`. Inferred from
  the changed paths (a change under `docs/prd/<slug>/` -> `prd:<slug>`, etc.).
- `what` - mechanical entries say `edited N files`; manual entries carry the
  intent the user gave, optionally prefixed with a stable id (`1.2`, `T03`).
- `files` - comma-separated paths, truncated with `+N more` past 8.
- `status` - `wip` | `in_progress` | `shipped`. The mechanical hook always writes
  `wip` (it cannot know intent). `shipped` is a claim of verified-done and only
  comes from a manual `/trace done ... --status shipped`.

## Mechanical vs intent

The Stop hook is deterministic and cheap: it logs the working-tree delta since
its last fire, every turn that changed files, with no model call. It captures
*what files moved*, never *why*.

The upgrade path (not built): a Stop hook that returns
`hookSpecificOutput.additionalContext` asking the model to write the entry,
capturing the *why* at the cost of tokens on every work-turn. Until then, the
*why* comes from `/trace done`.

Known ceiling: re-editing the same file across turns without changing its git
status code is not re-logged (the delta is empty). And a non-git project is not
observed at all - the hook exits silently.

## Relation to ship's trace.md

`ship` writes its own `trace.md` inside a run's output dir (for a prd, that is
the prd folder): a **per-run resume ledger**, the single source of truth to
resume one ship execution. This project-level `.claude/trace.md` is a different
thing: a **cross-session activity log** spanning every context, not tied to one
artifact. They share a name and a spirit (markdown, append, honest progress) but
not a scope. Kept separate on purpose; `next` reads both - the artifact statuses
for the board, this ledger for "what moved lately".
