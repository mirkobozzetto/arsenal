# trace

`trace` answers a question `next` could not: **what did I actually do - even when I was not running `ship`?**

It is a project-level **progress ledger** that writes itself. A Stop hook records the working-tree delta at the end of every turn that touched files, so the work lands in `.claude/trace.md` whether it happened inside `ship`, inside `rfc`, or in plain back-and-forth. You never have to remember to log it. `next` then reads the ledger and shows what moved.

It captures (that is `trace`); it does not build (that is `ship`) and it does not derive the board (that is `next`).

---

## The problem it solves

`next` derives its board from artifact frontmatter, and only `ship` stamps that frontmatter. So `next` is blind to everything that happens **outside** a `ship` run:

```
   you edit a file by hand        you run another skill        you just talk + change code
            │                              │                               │
            ▼                              ▼                               ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │   tasks.md checkboxes / prd.md status   =   UNCHANGED                       │
   └───────────────────────────────────────────────────────────────────────────┘
            │
            ▼
   /next says "0/9 tasks", board looks untouched
            │
            ▼
   you have to re-explain what you did, every time   ← the pain
```

The work was real. The record was not. The fix is not "remember harder" - it is to **capture deterministically**, at a moment that fires no matter what you were doing.

---

## The idea: a hook, not a habit

A skill you must *call* to log progress fails for the same reason a sticky note fails: you forget, exactly when you are busy. So the writer is not a skill. It is a **Stop hook** - the one event that fires at the end of *every* turn, in *every* context.

```
   "please remember to log"   ──▶   works ~60% of the time, fails when it matters
   a Stop hook                ──▶   fires every turn, no judgement, no forgetting
```

The end of a turn is the natural capture point: by then the files have moved, and the hook can see exactly what changed.

---

## How it works: one ledger, one hook, one reader

```
        EVERY TURN ENDS
              │
              ▼
        ┌─────────────────────────────────────────────┐
        │  Stop hook  ->  trace.cjs --hook             │
        │                                              │
        │  1. git status --porcelain                   │
        │  2. diff against the last snapshot           │
        │       (.claude/.trace-state)                 │
        │  3. nothing new?  ->  exit, write nothing    │
        │     something moved? -> append one entry     │
        └───────────────────────┬──────────────────────┘
                                │
                                ▼
                     .claude/trace.md   (the one ledger)
                                │
                                ▼
                     next reads it  ->  "RECENT ACTIVITY"
                       (board + SessionStart banner)
```

A pure-conversation turn changes no files, so the snapshot is identical and **nothing is written** - the ledger stays clean. The moment a file moves, one line lands.

---

## Two guards that make it safe

```
   ZERO NOISE                            NO SELF-LOOP
   ──────────                            ────────────
   no file changed this turn             the ledger lives in .claude/
        │                                     │
        ▼                                     ▼
   snapshot == last snapshot             .claude/ paths are excluded
        │                                from the change detection
        ▼                                     │
   exit 0, write nothing                      ▼
                                         writing trace.md never counts
                                         as "work" -> never re-triggers
```

Without the second guard, the hook's own write would dirty the tree, look like new work, and fire again forever. Excluding `.claude/` breaks that loop at the root.

---

## What an entry looks like

```
- [prd:oauth-login] 2026-06-26T09:14:02Z | done: edited 3 files | files: docs/prd/oauth-login/tasks.md, src/auth/token.ts, +1 more | status: wip
- [chat]            2026-06-26T10:02:55Z | done: fixed the porcelain parse off-by-one | files: plugins/trace/.../trace.cjs | status: shipped
```

- **context** - inferred from the changed paths: a change under `docs/prd/<slug>/` becomes `prd:<slug>`, under `docs/rfcs/<NNNN>/` becomes `rfc:<NNNN>`, otherwise the top-level dir or `chat`.
- **what** - the automatic hook says `edited N files` (it cannot know *why*). A manual entry carries the intent you give it.
- **status** - the hook always writes `wip`. `shipped` is a claim of *verified done* and only ever comes from a manual entry.

---

## Mechanical now, "why" on demand

The hook is deliberately **mechanical**: it logs *which files moved*, with no model call, so it is free and never wrong about facts. It cannot log *why* - that needs judgement.

```
   the hook            ──▶   WHAT moved        (free, deterministic, every turn)
   /trace done <why>   ──▶   WHY it moved      (you supply the intent)
```

When the bare file list is not enough ("note that I finished the auth refactor"), you add the intent yourself:

```bash
/trace done "finished the auth refactor" --files src/auth --id 1.2 --status shipped
/trace                                   # read the last dozen entries
```

> Upgrade path (not built): a Stop hook that asks the model to write the line, capturing the *why* automatically - at the cost of tokens on every working turn. Until then, the *why* is manual.

---

## This `trace.md` vs `ship`'s `trace.md`

Same name, different scope. Keep them straight:

```
   ship's trace.md                       this trace.md
   ───────────────                       ─────────────
   inside ONE ship run's output dir      project-level (.claude/trace.md)
   resume ledger for that run            cross-session activity log
   "where is this build up to?"          "what moved lately, anywhere?"
   tied to one artifact                  tied to no artifact
```

`next` reads **both**: artifact statuses for the board, this ledger for the "RECENT ACTIVITY" section.

---

## Feeding memory

The ledger is the raw record; memory is a consumer. A `SessionEnd` hook appends the not-yet-digested entries to `.remember/now.md`, so a session's work survives a `/clear`.

```
   trace.md  ──(SessionEnd: trace.cjs --digest)──▶  .remember/now.md
   (raw, every turn)                                (digest, once per session)
```

This is **best-effort**: `SessionEnd` can miss on `/clear` (anthropics/claude-code #6428, #33458), and there is no `.remember/` in every project. The reliable record is always `trace.md` itself; the digest is a convenience on top.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install trace@arsenal
```

Installing the plugin registers the `Stop` hook (auto-capture) and the `SessionEnd` hook (memory digest). The `/trace` command works either way.

If you load the skill by symlink instead of installing the plugin, the **hooks do not come with it** - a symlinked skill exposes the command, not the plugin's hooks. Add them to your settings to get auto-capture:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/trace/scripts/trace.cjs\" --hook" } ] }
    ],
    "SessionEnd": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/trace/scripts/trace.cjs\" --digest" } ] }
    ]
  }
}
```

---

## Usage

```bash
/trace                                   # read recent entries
/trace done "<what>" --files a,b --id N.x --status shipped   # write one intentful entry
node scripts/trace.cjs --hook            # what the Stop hook runs (logs the delta, or nothing)
node scripts/trace.cjs --read 20         # print the last 20 entries
node scripts/trace.cjs --digest          # flush new entries into .remember/ (what SessionEnd runs)
```

---

## Honest caveats

- **Git only.** Detection is `git status --porcelain`. A non-git project is not observed; the hook exits silently.
- **Delta, not intent.** The hook logs *that* files changed, not *why*. Re-editing the same file across turns with an unchanged git status is not re-logged. Use `/trace done` for the why.
- **`.claude/` is excluded.** Changes under `.claude/` are invisible to the hook on purpose (that is what stops the self-loop), so work on config there is not auto-traced.
- **Memory digest is best-effort.** `SessionEnd` is not guaranteed on `/clear`; `trace.md` is the durable record, the `.remember/` digest is a bonus.
