---
name: step-03-plan
description: Write docs/roadmap/<slug>/roadmap.md - phases, commands, mockup
prev_step: steps/step-02-research.md
next_step: steps/step-04-render.md
---

# Step 3 (Plan): Write the Roadmap

## MANDATORY EXECUTION RULES:

- Write the file; never dump the markdown into chat.
- Written in the conversation language (frontmatter keys/values, slug and
  code identifiers stay English).
- Phases are CUT RUTHLESSLY: phase 1 is the minimal version from the
  interview, nothing speculative. 2-4 phases total.
- Commands are real and runnable for the user's stack, in fenced blocks.
- The mockup is ONE wireframe of the core screen/flow: inline HTML/SVG
  (simple boxes + labels) or a mermaid flowchart for a non-UI project.
  It renders as-is on the HTML page; keep it under ~40 lines.

## FILE: `{roadmap_dir}/roadmap.md`

```markdown
---
type: roadmap
slug: <slug>
status: draft
created: <date>
updated: <date>
stepsCompleted: [0, 1, 2, 3]
resume_cmd: "/arsenal -r <slug>"
---

# <Project name>

> TL;DR - the objective in two sentences, the phase-1 promise in one.

## 1. Objectif
The pain, the users, what they do today, the success signal.

## 2. Hors-scope
What we are deliberately NOT building (from the interview).

## 3. Inspirations
| Source | À reprendre | À éviter |
one row per {research} item, name linked to its URL.

## 4. Maquette
The wireframe (inline HTML/SVG or mermaid).

## 5. Phases
### Phase 1 - <the minimal version> 
What ships, why it proves the objective, and its commands:
```bash
<the exact commands to bootstrap/run this phase>
```
### Phase 2..N - same shape, shorter.

## 6. Prochaine étape
The handoff: which phase to /brief first.
```

## NEXT STEP:

Load `./step-04-render.md`.

<critical>
Phase 1 must be shippable and prove the objective. A roadmap whose phase 1
is "setup" has no phase 1.
</critical>
