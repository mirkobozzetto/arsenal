---
name: prd
description: Author a product PRD by interviewing the user, then emit user stories, scope, success metrics, and a derived task list. Triggers on "write a PRD", "create a PRD", "spec this feature", "PRD". A PRD is a product spec (what/why), NOT a technical design (use rfc) and NOT open research (use brainstorm). The PRD generates the todo; it is not itself the todo.
argument-hint: "<feature idea> [-a auto] [-s skip-interview]"
---

<objective>
Interview the user about a feature, then produce a complete product PRD and an ordered task list derived from it, following the flow PRD -> tasks -> (handoff to ship). Stop at the task list; never write feature code.
</objective>

<parameters>
- `<feature idea>`: free-text feature name or one-line idea (remainder of input).
- `-a`: auto mode, skip AskUserQuestion confirmations, use recommended options.
- `-s`: skip-interview, draft directly from the given idea without the question loop (lower quality, use only when the idea is already detailed).
</parameters>

<state_variables>
- feature_name: string       # human-readable feature title
- feature_slug: string       # kebab-case slug for filenames
- answers: object            # gathered interview answers (JTBD, user, problem, constraints, 3-dim)
- feature_dir: string        # docs/prd/<slug>/  (one folder per feature)
- prd_path: string           # docs/prd/<slug>/prd.md
- tasks_path: string         # docs/prd/<slug>/tasks.md
- prd_body: string           # the drafted PRD markdown
- task_list: array           # ordered tasks derived from the PRD (nested checklist)
- auto_mode: boolean         # -a
- skip_interview: boolean    # -s
</state_variables>

<delimitation>
- `prd` != `rfc`: rfc is a technical design doc (alternatives, tradeoffs, architecture). prd stays at product level (user value, scope, metrics) and never picks the technical how.
- `prd` != `brainstorm`: brainstorm is open-ended research. prd assumes the idea is chosen and produces a structured spec.
- `prd` != `ship`: ship implements. prd stops at the task list and hands off.
- The PRD generates the todo. The PRD is not itself the todo.
</delimitation>

<file_layout>
One folder per feature: `docs/prd/<slug>/` containing `prd.md` + `tasks.md`.

```
docs/prd/
  <slug>/
    prd.md      # what/why
    tasks.md    # nested checklist (1.0 parent -> 1.1, 1.2 sub-tasks)
```

Rules:
- A big feature does NOT become many files. It becomes more parent tasks in the single `tasks.md` (phases = parent tasks: `1.0 Phase 1`, `2.0 Phase 2`).
- Split into a second PRD ONLY when the scope is genuinely separate. Then add numbered pairs in the same folder: `0001-prd-<x>.md` + `tasks-0001-<x>.md`, `0002-prd-<y>.md` + `tasks-0002-<y>.md`.
- Never create one folder or one file per task. Tasks are checklist items inside `tasks.md`.
- PRD stays 2-4 pages; if it exceeds ~6 pages, split scope into a numbered second PRD rather than padding.
</file_layout>

<entry_point>
Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | steps/step-00-init.md | Parse flags, slugify feature, detect resume, setup state |
| 01 | steps/step-01-interview.md | Targeted clarifying questions, loop until enough signal |
| 02 | steps/step-02-draft-prd.md | Emit the PRD: problem, goals, stories, scope, metrics, acceptance |
| 03 | steps/step-03-tasks.md | Derive the ordered task list (the todo) from the PRD |
| 04 | steps/step-04-finalize.md | Write artifacts, print handoff to ship |
</step_files>

<constraints>
- Never write feature code in this skill; stop at the task list.
- The task file carries an explicit "Do NOT implement" header until the user runs the implementer.
- No comments inside any generated code or scripts.
- Prose in English; technical terms and identifiers in English.
- Any web lookup uses Exa MCP only (web_search_exa, crawling_exa); never native WebSearch/WebFetch.
- Honor the git write-guard: do not commit/push the PRD unless the user asks.
- Edit existing PRD files in place rather than creating duplicates.
</constraints>
