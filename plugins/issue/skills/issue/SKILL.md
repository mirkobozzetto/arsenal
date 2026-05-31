---
name: issue
description: Use GitHub issues as persistent cross-session resolution memory. Create, update, and re-read issues that are self-contained and re-readable cold, recording the hypothesis and the resolution. Triggers on "track this in an issue", "create an issue I can resume", "resume issue", "issue memory", "log this problem as an issue", or when work must survive a context reset via the GitHub tracker. NOT for ephemeral session snapshots (use remember) and NOT for the manual Obsidian vault (use brain). GitHub-native, auto-re-readable on resume.
argument-hint: "[create|update|resume|list] [#N | <problem>]"
allowed-tools: Bash(gh issue view:*), Bash(gh issue list:*), Read
---

# issue: GitHub issues as resolution memory

Persist problem-solving state in GitHub issues so a later session (or a fresh context) can re-read an issue cold and continue. Each issue records the problem, a self-contained Pickup Directive, the working hypothesis, attempts, and the final resolution.

## Prerequisites

- `gh` CLI authenticated (`gh auth status`).
- Inside a GitHub repo (a remote with issues enabled). If not, stop and tell the user.

## Natural-language routing

Interpret intent and route:

| User says | Action |
|-----------|--------|
| "track this in an issue", "log this problem", "open an issue for this" | **create** |
| "update the issue", "note progress on #N", "I found the cause" | **update** |
| "resume issue #N", "what was I doing on #N", "pick up where I left off" | **resume** |
| "list my memory issues", "what issues am I tracking" | **list** |

Default when ambiguous and a number is present → **resume #N**; otherwise → **create**.

## create

1. Draft the issue body from `references/issue-template.md` (Problem / Pickup Directive / Hypothesis / Attempts / Resolution). Fill Problem + Pickup Directive + initial Hypothesis from the current context; leave Attempts/Resolution as stubs.
2. **Confirm with the user before opening** (opening an issue is outward-facing). Show the drafted title + body.
3. Create with the memory label so `resume`/`list` can filter:
   ```bash
   gh issue create --title "<concise title>" --label claude-memory --body "<rendered template>"
   ```
   If the label does not exist, create it once: `gh label create claude-memory --description "Claude resolution memory" --color BFD4F2`.
4. Report the issue number + URL.

## update

1. **Read before write**: `gh issue view <N> --comments` to load current state.
2. Append progress as a comment (never overwrite the original body):
   ```bash
   gh issue comment <N> --body "<progress / revised hypothesis / new attempt>"
   ```
3. When solved, append the resolution and close (**confirm before closing**):
   ```bash
   gh issue comment <N> --body "Resolution: <what fixed it and why>"
   gh issue close <N> --reason completed
   ```

## resume

1. Load the issue cold:
   ```bash
   gh issue view <N> --comments
   ```
   If no number given: `gh issue list --label claude-memory --state open` and ask which.
2. Reconstruct context strictly from the **Pickup Directive** + Hypothesis + latest comments. Do not assume prior chat memory.
3. State the recovered context back to the user, then continue the work.

## list

```bash
gh issue list --label claude-memory --state open
```
Show number, title, and updated time.

## Issue body template

The structure lives in `references/issue-template.md`. Read it before `create` so every issue is self-contained and re-readable cold. The **Pickup Directive** is mandatory: it is what makes the issue resumable without prior context.

## Guardrails

- Read an issue (`gh issue view`) before commenting or closing; never blow away existing content.
- Confirm with the user before `gh issue create` and before `gh issue close` (outward-facing / state change).
- Use `gh` for all issue operations, not raw git; this skill never commits or pushes.
- Never modify a database; this skill only touches GitHub issues.
- Prose in French; technical terms and identifiers in English.
- Any web lookup uses Exa MCP only (web_search_exa, crawling_exa); never native WebSearch/WebFetch.
- No comments inside any generated code or scripts.

## Delimitation

- `issue` != `remember`: remember is an ephemeral per-session snapshot. issue is durable and GitHub-native.
- `issue` != `brain`: brain is manual Obsidian capture. issue is the repo's tracker, auto-re-read on resume.
