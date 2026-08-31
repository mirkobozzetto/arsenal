# Codex Adapter

Detect Codex from Codex-owned session metadata or runtime capabilities. Do not
infer it from an OpenAI model name.

- Native agents must exist under `~/.codex/agents/` or project
  `.codex/agents/`. Map semantic names to `arsenal_product_scout`,
  `arsenal_harness_analyst`, and `arsenal_adversarial_reviewer`.
- Agent-file model settings override agent defaults and the parent model.
- Bundled templates request `gpt-5.6-luna` for fast and
  `gpt-5.6-terra` for balanced.
- All native agents set `sandbox_mode = "read-only"`.
- Parse the final agent response against the contract JSON schema.
- If native agents or authentication are missing, run solo.
- Record the model from spawn metadata when exposed. Otherwise use the native
  file value with provenance `agent-file`.
- Format resume as `arsenal -r <slug>` when slash commands are unavailable.
