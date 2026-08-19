---
name: step-00-init
description: Initialize brief workflow - parse flags, slugify feature, detect resume, setup state
next_step: steps/step-01-interview.md
---

# Step 0: Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER start drafting the brief here
- ✅ ALWAYS check for an existing brief before creating a new one
- 📋 Parse ALL flags before any other action
- 💬 FOCUS on initialization only - don't look ahead
- 🚫 FORBIDDEN to proceed without a feature_slug and state set

## EXECUTION PROTOCOLS:

- 🎯 Parse flags first, then check resume, then setup
- 💾 Create `docs/brief/` if missing
- 📖 Initialize state variables before loading step-01
- 🚫 FORBIDDEN to load step-01 until init complete

## CONTEXT BOUNDARIES:

- This step sets up; it does not interview or draft
- Don't assume knowledge from future steps
- The feature idea = remainder of the user input after flags

## YOUR TASK:

Initialize the workflow by parsing flags, slugifying the feature, detecting an existing brief, and setting up state.

---

## DEFAULTS CONFIGURATION:

```yaml
auto_mode: false       # -a: skip confirmations
skip_interview: false  # -s: draft directly, no question loop
```

---

## INITIALIZATION SEQUENCE:

### 1. Parse Flags and Input

```
-a → auto_mode = true
-s → skip_interview = true
Remainder → feature_name
```

Derive `feature_slug` = kebab-case of feature_name.
Set `feature_dir` = `docs/brief/<slug>/`, `brief_path` = `docs/brief/<slug>/brief.md`, `tasks_path` = `docs/brief/<slug>/tasks.md`.

### 2. Check for Existing brief

**If `brief_path` exists with `stepsCompleted` in frontmatter:**
- Read frontmatter to restore state
- Load the next incomplete step
- **STOP** - do not re-init

**If `feature_dir` exists with a numbered brief (`0001-brief-*.md`):**
- This feature already has split briefs; ask whether to add the next numbered pair (`000N-brief-*` + `tasks-000N-*`) or resume an existing one
- **STOP** - do not overwrite

**If no existing brief:**
→ Continue to step 3

### 3. Create Output Structure

```bash
mkdir -p docs/brief/<slug>
```

### 4. Confirm Start

**If `auto_mode` = true:**
→ Proceed directly to step-01 (or step-02 if `skip_interview` = true)

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Start"
    question: "brief for '<feature_name>'. Ready to start the interview?"
    options:
      - label: "Start (Recommended)"
        description: "Launch the scoping questions"
      - label: "Skip interview"
        description: "Draft directly from the idea (lower quality)"
      - label: "Cancel"
        description: "Do not launch this brief"
    multiSelect: false
```
Route: Skip interview → set skip_interview = true.

---

## SUCCESS METRICS:

✅ All flags parsed
✅ feature_slug, feature_dir, brief_path, tasks_path set
✅ Existing brief detected and resumed if present (incl. numbered split briefs)
✅ `docs/brief/<slug>/` exists
✅ State variables ready for step-01

## FAILURE MODES:

❌ Starting the brief draft during init
❌ Not parsing flags before proceeding
❌ Re-initializing over an existing brief
❌ **CRITICAL**: Not using AskUserQuestion for the start confirmation

---

## NEXT STEP:

After init, load `./step-01-interview.md` (or `./step-02-draft-brief.md` if `skip_interview` = true).

<critical>
Remember: Init is ONLY setup. No interview, no drafting here.
</critical>
