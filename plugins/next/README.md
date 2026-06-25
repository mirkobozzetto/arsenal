# next

`/next` answers one question: **what is left to do, and what is the exact command to resume it?** A bundled SessionStart hook surfaces the same answer automatically, so a `/clear` or a new session never loses the thread.

It is the **resume lens** of the `prd → rfc → ship` pipeline. It builds nothing (that is `ship`); it reads, ranks, and routes.

---

## The problem it solves

Every new session starts blank. The work you finished, and the one thing you were about to do next, lived in the conversation, and the conversation is gone.

```
   session 1                /clear              session 2
  ┌──────────┐                │              ┌──────────┐
  │ deep in   │               │              │  blank.   │
  │ a feature │  ───────────▶ ✂ ───────────▶ │  "where   │
  │ + a plan  │                              │  was I?"  │
  └──────────┘                              └──────────┘
       what you were doing and what's next  =  lost
```

The fix is not a bigger memory. It is to stop *remembering* the answer and start *deriving* it from files that survive the reset.

---

## The idea: derive, do not remember

The state already exists, in the artifacts the pipeline writes:

- `prd` writes `docs/prd/<slug>/prd.md` with a `status` (and `tasks.md` with checkboxes).
- `rfc` writes `RFC.md` with a `status`.
- `ship` flips that `status` to `shipped` when it finishes.

So "what is left" is not a note you keep up to date. It is **computed** from those statuses, every time you ask. Nothing to maintain, nothing to drift.

---

## How it works: one brain, two consumers

A single scanner reads the artifact frontmatter and derives the board. Both the on-demand command and the automatic hook call that same scanner, so they can never disagree.

```
        WRITE SIDE  (prd / rfc / ship stamp state as they work)
        prd.md             RFC.md            ship trace.md
        status: ready      status: Accepted  done / remaining
              \                 |                 /
               \                |                /
                ▼               ▼               ▼
            ┌───────────────────────────────────────┐
            │   scan.cjs   (the one scanner)         │
            │   reads frontmatter only -> tiny, fast │
            └───────────────────┬───────────────────┘
                                │  derives: open / authoring / done
                   ┌────────────┴────────────┐
                   ▼                          ▼
              /next                     scan.cjs --banner
         (full board, on demand)   (SessionStart hook, every session)
```

---

## The lifecycle, and why `ship` closes the loop

An item is only "open" while it is genuinely unfinished. `ship` flips the status on finish, which makes the item **drop off the board automatically**.

```
   draft  ──▶  ready  ──▶  in_progress  ──▶  shipped
   (WIP)      (OPEN)        (OPEN, -r)        (DONE, hidden)
                ▲              ▲                  │
                │              │                  │
          prd finalize    ship halts        ship finishes
                                             = loop closed

   the board shows OPEN, hides DONE.
   so a finished feature disappears from /next on its own,
   no manual cleanup, no stale "ready" lingering forever.
```

This loop close is the whole point. Without it, an item you already built keeps showing up as "to do" until someone remembers to cross it off, which is exactly the failure we are removing.

---

## Surviving `/clear`: clock-out, then clock-in

```
  SESSION 1                          SESSION 2  (after /clear)
  ─────────                          ─────────────────────────
  work on agent-studio               [ context wiped ]
      │                                   │
      │ prd / ship stamp status           │ SessionStart hook fires:
      ▼ continuously, onto disk           ▼ runs scan.cjs --banner
  prd.md: status: ready   ───────────▶  injects, before your first prompt:
  (this file survives /clear)            "OPEN WORK:
                                           - Agent Studio [ready] 0/45
                                             -> /ship docs/prd/agent-studio"
                                          │
                                          ▼  you resume in one read,
                                             not fifteen minutes of re-reading
```

The durability comes from the **continuous writes** (the status is always current on disk), not from trying to catch the `/clear` itself. The hook is just the clock-in that reads it back.

---

## The SessionStart hook

`hooks/hooks.json` registers one hook:

- **Event:** `SessionStart` (fires on startup, resume, after `/clear`, and after compaction).
- **Action:** runs `scan.cjs --banner`, which prints up to three open items as plain text.
- **Effect:** that text is added to context before your first prompt. No file to read, no command to type. Silent when there is nothing open.

It prints **raw text** to stdout on purpose, so it coexists with other raw-text SessionStart hooks (a JSON `additionalContext` shape mixed with a raw-text hook on the same event can drop one of them, see anthropics/claude-code #53682).

```
  new session  ─▶  SessionStart  ─▶  scan.cjs --banner  ─▶  context primed
                                       (exit 0 + silent
                                        if nothing open)
```

> The hook is **clock-in only** (read on start). It deliberately does **not** rely on catching `/clear` with a `SessionEnd` hook, because `SessionEnd` on `/clear` is unreliable (anthropics/claude-code #6428, #33458). The guarantee lives in the continuous writes, not in a last-second capture.

---

## What you see

`/next` (or the scanner directly):

```
OPEN (ready to act):
  Agent Studio [ready] (PRD, marketplace-flowflow)  0/45 tasks
      resume: /ship docs/prd/agent-studio
  RAG Chat Reliability [ready] (PRD, flowflow)  0/20 tasks
      resume: /ship docs/prd/rag-chat-reliability

(2 in authoring; --all to show)

Next: /ship docs/prd/agent-studio
```

Ranking is `in_progress` first, then `ready` / `Accepted`, then alphabetical. The `Next:` line is a deterministic pick, not a judgment of importance: it does not know your priorities, only the lifecycle order.

---

## The state contract

The exact frontmatter fields `prd` / `rfc` / `ship` maintain (`status`, `next_action`, `resume_cmd`, `shipped_at`) and how each bucket is classified live in [`skills/next/references/state-contract.md`](./skills/next/references/state-contract.md).

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install next@arsenal
```

Installing the plugin also registers the SessionStart hook. If you load the skill by symlink instead, add the hook to your settings to get the auto clock-in:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/skills/next/scripts/scan.cjs\" --banner" } ] }
    ]
  }
}
```

## Usage

```bash
/next                          # the open board + the recommended next command
/next --all                    # also show in-authoring and done items
/next <feature>                # drill into one artifact (status, remaining tasks, the why)
node scan.cjs --json <root>    # structured output; pass extra roots to scan sibling repos
node scan.cjs <repoA> <repoB>  # one board across several repos at once
```

## Honest caveats

- **Stale items.** Anything historically marked `ready` / `Accepted` but already built shows as open until reconciled (set its `status: shipped` once). New work closes the loop on its own via `ship`.
- **Per repo by default.** The scan covers the current repo; pass extra roots to include sibling repos in one board.
- **Priority is yours.** `Next:` follows the lifecycle order, not importance. It points at *a* valid next step, not necessarily *the* most urgent one.
