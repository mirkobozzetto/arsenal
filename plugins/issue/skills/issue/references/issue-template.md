# Issue body template

Render this as the GitHub issue body on `create`. Every section is required; the **Pickup Directive** is what lets a future session resume cold. Prose in French; identifiers in English.

```markdown
## Problem
<what is broken / what must be solved, observable symptom, where it shows up>

## Pickup Directive
> Self-contained. A future session reads ONLY this section + comments to resume, with no prior chat.
- Contexte : <repo, branche, fichiers/zones concernés>
- État actuel : <ce qui est fait / pas fait>
- Prochaine étape : <l'action concrète à reprendre>
- Comment vérifier : <commande / test / signal de succès>

## Hypothesis
<cause suspectée, et pourquoi>

## Attempts
- [ ] <tentative + résultat>   (mis à jour via `gh issue comment`)

## Resolution
<rempli à la fermeture : ce qui a corrigé, et pourquoi ça marche>
```

## Conventions

- Title: concise, problem-first (e.g. `Auth: token expiry off-by-one on refresh`).
- Label: `claude-memory` (filter for `resume` / `list`).
- Progress goes in **comments**, not by editing the original body: the body stays the stable Pickup Directive.
- On close: append a `Resolution:` comment, then `gh issue close <N> --reason completed`.
