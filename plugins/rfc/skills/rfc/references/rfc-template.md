# RFC Template — 11 sections

Used by step-00 to scaffold `RFC.md`. Each section is filled by a specific step.

```markdown
---
rfc_id: "NNNN"
slug: "kebab-case-slug"
title: "Title"
status: Draft
author: "Name"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
stepsCompleted: []
scope_path: "/path"
auto_mode: false
skip_review: false
---

# NNNN — Title

## 1. Summary
_Filled in step-09 (written LAST with full doc as context)_

3 paragraphs max:
- Problem (1-2 sentences)
- Recommendation (1-2 sentences)
- Impact (1-2 sentences)

## 2. Context / Codebase
_Filled in step-01 — inventory only, no design_

- Affected modules
- Key symbols (GitNexus refs)
- Prior art (ADRs, RFCs, TODOs)
- Execution flows touched

## 3. Problem & Motivation
_Filled in step-02 — why before what_

- Current state
- Pain (who, how often, what cost)
- Why now (trigger)
- Signals (metrics)

## 4. Goals / Non-Goals
_Filled in step-02_

- Goals: 3-5 measurable
- Non-Goals: 3-5 explicit "we are NOT solving"

## 5. Alternatives Considered
_Filled in step-03 — ≥3 alternatives including status quo_

Per alternative:
- Summary
- How it solves
- Pros
- Cons
- Cost
- Reversibility
- References

## 6. Proposed Design
_Filled in step-04 — concrete enough to build from_

- Architecture overview + Mermaid diagram
- Modules/files affected (table)
- Data model (schema, migrations)
- API contracts (endpoints, breaking flags)
- Flows (Mermaid sequence)
- Cross-cutting (auth, obs, flags, compat)

## 7. Drawbacks & Risks
_Filled in step-05_

- Drawbacks (inherent)
- Risks (probabilistic table: likelihood × impact × mitigation)
- Rollout / rollback strategy
- Gating metrics

## 8. Open Questions
_Filled in step-05_

| # | Question | Owner | Deadline |
|---|----------|-------|----------|

## 9. Recommendation & Rationale
_Filled in step-06_

- Recommendation + confidence
- Goals → mechanisms table
- Why not each rejected alternative (specific)
- Revisit-if triggers

## 10. Implementation Plan
_Filled in step-07_

- Tasks table (ID, title, files, deps, effort, accept)
- Dep graph (Mermaid)
- Verification plan (unit/integration/perf)
- Timeline (optional)

## 11. Review Findings
_Filled in step-08 (or skipped via --no-review)_

Adversarial subagent findings, severity-labeled:
- BLOCKER / MAJOR / MINOR / NIT
```

## Diagram cheatsheet

| Mermaid type | Use when |
|--------------|----------|
| `flowchart LR` / `TD` | Architecture overview, module deps |
| `sequenceDiagram` | API flows, auth, retries |
| `erDiagram` | Schema changes, new entities |
| `stateDiagram-v2` | Entity lifecycle |
| `graph TD` | Task dependency graph (step-07) |
| `C4Context` / `C4Container` | System boundary, component decomposition |

## Severity definitions

- **BLOCKER** — must fix before status moves past Draft. Wrong architecture, missing security, irreversible mistake.
- **MAJOR** — must fix before merge. Significant gap or risk without mitigation.
- **MINOR** — should fix but non-blocking. Clarity, missing edge case, doc gap.
- **NIT** — cosmetic, optional. Wording, structure.

## Effort sizing

| Size | Hours | Notes |
|------|-------|-------|
| XS | ≤2h | trivial config / 1-file edit |
| S | 2-4h | localized change, 2-3 files |
| M | 1d | new module, schema migration |
| L | 2-3d | cross-cutting change |
| XL | >3d | SPLIT — never lock as single task |
