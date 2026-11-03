# slim

Every Claude Code session pays for its `CLAUDE.md`, its rules and their
imports before its first word. They only grow: each correction becomes a
rule, often with the date and the words that caused it. `/slim` makes them
lighter and keeps every rule, and a script proves it.

---

## Use

```text
/slim
/slim ~/.claude/rules/pane.md
```

From any folder, `/slim` weighs what loads there at launch: the user
`CLAUDE.md` and its imports, the user and project rules without `paths:`,
the project `CLAUDE.md`, and the project's `MEMORY.md`. Then it sorts every
block:

| Block | Goes to |
|---|---|
| A rule every session needs | stays loaded, kept short |
| A procedure, a block for one kind of task | a skill, loaded when needed |
| A block for some files only | a rule with `paths:` |
| A dated citation, the story of why | `evidence/<file>.md`, outside `rules/`, never loaded |

It shows every change and each rewritten sentence beside its original, and
writes nothing before your go. Then `check.cjs` proves that every sentence,
parenthesis, list item, table cell and code line of the originals is still
written somewhere, or was a rewrite you validated. A file that lost one is
put back as it was. Each changed file gets its own commit; a file outside
Git gets a `.slim.bak` copy first, and a file with changes not committed is
refused. `/slim` ends with the gain, before and after.

`MEMORY.md` and generated blocks (GitNexus) are weighed, never edited.
Sizes are estimates (0.4 token per character); `/context` gives the exact
count in a fresh session.

---

## Install

```bash
/plugin install slim@arsenal
```

Needs `node` and `git`. Claude Code only.

## Tests

```bash
node --test plugins/slim/tests/*.test.cjs
```

Each test builds its own config, project and Git repository in a temporary
folder; no real file is read or written.
