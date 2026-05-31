# rfc

The **how** stage of the `prd → rfc → ship` pipeline. `rfc` forces reasoning before action: it walks a decision through problem → alternatives → tradeoffs → design → risks → recommendation → impl plan, and never converges on a plan before the alternatives are written down.

"Request for Comments" is a 50-year-old engineering discipline — see the [history of the RFC](../../README.md#rfc--request-for-comments-1969) in the root README. This plugin is that discipline as a 10-step workflow.

---

## When to use it

Use `rfc` when a decision **crosses a boundary**: architecture, a migration, a system-wide refactor, a new pattern, or several valid designs where the wrong one is expensive to undo. For a trivial change or a single-file fix, skip it — `ship` or a direct edit is enough.

## What it produces

A single `RFC.md` with 11 sections (summary, context, problem & motivation, goals/non-goals, alternatives considered, proposed design, drawbacks & risks, open questions, recommendation, implementation plan, review findings). The implementation plan is a task table with dependencies — exactly what `ship` consumes.

The final step sets a **status**: `Draft` / `Review` / `Accepted` / `Rejected`. `Accepted` is the gate: `ship` will only execute an RFC once it is `Accepted`.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install rfc@arsenal
```

## Usage

```bash
/rfc OAuth login                       # full 10-step workflow
/rfc --auto OAuth login                # skip the between-step confirmations
/rfc --no-review OAuth login           # skip the adversarial review step
/rfc --scope src/auth OAuth login      # limit codebase context to a path
```

### Flags

| Flag | Meaning |
|------|---------|
| `--auto` | Skip the AskUserQuestion confirmations between steps. |
| `--scope <path>` | Limit codebase context gathering to a path. |
| `--no-review` | Skip the step-08 adversarial review. |
| `--out <dir>` | Output directory (default `docs/rfcs/` in a git repo). |

## Hand-off

Once `Accepted`, run `ship <path>/RFC.md` to execute the impl plan. `ship` builds the dependency graph straight from the RFC's task table and refuses to run anything that isn't `Accepted`.

## Dependencies

- **[GitNexus](https://github.com/) — optional.** When present, `rfc` uses it for codebase context (symbols, impact, execution flows). When absent, it degrades to grep/Read.
- Exa MCP for prior-art / industry-pattern research. No native WebSearch/WebFetch.
- An adversarial-review subagent for the optional review step.
