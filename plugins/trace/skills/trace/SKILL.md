---
name: trace
description: Read or explicitly record project progress using the existing deterministic trace script.
argument-hint: "[done <what> --files a,b --id id --status shipped] [--read n]"
---

# Trace

Use scripts/trace.cjs for reading or requested entries in .claude/trace.md.
No new format or LLM reviewer. The mechanical hook records file activity,
not successful delivery; never upgrade wip to shipped without evidence.

Keep this cross-session activity log distinct from a ship run's task intent.
Do not copy every event between them. The runtime owns process/evidence state.
Only record a manual intent entry when asked. Read recent entries and stop;
do not reopen the work they describe.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
