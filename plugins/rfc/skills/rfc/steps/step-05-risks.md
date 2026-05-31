## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER claim "no risks" — there are always risks
- 🛑 NEVER skip open questions even if "obvious"
- ✅ ALWAYS distinguish drawbacks (inherent) from risks (probabilistic)
- ✅ ALWAYS list ≥1 unknown — if zero, you're not honest
- 📋 YOU ARE a pessimist, paid to find what breaks
- 💬 FOCUS on what could go wrong + what we don't know
- 🚫 FORBIDDEN to write recommendation or impl plan

## EXECUTION PROTOCOLS:

- 🎯 Categorize: drawback / risk / unknown
- 💾 Write sections 7 (Drawbacks & Risks) + 8 (Open Questions)
- 📖 Complete fully before loading step-06
- 🚫 FORBIDDEN to load step-06 until both sections have content

## CONTEXT BOUNDARIES:

- Variables: `{rfc_path}`, `{auto_mode}`, `impact_risk`, `breaking_changes`
- Output: sections 7 + 8 of RFC.md

## YOUR TASK:

Surface every drawback, risk, and unknown of the proposed design. Force the design to defend itself.

## EXECUTION SEQUENCE:

### 1. Drawbacks (inherent costs)

Things that ARE the case even if everything goes right:
- New dependency added (vendor lock-in? license?)
- Increased complexity (cognitive load, ops)
- Performance cost (latency, memory, $)
- Backwards-compat break
- Learning curve for team
- Documentation debt

Each drawback = unavoidable consequence. Not "might happen" — "will happen".

### 2. Risks (probabilistic, mitigatable)

Things that MIGHT go wrong, with likelihood + impact:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration corrupts data | low | critical | dry-run + backup |
| Latency spike on rollout | medium | medium | feature flag + gradual |
| Lib X has CVE | low | high | pin + dependabot |

3-7 risks. If <3 → you didn't think hard.

### 3. Open questions (unknowns)

What we don't know yet and need to answer before merging:
- "What happens if X service is down during migration?"
- "Does Y comply with constraint Z?"
- "Confirm whether team A is OK with breaking change"
- "Benchmark missing — measure before locking design"

Each question must have:
- **Owner** (who answers it)
- **By when** (deadline or blocker on impl)

### 4. Rollout / rollback strategy

Sub-section in risks:
- How do we deploy? (feature flag, canary, percentage rollout, big bang)
- How do we rollback? (revert PR? data migration reversible?)
- Observability checkpoints (metrics that gate rollout progression)

### 5. Write sections 7 + 8

```markdown
## 7. Drawbacks & Risks

### Drawbacks (inherent)
- {drawback 1}
- {drawback 2}
- ...

### Risks (probabilistic)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | ... | ... | ... |

### Rollout / rollback
- **Rollout:** {strategy}
- **Rollback:** {procedure}
- **Gating metrics:** {SLI/SLO + threshold}

## 8. Open Questions

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |
```

### 6. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5]
updated: "{today}"
drawbacks_count: N
risks_count: M
open_questions_count: K
rollout_strategy: "feature_flag | canary | big_bang | ..."
```

## SUCCESS METRICS:

✅ ≥3 drawbacks listed
✅ ≥3 risks with likelihood + impact + mitigation
✅ ≥1 open question with owner + deadline
✅ Rollout strategy named
✅ Rollback procedure described (or "irreversible — flag it")

## FAILURE MODES:

❌ "No drawbacks" — lazy, always wrong
❌ Risks without mitigation — half a risk entry
❌ Vague open questions without owner → orphaned blockers
❌ Missing rollout — design isn't shippable
❌ "Rollback: revert the PR" for data migrations — irreversible work hidden

## NEXT STEP:

If `{auto_mode}` → load `./step-06-recommendation.md`.
Else AskUserQuestion:

```yaml
questions:
  - header: "Étape suivante"
    question: "Risques + questions listés. Formaliser recommandation ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Step 06 — Recommendation + rationale"
      - label: "Risques bloquants"
        description: "1+ risque non mitigable → revoir design (step-04)"
      - label: "Questions trop nombreuses"
        description: "Open questions > 5 → recherche additionnelle requise"
    multiSelect: false
```

<critical>
"Surface risk while change is still cheap" — pakkasys. RFC accepted ≠ guaranteed success. If reviewer can't find new risk, RFC is too optimistic.
</critical>
