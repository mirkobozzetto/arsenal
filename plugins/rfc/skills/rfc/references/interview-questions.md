# Interview Questions Bank

Used by steps that need user input. AskUserQuestion preferred; free-text for follow-ups.

## Step 02: Problem & Motivation

### Symptom (single-select)
**Q:** What concrete problem are you observing today?
- Bug / malfunction (incorrect behavior)
- Friction / slowness (painful, slow, costly process)
- Limit / blocker (impossible to do X)
- Risk / debt (not broken but dangerous)

### Trigger (single-select)
**Q:** Why now?
- Recent incident (post-mortem, fire)
- Deadline (release, compliance, business deadline)
- Dependency (lib EOL, vendor change, upstream migration)
- Opportunity (newly mature tech, opportunistic refactor)

### Stakeholders (multi-select)
**Q:** Who is impacted?
- End users
- Internal dev team
- Ops / SRE
- Security / compliance
- Business / product

### Signals (free-text)
- Quantitative metrics observed?
- Logs / errors?
- Volume / frequency?

### Goals (free-text, structured)
- 3-5 measurable goals. Format: "X goes from A to B" or "Enable X without Y".

### Non-Goals (free-text, structured)
- 3-5 explicit. Format: "We are NOT solving X in this RFC".

---

## Step 03: Alternatives

### Alt generation (free-text)
- Status quo cost ? (mandatory)
- Approche minimale ? (smallest patch)
- Approche standard ? (industry pattern)
- Approche bold ? (novel / bigger refactor)

### Per-alternative drill (single-select per alt)
**Reversibility:**
- Easy (one PR revert)
- Hard (data migration, multi-system)
- One-way door (can't undo without major effort)

**Cost dominant:**
- Engineering effort
- Ongoing ops cost
- $ (license, infra)
- Cognitive load / learning curve

---

## Step 04: Design

### Base alternative pick (single-select)
**Q:** Which alternative serves as the base?
- List generated from step-03
- "Hybrid" option → specify what comes from each

### Diagram type (multi-select)
**Q:** Which diagrams are needed?
- Architecture (flowchart)
- Sequence (API/flows)
- ER (schema)
- State (lifecycle)
- C4 (system boundary)

### Breaking changes (single-select)
- None
- Public API breaking
- Schema breaking (migration)
- Behavior breaking (silent semantics change)

---

## Step 05: Risks

### Rollout strategy (single-select)
- Feature flag (per-user, percentage)
- Canary (1 pod → 10% → 100%)
- Blue/green
- Big bang
- Dark launch (shadow traffic)

### Rollback feasibility (single-select)
- PR revert is enough
- Reversible migration (down script)
- Backup + restore required
- Irreversible: prominent flag

### Open questions ownership (free-text)
Per question:
- Owner (name / role)
- Deadline (date or "before T0X")

---

## Step 06: Recommendation

### Confidence (single-select)
- High (≥80% sure the design holds for 12 months)
- Medium (50-80%, depends on identified variables)
- Low (<50%, hypothesis to validate via prototype)

### Revisit triggers (free-text)
- Concrete conditions that would invalidate the choice
- Ex: "load > 10x", "vendor change", "team size double"

---

## Step 07: Impl Plan

### Task split heuristic
If effort > 1 day → split. Criteria:
- Compilable / testable independently
- Reviewer can follow the diff without too much context
- Distinct acceptance criteria

### Verification depth (single-select per task)
- Unit only
- Unit + integration
- Unit + integration + perf
- Manual (rare, justify)

---

## Step 08: Review

### Subagent flavors (multi-select)
- Gap hunter (missing requirements, edge cases)
- Impl realism (tasks underestimated, ops surprises)
- Security review (OWASP, authz, secrets)
- Perf review (latency, throughput, memory)

### Action on BLOCKER (single-select)
- Revise RFC (loop back to the relevant steps)
- Accept blockers (document, continue)
- Abandon RFC (status: Rejected)

---

## Step 09: Finalize

### Status (single-select)
- Draft (ready to circulate)
- Review (in progress)
- Accepted (validated, permission to implement)
- Rejected (decision = do not do it)

### Handoff (single-select)
- Stop here (artifact only)
- Run /ship on the impl plan
- Run /sdd (spec-driven)
- Push to /brain (Obsidian)
