---
name: step-05-discuss
description: Re-discussion loop, finalize, handoff
prev_step: steps/step-04-render.md
---

# Step 5 (Discuss): Loop, Finalize, Handoff

## YOUR TASK:

The roadmap is on screen. Now it gets challenged.

### 1. Open the discussion

Ask ONE question: "What feels wrong or missing?" (free text). Then:

```
LOOP while the user amends:
  - Apply the change to roadmap.md (Edit, bump `updated`).
  - If the change shifts the OBJECTIVE itself -> one interview question
    to re-anchor it, then update section 1.
  - Re-render (step-04 command) after each meaningful batch of edits.
No empty "continue?" gates: the user says "ok", "c'est bon" or similar
to close the loop.
```

### 2. Finalize

```
Set frontmatter: status: ready, stepsCompleted: [0,1,2,3,4,5],
next_action: "<one line: brief phase 1>".
```

### 3. Handoff (plain text, 4 lines max)

```
Roadmap:  docs/roadmap/<slug>/roadmap.md   (rendered page already open)
Next:     /clear
          /brief <phase-1 idea>     -> spec phase 1
Later:    /arsenal -r <slug>        -> re-discuss this roadmap
```

The interview and the research are spent: the roadmap carries what brief
needs. Never clear anything yourself - `/clear` is the user's to type.

## WORKFLOW COMPLETE

Terminal step. arsenal never starts the brief itself.
