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

- 🎯 Show the PRD outline before writing the full body; speak in short prose and do NOT dump the raw section markdown into the chat (write it to the file, report a one-line recap)
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

- **En bref (TL;DR)**: the FIRST block, 3 short lines - who it is for / the problem / what it delivers. The skim path: a reader gets the verdict in 10 seconds. (Header `## En bref` is not parsed by ship; safe.)
- **Problem statement**: the pain, who has it, why now. Keep it tight (2-4 sentences), quantified if possible.
- **Goals**: outcomes this feature must achieve (measurable outcomes, not features).
- **Non-goals / Out-of-scope**: explicit exclusions (prevents scope creep; never empty).
- **User stories**: `As a <user>, I want <capability>, so that <value>`.
- **Acceptance criteria**: per story, testable. Default to a scannable `- [ ]` checklist; use Given/When/Then only for multi-step or edge-case behavior. Keep the `## Acceptance criteria` header in English.
- **Success metrics**: a primary metric with baseline -> target -> measurement window, plus guardrail metrics not to regress. Numbers, not adjectives. If no primary metric can be named, the goal is not sharp enough. Keep the `## Success metrics` header in English.
- **Constraints & assumptions**: from the interview.
- **Open questions**: anything still thin.

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
Body = the sections above. Write the prose in the language of the conversation; keep in English the `slug`, identifiers, frontmatter keys/values, and the section headers ship parses (`## Acceptance criteria`, `## Success metrics`, `## Out-of-scope`). If `prd_path` exists, edit in place (do not create a duplicate).

### 3. Proceed to tasks

Proceed to step-03. Tell the user in one short line, in the conversation language, that the PRD is written (e.g. "PRD written: <feature>, N stories, primary metric <metric>") - do NOT paste the section markdown into the chat. No "derive the tasks?" confirmation gate. The user may say "stop" or "revise <section>" to adjust in place before tasks.

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
❌ Dumping the raw PRD markdown into the chat instead of writing it to the file
❌ Missing the `## En bref` TL;DR at the top of the PRD

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
