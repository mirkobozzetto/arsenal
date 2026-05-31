---
name: step-01-interview
description: Targeted clarifying questions, loop until enough signal to draft the PRD
prev_step: steps/step-00-init.md
next_step: steps/step-02-draft-prd.md
---

# Step 1: Interview

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER draft the PRD in this step
- 🛑 NEVER pick a technical solution (that is rfc, not prd)
- ✅ ALWAYS ask about product value, not implementation
- 📋 YOU ARE A product interviewer, not an architect
- 💬 FOCUS on eliciting answers only
- 🚫 FORBIDDEN to advance until ambiguity is resolved or the user says "enough"

## EXECUTION PROTOCOLS:

- 🎯 Ask in small batches, reflect answers back before the next batch
- 💾 Accumulate answers into the `answers` state object
- 📖 Complete elicitation before loading step-02
- 🚫 FORBIDDEN to load step-02 until the decision gate passes

## CONTEXT BOUNDARIES:

- Available from init: feature_name, feature_slug, prd_path, tasks_path, auto_mode, skip_interview
- If `skip_interview` = true, do not run this step; load step-02 directly
- Don't assume knowledge from future steps

## YOUR TASK:

Elicit the product signal needed to write the PRD through targeted questions, looping until ambiguity is resolved.

---

## EXECUTION SEQUENCE:

### 1. Cover the required dimensions

Ask until each is answered (group into 1-2 AskUserQuestion rounds, one question per dimension):

- **JTBD**: what job does the user hire this feature to do?
- **Target user**: who, and what is their current workaround?
- **Problem**: what pain/cost exists today? Why now?
- **Constraints**: hard limits (deadline, platform, compliance, budget).
- **Data source**: where does the data come from / live?
- **Business rule**: the core rules that govern correct behavior.
- **Exception**: edge cases, failure handling, what must NOT happen.

Use AskUserQuestion for each dimension. Provide 2-4 concrete option guesses + the user can free-text. Example shape:
```yaml
questions:
  - header: "JTBD"
    question: "What job does the user 'hire' this feature to accomplish?"
    options:
      - label: "<guess A>"
        description: "<why>"
      - label: "<guess B>"
        description: "<why>"
    multiSelect: false
```

### 2. Reflect back

Summarize the gathered `answers` in a short bullet recap. Mark any dimension still thin.

### 3. Decision gate: enough signal?

**If `auto_mode` = true:**
→ If all 7 dimensions have an answer, proceed; else ask the thin ones once more, then proceed.

**If `auto_mode` = false:**
Use AskUserQuestion:
```yaml
questions:
  - header: "Scoping"
    question: "Enough signal to draft the PRD?"
    options:
      - label: "Draft (Recommended)"
        description: "Scoping is sufficient, move to the PRD"
      - label: "Re-question"
        description: "Dig into the dimensions that are still fuzzy"
    multiSelect: false
```
Route: Re-question → loop back to sequence 1 for the thin dimensions.

### 4. Update State

```yaml
---
stepsCompleted: [0, 1]
answers: { jtbd, target_user, problem, constraints, data_source, business_rule, exception }
---
```

---

## SUCCESS METRICS:

✅ All 7 dimensions have a recorded answer
✅ Answers reflected back to the user
✅ Decision gate passed (drafted only with enough signal)
✅ `answers` object persisted

## FAILURE MODES:

❌ Drafting the PRD here
❌ Choosing a technical approach
❌ Advancing with thin/ambiguous answers
❌ **CRITICAL**: Not using AskUserQuestion for elicitation and the gate

## INTERVIEW PROTOCOLS:

- One dimension per question; never bundle unrelated dimensions
- Offer concrete guesses as options so the user can confirm fast
- Keep questions in English; identifiers in English

---

## NEXT STEP:

After the decision gate passes, load `./step-02-draft-prd.md`.

<critical>
Remember: This step gathers product signal only. No drafting, no architecture.
</critical>
