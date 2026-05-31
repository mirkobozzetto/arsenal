---
name: step-00-init
description: Initialize prd workflow - parse flags, slugify feature, detect resume, setup state
next_step: steps/step-01-interview.md
---

# Step 0: Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER start drafting the PRD here
- ✅ ALWAYS check for an existing PRD before creating a new one
- 📋 Parse ALL flags before any other action
- 💬 FOCUS on initialization only - don't look ahead
- 🚫 FORBIDDEN to proceed without a feature_slug and state set

## EXECUTION PROTOCOLS:

- 🎯 Parse flags first, then check resume, then setup
- 💾 Create `docs/prd/` if missing
- 📖 Initialize state variables before loading step-01
- 🚫 FORBIDDEN to load step-01 until init complete

## CONTEXT BOUNDARIES:

- This step sets up; it does not interview or draft
- Don't assume knowledge from future steps
- The feature idea = remainder of the user input after flags

## YOUR TASK:

Initialize the workflow by parsing flags, slugifying the feature, detecting an existing PRD, and setting up state.

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
Set `feature_dir` = `docs/prd/<slug>/`, `prd_path` = `docs/prd/<slug>/prd.md`, `tasks_path` = `docs/prd/<slug>/tasks.md`.

### 2. Check for Existing PRD

**If `prd_path` exists with `stepsCompleted` in frontmatter:**
- Read frontmatter to restore state
- Load the next incomplete step
- **STOP** - do not re-init

**If `feature_dir` exists with a numbered PRD (`0001-prd-*.md`):**
- This feature already has split PRDs; ask whether to add the next numbered pair (`000N-prd-*` + `tasks-000N-*`) or resume an existing one
- **STOP** - do not overwrite

**If no existing PRD:**
→ Continue to step 3

### 3. Create Output Structure

```bash
mkdir -p docs/prd/<slug>
```

### 4. Confirm Start

**If `auto_mode` = true:**
→ Proceed directly to step-01 (or step-02 if `skip_interview` = true)

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Start"
    question: "PRD pour '<feature_name>'. Prêt à démarrer l'interview ?"
    options:
      - label: "Démarrer (Recommended)"
        description: "Lancer les questions de cadrage"
      - label: "Skip interview"
        description: "Drafter direct depuis l'idée (qualité moindre)"
      - label: "Annuler"
        description: "Ne pas lancer ce PRD"
    multiSelect: false
```
Route: Skip interview → set skip_interview = true.

---

## SUCCESS METRICS:

✅ All flags parsed
✅ feature_slug, feature_dir, prd_path, tasks_path set
✅ Existing PRD detected and resumed if present (incl. numbered split PRDs)
✅ `docs/prd/<slug>/` exists
✅ State variables ready for step-01

## FAILURE MODES:

❌ Starting the PRD draft during init
❌ Not parsing flags before proceeding
❌ Re-initializing over an existing PRD
❌ **CRITICAL**: Not using AskUserQuestion for the start confirmation

---

## NEXT STEP:

After init, load `./step-01-interview.md` (or `./step-02-draft-prd.md` if `skip_interview` = true).

<critical>
Remember: Init is ONLY setup. No interview, no drafting here.
</critical>
