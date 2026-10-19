# issue

GitHub or Linear issues as **cross-session resolution memory**. `issue` creates, updates, and re-reads issues that are self-contained and re-readable cold: a later session (or a fresh context) can pick up exactly where you left off, with the working hypothesis and the final resolution recorded.

It is durable and tracker-native: distinct from an ephemeral session snapshot and from a personal notes vault.

Before creating, it searches the open issues for the same topic and offers the match first, so the same problem is not written twice.

---

## What it does

Natural-language routing to these actions:

| You say | Action |
|---------|--------|
| "track this in an issue", "log this problem" | **create** |
| "note progress on #N", "I found the cause" | **update** |
| "resume issue #N", "pick up where I left off" | **resume** |
| "what issues am I tracking" | **list** |
| `from-tasks docs/brief/<slug>` (offered by `brief` at finalize) | **from-tasks**: one issue per top-level task, link written back into `tasks.md` |
| `close #N` (called by `ship` after a merge into a non-default branch) | **close** with a `Resolution:` comment |

Every issue carries a **Pickup Directive**: a self-contained section (context, current state, next step, how to verify) that lets a cold session resume from the issue alone, no prior chat. Progress goes in comments; the body stays the stable directive. On GitHub, issues are tagged `arsenal` so `resume` / `list` can filter them; issues created before the rename carry `claude-memory` and are still matched.

---

## Tracker

GitHub by default. Linear when the project's `CLAUDE.md` says so:

```markdown
Issue tracker: Linear, team <name>
```

The same file can name the label, priority, project, parent or template to use, and whether an integration moves issues to done on merge. Linear issues keep one progress comment, edited in place; `close` adds the resolution and sets the completed status.

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
/issue from-tasks docs/brief/oauth-login
/issue close 42
```

## Guardrails

- Reads an issue before commenting or closing: never blows away existing content.
- Confirms before creating and before closing (outward-facing / state change).
- Never commits, pushes, or touches a database.

## Dependencies

- GitHub: the [`gh`](https://cli.github.com/) CLI, authenticated (`gh auth status`), inside a repo with issues enabled.
- Linear: a connected [Linear MCP server](https://linear.app/docs/mcp), the claude.ai connector or `claude mcp add --transport http linear-server https://mcp.linear.app/mcp` then `/mcp` to sign in. The plugin ships no server; without one, `issue` stops and prints this setup.
