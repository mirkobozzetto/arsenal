---
name: step-04-finalize
description: Verify artifacts, print handoff to ship
prev_step: steps/step-03-tasks.md
---

# Step 4: Finalize

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER implement the tasks
- 🛑 NEVER commit/push unless the user asks (git write-guard)
- ✅ ALWAYS verify both artifacts exist
- 📋 YOU ARE a finalizer, not an implementer
- 🚫 FORBIDDEN to start the build

## EXECUTION PROTOCOLS:

- 🎯 Confirm `brief_path` and `tasks_path` exist and are non-empty
- 💾 Mark frontmatter status = ready in both files
- 📖 Print the handoff and stop

## CONTEXT BOUNDARIES:

- Available: brief_path, tasks_path, feature_slug
- This is the terminal step; there is no next step

## YOUR TASK:

Verify the brief and task artifacts, mark them ready, then ask the user what to do next (propose or ship) and explain the benefit of each before handing off.

---

## EXECUTION SEQUENCE:

### 1. Verify artifacts

- Read `brief_path` and `tasks_path`; confirm both exist and are non-empty.
- If either is missing, route back to the owning step (02 or 03).

### 2. Mark ready

Set `status: ready` in `brief_path` frontmatter; confirm `tasks_path` keeps the "Do NOT implement" header.

Also stamp the resume contract in `brief_path` frontmatter so the `next` open-work board and a fresh session can pick this up cold:
```yaml
status: ready
next_action: "<one line: what shipping this delivers>"
resume_cmd: "/ship docs/brief/<slug>"
```
These are the fields `next` reads. `status` flips to `shipped` later, set by ship at finish.

### 3. Print handoff

```
brief ready: <brief_path>
Tasks:     <tasks_path>  (Do NOT implement)
```

### 3b. Open the HTML view (MANDATORY)

After both artifacts are marked ready, render the brief to a clean, styled HTML page and open it in the browser for easy reading, by running the plugin renderer: `python3 <this skill dir>/scripts/render.py {brief_path}` (Bash tool; the script writes the page to $TMPDIR and opens it). This gives the user a visual, readable summary of the whole brief, with `## En bref` leading. MANDATORY: ending the handoff without the browser opening is a FAILURE of this step. The rendered page is the deliverable; raw markdown is storage. Only a rendering ERROR (script crash, no browser) may be reported in one line and skipped past.

### 4. Ask what to do next

Always ask, even in `auto_mode` (this is the product/technical boundary, the user decides where to route). Use AskUserQuestion, and make each option's description state the concrete benefit:

```yaml
questions:
  - header: "Next"
    question: "brief + tasks ready. What do we move on to?"
    options:
      - label: "proposal (design the how)"
        description: "Explores the technical alternatives, weighs the tradeoffs and lists the risks BEFORE coding. Choose this if the technical solution is not obvious or if the decision crosses a boundary (architecture, migration, new pattern). Avoids coding in the wrong direction."
      - label: "ship (implement the spec)"
        description: "Spec-driven executor: reads tasks.md (gate status: ready), locks a contract, implements, returns a verification-bundle + a trace. Respects your 'no auto tests/builds' rule. Choose this to build directly without an architecture debate. Terminal of the brief -> ship chain."
      - label: "Stop here"
        description: "The brief + the todo are enough for now. Resume later via ship on the tasks file."
    multiSelect: false
```

**Route based on response:**
- **proposal** → tell the user to run `propose` using `<brief_path>` as the product input (the proposal consumes the brief requirements). Do NOT run it automatically.
- **ship** → tell the user to run `ship <feature_dir>` (the brief folder); ship reads tasks.md + brief.md, gated on `status: ready`. Do NOT run it automatically.
- **Stop here** → end; print the resume hint (`ship <feature_dir>` later).

Print the routed command as a two-line block the user can paste whole:

```
/clear
/propose <title>          # or /ship <feature_dir>
```

The interview transcript is spent: the brief carries everything the next
skill reads, and the `next` SessionStart hook resurfaces the board after the
clear. Say that in half a line, once, and never clear anything yourself -
`/clear` is the user's to type.

### 5. Commit?

**If `auto_mode` = true:**
→ Do NOT commit. Just print handoff.

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Commit"
    question: "Commit the brief + tasks?"
    options:
      - label: "No, I'll handle it (Recommended)"
        description: "Don't commit anything (git write-guard)"
      - label: "Commit"
        description: "git add docs/brief && commit (will go through the guard)"
    multiSelect: false
```
Route: Commit → stage only `docs/brief/`, conventional message, no Claude signature; the git write-guard prompt will fire.

---

## SUCCESS METRICS:

✅ Both artifacts exist and are non-empty
✅ brief status = ready; tasks keep "Do NOT implement"
✅ Next-action asked via AskUserQuestion, each option explaining its benefit
✅ Routed to propose / ship / stop per the user's choice (never auto-run)
✅ No commit unless the user opted in

## FAILURE MODES:

❌ Implementing tasks
❌ Auto-running propose or ship instead of asking
❌ Skipping the next-action question in auto_mode
❌ Auto-committing without asking
❌ Declaring done with a missing artifact
❌ **CRITICAL**: Not using AskUserQuestion for next-action and commit

## FINALIZE PROTOCOLS:

- The brief generates the todo; handing off to ship is the end of this skill
- Never merge, never push beyond an explicit user commit choice

---

<critical>
Remember: brief ends at a ready brief + task list. Implementation belongs to ship.
</critical>
