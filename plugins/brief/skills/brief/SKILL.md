---
name: brief
description: Author a product brief by interviewing the user, then emit user stories, scope, success metrics, and a derived task list. Triggers on "write a brief", "create a brief", "spec this feature", "brief". A brief is a product spec (what/why), NOT a technical design (use propose) and NOT open research (use brainstorm). The brief generates the todo; it is not itself the todo.
argument-hint: "<feature idea> [-a auto] [-s skip-interview]"
---

<objective>
Interview the user about a feature, then produce a complete product brief and an ordered task list derived from it, following the flow brief -> tasks -> (handoff to ship). Stop at the task list; never write feature code.
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
- feature_dir: string        # docs/brief/<slug>/  (one folder per feature)
- brief_path: string           # docs/brief/<slug>/brief.md
- tasks_path: string         # docs/brief/<slug>/tasks.md
- brief_body: string           # the drafted brief markdown
- task_list: array           # ordered tasks derived from the brief (nested checklist)
- auto_mode: boolean         # -a
- skip_interview: boolean    # -s
</state_variables>

<delimitation>
- `brief` != `propose`: propose is a technical design doc (alternatives, tradeoffs, architecture). brief stays at product level (user value, scope, metrics) and never picks the technical how.
- `brief` != `brainstorm`: brainstorm is open-ended research. brief assumes the idea is chosen and produces a structured spec.
- `brief` != `ship`: ship implements. brief stops at the task list and hands off.
- The brief generates the todo. The brief is not itself the todo.
</delimitation>

<file_layout>
One folder per feature: `docs/brief/<slug>/` containing `brief.md` + `tasks.md`.

```
docs/brief/
  <slug>/
    brief.md      # what/why
    tasks.md    # nested checklist (1.0 parent -> 1.1, 1.2 sub-tasks)
```

Rules:
- A big feature does NOT become many files. It becomes more parent tasks in the single `tasks.md` (phases = parent tasks: `1.0 Phase 1`, `2.0 Phase 2`).
- Split into a second brief ONLY when the scope is genuinely separate. Then add numbered pairs in the same folder: `0001-brief-<x>.md` + `tasks-0001-<x>.md`, `0002-brief-<y>.md` + `tasks-0002-<y>.md`.
- Never create one folder or one file per task. Tasks are checklist items inside `tasks.md`.
- brief stays 2-4 pages; if it exceeds ~6 pages, split scope into a numbered second brief rather than padding.
</file_layout>

<entry_point>
Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | steps/step-00-init.md | Parse flags, slugify feature, detect resume, setup state |
| 01 | steps/step-01-interview.md | Targeted clarifying questions, loop until enough signal |
| 02 | steps/step-02-draft-brief.md | Emit the brief: problem, goals, stories, scope, metrics, acceptance |
| 03 | steps/step-03-tasks.md | Derive the ordered task list (the todo) from the brief |
| 04 | steps/step-04-finalize.md | Write artifacts, print handoff to ship |
</step_files>

<constraints>
- Never write feature code in this skill; stop at the task list.
- The task file carries an explicit "Do NOT implement" header until the user runs the implementer.
- No comments inside any generated code or scripts.
- Converse and write the brief prose and questions in the language of the conversation (French if the user writes French). Keep in English: the `slug`, code identifiers, frontmatter keys/values, file names, and the structural section headers ship/next parse (`Acceptance criteria`, `Success metrics`, `Out-of-scope`, `## Relevant Files`, `## Tasks`).
- Any web lookup uses Exa MCP only (web_search_exa, crawling_exa); never native WebSearch/WebFetch.
- Honor the git write-guard: do not commit/push the brief unless the user asks.
- Edit existing brief files in place rather than creating duplicates.
</constraints>

<interaction>
- **Default is interactive. Ask, do not infer.** Without `-a`/`-s`, the interview questions (the 7 dimensions + the success metric) MUST be asked via AskUserQuestion; never infer an answer the user can give. Inference is allowed only under `-a` (auto) or `-s` (skip-interview).
- **Group the interview.** Ask the dimensions in 1-2 AskUserQuestion rounds (the tool takes up to 4 questions per call), not one screen per dimension.
- **No empty proceed-gates.** Do not stop with "continue to the next step?" confirmations between draft and tasks; flow through and report one line per artifact. The genuine choices stay: the interview input, the parent-task confirmation, and the final next-action choice (step-04). The user says "stop" or "revise X" to loop back.
- **Speak in prose, write markdown to the file.** Talk to the user in short prose in their language; do NOT dump the raw brief/tasks markdown into the chat - write it to the file and report a one-line recap per artifact.
- **Readability of the brief.** The produced `brief.md` opens with a `## En bref` TL;DR (3 lines), keeps acceptance criteria as a scannable `- [ ]` checklist, and a success metric with baseline -> target -> window. Best practice: the "why" leads, the doc is skimmable in 10 seconds.
</interaction>
