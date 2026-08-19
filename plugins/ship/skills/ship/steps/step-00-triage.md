---
name: step-00-triage
description: Handle --help, classify input as brief-folder / PROPOSAL.md / bare-prompt, route to init (brief / propose / inline)
next_step: steps/step-00-init.md
---

# Step 0 (Triage): Input Classification

## MANDATORY EXECUTION RULES:

- YOU ARE A CLASSIFIER, not an implementer, planner, or spec author
- NEVER read task content, write files, or spawn anything in this step
- NEVER skip the --help check (always the first action)
- ALWAYS classify the input before routing
- IF the input is a bare prompt, OFFER the choice (ship direct, or write brief/propose first); never silently force a full brief

## CONTEXT BOUNDARIES:

- This is the ABSOLUTE FIRST step. No previous state exists.
- $ARGUMENTS contains raw user input (flags + an artifact path OR a bare prompt).
- Next step is ALWAYS step-00-init.md.

## YOUR TASK:

Check for --help, classify the input as a brief folder, an PROPOSAL.md, or a bare prompt, and route to init.

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
brief    IF {raw_input} resolves to a directory under docs/brief/ (or contains brief.md + tasks.md):
         -> {triage_mode} = "brief"; {artifact_kind} = "brief"; {artifact_path} = the folder
propose    IF {raw_input} ends in PROPOSAL.md (or a dir holding PROPOSAL.md):
         -> {triage_mode} = "propose"; {artifact_kind} = "propose"; {artifact_path} = the PROPOSAL.md
inline IF {raw_input} is a sentence/prompt with no artifact path:
         -> {triage_mode} = "inline"; {artifact_kind} = "inline"; {raw_prompt} = {raw_input}; {artifact_path} = null
ambiguous IF a path that is neither -> probe with Glob (brief.md/tasks.md vs PROPOSAL.md), else ask.
```

Quick disambiguation when a file is given but kind is unclear: a body with nested `- [ ] N.0/N.1` checkboxes => brief; a body with a flat `| T0n |` task table => propose.

### 4. Inline route (CASE C): offer the choice

```
IF {triage_mode} = "inline" AND NOT auto_mode:
  No brief/propose artifact was given. Honor flexibility, ASK how to proceed:
  AskUserQuestion:
    header: "No spec"
    question: "No brief/propose found. Ship this directly, or spec it first?"
    options:
      - label: "Ship direct (Recommended)"
        description: "ship runs a short interview, builds an inline contract, then executes. Fast, flexible."
      - label: "Write a brief first"
        description: "Stop here, run /brief <idea> to pin down what/why, then /ship the folder."
      - label: "Write an proposal first"
        description: "Stop here, run /propose <title> for a design doc, then /ship the proposal."
  Route:
    - "Ship direct"       -> keep {triage_mode} = "inline"; continue. step-01 CASE C runs the interview.
    - "Write a brief first" -> tell the user "Run: /brief <your idea>", then STOP.
    - "Write an proposal first" -> tell the user "Run: /propose <your title>", then STOP.

IF {triage_mode} = "inline" AND auto_mode:
  -> skip the question, proceed "Ship direct".
```

### 5. Update state and route

```yaml
triage_mode: "brief" | "propose" | "inline"
artifact_kind: "brief" | "propose" | "inline"
artifact_path: "<absolute path>" | null
raw_prompt: "<string or null>"
extracted_flags: "<string>"
```

---

## SUCCESS METRICS:

- --help displayed without running the workflow
- Input correctly classified (brief folder vs PROPOSAL.md vs bare prompt)
- Bare prompts marked for a MINIMAL inline spec (not a full brief)
- {artifact_path} resolved to an absolute path (or null for inline)

## FAILURE MODES:

- brief folder misread as a single file -> Recovery: Glob for brief.md + tasks.md inside it
- PROPOSAL.md not Accepted -> Recovery: not checked here; step-01 ingest gate handles status
- Bare prompt over-spec'd into a full brief -> Recovery: inline stays minimal (tasks + acceptance only)
- --help not detected -> Recovery: always check FIRST

## TRIAGE PROTOCOLS:

- --help is ALWAYS the first check
- Classification is heuristic; when a path exists but kind is unclear, Glob before asking
- Inline is the quick route; brief/propose are the durable-spec routes

---

## NEXT STEP:

Load `./step-00-init.md` (brief, propose, and inline all converge there).

<critical>
Triage is CLASSIFIER only. No spec reading, no file writes, no spawning.
A bare prompt -> offer "ship direct" or "spec first". ship handles every case, flexibility first.
</critical>
