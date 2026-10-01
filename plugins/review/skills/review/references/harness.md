# Launching readers in each harness

One generic read-only reader, launched once per angle. The model and the
thinking level are passed at launch, never through temporary agent files:
Claude Code does not reliably reload agent files during a session
(anthropics/claude-code#75432).

| Harness | Reader | Model at launch | Thinking level | Providers |
|---|---|---|---|---|
| Claude Code | `review:review-reader`; until Claude Code restarts after the install, the builtin read-only `Explore` with the reader instructions in the prompt | `model` of the Agent tool (`opus`, `sonnet`, `haiku`, `fable`, full id) | the session's; not settable at launch | Claude only |
| Codex | `review_reader` if installed, else a default agent with the reader instructions in the message | `model` of `spawn_agent` | `reasoning_effort` of `spawn_agent` | OpenAI only |
| OMP | `review-reader` in `~/.omp/agent/agents/` | `task.agentModelOverrides["review-reader"]` | the agent file's `thinking-level` | any configured |
| Pi | builtin `reviewer` | `model: "provider/model"` | suffix `:low`, `:medium`, `:high` | any configured |
| Prime | native `rlm` child with the reader instructions | exact selector from `rlm.find_models` | omit to inherit; set only on the user's choice | any configured |

Ask in the interview only for what the row allows. Announce the resolved
reader, model and level before launching. Never claim a model that was not
verified. A missing reader in Codex or OMP: offer once to copy the file from
this plugin's `agents/codex/` or `agents/omp/` into the harness agent
directory, with consent; otherwise use the fallback in the row or review
solo.

Several readers launch in one parallel batch: one message with several
Agent calls in Claude Code, several `spawn_agent` calls in Codex, one
`workflowScript` with `async: true` in Pi.

Reader instructions, for harnesses without an agent file: read only the
scope given; never edit, run destructive commands, ask the user or delegate;
return only the JSON array of findings `{severity, file, line, issue,
evidence, fix_skill}`; empty is valid.
