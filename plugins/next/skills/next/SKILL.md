---
name: next
description: Start a session from what was left - trace saves, briefs, proposals, review reports, issues - and ask what to continue. Never resume or implement automatically.
argument-hint: "[--all] [feature]"
---

# Next

Run scripts/scan.cjs from the intended repository, not the launch directory
by assumption. --json is for tooling; --all includes completed work. In
Claude Code pass --claude-code, so commands come out callable
(`/ship:ship`). The scanner recognizes shipped markers as terminal.

## Resume a session

Next is the start of a session; `trace` ends one. When the scan opens with
a `Next:` line from the newest trace save, offer it first: ask only « On
reprend : <its next> ? » in the conversation language and wait. On yes,
run `scripts/scan.cjs --resume <its date>` and hand that next action to
Arsenal. On no, or without such a line, show the numbered list of open
saves, review reports and issues (for each save, what was done and what is
left), ask only « On continue quoi ? » and wait. In Claude Code and Codex
the SessionStart hook prints the same with this instruction after
`/clear`; elsewhere the user runs next.

When the user picks a session save, run `scripts/scan.cjs --resume
<its date>` so it is not offered again, then hand its `next` line to
Arsenal, which picks the skill and keeps its approval gates. A picked spec,
review or issue goes to Arsenal the same way. Next never starts the work.

## Board

Report the most useful open action. Do not re-read every artifact body after
a sufficient scan. Read a specific artifact only for a requested detail.
Distinguish implemented work waiting for user acceptance from work to redo.
An old todo or reminder is not evidence that a completed fix needs another
diagnosis. Never execute the recommended action without a user request.

## Arsenal handoff

Return the open-work result to Arsenal when it called this skill. A request
to resume work authorizes Arsenal to inspect the selected artifact and choose
the next step; a status-only request stops here. Never reopen shipped work.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
