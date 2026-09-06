---
name: arsenal
description: Use when the user invokes Arsenal, needs help choosing an approach, or wants an end-to-end task handled with the installed Arsenal skills.
---

# Arsenal

One entry point, the shortest sufficient workflow. Read and apply selected
skills; do not reproduce their procedures here. Work solo by default.

## Start

Load steps/step-00-init.md. Keep the objective, scope, constraints, decisions,
artifact paths, permissions and remaining questions in conversation.
Reuse existing artifacts; no mandatory orchestration file or roadmap.

With no description, ask what outcome the user wants and whether they want
advice, a document, or implementation. Use the runtime's native question form
when available and permitted in the active mode; otherwise ask in plain text.
Wait for the answer: a preselected option is not submitted consent.

With a description, inspect supplied context and relevant project instructions
first. Ask only missing questions that could change the route, scope or safety.
Use small adaptive batches, not a fixed questionnaire or complexity score.
Existing answers and accepted artifacts are not another interview.

## Choose the next useful step

Use the live installed skill inventory, including actual names and paths.
These routes express intent, not a required sequence or proof of installation:

| Evidence or requested outcome | Next step |
|---|---|
| Product outcome, audience or scope needs a durable specification | brief |
| Consequential technical choice remains unresolved | propose |
| Clear implementation request or approved implementation artifact | ship |
| External facts are needed to answer the current question | websearch |
| Save, update, read or resume a specific GitHub issue | issue |
| Discover unfinished work | next |
| Read project activity or explicitly record progress | trace |
| Explicit phased roadmap or genuine multi-workstream sequencing | Roadmap below |

For another installed Arsenal skill, match its declared purpose to the missing
result. Do not route back to Arsenal.
A bug does not imply a GitHub issue; a large change does not imply a brief.
A short clarification can resolve uncertainty without creating a document.
For advice-only requests, recommend the shortest path and stop before execution.

## Apply, then reassess

1. Name the selected skill and the concrete reason in one short update.
2. Resolve it from the live inventory and read its complete SKILL.md before
   acting. Load only the linked references/scripts required by that skill.
   Resolve relative resources from that skill's directory, never Arsenal's.
   Plugins may be installed separately; do not guess sibling cache paths.
3. Pass the current objective, constraints, decisions, artifacts, authorizations
   and unknowns into the step. Follow its actual instructions, not its summary.
4. When it returns a result, update that context and reassess what remains.
   Continue only inside the user's original authorized outcome. Child skills
   do not launch one another; Arsenal owns the transition.

Missing or unreadable skill: state the gap. Do not claim to have used it or
silently install it. Offer installation or a clearly labeled native fallback;
stop if the missing capability is essential. No whole-config scan by default.

Standalone stop rules end that skill's step, not an already authorized broader
Arsenal task. They never waive approval gates: a proposal remains Draft/Review
until explicitly accepted; ship requires a ready brief or Accepted proposal
when consuming one. Analysis is not permission to implement. Issue creation,
closure, commits, pushes, installs and delegation retain their approval rules.
If a selected skill explicitly forbids the required transition, stop and ask.

Stop when the outcome is delivered, approval is needed, the user stops, or a
step cannot progress. No repeated unchanged route, redoing completed work,
automatic reviewers, model retuning or ceremonial launch confirmations.

## Optional efficiency plugins

With Espresso or another efficiency plugin, Arsenal still owns routing and
the selected skill retains its approval gates, specialized agents, model
assignments, schemas, artifacts and verification. An automatic delegation
setting does not waive these rules or authorize a competing team/reviewer.
Use the stricter applicable scope and concurrency limit. No plugin is required;
without one, the workflow is unchanged. Never install one as a routing side effect.

## Optional roadmap and configuration

For a requested roadmap or `-r <slug>`, read the existing roadmap if present
and steps/step-03-plan.md. Preserve its schema and finished phases. Research
only unresolved external questions through websearch when available.
Render scripts/render.py only for `--html` or an explicit request. Mark ready
when approved; a roadmap request alone does not authorize implementation.

`-a` permits explicit assumptions, not new permissions; `--no-agents` stays solo.
Any delegation requires consent, references/agent-contracts.md and the matching
adapter; at most three independent read-only units, no nested delegation.
Explicit `--install-omp-agents`, `--install-codex-agents` and matching
`--uninstall-*` actions use scripts/install_agents.py with backups, then stop.
Never install agents as a side effect of routing.
