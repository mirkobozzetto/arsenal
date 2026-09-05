---
name: arsenal
description: Clarify a genuinely fuzzy idea into a concise phased roadmap. Optional bounded research, no automatic agents.
argument-hint: "<idea> [-a] [-r slug] [--no-agents] [--html]"
---

# Arsenal roadmap

Keep the existing roadmap schema and resume behavior. Read the requested
roadmap if resuming; do not restart a finished phase.

Clarify the actual pain, intended user, smallest useful result, non-goals and
constraints only where missing. Ask a relevant plain-text question, not a
fixed interview quota. Stop interviewing when the direction is actionable.

Run targeted research only where external evidence changes the roadmap.
Keep useful sources, what to borrow/avoid and uncertainty; no minimum count.
Use available native search capabilities. No web access means disclose the
limitation, not fabricate citations.

Write docs/roadmap/<slug>/roadmap.md. Keep its six numbered sections from the
existing schema, but omit decorative content within them. Use as many phases
as the objective needs, no invented diagram or feature. Review in the lead.

Agents are optional: only after approval, and only genuinely independent
read-only units. Read references/agent-contracts.md and the matching adapter
only then. At most three; no fallback chain of agent launches. If a worker
fails, handle the missing part once in the lead. Do not open test sessions
to prove model routing during a roadmap task.

Render scripts/render.py only with --html or an explicit request. Mark ready
when the user approves. Do not execute the next phase automatically.

Explicit install/uninstall flags remain supported: --install-omp-agents,
--install-codex-agents, --uninstall-omp-agents, --uninstall-codex-agents. Use
scripts/install_agents.py for the selected operation only, with backups.
They never run as a side effect of creating a roadmap. A restricted harness
may require the user to authorize this separate configuration action.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
