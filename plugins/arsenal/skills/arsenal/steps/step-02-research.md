---
name: step-02-research
description: Capability-aware research with bounded optional delegation
prev_step: steps/step-01-interview.md
next_step: steps/step-03-plan.md
---

# Step 2: Research Existing Solutions

Load `../references/agent-contracts.md` and the active harness adapter.
Freeze the context packet after the interview. The lead remains responsible
for interpreting every result.

## Research contract

- Run two or three targeted searches based on the objective, users, domain,
  and project-specific constraint. Never search generic keywords for padding.
- Retain two to five useful inspirations.
- Every inspiration contains `name`, `url`, `borrow`, `avoid`,
  `confidence`, and `risk`.
- Cite the source URL. If no web capability exists, use prior knowledge,
  set `url` to `null`, and set `confidence` to `inferred`.

## Execution mode

Delegate only after the interview is complete and only when all conditions
hold:

1. `{capabilities}.subagents` is `parallel` or `sequential`.
2. At least two independent research units exist.
3. The matching native agents are available and authenticated.

Dispatch at most three read-only units. Product-pattern research uses
`arsenal-product-scout`. Harness constraints use
`arsenal-harness-analyst`. Parse each result using the schemas in
`agent-contracts.md`.

If any condition fails, execute the same units in the lead. A failed or invalid
agent result is rerun once in the lead. Missing web, agents, authentication, or
specialized models never blocks the roadmap.

## Trace

Append one `{execution_trace}` item per unit with harness, unit, semantic
role, requested model, resolved model, provenance, and status. Do not infer a
resolved model from an alias. Follow the active adapter's proof rule.

Report useful research and contradictions in at most eight lines. Store the
normalized inspiration list as `{research}`, then load
`./step-03-plan.md`.
