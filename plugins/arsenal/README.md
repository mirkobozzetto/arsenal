# arsenal

One entry point for Claude Code and Codex. Arsenal chooses and applies installed
skills; the specialist skills remain the source of their own procedures.

## Usage

| Claude Code | Codex |
|---|---|
| `/arsenal` | `$arsenal` |
| `/arsenal implement the agreed login flow` | `$arsenal implement the agreed login flow` |
| `/arsenal compare storage options, no code` | `$arsenal compare storage options, no code` |

Without a description, a small native form clarifies the goal and desired action.
If the runtime cannot show a form, Arsenal asks the same questions in conversation.
With a description, it uses existing context and asks only what changes the route.

## Routing

- Unresolved product specification: brief.
- Consequential technical decision: propose.
- Clear authorized implementation: ship.
- External evidence: websearch.
- GitHub issue memory: issue.
- Open work: next. Activity history: trace.
- Requested phased planning: the optional roadmap workflow.

Arsenal reads each selected SKILL.md before applying it, loads only necessary
references and carries decisions, artifact paths and permissions between steps.
It can use other installed Arsenal skills by matching their declared purpose.
It reassesses after each result instead of imposing a fixed pipeline.

Advice stops at advice. Proposal acceptance, issue confirmations, Git delivery
and delegation keep their approval gates. A completed task stays completed.

## Install

Follow the [shared installation instructions](../../README.md#quick-install).
Arsenal and its specialists are separate plugins: install the ones you need.
The router reports missing skills; it does not install them automatically.
Both runtimes use the same skill files through their native plugin manifests.

## Optional roadmap and agents

Request a roadmap explicitly, or use `-r <slug>` to resume
`docs/roadmap/<slug>/roadmap.md`. Existing phases and the six-section schema
are preserved. `--html` requests the bundled offline renderer.
A roadmap request does not authorize implementing its phases.

Work stays solo. `-a` allows assumptions, not extra permissions;
`--no-agents` explicitly retains solo mode. Approved independent research can
use the existing adapters and read-only agents, at most three.

Agent installation is a separate explicit action:
`--install-omp-agents` or `--install-codex-agents`.
Matching `--uninstall-*` actions restore backed-up files.
Routing never installs agents or changes models.

## Manual routing checks

Use fresh conversations in each runtime; these are expected outcomes, not
a claim of measured performance.

| Request or state | Expected behavior |
|---|---|
| Arsenal, no context | Ask goal and action; wait for answers |
| Clear small fix | Read ship; no brief or proposal |
| Product requirements uncertain | Clarify; brief if a durable specification is needed |
| Unresolved storage architecture | Read propose; wait for acceptance before implementation |
| Accepted proposal, implement it | Read ship and exact artifact; no repeated interview |
| Compare current tools, no code | Read websearch; cited answer, no implementation |
| Save this bug as an issue | Read issue; retain creation confirmation |
| Show unfinished work | Read next; report, do not resume |
| Fix issue #42 | Read issue context, then ship if actionable and authorized |
| Required skill absent | Report gap; no fabricated skill invocation |
| Shipped artifact or unchanged blocker | Stop; do not rerun completed steps |
| Explicit phased roadmap | Use existing schema; HTML only on request |

Observe selected skills, unnecessary questions, approval violations and outcome.
Measure duration and tokens only from actual runtime evidence, not estimates.
