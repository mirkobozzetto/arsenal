---
name: next
description: Report unfinished work and the exact next action from existing artifact states. Never resume or implement automatically.
argument-hint: "[--all] [feature]"
---

# Next

Run scripts/scan.cjs from the intended repository, not the launch directory
by assumption. --json is for tooling; --all includes completed work. The
scanner recognizes shipped markers as terminal.

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
