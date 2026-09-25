# brief templates

The two files a brief writes, in the shape `next` and `ship` read. Start from
these skeletons; never copy the format of a brief found in another project,
older briefs use a legacy task numbering. The frontmatter fields are defined
in the `next` state contract; the ones below are all a brief ever writes.

A section with nothing real to say is left out, except the structural
headings Acceptance criteria, Success metrics, Out-of-scope, Relevant Files
and Tasks. Boundary is written only when the answer is knowable.

## docs/brief/<slug>/brief.md

```markdown
---
type: brief
slug: <slug>
title: <title>
status: draft
created: <YYYY-MM-DD>
next_action: <one line: what shipping this does>
resume_cmd: /ship docs/brief/<slug>
base: <branch checked out at finalize, git only>
branch: feat/<slug>
---

# <title>

## Problem

<who hits what today, and what it costs them>

## Users

<who uses the result, one line each>

## Goals

- <outcome, not mechanism>

## Acceptance criteria

- AC1 <observable behaviour: someone can check it without reading code>
- AC2 <...>

## Success metrics

<how we know it worked; a numeric metric only when one is meaningful>

## Out-of-scope

- <what this release deliberately does not do>

## Constraints and assumptions

- <fixed decisions, platform limits, assumptions to verify, with sources>

## Boundary

Owns:
- `<path/>`

Must not touch:
- `<path/>`
```

`status` goes `draft` to `ready` at finalize. `base` and `branch` are written
at finalize and only in a Git repository.

## docs/brief/<slug>/tasks.md

```markdown
---
type: tasks
slug: <slug>
source_brief: docs/brief/<slug>/brief.md
---

# Tasks: <title>

## Relevant Files

- `<path>` - <why it matters to this feature>

## Tasks

Ordered. Each task closes the acceptance criteria it names.

## T01 - <outcome>

Closes: AC1, AC2

- [ ] <observable sub-outcome>
- [ ] <...>

## T02 - <outcome>

Closes: AC3

- [ ] <...>
```

Every task is a `## T<nn>` heading with its checkboxes directly under it:
`next` reports the first unchecked box with the `##` heading it sits under,
and `ship --tasks T02` addresses the task by that prefix.
