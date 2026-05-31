---
artifact: "{artifact_path}"
artifact_kind: "{prd|rfc}"
locked: "{date}"
---

# Definition of Done: {feature_or_rfc_title}

> Immutable target. Every item below is a concrete, checkable condition the final verification bundle validates against. Requirement changes get a NEW entry; never silently rewrite an existing line.

## Acceptance criteria (the contract)

| # | Criterion (from spec) | Source | Validated by |
|---|------------------------|--------|--------------|
| C1 | {Given/When/Then or rfc Accept-criteria cell} | {prd.md story / RFC.md T0n} | {bundle command or self-check} |
| C2 | ... | ... | ... |

## Out of scope (never build)

- {from prd Out-of-scope / rfc Non-Goals}

## Edit scope

- {files/modules the spec authorizes touching: prd Relevant Files / rfc Files column}
