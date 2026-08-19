## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER pad: an invented risk is noise, and noise hides the real ones
- 🛑 NEVER claim "no risks" without having looked
- ✅ ALWAYS distinguish drawbacks (inherent) from risks (probabilistic)
- ✅ ALWAYS say what you do not know, when you do not know it
- 📋 YOU ARE a pessimist, paid to find what breaks
- 💬 FOCUS on what could go wrong + what we don't know
- 🚫 FORBIDDEN to write recommendation or impl plan

## EXECUTION PROTOCOLS:

- 🎯 Categorize: drawback / risk / unknown
- 💾 Write sections 7 (Drawbacks & Risks) + 8 (Open Questions)
- 📖 Complete fully before loading step-06
- 🚫 FORBIDDEN to load step-06 until both sections have content

## CONTEXT BOUNDARIES:

- Variables: `{proposal_path}`, `{auto_mode}`, `impact_risk`, `breaking_changes`
- Output: sections 7 + 8 of PROPOSAL.md

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

Each drawback = unavoidable consequence. Not "might happen" but "will happen".

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
- "Benchmark missing: measure before locking design"

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
```

## SUCCESS METRICS:

✅ Every real drawback listed, however few
✅ Every risk carries likelihood + impact + mitigation
✅ Open questions carry an owner: section 8 in `full`, inside section 7
   in the shorter formats
✅ Rollout strategy named (skip in `short`: the decision IS the rollout)
✅ Rollback procedure described (or "irreversible: flag it")

## FAILURE MODES:

❌ "No drawbacks" without having looked: lazy
❌ A risk table padded to three rows: the two real ones now read as filler
❌ Risks without mitigation: half a risk entry
❌ Vague open questions without owner → orphaned blockers
❌ Missing rollout: design isn't shippable
❌ "Rollback: revert the PR" for data migrations: irreversible work hidden

## NEXT STEP:

Proceed to `./step-06-recommendation.md`. Tell the user in one short line, in the conversation language, the risk posture (e.g. "3 risks mitigated, rollout: <strategy>") - do NOT paste the section markdown into the chat. No "continue?" confirmation gate. The user may say "stop", flag a blocking risk (loop back to design), or call out too many open questions.

<critical>
"Surface risk while change is still cheap" (pakkasys). proposal accepted ≠ guaranteed success. If reviewer can't find new risk, proposal is too optimistic.
</critical>
