---
name: step-05-verify
description: Read-only self-checks, write the user-run verification bundle and the trace ledger
prev_step: steps/step-04-execute.md
next_step: steps/step-06-finish.md
---

# Step 5 (Verify): Self-Check + Bundle + Trace

## MANDATORY EXECUTION RULES:

- YOU ARE A VERIFIER, not a test runner
- NEVER run build/test/typecheck toolchain by default (your rule: "the user does that")
- NEVER run destructive/DB/deploy commands, ever, even with --yolo
- ALWAYS write verification-bundle.md (stack-detected) + finalize trace.md
- ALWAYS map each contract item to a concrete edit (PASS/FAIL)

## CONTEXT BOUNDARIES:

- Available: `{contract_path}`, `{trace_path}`, `{detected_stack}`, `{output_dir}`, `{yolo_mode}`, `{auto_mode}`, edited files (from trace.md)
- Tools: Read, Grep, Glob, Write, Agent (read-only verifier/reviewer), Bash (only per the boundary below)
- Load `references/guardrails.md` for the Bash boundary

## YOUR TASK:

Run read-only self-checks, write the user-run verification bundle, and finalize the trace ledger.

---

## EXECUTION SEQUENCE:

### 1. Read-only self-checks (always allowed)

```
- Read-back: re-Read every edited file (from trace.md) to confirm the change landed.
- Contract cross-check: spawn a forked `creator-verifier` Agent (role-templates.md). For each contract item,
  PASS/FAIL with a file:line cite. Read/Grep only; it never shells out.
- OPTIONAL adversarial fan-out: spawn `adversarial-reviewer` Agent(s) (code-reviewer style, severity x validity).
Collect findings. A FAIL or BLOCKER on a task that was supposed to be done -> mark it for HALT/redo (up to the 3x cap from step-04).
```

### 2. Detect verification commands (read-only)

```
From {detected_stack}, assemble the project's REAL commands (typecheck/lint/test/build) as they exist in the manifest.
Separate them into:
  SAFE set       = typecheck, lint, test, build (no state change).
  DESTRUCTIVE set = migrations, deploy, anything stateful/outward-facing.
Do NOT run them yet.
```

### 3. Write the verification bundle

```
Write {output_dir}/verification-bundle.md from templates/verification-bundle.md:
  - SAFE checks table: command + what it validates + expected pass signal, each tied to a contract item.
  - DESTRUCTIVE table: USER ONLY, with warnings.
  - Contract coverage: C1..Cn -> command/self-check; list any uncovered criterion needing a manual check.
Set {bundle_path}.
```

### 4. Run authority (the only place ship may execute the SAFE set)

```
DEFAULT (no --yolo):
  -> List the SAFE commands. AskUserQuestion: "Run these checks myself, or do you run them?"
     Options: "I run them myself (Recommended)" / "ship runs the safe checks now".
     Only on explicit opt-in does ship run the SAFE set; otherwise it runs nothing.

--yolo:
  -> FIRST print the exact SAFE commands and how they will run.
  -> Then run the SAFE set to completion, capturing pass/fail.
  -> NEVER run the DESTRUCTIVE set, even under --yolo.

If any check ship runs fails -> record in trace.md; if it breaks a contract item, redo the task (respect the 3x HALT cap).
```

Be honest in the report: the bundle + small per-task diffs let the user audit cheaply; with the toolchain off by default, this raises the floor, it is not a "trust every line" guarantee.

### 5. Finalize trace.md

```
Update {trace_path}: per-task contract item satisfied (PASS/FAIL), final diff summary, engine tier, checkpoints, any HALT.
Set frontmatter final_status (shipped / halted).
```

### 6. Update state

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5]
bundle_path: "{output_dir}/verification-bundle.md"
final_status: "shipped|halted"
```

---

## SUCCESS METRICS:

- Read-back + per-requirement PASS/FAIL done (read-only)
- verification-bundle.md written, stack-detected, SAFE vs DESTRUCTIVE separated, tied to contract
- Default asks before running; --yolo runs only the SAFE set after listing; destructive never run
- trace.md finalized with contract coverage

## FAILURE MODES:

- Running tests/builds by default -> Recovery: forbidden; bundle is user-run
- Running a migration/deploy under --yolo -> Recovery: destructive is user-only always
- creator-verifier shelling out -> Recovery: read-only, Read/Grep only
- Claiming "trust every line" -> Recovery: frame honestly (floor raised, not a guarantee)
- Bundle hardcoding pnpm -> Recovery: use {detected_stack}

## VERIFY PROTOCOLS:

- Self-checks are read-only; the toolchain belongs to the user
- The bundle is the deliverable; the trace anchors resume
- --yolo relaxes only the SAFE set, only after listing the commands

---

## NEXT STEP:

Load `./step-06-finish.md`.

<critical>
ship verifies by writing a bundle the USER runs. It never runs build/test by default and never runs destructive commands at all.
</critical>
