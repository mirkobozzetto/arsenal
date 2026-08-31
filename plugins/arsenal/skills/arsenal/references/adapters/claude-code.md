# Claude Code Adapter

Detect Claude Code from documented session metadata or Claude-owned runtime
capabilities. Do not infer it from an Anthropic model name.

- Plugin agents are loaded from `agents/*.md`. Map semantic names to
  `arsenal:arsenal-product-scout`, `arsenal:arsenal-harness-analyst`, and
  `arsenal:arsenal-adversarial-reviewer` because plugin agents are scoped.
- Claude user agents with the same name take precedence.
- The plugin files request `haiku` for fast and `sonnet` for balanced.
- If a requested agent is unknown or its model is unavailable, rerun the unit
  in the lead.
- Product and harness research may use any available read-only web capability.
- Record resolved model from runtime metadata when exposed. Otherwise record
  the model requested by the native file and provenance `agent-file`.
- Format resume as `/arsenal -r <slug>` only when the command is available.
