# issue

GitHub issues as **cross-session resolution memory**. `issue` creates, updates, and re-reads issues that are self-contained and re-readable cold — so a later session (or a fresh context) can pick up exactly where you left off, with the working hypothesis and the final resolution recorded.

It is durable and GitHub-native — distinct from an ephemeral session snapshot and from a personal notes vault.

---

## What it does

Natural-language routing to four actions:

| You say | Action |
|---------|--------|
| "track this in an issue", "log this problem" | **create** |
| "note progress on #N", "I found the cause" | **update** |
| "resume issue #N", "pick up where I left off" | **resume** |
| "what issues am I tracking" | **list** |

Every issue carries a **Pickup Directive** — a self-contained section (context, current state, next step, how to verify) that lets a cold session resume from the issue alone, no prior chat. Progress goes in comments; the body stays the stable directive. Issues are tagged `claude-memory` so `resume` / `list` can filter them.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install issue@arsenal
```

## Usage

```bash
/issue track this race condition in the auth refresh
/issue resume 42
/issue list
```

## Guardrails

- Reads an issue (`gh issue view`) before commenting or closing — never blows away existing content.
- Confirms before `gh issue create` and before `gh issue close` (outward-facing / state change).
- Uses `gh` for all issue operations; never commits, pushes, or touches a database.

## Dependencies

- The [`gh`](https://cli.github.com/) CLI, authenticated (`gh auth status`).
- Run inside a GitHub repo with issues enabled.
