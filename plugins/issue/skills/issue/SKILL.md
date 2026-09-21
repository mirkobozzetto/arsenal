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
comments instead of overwriting the body. Label new issues `arsenal`; keep
`claude-memory` on the ones that already carry it and match either when
listing or resuming. Preserve the Pickup Directive contract. No code changes, commits or agents.

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

## Verify external facts

Before stating an external fact (a version, an API, a price, a date, a
regulation, the behaviour of a tool or library, a person or company), search
first when the runtime offers web search: read the `websearch` skill and run
one quick search, then cite the source. One search per fact; `--deep` only on
request. Without web search, mark the claim unverified. Facts visible in the
repository or the request need no search.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
