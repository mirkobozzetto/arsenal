---
name: ship
description: Execute a predetermined spec. Ingests a finalized brief (docs/brief/<slug>/ with brief.md status ready + tasks.md) or an Accepted propose (PROPOSAL.md), locks a definition-of-done contract, implements it on the strongest available engine (agent-teams / subagents / solo, with ultracode awareness), keeps a tight leash with minimal risk-boundary checkpoints, and hands back a user-run verification bundle plus a trace ledger. For a bare prompt with no spec, ship derives a minimal inline execution contract then ships it. Triggers on "ship this", "ship the brief", "implement the brief", "execute the proposal", "build from tasks.md", "run the spec", "implement this". The universal implementer; it does NOT author the durable product/technical spec (that is brief and propose). Never runs build/test toolchain by default.
argument-hint: "<docs/brief/<slug>/ | path/to/PROPOSAL.md> [-a] [-e] [-r] [--yolo] [-m teams|subagents|solo] [-h]"
allowed-tools:
  - TeamCreate
  - TeamDelete
  - TaskCreate
  - TaskUpdate
  - TaskList
  - TaskGet
  - SendMessage
  - Agent
  - AskUserQuestion
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

<objective>
Execute a locked upstream spec end to end. ship consumes EITHER a finalized brief folder or an Accepted propose, builds a dependency DAG straight from the artifact, locks a definition-of-done contract, implements it on a capability-detected engine, and emits a verification bundle the USER runs plus a trace ledger that survives context reset. ship authors zero product or spec work and never runs build/test toolchain by default.
</objective>

<parameters>
| Flag | Long | Description |
|------|------|-------------|
| `-h` | `--help` | Show usage guide (references/help-text.md) and exit |
| `-a` | `--auto` | Skip non-safety confirmations, auto-pick Recommended (DB/destructive ops still ask) |
| `-e` | `--economy` | Force solo tier, no fan-out, save tokens |
| `-r` | `--resume` | Resume from an existing trace.md (stepsCompleted) |
| `--yolo` | | After listing the commands and how they run, ship may run the SAFE verification commands itself to completion (destructive/DB/deploy stay user-only) |
| `-m <tier>` | `--mode <tier>` | Force engine tier: `teams` / `subagents` / `solo` (overrides the probe) |
| | `--no-commit` | Disable per-task progressive commits (default is ON: one commit per finished trace unit) |
| | `--tasks <ids>` | Run only these spec tasks (`T01-T06`, `T01,T04`, `1.0-3.0`). Scopes the run; its ledger is kept separate so parallel scoped runs never collide |

**Parsing:** Defaults from `steps/step-00-init.md`. Flags override. Remainder of input = the artifact path (a `docs/brief/<slug>/` folder OR an `PROPOSAL.md`).
</parameters>

<state_variables>
| Variable | Type | Set by |
|----------|------|--------|
| `{triage_mode}` | enum(brief,propose,inline) | step-00-triage |
| `{artifact_path}` | string\|null | step-00-triage |
| `{artifact_kind}` | enum(brief,propose,inline) | step-00-triage |
| `{auto_mode}` | boolean | step-00-init |
| `{economy_mode}` | boolean | step-00-init |
| `{resume_mode}` | boolean | step-00-init |
| `{yolo_mode}` | boolean | step-00-init |
| `{engine_override}` | enum(teams,subagents,solo)\|null | step-00-init |
| `{commit_mode}` | boolean | step-00-init (default true; `--no-commit` -> false) |
| `{task_filter}` | array\|null | step-00-init (`--tasks`) |
| `{run_id}` | string | step-00-init (`""` for a whole-spec run, else `-<scope>`) |
| `{work_branch}` | string\|null | step-02-plan (branch checkpoint) |
| `{project_root}` | string | step-00-init |
| `{output_dir}` | string | step-00-init |
| `{detected_stack}` | object | step-01-ingest |
| `{tasks}` | array | step-01-ingest |
| `{contract_path}` | string | step-02-plan |
| `{independent_groups}` | array | step-02-plan |
| `{engine_tier}` | enum(teams,subagents,solo) | step-03-engine |
| `{ultracode_signal}` | enum(on,off,unknown) | step-03-engine |
| `{team_name}` | string\|null | step-04-execute |
| `{trace_path}` | string | step-04-execute |
| `{bundle_path}` | string | step-05-verify |
| `{final_status}` | enum(shipped,halted,rejected) | step-04 / step-05 |
| `{stepsCompleted}` | array | every step |
</state_variables>

<delimitation>
- `ship` != `brief`: brief produces the durable product spec (what/why) + tasks. ship consumes it; it never interviews or authors a brief.
- `ship` != `propose`: propose produces the technical design (how). ship consumes an Accepted proposal; it never designs.
- ship is the IMPLEMENTER: terminal of the chain `brief -> propose -> ship`, and the direct executor of a bare prompt via a minimal inline contract (a task list + acceptance items, never a full brief).
</delimitation>

<input_contract>
Auto-detected by artifact shape (set in step-00-triage, parsed in step-01-ingest):

- CASE A (brief): a `docs/brief/<slug>/` folder. RUN-GATE = `brief.md` frontmatter `status: ready` (set by brief step-04). The `tasks.md` "Do NOT implement" line is a PROHIBITION on brief, NOT an authorization token: never treat its presence as a gate. Parse `tasks.md` (frontmatter `type: tasks`, `## Relevant Files`, the `## Tasks` nested checklist `- [ ] N.0` parents / `- [ ] N.x` sub-tasks); follow `source_brief` to `brief.md` for the WHY (Acceptance criteria, Success metrics, Out-of-scope = never build). The checkbox ledger is reconciled from trace.md exactly once, at finish (step-06): a shipped run with its criteria satisfied flips the done tasks `[ ] -> [x]`, no per-unit confirm.
- CASE B (propose): an `PROPOSAL.md`. RUN-GATE = frontmatter `status: Accepted` (Draft / Review / Rejected -> refuse + HALT). Build the DAG from section 10 Implementation Plan task table (ID, title, files, deps, effort, accept) cross-checked with the `graph TD` Mermaid; Accept column = done, Files column = edit scope. Read section 6 Proposed Design for HOW, resolve section 11 BLOCKER/MAJOR findings first, sections 7-8 for hazards. NEVER mutate an Accepted PROPOSAL.md: propose progress lives only in ship's trace.md.
- CASE C (inline): a bare prompt with no artifact => ship offers a choice: ship direct, or write brief/propose first. On "ship direct" it runs a short prompt-creator-structured interview (context / task / requirements / success), builds a minimal contract (task list + 2-5 acceptance items), confirms it (your OK is the run-gate), then executes. Never a full brief.
- Disambiguation: nested `- [ ] N.0/N.1` => brief; flat `| T0n |` task table => propose; no artifact => inline.
</input_contract>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-triage.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00t | `steps/step-00-triage.md` | --help; classify input (brief-folder / PROPOSAL.md / bare-prompt -> inline); route |
| 00 | `steps/step-00-init.md` | Parse flags, resolve paths + output_dir, detect resume |
| 01 | `steps/step-01-ingest.md` | Read spec, apply run-gate, parse tasks/DAG, detect stack |
| 02 | `steps/step-02-plan.md` | DAG -> independent groups + serialization sets; write contract.md |
| 03 | `steps/step-03-engine.md` | Capability probe -> select tier; engine-confirm; ultracode suggestion |
| 04 | `steps/step-04-execute.md` | Implement on the tier; risk-boundary checkpoints; mutate trace ledger |
| 05 | `steps/step-05-verify.md` | Read-only self-checks; write verification-bundle.md + trace.md |
| 06 | `steps/step-06-finish.md` | Team shutdown, handoff, git-guard; MANDATORY on every path |
</step_files>

<references>
| File | Content |
|------|---------|
| `references/help-text.md` | Full usage guide shown by --help |
| `references/guardrails.md` | Irreversible-op hazard list + the Bash boundary |
| `references/role-templates.md` | Teammate constraint floor + per-tier worker prompts |
| `templates/contract.md` | Definition-of-done scaffold |
| `templates/verification-bundle.md` | User-run command list scaffold |
| `templates/trace.md` | Per-task ledger scaffold (single source of truth) |
| `templates/state.yaml` | Full state shape for resume |
| `scripts/detect-stack.sh` | Deterministic toolchain detection: lockfile/manifest -> JSON {language, package_manager} |
| `scripts/scaffold.sh` | Seed contract.md / verification-bundle.md / trace.md from templates into the output dir |
</references>

<output_discipline>
A check that PASSES is silent. Never narrate the run-gate, the task filter,
the detected stack, the satisfied dependencies, the single-repo check, or any
step's success metrics: they land in trace.md, where the user reads them if
he wants to.

ship writes only for three reasons:
1. it needs a decision (ask it, nothing else around it),
2. it refuses to go further (say why, and what unblocks it),
3. work landed (what was done, what is left).

No preamble, no recap of what the user already knows, no restating the spec
back at him. If a sentence would not change what he does next, delete it.
</output_discipline>

<critical>
- NEVER re-author product or spec work. ship only executes the artifact.
- NEVER run build/test/typecheck toolchain by default. Emit a user-run bundle. `--yolo` runs only SAFE commands, after listing them; DB/destructive/deploy stay user-only ALWAYS.
- NEVER set effort/ultracode itself. It detects/suggests; the user toggles via /effort.
- NEVER mutate an Accepted PROPOSAL.md. trace.md is the single progress source.
- NEVER hardcode a toolchain (pnpm/Node). Detect the stack; ask when unknown.
- NEVER use `rm -rf`. Use `trash`. NEVER modify a database without explicit approval.
- Cleanup (step-06) is MANDATORY on every path (shipped / halted / rejected).
- Prose in English; identifiers in English. Web via Exa MCP only.
- Git policy: progressive commits are part of the flow. One branch checkpoint at step-02 (create `ship/<slug>` or stay), ONE commit authorization for the whole run (the grant), then one commit per finished trace unit (`git add` of that unit's files only, Conventional Commits, no Claude signature). NEVER push. A PR happens only through the step-06 user-story validation gate.

</critical>
