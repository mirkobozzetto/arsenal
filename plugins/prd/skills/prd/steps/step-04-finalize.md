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

- 🎯 Confirm `prd_path` and `tasks_path` exist and are non-empty
- 💾 Mark frontmatter status = ready in both files
- 📖 Print the handoff and stop

## CONTEXT BOUNDARIES:

- Available: prd_path, tasks_path, feature_slug
- This is the terminal step; there is no next step

## YOUR TASK:

Verify the PRD and task artifacts, mark them ready, then ask the user what to do next (rfc or ship) and explain the benefit of each before handing off.

---

## EXECUTION SEQUENCE:

### 1. Verify artifacts

- Read `prd_path` and `tasks_path`; confirm both exist and are non-empty.
- If either is missing, route back to the owning step (02 or 03).

### 2. Mark ready

Set `status: ready` in `prd_path` frontmatter; confirm `tasks_path` keeps the "Do NOT implement" header.

### 3. Print handoff

```
PRD ready: <prd_path>
Tasks:     <tasks_path>  (Do NOT implement)
```

### 4. Ask what to do next

Always ask, even in `auto_mode` (this is the product/technical boundary, the user decides where to route). Use AskUserQuestion, and make each option's description state the concrete benefit:

```yaml
questions:
  - header: "Suite"
    question: "PRD + tasks prêts. On enchaîne sur quoi ?"
    options:
      - label: "RFC (concevoir le how)"
        description: "Explore les alternatives techniques, pèse les tradeoffs et liste les risques AVANT de coder. À choisir si la solution technique n'est pas évidente ou si la décision franchit une boundary (archi, migration, nouveau pattern). Évite de coder dans la mauvaise direction."
      - label: "ship (implémenter le spec)"
        description: "Exécuteur spec-driven : lit tasks.md (gate status: ready), verrouille un contrat, implémente, rend un verification-bundle + une trace. Respecte ta règle 'pas de tests/builds auto'. À choisir pour construire direct sans débat d'archi. Terminal de la chaîne prd -> ship."
      - label: "Stop ici"
        description: "Le PRD + la todo suffisent pour l'instant. Reprise plus tard via ship sur le fichier tasks."
    multiSelect: false
```

**Route based on response:**
- **RFC** → tell the user to run `rfc` using `<prd_path>` as the product input (the RFC consumes the PRD requirements). Do NOT run it automatically.
- **ship** → tell the user to run `ship <feature_dir>` (the prd folder); ship reads tasks.md + prd.md, gated on `status: ready`. Do NOT run it automatically.
- **Stop ici** → end; print the resume hint (`ship <feature_dir>` later).

### 5. Commit?

**If `auto_mode` = true:**
→ Do NOT commit. Just print handoff.

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Commit"
    question: "Commiter le PRD + tasks ?"
    options:
      - label: "Non, je gère (Recommended)"
        description: "Ne rien commiter (git write-guard)"
      - label: "Commiter"
        description: "git add docs/prd && commit (passera par le guard)"
    multiSelect: false
```
Route: Commiter → stage only `docs/prd/`, conventional message, no Claude signature; the git write-guard prompt will fire.

---

## SUCCESS METRICS:

✅ Both artifacts exist and are non-empty
✅ PRD status = ready; tasks keep "Do NOT implement"
✅ Next-action asked via AskUserQuestion, each option explaining its benefit
✅ Routed to rfc / ship / stop per the user's choice (never auto-run)
✅ No commit unless the user opted in

## FAILURE MODES:

❌ Implementing tasks
❌ Auto-running rfc or ship instead of asking
❌ Skipping the next-action question in auto_mode
❌ Auto-committing without asking
❌ Declaring done with a missing artifact
❌ **CRITICAL**: Not using AskUserQuestion for next-action and commit

## FINALIZE PROTOCOLS:

- The PRD generates the todo; handing off to ship is the end of this skill
- Never merge, never push beyond an explicit user commit choice

---

<critical>
Remember: prd ends at a ready PRD + task list. Implementation belongs to ship.
</critical>
