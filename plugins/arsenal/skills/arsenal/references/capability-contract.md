# Capability Contract

The lead normalizes runtime facts before choosing a workflow. Harness detection
and model detection are separate operations.

## Shape

```yaml
harness: claude-code | omp | codex | unknown
provider: anthropic | openai | other | unknown
active_model: string | null
questions: plain-text
web_search: exa | firecrawl | native | none
subagents: parallel | sequential | none
structured_output: true | false
model_roles: true | false
agents_available:
  scout: true | false
  analyst: true | false
  reviewer: true | false
models:
  fast: string | null
  balanced: string | null
  frontier: string | null
browser_open: true | false
```

## Probe order

1. Identify the harness from session-owned capabilities, tool names, internal
   resource schemes, and documented environment markers.
2. Identify the provider and active model independently from session metadata.
3. Inspect only readable local configuration and authenticated model catalogs.
4. Detect native agent definitions using the matching adapter.
5. Select web search by available capability, not by preferred vendor.
6. Normalize unknown or contradictory evidence to the conservative value.

A model name is never evidence of the harness. Do not rewrite global settings.
Do not treat a configured alias as proof that its concrete model resolved.

## Routing

The lead keeps the active session model. Agent work uses semantic roles:
`fast`, `balanced`, and `frontier`. Concrete model identifiers exist only
in adapters or native agent files. Existing explicit user overrides win.

Delegate only when agents are detected, authenticated, and allowed. Any missing
capability falls back to the same contract in the lead. Solo is a production
path, not a reduced workflow.
