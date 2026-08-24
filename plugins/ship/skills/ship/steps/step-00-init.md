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
commit_mode: true      # --no-commit flips to false
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
--no-commit      -> commit_mode = false
```

### 2. Resolve paths

```
project_root = git rev-parse --show-toplevel (fallback: PWD)
```

Resolve `{output_dir}` by artifact kind:
```
brief    -> output_dir = the brief folder itself (docs/brief/<slug>/)         # write alongside the spec
propose    -> output_dir = the PROPOSAL.md's parent folder (<out>/NNNN-slug/)     # never touch PROPOSAL.md
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

### 3b. Re-arm the run on resume (git continuity)

A resume skips step-02, where the branch checkpoint and the commit grant
are set. Without this, a resumed run commits on whatever branch happens to
be checked out and prompts on every single commit. So on resume:

```
Restore {work_branch} and {commit_mode} from the trace.md frontmatter.
IF {commit_mode} AND {work_branch}:
  - checkout it if the current branch differs (`git checkout {work_branch}`;
    Graphite repo -> `gt co {work_branch}`). If it no longer exists, say so
    in one line and re-run the step-02 branch checkpoint instead.
  - re-arm the grant (finish deleted the previous run's):
      printf '%s %s\n' "$(git rev-parse --show-toplevel)" "{work_branch}" > ~/.claude/.git-guard-commit-grant
  - state the branch in one line so the user sees where commits land.
IF the trace has no work_branch (pre-1.3 ledger): run the step-02 branch
checkpoint once before executing, then continue the resume.
```

### 4. Confirm start

**If `{auto_mode}` = true:** proceed to step-01.

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Start"
    question: "ship will execute {artifact_path} ({artifact_kind}). Start?"
    options:
      - label: "Start (Recommended)"
        description: "Read the spec, validate the gate, plan"
      - label: "Cancel"
        description: "Do nothing"
    multiSelect: false
```

### 5. Update state

```yaml
stepsCompleted: [0]
auto_mode: <bool>
economy_mode: <bool>
resume_mode: <bool>
yolo_mode: <bool>
commit_mode: <bool>
engine_override: <tier|null>
project_root: "<path>"
output_dir: "<path>"
```

---

## SUCCESS METRICS:

- All flags parsed; invalid -m value rejected
- project_root + output_dir resolved (output_dir matches artifact kind)
- Resume detected and honored when trace.md exists
- On resume: branch restored and commit grant re-armed from the ledger
- No toolchain assumed, no path hardcoded

## FAILURE MODES:

- Fresh init over an existing trace -> Recovery: always check trace.md first
- Resuming onto the wrong branch, or prompting on every commit -> Recovery: restore work_branch + re-arm the grant (3b)
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
