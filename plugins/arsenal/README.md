# arsenal

The orientation stage before product specification, technical design, and
implementation. Arsenal turns a fuzzy idea into a phased roadmap through a
Socratic interview, capability-aware research, and adversarial review.

## Deliverable

A normal run writes only `docs/roadmap/<slug>/roadmap.md` in the project. The
same roadmap is rendered as a self-contained HTML page with:

- the objective, exclusions, and cited inspirations;
- one wireframe or flow diagram;
- two to four shippable phases with runnable commands;
- a semantic handoff for the first phase;
- optional agent routing evidence.

The renderer bundles pinned Marked and Mermaid assets. It works offline and
uses the platform default browser when one is available.

## Portability

The canonical workflow is an Agent Skills `SKILL.md`. Harness-specific model
and agent details live outside the portable core.

| Harness | Agent discovery | Fast | Balanced |
|---------|-----------------|------|----------|
| Claude Code | Plugin agents, automatic | Haiku | Sonnet |
| OMP | Explicit user or project installation | GPT-5.6 Luna | GPT-5.6 Terra |
| Codex | Explicit user or project installation | GPT-5.6 Luna | GPT-5.6 Terra |
| Other | Solo in the parent session | Parent | Parent |

The lead always owns the interview, scope, synthesis, roadmap write, and final
discussion. Read-only agents handle independent research and one adversarial
review. Missing agents, models, authentication, search, or browser capability
falls back to the complete solo workflow.

## Install

Claude Code plugin:

```text
/plugin marketplace add mirkobozzetto/arsenal
/plugin install arsenal@arsenal
```

OMP and Codex agents are never installed automatically. Invoke the explicit
skill action after installing the plugin:

```text
/arsenal --install-omp-agents
/arsenal --install-codex-agents
```

Both installers preserve replaced files and support reversal:

```text
/arsenal --uninstall-omp-agents
/arsenal --uninstall-codex-agents
```

## Usage

```text
/arsenal a tool that turns meeting notes into follow-up emails
/arsenal -r meeting-notes-emails
/arsenal -a a local photo organization CLI
/arsenal --no-agents a roadmap that must run in solo mode
```

## Verification

```text
python3 -m unittest discover -s plugins/arsenal/tests -v
```

The suite validates portable skill metadata, native agent formats, reversible
installation, canonical roadmap structure, and offline rendering. Runtime
routing still requires each harness: OMP model proof comes from child session
transcripts, not from configured aliases.

## Boundaries

- Arsenal decides what to build and in which order. It does not implement.
- Research uses the best available semantic web capability.
- Existing roadmaps resume in place without migration or forks.
- Global user configuration changes only after an explicit install action.
