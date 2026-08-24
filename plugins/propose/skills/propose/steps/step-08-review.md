## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip review unless `{skip_review}` = true
- 🛑 NEVER edit PROPOSAL.md based on review findings here: capture only
- ✅ ALWAYS spawn subagent (different perspective from main thread)
- ✅ ALWAYS classify findings by severity, and land them where `{format}` says
- 📋 YOU ARE a review orchestrator, not a reviewer yourself
- 💬 FOCUS on dispatching + capturing findings
- 🚫 FORBIDDEN to defend the proposal against findings: neutral capture

## EXECUTION PROTOCOLS:

- 🎯 Spawn ≥1 subagent (general-purpose) with adversarial prompt
- 💾 Write section 11 (Review Findings) with severity labels
- 📖 Complete before loading step-09
- 🚫 FORBIDDEN to load step-09 until findings written OR explicit "no issues"

## CONTEXT BOUNDARIES:

- Variables: `{proposal_path}`, `{auto_mode}`, `{skip_review}`, full proposal sections 1-10
- Output: section 11 of PROPOSAL.md
- Resources: `Agent` tool with `subagent_type=general-purpose`

## YOUR TASK:

Spawn adversarial subagent(s) to attack the proposal. Where the findings land
depends on `{format}`.

### Where findings go

| Format | Findings |
|---|---|
| `short`, `propose` | APPLIED to the sections they hit; no section 11 |
| `full` | captured neutrally in section 11, then applied |

The short formats do not carry a review log: a finding that changed the
text is already in the text, and one that did not change it is either
resolved in conversation or it is a blocker that stops the proposal. Piling the
log at the end was adding 100 lines nobody re-reads.

Applying a finding still means saying so: report each BLOCKER and MAJOR to
the user in one line, with what you changed.

## EXECUTION SEQUENCE:

### 1. Bail if skipped

If `{skip_review}` = true → jump to step-09. In `full`, mark section 11
as `_skipped via --no-review_` first. In the short formats, write nothing.

### 2. Read full proposal

Read `{proposal_path}` completely. Subagent needs full content.

### 3. Dispatch 1-2 adversarial subagents (in parallel)

**Subagent A: Gap hunter**

```
Agent({
  description: "Adversarial proposal review: gaps",
  subagent_type: "general-purpose",
  prompt: `
    Read this full proposal and find the GAPS: missing requirements,
    ignored edge cases, hidden assumptions, internal contradictions.

    proposal content:
    ---
    {full PROPOSAL.md content}
    ---

    For each finding, output:
    - Severity: BLOCKER | MAJOR | MINOR | NIT
    - Section: which section of proposal
    - Issue: ≤2 sentences
    - Suggestion: ≤2 sentences

    Format: markdown table. No praise, no recap.
    Be skeptical. Your job = find what is missing, not validate.
  `
})
```

**Subagent B: Impl realism** (optional, if `tasks_count > 5`)

```
Agent({
  description: "Adversarial proposal review: impl realism",
  subagent_type: "general-purpose",
  prompt: `
    Read this full proposal and challenge the impl plan (section 10).
    Look for: underestimated tasks, hidden deps, ops assumptions,
    ignored rollback risks, what breaks in prod.

    proposal content: ---
    {full PROPOSAL.md content}
    ---

    Output format identical to Subagent A.
  `
})
```

Run both in parallel if used.

### 4. Capture findings (neutral)

Aggregate findings from subagent(s). Don't filter. Sort by severity.

### 5. Land the findings

**`short` and `propose`:** apply each finding to the section it hits, then report
to the user in one line per BLOCKER and MAJOR: what was raised, what
changed. Write no section 11.

**`full`:** write section 11 as below, then apply.

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

A BLOCKER you already RESOLVED by editing the proposal is not a blocker
any more: report what you fixed in one line each and go straight to
step-09. Do NOT pause, do NOT ask what to do about it.

Only an UNRESOLVED blocker stops the flow. List those in prose, one line
each, and name the three ways out: revisit the proposal, accept the
blocker and document it in its section, or abandon (status Rejected).
Ask in plain prose, not with AskUserQuestion. Under `auto_mode`, revisit.

### 7. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7, 8]
updated: "{today}"
```

Severity counters are NOT written to frontmatter: nothing reads them, and
they were four lines of noise on every document.

## SUCCESS METRICS:

✅ ≥1 subagent dispatched (or explicit skip flag)
✅ Findings classified BLOCKER/MAJOR/MINOR/NIT
✅ User sees the blockers before continuing
✅ Findings landed where `{format}` says: applied, or section 11 then applied

## FAILURE MODES:

❌ Reviewing the proposal yourself instead of spawning subagent (same model bias)
❌ Applying a finding silently: the user never learns what the review caught
❌ Defending the proposal instead of capturing the finding
❌ Filtering out findings you disagree with → loses adversarial value
❌ Writing section 11 in `short` or `propose`: that log is the padding this removes

## NEXT STEP:

If blockers accepted/none → load `./step-09-finalize.md`.
If user chose "Revisit proposal" → AskUserQuestion which step to reload (typically step-04 or step-05).
If "Abandon" → load step-09 with `status: Rejected`.

<critical>
Subagent has FRESH context: that's the point. Independent review > self-review every time. Resist urge to argue back.
</critical>
