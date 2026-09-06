---
name: brief
description: Write a product brief and its task list when the user requests a product specification. Never implement it.
argument-hint: "<idea> [-a] [-s] [--html]"
---

# Brief

Clarify only missing product decisions: user, problem, scope, constraints and
observable success. Do not repeat information already supplied or require a
numeric business metric for a small usability change. Group related questions
in plain prose; no start/proceed confirmations. -a/-s allow explicit assumptions,
not invented certainty or external permissions.

Write docs/brief/<slug>/brief.md and tasks.md. Keep the existing frontmatter
and structural headings Acceptance criteria, Success metrics, Out-of-scope,
Relevant Files and Tasks. Derive outcome tasks from acceptance criteria; do
not inflate them into a fixed number of phases. One feature, one folder.

Mark ready only when the brief is complete; never implement automatically.
Render with scripts/render.py only for --html or an explicit request. No
mandatory browser, commit, test run, or handoff menu. Report paths and the
next action if requested. Existing files are updated, not duplicated.

## Arsenal handoff

When called by Arsenal for an explicitly requested broader task, return the
brief, its readiness and unresolved decisions to Arsenal. Do not launch ship
yourself. Arsenal may continue an authorized implementation once the brief is
ready; a request for a brief alone never authorizes implementation.

## Execution policy

Work solo. Ask before any subagent or reviewer, even in auto mode. Explain
the independent scope and expected benefit first. No hidden advisor, nested
delegation, model retuning, repeated successful checks, or progress spam.
Use existing context before asking questions. Stop when the requested result
is delivered. User stops and scope changes override pending steps.
