## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER recommend without rationale tying back to goals (section 4)
- 🛑 NEVER hide which alternative was chosen
- ✅ ALWAYS justify against each rejected alternative: "why not Alt 2?"
- ✅ ALWAYS state confidence level (high/medium/low) honestly
- 📋 YOU ARE a decision writer, not a salesperson
- 💬 FOCUS on recommendation + rationale + confidence
- 🚫 FORBIDDEN to draft impl steps: step-07

## EXECUTION PROTOCOLS:

- 🎯 Recommendation = chosen alt + why this one + why not others
- 💾 Write section 9 (Recommendation & Rationale)
- 📖 Complete fully before loading step-07
- 🚫 FORBIDDEN to load step-07 until rationale references goals + rejected alts

## CONTEXT BOUNDARIES:

- Variables: `{rfc_path}`, `{auto_mode}`, `base_alternative`, `alternatives_count`, `goals_count`
- Output: section 9 of RFC.md

## YOUR TASK:

State the recommendation and defend it. Make rejection of other alternatives explicit so future readers don't relitigate.

## EXECUTION SEQUENCE:

### 1. Recommendation statement (1 paragraph)

Pattern:
> **Recommendation:** Adopt **{Alt N: Name}** as designed in section 6.
>
> Confidence: **{high | medium | low}**: {1 sentence why this confidence level}.

### 2. Why this one

For each goal (from section 4), explain how the chosen design hits it:

| Goal | How recommended design hits it |
|------|-------------------------------|
| {goal 1} | {mechanism in section 6 that addresses it} |
| {goal 2} | ... |

### 3. Why not others

For each rejected alternative from section 5, ONE sentence why rejected:

```markdown
### Why not other alternatives

- **Alt 0 (status quo):** rejected because {cost of inaction > impl cost}.
- **Alt 1 ({name}):** rejected because {specific blocker, not "less good"}.
- **Alt 3 ({name}):** rejected because {specific blocker}.
```

Rejection MUST be specific. "Not as elegant" = not specific. "Requires Postgres ≥14, we run 12" = specific.

### 4. Conditions for revisiting

When would this recommendation be wrong?

```markdown
### Revisit if
- {trigger 1, e.g., "load > 10x current"}
- {trigger 2, e.g., "vendor X discontinues product"}
```

Forces honesty about scope assumptions.

### 5. Write section 9

```markdown
## 9. Recommendation & Rationale

**Recommendation:** Adopt **{chosen}** as designed in section 6.

**Confidence:** {high | medium | low}: {why}.

### How it hits the goals
| Goal | Mechanism |
|------|-----------|
| ... | ... |

### Why not other alternatives
- **Alt 0 (status quo):** ...
- **Alt N:** ...

### Revisit if
- ...
- ...
```

### 6. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5, 6]
updated: "{today}"
recommendation: "{Alt name}"
confidence: high | medium | low
```

## SUCCESS METRICS:

✅ One clear recommendation declared
✅ Confidence level stated (not avoided)
✅ Every goal mapped to a design mechanism
✅ Every rejected alt has specific rejection reason
✅ ≥1 "revisit if" trigger listed

## FAILURE MODES:

❌ Hedging ("we lean toward X but Y is also fine"): pick one
❌ Rejection reasons that are tautological ("Alt 2 is worse")
❌ Missing confidence level → invites overconfidence downstream
❌ No "revisit if" → pretends design works under all conditions

## NEXT STEP:

Proceed to `./step-07-impl-plan.md`. Tell the user in one short line, in the conversation language, the recommendation (e.g. "recommend: <alt>, confidence: <level>") - do NOT paste the section markdown into the chat. No "continue?" confirmation gate. The user may say "stop" or flag low confidence to loop back for research.

<critical>
"Accepted = permission to implement, not guarantee of perfection" (pakkasys). Recommendation is a hypothesis; revisit-if conditions are how you stay honest later.
</critical>
