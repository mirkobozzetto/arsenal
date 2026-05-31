# Issue body template

Render this as the GitHub issue body on `create`. Every section is required; the **Pickup Directive** is what lets a future session resume cold. Prose in English; identifiers in English.

```markdown
## Problem
<what is broken / what must be solved, observable symptom, where it shows up>

## Pickup Directive
> Self-contained. A future session reads ONLY this section + comments to resume, with no prior chat.
- Context: <repo, branch, files/areas involved>
- Current state: <what is done / not done>
- Next step: <the concrete action to resume>
- How to verify: <command / test / success signal>

## Hypothesis
<suspected cause, and why>

## Attempts
- [ ] <attempt + result>   (updated via `gh issue comment`)

## Resolution
<filled in at close: what fixed it, and why it works>
```

## Conventions

- Title: concise, problem-first (e.g. `Auth: token expiry off-by-one on refresh`).
- Label: `claude-memory` (filter for `resume` / `list`).
- Progress goes in **comments**, not by editing the original body: the body stays the stable Pickup Directive.
- On close: append a `Resolution:` comment, then `gh issue close <N> --reason completed`.
