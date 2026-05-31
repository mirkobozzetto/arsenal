---
name: step-02-draft-prd
description: Emit the PRD - problem, goals, user stories, scope, out-of-scope, success metrics, acceptance criteria
prev_step: steps/step-01-interview.md
next_step: steps/step-03-tasks.md
---

# Step 2: Draft PRD

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER specify the technical how (no stack, no schema, no API design)
- 🛑 NEVER write feature code
- ✅ ALWAYS write to `prd_path` (edit in place if it exists)
- 📋 YOU ARE A product writer, not an engineer
- 💬 FOCUS on what/why and measurable outcomes
- 🚫 FORBIDDEN to derive tasks here (that is step-03)

## EXECUTION PROTOCOLS:

- 🎯 Show the PRD outline before writing the full body
- 💾 Write the full PRD to `prd_path` with frontmatter
- 📖 Complete the PRD before loading step-03
- 🚫 FORBIDDEN to load step-03 until the PRD file is written

## CONTEXT BOUNDARIES:

- Available: feature_name, feature_slug, prd_path, tasks_path, answers (from interview)
- If `skip_interview` = true, draft from feature_name + any provided idea, and flag thin sections
- Don't assume knowledge from future steps

## YOUR TASK:

Write a complete product PRD from the gathered answers and save it to `prd_path`.

---

## EXECUTION SEQUENCE:

### 1. Build the PRD body

Sections (in this order):

- **Problem statement** — the pain, who has it, why now.
- **Goals** — outcomes this feature must achieve.
- **Non-goals / Out-of-scope** — explicit exclusions (prevents scope creep).
- **User stories** — `As a <user>, I want <capability>, so that <value>`.
- **Acceptance criteria** — per story, testable Given/When/Then.
- **Success metrics** — measurable signals the feature worked (numbers, not adjectives).
- **Constraints & assumptions** — from the interview.
- **Open questions** — anything still thin.

### 2. Write the file

Write to `prd_path` with frontmatter:
```yaml
---
feature: <feature_name>
slug: <feature_slug>
type: prd
status: draft
stepsCompleted: [0, 1, 2]
---
```
Body = the sections above. Prose in French; identifiers in English. If `prd_path` exists, edit in place — do not create a duplicate.

### 3. Confirm

**If `auto_mode` = true:**
→ Proceed to step-03

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "PRD"
    question: "PRD écrit dans <prd_path>. On dérive les tasks ?"
    options:
      - label: "Dériver les tasks (Recommended)"
        description: "Passer à la todo dérivée du PRD"
      - label: "Réviser le PRD"
        description: "Ajuster des sections avant"
    multiSelect: false
```
Route: Réviser → revise the named sections in place, re-confirm.

---

## SUCCESS METRICS:

✅ All sections present, including Out-of-scope and Success metrics
✅ Success metrics are measurable (numbers, not adjectives)
✅ Each user story has testable acceptance criteria
✅ No technical-how content
✅ PRD written to `prd_path` with frontmatter

## FAILURE MODES:

❌ Specifying stack/schema/API (that is rfc)
❌ Writing feature code
❌ Vague success metrics ("better UX")
❌ Deriving tasks in this step
❌ **CRITICAL**: Not using AskUserQuestion to confirm

## DRAFT PROTOCOLS:

- Out-of-scope is mandatory, never empty
- Every story maps to at least one acceptance criterion
- Carry interview "exception" answers into acceptance criteria and Open questions

---

## NEXT STEP:

After confirm, load `./step-03-tasks.md`.

<critical>
Remember: Product spec only. The how belongs to rfc/ship, not here.
</critical>
