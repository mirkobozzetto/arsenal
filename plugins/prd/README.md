# prd

The **what / why** stage of the `prd → rfc → ship` pipeline. `prd` interviews you about a feature, then writes a product PRD and a derived task list, and stops before code. It is a product spec, not a technical design (that's `rfc`) and not open research (that's a brainstorm).

A PRD describes *what* a release does, *who* it's for, and *why*. It is deliberately silent on *how*. See the [history of the PRD](../../README.md#prd--product-requirements-document) in the root README.

---

## What it does

A short interview (jobs-to-be-done, target user, problem, constraints, the three dimensions: data source / business rule / exception), then it emits **one folder per feature**:

```
docs/prd/<slug>/
  prd.md      # problem, goals, user stories, scope, out-of-scope, success metrics, acceptance criteria
  tasks.md    # a single nested checklist: 1.0 parent -> 1.1, 1.2 sub-tasks (phases = parent tasks)
```

A big feature adds **more parent tasks**, never more files. The task list traces every task back to a PRD criterion. At the end, `prd.md` is marked `status: ready` and it hands off: to `rfc` (design the how) or straight to `ship` (build it).

> Convention follows Ryan Carson's [ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks) pattern: two files per feature, tasks as one nested checklist.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install prd@arsenal
```

## Usage

```bash
/prd add OAuth login            # full interview, then writes the PRD + tasks
/prd -s add OAuth login         # skip the interview (use only when the idea is already detailed)
/prd -a add OAuth login         # auto mode: take recommended options
```

### Flags

| Flag | Meaning |
|------|---------|
| `-a` / `--auto` | Skip confirmations, use recommended options. |
| `-s` | Skip the interview and draft directly from the given idea (lower quality). |

## Hand-off

When the PRD is `ready`, `prd` asks what's next and explains the benefit of each path:

- **`rfc`**: design the *how* first (alternatives, tradeoffs, risks). Choose this when the technical solution isn't obvious or the decision crosses a boundary.
- **`ship`**: build directly from `tasks.md`. Choose this when the feature is clear and there's no architecture debate.

## Dependencies

- Exa MCP for any web lookup. No native WebSearch/WebFetch.
- Honors the git write-guard: it won't commit the PRD unless you ask.
