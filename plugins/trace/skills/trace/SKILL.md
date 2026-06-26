---
name: trace
description: Read or hand-write the project progress ledger (.claude/trace.md). Use when the user says "/trace", "what did I do", "log this", "trace done", or wants to record or review what moved this session. The automatic Stop hook already logs file changes; this skill is the reader and the manual writer for the intent the hook cannot infer.
disable-model-invocation: true
argument-hint: "[done <what> --files a,b --id N.x --status shipped] | (empty to read)"
allowed-tools: Bash
---

# trace

One ledger: `<project_root>/.claude/trace.md`. The Stop hook writes mechanical
entries automatically (which files changed, each turn that touched files). This
skill is the **reader** and the **manual writer** for the *why* the hook cannot
infer. It never invents a second format - it shells out to the same script.

## Routing

Let `S` = `${CLAUDE_PLUGIN_ROOT}/skills/trace/scripts/trace.cjs`. Run from the
project root (so the ledger and git detection resolve to this repo).

- **`/trace`** (no args) -> read recent entries:
  ```bash
  node "$S" --read 12
  ```
  Print the output as-is. Do not summarize unless asked.

- **`/trace done <what> [flags]`** -> write one clean entry:
  ```bash
  node "$S" done "<what>" [--files a,b] [--id N.x] [--status shipped|in_progress|wip] [--context prd:<slug>]
  ```
  Map the user's words to `<what>`. Pass `--files` when they name files,
  `--id` for a prd Unit (`N.x`) or rfc task (`T0n`), `--status shipped` when the
  work is truly done and verified (default `wip`). Context is inferred from the
  files when omitted.

- **Anything else after `/trace`** -> treat the free text as the `<what>` of a
  `done` entry, status `wip`, unless the user clearly meant to read.

## Notes

- The hook covers automatic capture; only reach for `done` when the user wants
  to record intent ("note that I finished the auth refactor") that bare file
  paths do not convey.
- `--status shipped` is a claim of verified-done, not attempted. Use the user's
  evidence, do not upgrade a `wip` to `shipped` on your own.
- For the entry format and how this relates to ship's per-run `trace.md`, see
  [references/format.md](references/format.md).
