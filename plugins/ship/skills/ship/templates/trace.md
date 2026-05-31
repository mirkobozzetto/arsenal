---
artifact: "{artifact_path}"
artifact_kind: "{prd|rfc}"
engine_tier: "{teams|subagents|solo}"
stepsCompleted: []
final_status: ""
updated: "{date}"
---

# Trace Ledger: {feature_or_rfc_title}

> Single source of truth for progress. A fresh session reads ONLY this file to resume. One row per task/T-id.

## Tasks

| Unit | Contract item | Status | Files touched | Engine | Notes |
|------|---------------|--------|---------------|--------|-------|
| 1.0 / T01 | C1 | done / in_progress / blocked | `path` | solo | {diff summary} |

## Checkpoints

| Step | Kind | Decision | Why |
|------|------|----------|-----|
| step-04 | risk-boundary | proceeded / halted | {irreversible op + user choice} |

## HALT events

- {none, or: task X failed self-check 3x / rfc BLOCKER unresolved}
