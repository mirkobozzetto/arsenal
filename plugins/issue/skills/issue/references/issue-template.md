# Issue body template

Render this as the issue body on `create`: the GitHub issue body, or the Linear `description`. Every section is required; the **Pickup Directive** is what lets a future session resume cold. Prose in English; identifiers in English.

```markdown
## Problem
<what is broken / what must be solved, observable symptom, where it shows up>

## Pickup Directive
> Self-contained. A future session reads ONLY this section + comments to resume, with no prior chat.
- Context: <repo, base and work branch, brief path and task id when it comes from a brief, files/areas involved>
- Current state: <what is done / not done>
- Next step: <the concrete action to resume>
- How to verify: <command / test / success signal>

## Hypothesis
<suspected cause, and why>

## Attempts
- [ ] <attempt + result>   (updated via comments)

## Resolution
<filled in at close: what fixed it, and why it works>
```

## Conventions

- Title: concise, problem-first (e.g. `Auth: token expiry off-by-one on refresh`).
- Label (GitHub): `arsenal` (filter for `resume` / `list`). Issues created before
  the rename carry `claude-memory`; keep it on them and search both.
- Linear: team, label, priority, project, parent and template come from the
  project's CLAUDE.md; nothing is added that it does not name.
- Progress goes in **comments**, not by editing the original body: the body stays the stable Pickup Directive.
  On Linear, one comment starting with `## Progress`, rewritten in place (`save_comment` with its `id`).
- On close: append a `Resolution:` comment, then `gh issue close <N> --reason completed`.
  On Linear, the `Resolution:` comment, then the team's completed status, unless
  the CLAUDE.md leaves the status to an integration.
- From a brief (`from-tasks`): title `<Area>: <task heading>`, one issue per top-level task, link written back into the task heading as `[#N](url)` (`[ID](url)` on Linear).
