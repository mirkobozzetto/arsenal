---
name: ship
description: Implement a clear request or an approved brief/proposal. Work solo, make the smallest sufficient change, verify the changed behavior, and stop. Ask before any delegation.
argument-hint: "<request or spec> [-r] [--tasks ids] [--commit] [--yolo]"
---

# Ship

Own the result, not a ceremony. A clear request is sufficient authorization
for its reversible, in-scope implementation. Do not ask whether to start.
Do not turn a small fix into a brief, proposal, interview, or document bundle.

## Execution policy

- Work solo. Ask before every proposed delegation, including reviews. State
  the independent scope and expected benefit. Auto mode never grants consent.
- Use the active model and configured routing. Do not inspect or tune models
  during an unrelated task. No hidden advisor or nested delegation.
- Prefer native read/search/edit tools. In OMP controlled mode, Eval accepts
  only literal tool-bridge calls, for example:
  `display(await tool.read({path:"src/example.ts"}));`
- Read the relevant existing code, fix the cause, run the smallest meaningful
  behavioral check, and deliver. Reuse current evidence until code or inputs
  relevant to that evidence change. No routine full-file read-back.
- Keep backups and explicit approval for live data, destructive operations,
  publication, and deployment. A build target may install or deploy; inspect
  its actual effects instead of trusting its name.
- Stop on user interruption. A completed task is not reopened by a reminder.

## Choose the shortest sufficient path

**Clear request:** identify the target and success condition from the request
and existing code. Ask only for a missing decision that materially changes the
result. Implement directly; no mandatory artifact files or step-by-step gates.

**Approved spec:** read the exact artifact once. Brief requires `ready`;
proposal requires explicit `Accepted`. Honor scope, dependencies, acceptance
criteria and non-goals. A shipped marker means done, not another run.

**Long or resumed work:** load `steps/step-00-init.md` and maintain one
per-run `trace.md`. Existing contract/bundle files remain readable but are
not mandatory new outputs. Record completed units immediately. Native todo
is a projection of progress, not another authority to arbitrate against it.

## Commands and verification

One owner runs commands on a shared workspace/toolchain. Do not start a
second compiler while the first exists. A timeout is not process termination.
Use the existing job handle or `arsenal_status` before any retry.

- Prose/prompts/simple configuration: successful edits suffice unless a check
  was requested. Do not start model sessions, validators, or builds for them.
- Code: reproduce the relevant behavior and verify the fix. Use an existing
  targeted check or disposable smoke scenario. Ask before permanent new tests.
- Data migration: keep the backup and real-copy verification; do not replace
  them with a read-only reviewer saying PASS.
- In controlled OMP, mark a meaningful command with bash `verification:true`.
  The controller records exit status, not semantic correctness. A trivial
  successful command cannot prove a feature. Call `arsenal_finish` once done.
- Sandbox shell networking and out-of-root writes are refused. Report an
  unavailable capability; do not escape the controller through another tool.

## Optional branches

Load only when needed:
- `steps/step-01-ingest.md`: artifact formats and task filtering.
- `steps/step-02-plan.md`: complex dependencies and optional green commits.
- `steps/step-03-engine.md`: user-approved delegation.
- `references/guardrails.md`: hazardous operations.
- `steps/step-06-finish.md`: durable status and requested Git delivery.

Flags: `-a/--auto` suppresses redundant questions, not safety/agent consent;
`-e/--economy` and `-m solo` retain solo; another `-m` requests a mode,
not a permission bypass. `--tasks` scopes to named spec tasks and completed
dependencies. `-r` resumes. `--commit` requests progressive green commits;
`--no-commit` keeps them off. `--yolo` requests relevant safe checks, never
live-data edits, deployment or a full suite unrelated to the change.

Final response: result, exact proof, material limitation. No automatic PR
offer after the user deferred it, no required HTML, no next-work expansion.
