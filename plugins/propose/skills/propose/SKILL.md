---
name: propose
description: Design workflow in the RFC tradition. Forces reasoning before action: problem → alternatives → tradeoffs → design → risks → recommendation → impl plan. Two sizes with hard ceilings: one page for a bounded choice, a few pages for a real design question. Use when user says "propose", "write a proposal", "design doc", "RFC", "before implementing", or when a decision is expensive to undo. Integrates GitNexus codebase context, Exa research, adversarial review subagent.
argument-hint: "<short title> [--auto] [--scope <path>] [--no-review] [--out <dir>]"
---

<objective>
Produce a complete proposal document via 10 disciplined micro-steps. Each step focuses on one phase, persists state in frontmatter, and never converges to a plan before alternatives + tradeoffs are explicit.
</objective>

<when_to_use>
- Decision crosses a boundary: between systems, teams, versions, or expectations
- Architecture choice, migration, system-wide refactor, new pattern
- Multiple valid solutions exist → wrong direction = expensive rework
- User wants reasoning preserved, not only the final plan

**Don't use for:** trivial refactors, single-file fixes, doc-only changes. Use `ship` or direct edit instead.
</when_to_use>

<formats>
The document is sized to the decision it carries. `step-00` settles the
format; every later step writes only the sections its format owns, and
`step-09` enforces the ceiling.

| Format | Sections | Ceiling | For |
|---|---|---|---|
| `short` | 1, 5, 6, 7, 10 | 80 lines | one reversible decision, one system |
| `propose` | 1, 3, 4, 5, 6, 7, 9, 10 | 250 lines | a change inside one system |
| `full` | 1-11 | 600 lines | crosses systems, teams or versions |

Section NUMBERS are stable across formats: a short format is a subset of
the canonical numbering, never a renumbering. That is what keeps `ship`
working on all three without changes.

Over the ceiling means the SUBJECT is too wide: split it. Never compress
the prose to fit. A section with nothing real to say is deleted, not filled
with a placeholder or an invented risk.
</formats>

<parameters>
- `<short title>`: proposal title (required). Used to generate slug.
- `--short` / `--full`: force the format (default: asked in step-00)
- `--auto`: skip AskUserQuestion confirmations between steps
- `--scope <path>`: limit codebase context gathering to a path (default: repo root)
- `--no-review`: skip step-08 adversarial review
- `--out <dir>`: output dir (default: `docs/proposals/` if git repo, else `~/.claude/proposes/`)
</parameters>

<state_variables>
- `proposal_id`: 4-digit zero-padded (0001, 0002, ...)
- `proposal_slug`: kebab-case from title
- `proposal_dir`: absolute path `<out>/NNNN-slug/`
- `proposal_path`: `<proposal_dir>/PROPOSAL.md`
- `auto_mode`: boolean
- `scope_path`: path for codebase exploration
- `skip_review`: boolean
- `status`: Draft | Review | Accepted | Rejected
- `context_collected`: object (symbols, files, prior art from GitNexus/grep)
- `problem`, `motivation`: strings
- `alternatives`: array of `{name, summary, pros, cons}`
- `design`: object (architecture, data model, API, modules touched)
- `drawbacks`, `risks`, `open_questions`: arrays
- `recommendation`: string + rationale
- `impl_plan`: ordered task list
- `review_findings`: array (from step-08)
- `stepsCompleted`: array (tracks progress in frontmatter)
</state_variables>

<entry_point>
Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | steps/step-00-init.md | Parse args, create proposal dir, init frontmatter |
| 01 | steps/step-01-context.md | Gather codebase context (GitNexus + grep) |
| 02 | steps/step-02-problem.md | Define problem statement + motivation (interview) |
| 03 | steps/step-03-alternatives.md | Surface alternatives + tradeoffs |
| 04 | steps/step-04-design.md | Proposed design: modules, data, API |
| 05 | steps/step-05-risks.md | Drawbacks, risks, unknowns |
| 06 | steps/step-06-recommendation.md | Recommendation + rationale |
| 07 | steps/step-07-impl-plan.md | Implementation plan (ordered tasks) |
| 08 | steps/step-08-review.md | Adversarial review via subagent (optional) |
| 09 | steps/step-09-finalize.md | Finalize, set status, summarize |
</step_files>

<references>
| File | Content |
|------|---------|
| references/proposal-template.md | The three formats, stable section numbering, size ceilings, FR/EN title mapping |
| references/interview-questions.md | Question bank per step (problem, alternatives, design) |
</references>

<integrations>
- **GitNexus**: `mcp__gitnexus__query`, `mcp__gitnexus__context`, `mcp__gitnexus__impact` for codebase exploration
- **Exa**: `mcp__exa__web_search_exa`, `mcp__exa__get_code_context_exa` for prior art / industry patterns
- **Subagents**: `Agent(subagent_type=general-purpose)` for adversarial review (step-08)
- **brain skill**: optional save to Obsidian vault after acceptance
</integrations>

<interaction>
- **Default is interactive. Ask, do not infer.** Without `--auto`, the real input questions (problem, scope, goals/non-goals, alternatives direction, design choices) MUST be asked via AskUserQuestion. NEVER infer or assume an answer the user can give. Inference is allowed ONLY when `auto_mode` is true. "AskUserQuestion or infer" anywhere in the steps means: ask; infer only under `--auto`.
- **Input questions vs proceed-confirmations.** Keep asking for INPUT (what the user decides). Do NOT gate the user with empty "continue to the next step?" confirmations between steps - real proposal practice (Rust, Oxide, Google, decision record) has the author write the whole doc then others review; it never asks the author for permission to proceed. Default: flow to the next step and state in one line what was written; the user says "stop" or "revise X" to loop back. The genuine decision points stay: the adversarial review findings (step-08) and the final status (step-09).
- **Speak in prose, write markdown to the file.** Talk to the user in short prose, in the conversation language. Do NOT dump the raw section markdown destined for PROPOSAL.md into the chat; write it to the file and report one line per section.
- **Language.** Converse and write the proposal in the conversation language (French if the user writes French) - prose AND titles, `##` and `###` alike. A document half in one language and half in the other is the single worst readability defect this skill had. Keep in English, and only these: frontmatter keys/values, the `slug`, the section NUMBERS, the column headers of the section 10 task table, the `graph TD` block, and code identifiers. The number is the anchor ship and next parse, not the title (`ship/steps/step-01-ingest.md:90`); the FR title mapping is in `references/proposal-template.md`.
</interaction>

<critical>
proposal ≠ Plan. NEVER converge to implementation before alternatives + tradeoffs are written. Plan mode = biased toward action. proposal slows agent down in the right place. If user says "just plan it", redirect to `ship` skill: proposal is for boundary-crossing decisions only.
</critical>
