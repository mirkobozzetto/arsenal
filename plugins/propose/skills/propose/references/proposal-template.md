# proposal templates: three sizes, one numbering

The document is sized to the decision it carries. `step-00` picks the
format; every later step writes only the sections its format owns.

## Section numbers are the anchors

Sections keep a STABLE number across all three formats. A short format is a
SUBSET of the canonical numbering, not a renumbering: an `short` jumps from 1
to 5 to 6 to 7 to 10, and that is correct.

This is what keeps `ship` working on every format without changes: it reads
"section 6", "section 10" and "section 11" by number
(`ship/steps/step-01-ingest.md:90-94`).

| # | Canonical name | short | standard | full | Written by |
|---|---|---|---|---|---|
| 1 | Summary | ✓ | ✓ | ✓ | step-09 (last) |
| 2 | Context / Codebase | - | - | ✓ | step-01 |
| 3 | Problem & Motivation | - | ✓ | ✓ | step-02 |
| 4 | Goals / Non-Goals | - | ✓ | ✓ | step-02 |
| 5 | Alternatives Considered | ✓ | ✓ | ✓ | step-03 |
| 6 | Proposed Design | ✓ | ✓ | ✓ | step-04 |
| 7 | Drawbacks & Risks | ✓ | ✓ | ✓ | step-05 |
| 8 | Open Questions | - | - | ✓ | step-05 |
| 9 | Recommendation & Rationale | - | ✓ | ✓ | step-06 |
| 10 | Implementation Plan | ✓ | ✓ | ✓ | step-07 |
| 11 | Review Findings | - | - | ✓ | step-08 |

In `short`, section 1 is the decision itself (2-4 lines), not a summary of a
longer text. In `short` and `propose`, review findings are APPLIED to the text
instead of being appended as section 11.

## Size ceilings (hard)

| Format | Ceiling | Use for |
|---|---|---|
| `short` | 80 lines | one reversible decision, one system |
| `propose` | 250 lines | a change inside one system |
| `full` | 600 lines | crosses systems, teams or versions |

The ceiling is a limit on the DECISION, not on the writing. Over the
ceiling means the subject is too wide: split it into several documents.
Never compress prose to fit, and never pad to fill.

A section with nothing real to say is NOT written. No placeholder, no
"N/A", no invented risk. Deleting an empty section is the correct outcome.

## Titles follow the conversation language

Write the title in the conversation language, keep the number. French
mapping, to avoid inventing a new wording per document:

| # | English | French |
|---|---|---|
| 1 | Summary / Decision | Résumé / Décision |
| 2 | Context / Codebase | Contexte et code existant |
| 3 | Problem & Motivation | Problème et motivation |
| 4 | Goals / Non-Goals | Objectifs et non-objectifs |
| 5 | Alternatives Considered | Alternatives envisagées |
| 6 | Proposed Design | Conception retenue |
| 7 | Drawbacks & Risks | Inconvénients et risques |
| 8 | Open Questions | Questions ouvertes |
| 9 | Recommendation & Rationale | Recommandation et justification |
| 10 | Implementation Plan | Plan d'implémentation |
| 11 | Review Findings | Conclusions de la revue |

Subsection titles (`###`) follow the same language. Nothing parses them.

Stay in English regardless of language: frontmatter keys and values, the
`slug`, the columns of the section 10 task table, the `graph TD` block, and
code identifiers.

## Frontmatter

Only keys something reads. Counters are derivable from the document and
were dropping 40 lines of noise on every proposal.

```yaml
---
proposal_id: "NNNN"
slug: "kebab-case-slug"
title: "Title"
status: Draft
format: standard
author: "Name"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
stepsCompleted: []
scope_path: "/path"
source_brief: "docs/brief/<slug>/"   # omit when the proposal has no sibling brief
auto_mode: false
skip_review: false
---
```

`status`: Draft | Review | Accepted | Rejected (the `ship` run-gate).
`format`: short | standard | full.
`resume_cmd` is added by step-09 when the proposal is Accepted.

## Format `short` — one decision, 80 lines

```markdown
# NNNN : <title>

## 1. Décision
What is decided, in 2-4 lines. No suspense, no build-up.

## 5. Alternatives envisagées
A table: option, why not. One line each. The status quo counts as an option.

## 6. Conception retenue
What changes, concretely. Files, module, contract. No diagram unless the
shape genuinely cannot be said in words.

## 7. Inconvénients et risques
What this costs. Prose, no probability table at this size.

## 10. Plan d'implémentation
| ID | Title | Files | Depends on | Effort |
```

## Format `propose` — default, 250 lines

Sections 1, 3, 4, 5, 6, 7, 9, 10.

Section 1 is a real summary: problem, recommendation, impact, one or two
sentences each. Open questions live inside section 7 rather than in their
own section 8. Review findings are applied to the text.

## Format `full` — 600 lines

All 11 sections. Reserved for a decision crossing systems, teams or
versions. Sections still get dropped when empty; the format authorises
them, it does not mandate them.

## Diagram cheatsheet

A diagram earns its place when it shows something prose cannot: a topology,
a race, a lifecycle. It is never mandatory.

| Mermaid type | Use when |
|--------------|----------|
| `flowchart LR` / `TD` | Architecture overview, module deps |
| `sequenceDiagram` | API flows, auth, retries |
| `erDiagram` | Schema changes, new entities |
| `stateDiagram-v2` | Entity lifecycle |
| `graph TD` | Task dependency graph (step-07, propose-full only) |

## Severity definitions

- **BLOCKER**: must fix before status moves past Draft. Wrong architecture,
  missing security, irreversible mistake.
- **MAJOR**: must fix before merge. Significant gap or risk without
  mitigation.
- **MINOR**: should fix but non-blocking. Clarity, missing edge case.
- **NIT**: cosmetic, optional. Wording, structure.

## Effort sizing

| Size | Hours | Notes |
|------|-------|-------|
| XS | ≤2h | trivial config / 1-file edit |
| S | 2-4h | localized change, 2-3 files |
| M | 1d | new module, schema migration |
| L | 2-3d | cross-cutting change |
| XL | >3d | SPLIT: never lock as single task |
