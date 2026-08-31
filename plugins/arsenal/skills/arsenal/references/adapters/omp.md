# OMP Adapter

Detect OMP from OMP-owned runtime capabilities or internal resource schemes.
Do not infer it from the active model.

- Native agents must exist under `~/.omp/agent/agents/` or a project
  `.omp/agents/` directory. Claude plugin discovery alone does not count as
  native Arsenal agent installation.
- Dispatch sets only the agent name. Never invent a task-level model field.
- Model precedence is `task.agentModelOverrides[agentName]`, agent
  frontmatter, then parent. Expand role aliases through `modelRoles`.
- Bundled templates request `openai-codex/gpt-5.6-luna` for fast and
  `openai-codex/gpt-5.6-terra` for balanced.
- Use frontmatter `output` for structured results when supported.
- Prove the resolved model from Agent Hub, transcript, or session metadata.
  An alias or agent file alone is insufficient proof.
- If native agents, authentication, or proof are missing, run solo.
- Format resume as `/arsenal -r <slug>` only when routed by the harness.
