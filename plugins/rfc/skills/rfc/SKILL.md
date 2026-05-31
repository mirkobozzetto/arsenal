---
name: rfc
description: Multi-step RFC (Request For Comments) workflow for Claude Code. Forces reasoning before action — problem → alternatives → tradeoffs → design → risks → recommendation → impl plan. Use when user says "RFC", "écris un RFC", "design doc", "propose a", "before implementing", or when decision crosses a boundary (system/team/version). Integrates GitNexus codebase context, Exa research, adversarial review subagent.
argument-hint: "<short title> [--auto] [--scope <path>] [--no-review] [--out <dir>]"
---

<objective>
Produce a complete RFC document via 10 disciplined micro-steps. Each step focuses on one phase, persists state in frontmatter, and never converges to a plan before alternatives + tradeoffs are explicit.
</objective>

<when_to_use>
- Decision crosses a boundary: between systems, teams, versions, or expectations
- Architecture choice, migration, system-wide refactor, new pattern
- Multiple valid solutions exist → wrong direction = expensive rework
- User wants reasoning preserved, not only the final plan

**Don't use for:** trivial refactors, single-file fixes, doc-only changes. Use `ship` or direct edit instead.
</when_to_use>

<parameters>
- `<short title>` — RFC title (required). Used to generate slug.
- `--auto` — skip AskUserQuestion confirmations between steps
- `--scope <path>` — limit codebase context gathering to a path (default: repo root)
- `--no-review` — skip step-08 adversarial review
- `--out <dir>` — output dir (default: `docs/rfcs/` if git repo, else `~/.claude/rfcs/`)
</parameters>

<state_variables>
- `rfc_id`: 4-digit zero-padded (0001, 0002, ...)
- `rfc_slug`: kebab-case from title
- `rfc_dir`: absolute path `<out>/NNNN-slug/`
- `rfc_path`: `<rfc_dir>/RFC.md`
- `auto_mode`: boolean
- `scope_path`: path for codebase exploration
- `skip_review`: boolean
- `status`: Draft | Review | Accepted | Rejected
- `context_collected`: object — symbols, files, prior art from GitNexus/grep
- `problem`, `motivation`: strings
- `alternatives`: array of `{name, summary, pros, cons}`
- `design`: object — architecture, data model, API, modules touched
- `drawbacks`, `risks`, `open_questions`: arrays
- `recommendation`: string + rationale
- `impl_plan`: ordered task list
- `review_findings`: array (from step-08)
- `stepsCompleted`: array — tracks progress in frontmatter
</state_variables>

<entry_point>
Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | steps/step-00-init.md | Parse args, create RFC dir, init frontmatter |
| 01 | steps/step-01-context.md | Gather codebase context (GitNexus + grep) |
| 02 | steps/step-02-problem.md | Define problem statement + motivation (interview) |
| 03 | steps/step-03-alternatives.md | Surface alternatives + tradeoffs |
| 04 | steps/step-04-design.md | Proposed design — modules, data, API |
| 05 | steps/step-05-risks.md | Drawbacks, risks, unknowns |
| 06 | steps/step-06-recommendation.md | Recommendation + rationale |
| 07 | steps/step-07-impl-plan.md | Implementation plan (ordered tasks) |
| 08 | steps/step-08-review.md | Adversarial review via subagent (optional) |
| 09 | steps/step-09-finalize.md | Finalize, set status, summarize |
</step_files>

<references>
| File | Content |
|------|---------|
| references/rfc-template.md | Markdown template — 11 sections |
| references/interview-questions.md | Question bank per step (problem, alternatives, design) |
</references>

<integrations>
- **GitNexus** — `mcp__gitnexus__query`, `mcp__gitnexus__context`, `mcp__gitnexus__impact` for codebase exploration
- **Exa** — `mcp__exa__web_search_exa`, `mcp__exa__get_code_context_exa` for prior art / industry patterns
- **Subagents** — `Agent(subagent_type=general-purpose)` for adversarial review (step-08)
- **brain skill** — optional save to Obsidian vault after acceptance
</integrations>

<critical>
RFC ≠ Plan. NEVER converge to implementation before alternatives + tradeoffs are written. Plan mode = biased toward action. RFC slows agent down in the right place. If user says "just plan it", redirect to `ship` skill — RFC is for boundary-crossing decisions only.
</critical>
