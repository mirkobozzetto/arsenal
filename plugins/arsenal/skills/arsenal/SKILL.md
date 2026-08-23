---
name: arsenal
description: Clarify a fuzzy project idea into a phased roadmap through a Socratic interview. Asks what the objective really is, one question at a time, researches how others solved it (Exa), then writes docs/roadmap/<slug>/roadmap.md and opens it as a styled HTML page with a wireframe mockup and copy-paste command blocks. Re-discussable in place; hands off to /brief or /ship. Triggers on "roadmap", "what should we build", "I have an idea but it's vague", "help me figure out the objective", "clarify this idea", "arsenal", "où on va avec ce projet", "je ne sais pas par où commencer". NOT brief (that specs a defined feature), NOT propose (that designs a decided change), NOT code-roadmap (that routes to skills).
argument-hint: "<project idea> [-a auto] [-r resume <slug>]"
allowed-tools:
  - AskUserQuestion
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

<objective>
Turn a vague idea into a clear, phased roadmap the user believes in. arsenal
interviews first (the objective is the deliverable of the conversation, not
an input), researches how existing products solved the same problem, then
writes ONE durable artifact (roadmap.md) and renders it to an HTML page with
a wireframe mockup and the exact commands to run per phase. The roadmap is
upstream of everything: it feeds /brief (spec one feature) or /ship.
</objective>

<parameters>
| Flag | Description |
|------|-------------|
| `-a` / `--auto` | Skip the interview loop gates, infer from the idea (NOT recommended for truly vague ideas) |
| `-r` / `--resume` | Reopen an existing docs/roadmap/<slug>/ for re-discussion |

Remainder of input = the project idea (free text) or the slug to resume.
</parameters>

<state_variables>
| Variable | Type | Set by |
|----------|------|--------|
| `{idea}` | string | step-00-init |
| `{slug}` | string | step-00-init |
| `{auto_mode}` | boolean | step-00-init |
| `{resume_mode}` | boolean | step-00-init |
| `{roadmap_dir}` | string | step-00-init (docs/roadmap/<slug>/) |
| `{answers}` | object | step-01-interview |
| `{research}` | array | step-02-research |
| `{stepsCompleted}` | array | every step |
</state_variables>

<delimitation>
- `arsenal` != `brief`: brief specs ONE defined feature (stories, metrics,
  tasks). arsenal decides WHAT is worth building and in which order.
- `arsenal` != `propose`: propose designs a decided technical change.
- `arsenal` != `code-roadmap`: that one routes to skills; this one shapes
  the product objective itself.
- Chain: `arsenal -> brief -> propose -> ship`. arsenal never implements.
</delimitation>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse flags, slugify, detect resume |
| 01 | `steps/step-01-interview.md` | Socratic interview: objective, users, minimal version, constraints |
| 02 | `steps/step-02-research.md` | Exa research: how others solved it, cited |
| 03 | `steps/step-03-plan.md` | Write roadmap.md: phases, commands, mockup |
| 04 | `steps/step-04-render.md` | Render + open the HTML deliverable |
| 05 | `steps/step-05-discuss.md` | Re-discussion loop; finalize; handoff |
</step_files>

<references>
| File | Content |
|------|---------|
| `scripts/render.py` | Markdown -> styled HTML page (status banner, TOC, mermaid), opens in browser |
</references>

<interaction>
- Default is interactive: the interview IS the product. Never infer the
  objective without `-a`.
- One question at a time in the interview; never a wall of questions.
- Converse in the conversation language; the roadmap artifact is written in
  the conversation language too (frontmatter keys/values, slug and code
  identifiers stay English).
- Never dump the raw markdown into chat: write the file, render the HTML,
  report one line.
</interaction>

<critical>
- The interview digs for the REAL objective: ask non-obvious questions that
  surface assumptions, never feature checklists.
- Research goes through Exa MCP only (no native WebSearch/WebFetch);
  every inspiration in the roadmap is cited with its URL.
- The HTML render at finalize is MANDATORY: the page is the deliverable,
  raw markdown is storage.
- The roadmap stays re-discussable: `-r <slug>` reopens the loop, edits the
  same artifact, re-renders. Never fork a second roadmap for the same idea.
- arsenal writes docs/roadmap/<slug>/roadmap.md and NOTHING else in the
  repo. No code, no scaffolding.
</critical>
