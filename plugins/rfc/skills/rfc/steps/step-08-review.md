## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip review unless `{skip_review}` = true
- 🛑 NEVER edit RFC.md based on review findings here: capture only
- ✅ ALWAYS spawn subagent (different perspective from main thread)
- ✅ ALWAYS capture findings in section 11, classified by severity
- 📋 YOU ARE a review orchestrator, not a reviewer yourself
- 💬 FOCUS on dispatching + capturing findings
- 🚫 FORBIDDEN to defend the RFC against findings: neutral capture

## EXECUTION PROTOCOLS:

- 🎯 Spawn ≥1 subagent (general-purpose) with adversarial prompt
- 💾 Write section 11 (Review Findings) with severity labels
- 📖 Complete before loading step-09
- 🚫 FORBIDDEN to load step-09 until findings written OR explicit "no issues"

## CONTEXT BOUNDARIES:

- Variables: `{rfc_path}`, `{auto_mode}`, `{skip_review}`, full RFC sections 1-10
- Output: section 11 of RFC.md
- Resources: `Agent` tool with `subagent_type=general-purpose`

## YOUR TASK:

Spawn adversarial subagent(s) to attack the RFC, capture findings neutrally in section 11.

## EXECUTION SEQUENCE:

### 1. Bail if skipped

If `{skip_review}` = true → mark section 11 as `_skipped via --no-review_`, update frontmatter, jump to step-09.

### 2. Read full RFC

Read `{rfc_path}` completely. Subagent needs full content.

### 3. Dispatch 1-2 adversarial subagents (in parallel)

**Subagent A: Gap hunter**

```
Agent({
  description: "Adversarial RFC review: gaps",
  subagent_type: "general-purpose",
  prompt: `
    Lis ce RFC complet et trouve les GAPS : requirements manquants,
    edge cases ignorés, hypothèses cachées, contradictions internes.

    RFC content:
    ---
    {full RFC.md content}
    ---

    Pour chaque finding, output:
    - Severity: BLOCKER | MAJOR | MINOR | NIT
    - Section: which section of RFC
    - Issue: ≤2 sentences
    - Suggestion: ≤2 sentences

    Format: markdown table. No praise, no recap.
    Sois sceptique. Ton job = trouver ce qui manque, pas valider.
  `
})
```

**Subagent B: Impl realism** (optional, if `tasks_count > 5`)

```
Agent({
  description: "Adversarial RFC review: impl realism",
  subagent_type: "general-purpose",
  prompt: `
    Lis ce RFC complet et challenge le plan d'impl (section 10).
    Cherche : tâches sous-estimées, deps cachées, hypothèses d'ops,
    risques de rollback ignorés, ce qui casse en prod.

    RFC content: ---
    {full RFC.md content}
    ---

    Output format identique à Subagent A.
  `
})
```

Run both in parallel if used.

### 4. Capture findings (neutral)

Aggregate findings from subagent(s). Don't filter. Sort by severity.

### 5. Write section 11

```markdown
## 11. Review Findings

**Reviewer:** Adversarial subagent(s) via `general-purpose`
**Date:** {today}

| # | Severity | Section | Issue | Suggestion |
|---|----------|---------|-------|------------|
| 1 | BLOCKER | §6 | ... | ... |
| 2 | MAJOR | §10 | ... | ... |
| 3 | MINOR | §5 | ... | ... |

### Counts
- BLOCKER: N
- MAJOR: M
- MINOR: K
- NIT: L
```

### 6. Surface blockers

If any BLOCKER found:
- Display them to user
- AskUserQuestion (unless `auto_mode`):

```yaml
questions:
  - header: "Blockers"
    question: "{N} BLOCKER(s) trouvés. Action ?"
    options:
      - label: "Revoir RFC (Recommended)"
        description: "Reboucler aux steps concernés pour fixer blockers"
      - label: "Accepter blockers"
        description: "Documenter dans § correspondante + continuer step-09"
      - label: "Abandonner RFC"
        description: "Status: Rejected"
    multiSelect: false
```

### 7. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7, 8]
updated: "{today}"
review_blockers: N
review_major: M
review_minor: K
review_nit: L
```

## SUCCESS METRICS:

✅ ≥1 subagent dispatched (or explicit skip flag)
✅ Findings classified BLOCKER/MAJOR/MINOR/NIT
✅ User sees blocker count before continuing
✅ Section 11 populated (or skipped marker)

## FAILURE MODES:

❌ Reviewing the RFC yourself instead of spawning subagent (same model bias)
❌ Editing main RFC sections based on findings: that's the user's call
❌ Defending RFC in section 11 ("but actually we considered…"): capture only
❌ Filtering out findings you disagree with → loses adversarial value

## NEXT STEP:

If blockers accepted/none → load `./step-09-finalize.md`.
If user chose "Revoir RFC" → AskUserQuestion which step to reload (typically step-04 or step-05).
If "Abandonner" → load step-09 with `status: Rejected`.

<critical>
Subagent has FRESH context: that's the point. Independent review > self-review every time. Resist urge to argue back.
</critical>
