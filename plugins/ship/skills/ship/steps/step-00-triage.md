---
name: step-00-triage
description: Handle --help, classify input as prd-folder / RFC.md / bare-prompt, route to init (prd / rfc / inline)
next_step: steps/step-00-init.md
---

# Step 0 (Triage): Input Classification

## MANDATORY EXECUTION RULES:

- YOU ARE A CLASSIFIER, not an implementer, planner, or spec author
- NEVER read task content, write files, or spawn anything in this step
- NEVER skip the --help check (always the first action)
- ALWAYS classify the input before routing
- IF the input is a bare prompt, mark it for a MINIMAL inline spec (CASE C) — never a full product PRD

## CONTEXT BOUNDARIES:

- This is the ABSOLUTE FIRST step. No previous state exists.
- $ARGUMENTS contains raw user input (flags + an artifact path OR a bare prompt).
- Next step is ALWAYS step-00-init.md.

## YOUR TASK:

Check for --help, classify the input as a prd folder, an RFC.md, or a bare prompt, and route to init.

---

## EXECUTION SEQUENCE:

### 1. Check for --help

```
IF $ARGUMENTS contains -h or --help:
  -> Read references/help-text.md
  -> Display it
  -> STOP (load no further steps)
```

### 2. Strip flags, isolate the remainder

```
Remove known flags: -a --auto, -e --economy, -r --resume, --yolo, -m <tier> --mode <tier>, -h --help
Store stripped flags as {extracted_flags} (passed to step-00-init)
Store remainder as {raw_input}
```

### 3. Classify {raw_input}

```
prd    IF {raw_input} resolves to a directory under docs/prd/ (or contains prd.md + tasks.md):
         -> {triage_mode} = "prd"; {artifact_kind} = "prd"; {artifact_path} = the folder
rfc    IF {raw_input} ends in RFC.md (or a dir holding RFC.md):
         -> {triage_mode} = "rfc"; {artifact_kind} = "rfc"; {artifact_path} = the RFC.md
inline IF {raw_input} is a sentence/prompt with no artifact path:
         -> {triage_mode} = "inline"; {artifact_kind} = "inline"; {raw_prompt} = {raw_input}; {artifact_path} = null
ambiguous IF a path that is neither -> probe with Glob (prd.md/tasks.md vs RFC.md), else ask.
```

Quick disambiguation when a file is given but kind is unclear: a body with nested `- [ ] N.0/N.1` checkboxes => prd; a body with a flat `| T0n |` task table => rfc.

### 4. Inline note (CASE C)

```
IF {triage_mode} = "inline":
  ship handles it directly — NO escape. step-01-ingest will derive a MINIMAL execution spec
  (short ordered task list + 2-5 acceptance items) from {raw_prompt} and confirm it with the user.
  This is NOT a product PRD (no interview, no user stories). For a full durable spec, the user can
  run /prd first; ship's inline path is the quick route.
  No status gate applies to inline — the user's confirmation of the derived list IS the gate.
```

### 5. Update state and route

```yaml
triage_mode: "prd" | "rfc" | "inline"
artifact_kind: "prd" | "rfc" | "inline"
artifact_path: "<absolute path>" | null
raw_prompt: "<string or null>"
extracted_flags: "<string>"
```

---

## SUCCESS METRICS:

- --help displayed without running the workflow
- Input correctly classified (prd folder vs RFC.md vs bare prompt)
- Bare prompts marked for a MINIMAL inline spec (not a full PRD)
- {artifact_path} resolved to an absolute path (or null for inline)

## FAILURE MODES:

- prd folder misread as a single file -> Recovery: Glob for prd.md + tasks.md inside it
- RFC.md not Accepted -> Recovery: not checked here; step-01 ingest gate handles status
- Bare prompt over-spec'd into a full PRD -> Recovery: inline stays minimal (tasks + acceptance only)
- --help not detected -> Recovery: always check FIRST

## TRIAGE PROTOCOLS:

- --help is ALWAYS the first check
- Classification is heuristic; when a path exists but kind is unclear, Glob before asking
- Inline is the quick route; prd/rfc are the durable-spec routes

---

## NEXT STEP:

Load `./step-00-init.md` (prd, rfc, and inline all converge there).

<critical>
Triage is CLASSIFIER only. No spec reading, no file writes, no spawning.
A bare prompt -> minimal inline spec (CASE C), then execute. ship handles every case.
</critical>
