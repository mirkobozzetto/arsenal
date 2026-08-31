---
name: arsenal
description: Clarify a fuzzy project idea into a phased roadmap through a Socratic interview, capability-aware research, and adversarial review. Use for roadmap discovery, product direction, or deciding what to build before brief, proposal, or implementation work.
compatibility: Python 3 is required only for HTML rendering. Network access and subagents are optional; the complete workflow has a solo fallback.
metadata:
  version: "1.2.0"
---

<objective>
Turn a vague idea into a clear phased roadmap the user believes in. Interview
first, research existing solutions, draft the smallest useful sequence, review
it adversarially, and render one durable roadmap artifact.
</objective>

<parameters>
| Flag | Description |
|------|-------------|
| `-a` / `--auto` | Infer interview answers from the idea |
| `-r` / `--resume` | Reopen an existing roadmap for discussion |
| `--no-agents` | Force the complete solo workflow |
| `--install-omp-agents` | Explicitly install bundled OMP agents |
| `--install-codex-agents` | Explicitly install bundled Codex agents |
| `--uninstall-omp-agents` | Restore or remove installed OMP agents |
| `--uninstall-codex-agents` | Restore or remove installed Codex agents |

The remaining input is the project idea or resume slug.
</parameters>

<state_variables>
| Variable | Type | Set by |
|----------|------|--------|
| `{idea}` | string | step-00-init |
| `{slug}` | string | step-00-init |
| `{auto_mode}` | boolean | step-00-init |
| `{resume_mode}` | boolean | step-00-init |
| `{force_solo}` | boolean | step-00-init |
| `{roadmap_dir}` | string | step-00-init |
| `{capabilities}` | object | step-00-init |
| `{answers}` | object | step-01-interview |
| `{research}` | array | step-02-research |
| `{execution_trace}` | array | steps 02 and 03 |
| `{stepsCompleted}` | array | every step |
</state_variables>

<delimitation>
- Arsenal decides what is worth building and in which order.
- It does not write a product brief, technical proposal, or implementation.
- The workflow hands off through semantic next actions. Harness adapters format
  any concrete command shown to the user.
</delimitation>

<entry_point>
**FIRST ACTION:** Load `steps/step-00-init.md`.
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | `steps/step-00-init.md` | Parse input and detect capabilities |
| 01 | `steps/step-01-interview.md` | Find the real objective |
| 02 | `steps/step-02-research.md` | Research through available capabilities |
| 03 | `steps/step-03-plan.md` | Draft and adversarially review the roadmap |
| 04 | `steps/step-04-render.md` | Render the HTML deliverable |
| 05 | `steps/step-05-discuss.md` | Re-discuss, finalize, and hand off |
</step_files>

<references>
- `references/capability-contract.md`: probe and fallback contract.
- `references/agent-contracts.md`: bounded agent inputs and outputs.
- `references/adapters/`: harness-specific discovery and routing.
- `scripts/install_agents.py`: explicit OMP and Codex agent installation.
- `scripts/render.py`: offline, cross-platform HTML renderer.
</references>

<interaction>
- The interview is interactive unless `--auto` is present.
- Ask one plain-text question at a time.
- Use the conversation language for chat and the roadmap. Keep versioned
  repository content, identifiers, commands, and frontmatter keys in English.
- The lead owns interpretation, scope, synthesis, roadmap writing, and final
  discussion. Agents never question the user or write the roadmap.
</interaction>

<critical>
- Resolve research, delegation, and rendering as semantic capabilities. Never
  require a particular tool name in the portable core.
- Delegate only two or more independent, read-only units. Maximum fan-out is
  three. Run the same contracts sequentially in the lead when delegation is
  unavailable.
- Preserve the roadmap schema and resume behavior. Optional execution trace
  metadata is additive.
- Never modify global user configuration automatically. Agent installation is
  explicit and reversible.
- Rendering the HTML is mandatory. Opening a browser is optional.
- Write only `docs/roadmap/<slug>/roadmap.md` during a normal workflow.
</critical>
