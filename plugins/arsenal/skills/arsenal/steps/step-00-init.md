---
name: step-00-init
description: Parse input, detect capabilities, and resume safely
next_step: steps/step-01-interview.md
---

# Step 0: Initialize

## Parse input

```text
-a | --auto                    -> auto_mode = true
-r | --resume <slug>           -> resume_mode = true
--no-agents                    -> force_solo = true
--install-omp-agents           -> explicit OMP installation action
--install-codex-agents         -> explicit Codex installation action
--uninstall-omp-agents         -> explicit OMP removal action
--uninstall-codex-agents       -> explicit Codex removal action
otherwise                      -> remainder = idea
slug                           -> English kebab-case, at most five words
roadmap_dir                    -> <project_root>/docs/roadmap/<slug>/
```

For an installation action, run the matching command and stop:

```text
python3 <skill-dir>/scripts/install_agents.py install omp
python3 <skill-dir>/scripts/install_agents.py install codex
python3 <skill-dir>/scripts/install_agents.py uninstall omp
python3 <skill-dir>/scripts/install_agents.py uninstall codex
```

The user's flag is the explicit authorization to write the selected user agent
directory. Never run an installation action during a normal roadmap workflow.

## Probe capabilities

Load `../references/capability-contract.md`, detect the harness separately
from the provider and active model, then load the matching file under
`../references/adapters/`. Store the normalized result as `{capabilities}`.
If detection is uncertain, use the solo adapter. If `{force_solo}` is true,
override subagents to `none` after probing.

## Resume

If `{roadmap_dir}/roadmap.md` exists, read its frontmatter. Existing files
without `execution_trace` are valid and require no migration.

```text
status ready | discussed -> load step-05-discuss
status draft             -> resume at first incomplete step
missing file             -> continue as a fresh workflow
```

State in one short line that Arsenal will interview, research, review, and
render a roadmap. Then load `./step-01-interview.md`.
