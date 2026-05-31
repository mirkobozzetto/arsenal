---
name: step-03-tasks
description: Derive the ordered task list (the todo) from the PRD
prev_step: steps/step-02-draft-prd.md
next_step: steps/step-04-finalize.md
---

# Step 3: Derive Tasks

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER implement any task
- 🛑 NEVER write feature code
- ✅ ALWAYS derive tasks from the PRD's stories + acceptance criteria
- ✅ ALWAYS write the "Do NOT implement" header at the top of the task file
- 📋 YOU ARE A task planner, not an implementer
- 🚫 FORBIDDEN to start coding even if a task looks trivial

## EXECUTION PROTOCOLS:

- 🎯 Map each user story to one or more ordered tasks
- 💾 Write the task list to `tasks_path`
- 📖 Complete the task file before loading step-04
- 🚫 FORBIDDEN to load step-04 until `tasks_path` is written

## CONTEXT BOUNDARIES:

- Available: feature_slug, prd_path, tasks_path, the PRD body (from step-02)
- The PRD is the source of truth; tasks must trace back to it
- Don't assume knowledge from future steps

## YOUR TASK:

Turn the PRD into an ordered, dependency-aware task list and save it to `tasks_path` flagged "Do NOT implement".

---

## EXECUTION SEQUENCE:

### 1. Derive tasks (nested checklist)

- Parent tasks = high-level units / phases (`1.0`, `2.0`, ...), each with sub-tasks (`1.1`, `1.2`).
- Order by dependency; each parent references the PRD story/criterion it satisfies.
- A BIG feature stays ONE file: add more parent tasks, never more files. Phases = parent tasks (`1.0 Phase 1`, `2.0 Phase 2`).
- Keep tasks product/outcome-scoped, not code-level instructions.
- Two-pass like Carson's pattern: propose the PARENT tasks first, confirm, THEN expand sub-tasks.

### 2. Write the file

Write to `tasks_path`:
```markdown
---
feature: <feature_name>
slug: <feature_slug>
type: tasks
source_prd: <prd_path>
stepsCompleted: [0, 1, 2, 3]
---

> ⚠️ Do NOT implement. This is the derived task list. Run `ship` (or the implementer) to execute.

## Relevant Files
- `<path>` - <role>  (anticipated files; kept in context for the implementer)

## Tasks
- [ ] 1.0 <parent task>  _(PRD: <story/criterion>)_
  - [ ] 1.1 <sub-task>
  - [ ] 1.2 <sub-task>
- [ ] 2.0 <parent task>
  - [ ] 2.1 <sub-task>
```
Prose in French; identifiers in English. Edit in place if it exists.
If scope is genuinely separate, do NOT bloat this file: create a numbered pair in the same folder (`0001-prd-*` / `tasks-0001-*`) per the SKILL file_layout.

### 3. Confirm

**If `auto_mode` = true:**
→ Proceed to step-04

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Tasks"
    question: "Task list dérivée dans <tasks_path>. Finaliser ?"
    options:
      - label: "Finaliser (Recommended)"
        description: "Clore le PRD et afficher le handoff"
      - label: "Réordonner"
        description: "Ajuster l'ordre / les dépendances"
    multiSelect: false
```
Route: Réordonner → adjust ordering/dependencies in place, re-confirm.

---

## SUCCESS METRICS:

✅ Every PRD story maps to at least one parent task
✅ Nested checklist (parent `N.0` + sub-tasks `N.1`), ordered by dependency
✅ Parent tasks proposed and confirmed before sub-task expansion
✅ Single file even for big features (phases = parent tasks); split only via numbered pair
✅ "Do NOT implement" header present
✅ `tasks_path` written with frontmatter linking `source_prd`

## FAILURE MODES:

❌ Implementing or coding any task
❌ Tasks that don't trace back to the PRD
❌ Missing "Do NOT implement" header
❌ **CRITICAL**: Not using AskUserQuestion to confirm

## TASK PROTOCOLS:

- Tasks describe outcomes, not code edits
- Out-of-scope items from the PRD never become tasks
- Preserve traceability: every task cites its PRD origin

---

## NEXT STEP:

After confirm, load `./step-04-finalize.md`.

<critical>
Remember: Derive and order tasks. Implementation is a separate skill (ship).
</critical>
