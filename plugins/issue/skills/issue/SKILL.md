---
name: issue
description: Create, update or resume a GitHub issue as durable resolution memory when requested.
argument-hint: "[create|update|resume|list] [#N | problem]"
---

# Issue memory

Use the authenticated gh CLI. Read the specific issue and comments before
updating it; do not query unrelated issues. Capture the problem, evidence,
attempts, remaining action and verification so the issue can be resumed cold.
Use references/issue-template.md when creating one.

Confirm before creating or closing an issue. Append requested progress as
comments instead of overwriting the body. Preserve the existing claude-memory
label and Pickup Directive contract. No code changes, commits or agents.

Resume reconstructs the current state from the issue, not stale memory. A
solved issue does not trigger another diagnosis. List returns concise open
items and stops. If the controlled shell has no external networking, report
that authorization/capability boundary instead of claiming the GitHub action
happened or attempting an execution escape.

## Arsenal handoff

Return issue context and remaining actions to Arsenal when it called this
skill. A request to fix the issue can continue through Arsenal's implementation
route; reading or resuming context alone does not authorize code changes.
Issue creation and closure retain their confirmation gates.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
