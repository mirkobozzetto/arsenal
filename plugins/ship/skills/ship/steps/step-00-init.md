---
name: step-00-init
description: Parse flags, resolve project root + output_dir, detect resume from trace.md
prev_step: steps/step-00-triage.md
next_step: steps/step-01-ingest.md
---

# Step 0 (Init): Flags, Paths, Resume

## MANDATORY EXECUTION RULES:

- YOU ARE AN INITIALIZER, not an implementer
- NEVER read or execute task content here
- NEVER hardcode a toolchain or an output path
- ALWAYS parse all flags before anything else
- ALWAYS detect an existing trace.md before a fresh start

## CONTEXT BOUNDARIES:

- Available from triage: `{triage_mode}`, `{artifact_kind}`, `{artifact_path}`, `{extracted_flags}`
- Tools: Bash (read-only path checks), Read, Glob
- Don't assume knowledge from future steps

## YOUR TASK:

Parse flags, resolve `{project_root}` and `{output_dir}`, and resume from an existing trace.md if present.

---

## DEFAULTS CONFIGURATION:

```yaml
auto_mode: false       # -a
economy_mode: false    # -e
resume_mode: false     # -r
yolo_mode: false       # --yolo
engine_override: null  # -m teams|subagents|solo
```

---

## INITIALIZATION SEQUENCE:

### 1. Parse flags

```
-a / --auto      -> auto_mode = true
-e / --economy   -> economy_mode = true
-r / --resume    -> resume_mode = true
--yolo           -> yolo_mode = true
-m <tier>        -> engine_override = teams|subagents|solo (reject other values)
```

### 2. Resolve paths

```
project_root = git rev-parse --show-toplevel (fallback: PWD)
```

Resolve `{output_dir}` by artifact kind:
```
prd    -> output_dir = the prd folder itself (docs/prd/<slug>/)         # write alongside the spec
rfc    -> output_dir = the RFC.md's parent folder (<out>/NNNN-slug/)     # never touch RFC.md
inline -> output_dir = {project_root}/.claude/output/ship/<slug>/        # slug derived from {raw_prompt}
```

If `{output_dir}` cannot be resolved or is ambiguous, AskUserQuestion (unless auto_mode) for where to write contract.md / verification-bundle.md / trace.md, defaulting to the artifact folder.

### 3. Detect resume

```
IF {output_dir}/trace.md exists with stepsCompleted in frontmatter:
  -> Read it, restore state, set resume_mode = true
  -> Resume at the first incomplete step
  -> STOP fresh init
ELSE:
  -> Continue
```

### 4. Confirm start

**If `{auto_mode}` = true:** proceed to step-01.

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Start"
    question: "ship va exécuter {artifact_path} ({artifact_kind}). Démarrer ?"
    options:
      - label: "Démarrer (Recommended)"
        description: "Lire le spec, valider le gate, planifier"
      - label: "Annuler"
        description: "Ne rien faire"
    multiSelect: false
```

### 5. Update state

```yaml
stepsCompleted: [0]
auto_mode: <bool>
economy_mode: <bool>
resume_mode: <bool>
yolo_mode: <bool>
engine_override: <tier|null>
project_root: "<path>"
output_dir: "<path>"
```

---

## SUCCESS METRICS:

- All flags parsed; invalid -m value rejected
- project_root + output_dir resolved (output_dir matches artifact kind)
- Resume detected and honored when trace.md exists
- No toolchain assumed, no path hardcoded

## FAILURE MODES:

- Fresh init over an existing trace -> Recovery: always check trace.md first
- output_dir hardcoded -> Recovery: derive from {artifact_path}
- -m given a bad tier -> Recovery: reject, ask or fall back to the probe

## INIT PROTOCOLS:

- Init is setup only; no spec reading, no execution
- trace.md is the resume source of truth

---

## NEXT STEP:

Load `./step-01-ingest.md`.

<critical>
Init = flags + paths + resume. The spec is read in step-01, never here.
</critical>
