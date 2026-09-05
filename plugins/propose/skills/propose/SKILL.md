---
name: propose
description: Design a concrete technical proposal with evidence and tradeoffs when a decision needs design. No implementation or automatic reviewer.
argument-hint: "<question> [--short|--full] [--auto] [--scope path] [--no-review] [--out dir] [--html]"
---

# Propose

Gather only the context needed to answer the design question. Prefer the
smallest sufficient format: short for a bounded reversible choice, standard
for one system, full for a genuine cross-system design. No format interview
when the request already determines the appropriate size.

Use references/proposal-template.md for stable section numbers and artifact
shape. Write problem, real alternatives (including status quo when relevant),
tradeoffs, design, risks, recommendation and runnable implementation tasks.
Do not manufacture alternatives, diagrams, metrics or verification layers
to fill a template. Ask only about a blocking decision not recoverable from
code or the request. Research only unresolved external questions.

Review the draft yourself. An independent review is optional and requires
explicit user consent, never merely omission of --no-review. Retain supported
findings only. Leave status Draft or Review until the user explicitly accepts
the proposal; writing it is not implementation approval.

Keep the existing docs/proposals/<id>-<slug>/PROPOSAL.md layout and links to
a source brief. Do not supersede that brief until the design is accepted.
Render via scripts/render.py only on --html or request. Do not launch ship,
open a browser, create an index, or start another agent just to finish.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
