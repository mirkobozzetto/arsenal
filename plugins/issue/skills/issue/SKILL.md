---
name: issue
description: Create, update or resume a GitHub or Linear issue as durable resolution memory when requested.
argument-hint: "[create|update|resume|list|from-tasks|close] [#N | ID | problem | brief folder]"
---

# Issue memory

Read the specific issue and comments before updating it; outside the
duplicate check, do not query unrelated issues. Capture the problem,
evidence, attempts, remaining action and verification so the issue can be
resumed cold. Use references/issue-template.md when creating one.

## Tracker

Read the project's CLAUDE.md first (AGENTS.md in harnesses that read that
instead). A line naming Linear, such as `Issue tracker: Linear, team <name>`,
selects Linear. Otherwise use GitHub through the authenticated gh CLI,
unchanged. Label, priority, project, parent and template follow that file
when it names them; never guess one.

Linear goes through the Linear MCP server already connected, whatever its
tool prefix: `list_issues`, `get_issue`, `save_issue`, `list_comments`,
`save_comment`. Without those tools, stop: create nothing on GitHub instead,
and give the setup. In Claude Code:
`claude mcp add --transport http linear-server https://mcp.linear.app/mcp`,
then `/mcp` to sign in; elsewhere, the client's Linear connector or MCP
setup with that URL.

## Commands

Before `create` and `from-tasks`, search the open issues with the topic's
key words: `gh issue list --search "<words>" --state open`, or on Linear
`list_issues` with `query` and the team, ignoring completed and canceled
ones. Show a close match first, with the offer to add to it (`update`)
instead of creating a new one. Nothing is created without confirmation.

Confirm before creating or closing an issue. Preserve the Pickup Directive
contract. No code changes, commits or agents.

On GitHub, append requested progress as comments instead of overwriting the
body. Label new issues `arsenal`; keep `claude-memory` on the ones that
already carry it and match either when listing or resuming.

On Linear, `create` is `save_issue` with `title`, `team`, the template as
`description` and the fields the CLAUDE.md names. `update` keeps one
progress comment per issue: find it with `list_comments` (it starts with
`## Progress`), rewrite it with `save_comment` and its `id`, and create it
only when none exists. `resume` reads `get_issue` and `list_comments`.
`list` returns the team's open issues, narrowed by the label or project the
CLAUDE.md names.

`from-tasks <brief folder>` creates one issue per top-level `##` task of
`tasks.md`, after a single confirmation for the whole batch. Each body uses
the template: Problem from the task and the acceptance criteria it cites,
Pickup Directive with the brief path, `base` and `branch` from the brief
frontmatter, the task identifier and its check command. It then writes
`[#N](url)` (`[ID](url)` on Linear) into each task heading and the range or
the identifiers into the brief `issues` field. Existing links are kept,
never duplicated.

`close #N` appends a `Resolution:` comment from the evidence given (trace
row, commit, PR) and closes the issue as completed. Ship calls it after a
merge into a branch that is not the default one, where GitHub's `Closes #N`
does nothing. On Linear, `close` adds the `Resolution:` comment, then moves
the issue to the team's completed status with `save_issue` (`state`),
unless the CLAUDE.md leaves that to an integration: then the comment only.

After every `create`, end with one line asking whether to turn the issue
into a brief (« On en fait un brief ? » in the conversation language), with
the command in the harness syntax (`/brief:brief #N` in Claude Code). Never
start it yourself; Arsenal owns the transition.

Resume reconstructs the current state from the issue, not stale memory. A
solved issue does not trigger another diagnosis. List returns concise open
items and stops. If the controlled shell has no external networking, report
that authorization/capability boundary instead of claiming the tracker
action happened or attempting an execution escape.

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
