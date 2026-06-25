---
name: step-04-finalize
description: Verify artifacts, print handoff to ship
prev_step: steps/step-03-tasks.md
---

# Step 4: Finalize

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER implement the tasks
- 🛑 NEVER commit/push unless the user asks (git write-guard)
- ✅ ALWAYS verify both artifacts exist
- 📋 YOU ARE a finalizer, not an implementer
- 🚫 FORBIDDEN to start the build

## EXECUTION PROTOCOLS:

- 🎯 Confirm `prd_path` and `tasks_path` exist and are non-empty
- 💾 Mark frontmatter status = ready in both files
- 📖 Print the handoff and stop

## CONTEXT BOUNDARIES:

- Available: prd_path, tasks_path, feature_slug
- This is the terminal step; there is no next step

## YOUR TASK:

Verify the PRD and task artifacts, mark them ready, then ask the user what to do next (rfc or ship) and explain the benefit of each before handing off.

---

## EXECUTION SEQUENCE:

### 1. Verify artifacts

- Read `prd_path` and `tasks_path`; confirm both exist and are non-empty.
- If either is missing, route back to the owning step (02 or 03).

### 2. Mark ready

Set `status: ready` in `prd_path` frontmatter; confirm `tasks_path` keeps the "Do NOT implement" header.

Also stamp the resume contract in `prd_path` frontmatter so the `next` open-work board and a fresh session can pick this up cold:
```yaml
status: ready
next_action: "<one line: what shipping this delivers>"
resume_cmd: "/ship docs/prd/<slug>"
```
These are the fields `next` reads. `status` flips to `shipped` later, set by ship at finish.

### 3. Print handoff

```
PRD ready: <prd_path>
Tasks:     <tasks_path>  (Do NOT implement)
```

### 4. Ask what to do next

Always ask, even in `auto_mode` (this is the product/technical boundary, the user decides where to route). Use AskUserQuestion, and make each option's description state the concrete benefit:

```yaml
questions:
  - header: "Next"
    question: "PRD + tasks ready. What do we move on to?"
    options:
      - label: "RFC (design the how)"
        description: "Explores the technical alternatives, weighs the tradeoffs and lists the risks BEFORE coding. Choose this if the technical solution is not obvious or if the decision crosses a boundary (architecture, migration, new pattern). Avoids coding in the wrong direction."
      - label: "ship (implement the spec)"
        description: "Spec-driven executor: reads tasks.md (gate status: ready), locks a contract, implements, returns a verification-bundle + a trace. Respects your 'no auto tests/builds' rule. Choose this to build directly without an architecture debate. Terminal of the prd -> ship chain."
      - label: "Stop here"
        description: "The PRD + the todo are enough for now. Resume later via ship on the tasks file."
    multiSelect: false
```

**Route based on response:**
- **RFC** → tell the user to run `rfc` using `<prd_path>` as the product input (the RFC consumes the PRD requirements). Do NOT run it automatically.
- **ship** → tell the user to run `ship <feature_dir>` (the prd folder); ship reads tasks.md + prd.md, gated on `status: ready`. Do NOT run it automatically.
- **Stop here** → end; print the resume hint (`ship <feature_dir>` later).

### 5. Commit?

**If `auto_mode` = true:**
→ Do NOT commit. Just print handoff.

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Commit"
    question: "Commit the PRD + tasks?"
    options:
      - label: "No, I'll handle it (Recommended)"
        description: "Don't commit anything (git write-guard)"
      - label: "Commit"
        description: "git add docs/prd && commit (will go through the guard)"
    multiSelect: false
```
Route: Commit → stage only `docs/prd/`, conventional message, no Claude signature; the git write-guard prompt will fire.

---

## SUCCESS METRICS:

✅ Both artifacts exist and are non-empty
✅ PRD status = ready; tasks keep "Do NOT implement"
✅ Next-action asked via AskUserQuestion, each option explaining its benefit
✅ Routed to rfc / ship / stop per the user's choice (never auto-run)
✅ No commit unless the user opted in

## FAILURE MODES:

❌ Implementing tasks
❌ Auto-running rfc or ship instead of asking
❌ Skipping the next-action question in auto_mode
❌ Auto-committing without asking
❌ Declaring done with a missing artifact
❌ **CRITICAL**: Not using AskUserQuestion for next-action and commit

## FINALIZE PROTOCOLS:

- The PRD generates the todo; handing off to ship is the end of this skill
- Never merge, never push beyond an explicit user commit choice

---

<critical>
Remember: prd ends at a ready PRD + task list. Implementation belongs to ship.
</critical>
