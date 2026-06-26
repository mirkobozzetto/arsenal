---
name: step-04-execute
description: Implement on the selected tier, checkpoint at risk boundaries, mutate the trace ledger
prev_step: steps/step-03-engine.md
next_step: steps/step-05-verify.md
---

# Step 4 (Execute): Implement on Tier

## MANDATORY EXECUTION RULES:

- YOU ARE AN EXECUTOR of a locked spec, not a re-designer
- NEVER exceed the contract edit scope; NEVER add features the spec did not list
- NEVER run build/test/typecheck toolchain (that is verification, step-05)
- NEVER perform an irreversible op without the risk-boundary checkpoint
- ALWAYS read before edit; ALWAYS mutate trace.md per completed unit

## CONTEXT BOUNDARIES:

- Available: `{tasks}`, `{independent_groups}`, `{engine_tier}`, `{contract_path}`, `{output_dir}`, `{artifact_kind}`, `{auto_mode}`
- Tools per tier: TeamCreate/TaskCreate/Agent/SendMessage (teams), Agent (subagents), Read/Write/Edit/Grep/Bash (solo)
- Load `references/guardrails.md` for the hazard list before any risky op
- Load `references/role-templates.md` for worker prompts (teams/subagents)

## YOUR TASK:

Implement every task on `{engine_tier}`, checkpoint at risk boundaries, and keep trace.md as the live ledger.

---

## EXECUTION SEQUENCE:

### 0. Initialize the ledger

```
Write {output_dir}/trace.md from templates/trace.md (artifact, kind, engine_tier).
Set {trace_path}. One row per task; status starts "todo".
```

### 1. Run the matching tier protocol

**SOLO (`engine_tier` = solo):**
```
For each task in topological order:
  - Read every file in the task's edit scope.
  - Implement ONLY the contract items for this task. No scope creep.
  - Risk-boundary check (see step 2) before any hazardous op.
  - Update trace.md row -> done (files touched + 1-line diff summary).
  - For prd: record the unit in trace.md only; tasks.md checkboxes are synced once at finish (step-06), not here.
```

**SUBAGENTS (`engine_tier` = subagents):**
```
For each independent group, spawn an Agent (subagent_type general-purpose, mode bypassPermissions, NEVER run_in_background)
  using the `subagent-implementer` template from role-templates.md (inject the global constraint floor + this unit's contract excerpt + edit scope + design excerpt).
Serialize same-file sets. Capture each Agent's unit report. Write trace.md rows from the reports.
Irreversible ops are returned flagged by the worker -> the lead handles the risk-boundary checkpoint, never the worker.
```

**TEAMS (`engine_tier` = teams):**
```
ORDER IS FIXED: TeamCreate -> TaskCreate -> Agent.
1. TeamCreate team_name = "ship-<slug>" (truncate 20 chars).
2. One TaskCreate per independent group; addBlockedBy for cross-group deps.
3. Spawn teammates ONE AT A TIME (general-purpose, bypassPermissions, NEVER run_in_background) using the
   `teams-implementer` template (inject constraint floor + contract excerpt + edit scope + design excerpt).
4. Collect unit reports via SendMessage; write trace.md rows.
Store {team_name}. Same-file sets still serialize. Workers never do irreversible ops: they report; the lead checkpoints.
```

### 2. Risk-boundary checkpoint

Before any op on the `references/guardrails.md` hazard list:
```
ALWAYS-ASK hazards (DB/migration, deletion, dependency removal, public-API break, security change):
  -> AskUserQuestion EVEN IF auto_mode (safety override; "Never modify a DB without explicit approval").
     Options: Proceed / Skip this op / Halt. Record the decision in trace.md Checkpoints.
Other irreversible ops (e.g. new dependency, scope-edge):
  -> auto_mode may proceed but MUST log to trace.md; otherwise ask.
Never let a worker perform these: only the lead, after approval.
```

### 3. Task ledger = trace.md only (no live checkbox writes)

```
During execute, trace.md is the ONLY live ledger. Do NOT mutate tasks.md (prd) or RFC.md (rfc) here.
The prd tasks.md checkboxes are reconciled from trace.md exactly once, at finish (step-06 CASE A):
shipped + criteria satisfied authorizes the [ ] -> [x] flip, so there is no per-unit confirm and no
auto_mode hole where progress silently never lands. For rfc: RFC.md stays immutable; progress lives only in trace.md.
```

### 4. Anti-premature-stop + HALT

```
Do NOT stop for milestones, "significant progress", or session boundaries.
Continue until every task is done in trace.md, UNLESS a HALT fires:
  - a task fails its read-only self-check 3x (carry to step-05),
  - an rfc BLOCKER blocks a task,
  - a risk-boundary returns Halt.
On HALT: set {final_status} = halted, jump to step-06-finish.
```

### 5. Update state

```yaml
stepsCompleted: [0, 1, 2, 3, 4]
team_name: "<name|null>"
trace_path: "{output_dir}/trace.md"
final_status: "shipped"   # or halted
```

---

## SUCCESS METRICS:

- Every task implemented within its contract edit scope, no scope creep
- Risk-boundary checkpoints fired on hazards; DB/destructive asked even in auto_mode
- trace.md updated per unit; tasks.md/RFC.md untouched here (checkbox sync happens once at finish)
- No build/test toolchain run here
- Teams order TeamCreate -> TaskCreate -> Agent; never run_in_background

## FAILURE MODES:

- Scope creep beyond the contract -> Recovery: revert the extra edit, re-scope to the spec
- Worker runs an irreversible op -> Recovery: forbidden; lead-only after approval
- Auto-proceeding on a DB change -> Recovery: ALWAYS ask, even with -a
- Same-file tasks parallelized -> Recovery: serialize them
- Mutating an Accepted RFC.md -> Recovery: never; trace.md only

## EXECUTE PROTOCOLS:

- Read before edit, contract-scoped edits only
- The lead owns every risk-boundary checkpoint
- trace.md is the live single source of truth

---

## NEXT STEP:

Load `./step-05-verify.md` (even on HALT, verify what was done, then finish).

<critical>
Execute the spec, nothing more. Toolchain stays off here. Verification ships as a bundle in step-05.
</critical>
