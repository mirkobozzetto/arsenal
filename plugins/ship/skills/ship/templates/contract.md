---
artifact: "{artifact_path}"
artifact_kind: "{brief|propose}"
locked: "{date}"
---

# Definition of Done: {feature_or_proposal_title}

> Immutable target. Every item below is a concrete, checkable condition the final verification bundle validates against. Requirement changes get a NEW entry; never silently rewrite an existing line.

## Acceptance criteria (the contract)

| # | Criterion (from spec) | Source | Validated by |
|---|------------------------|--------|--------------|
| C1 | {Given/When/Then or propose Accept-criteria cell} | {brief.md story / PROPOSAL.md T0n} | {bundle command or self-check} |
| C2 | ... | ... | ... |

## Out of scope (never build)

- {from brief Out-of-scope / propose Non-Goals}

## Edit scope

- {files/modules the spec authorizes touching: brief Relevant Files / propose Files column}
