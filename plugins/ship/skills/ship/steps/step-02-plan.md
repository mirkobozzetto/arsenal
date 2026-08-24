---
name: step-02-plan
description: Build the execution DAG into independent groups + serialization sets, write contract.md
prev_step: steps/step-01-ingest.md
next_step: steps/step-03-engine.md
---

# Step 2 (Plan): DAG Scheduling + Contract Lock

## MANDATORY EXECUTION RULES:

- YOU ARE A SCHEDULER, not a re-designer or implementer
- NEVER re-decompose product scope; schedule only what the spec lists
- NEVER implement anything here
- ALWAYS derive parallelism from disjoint file sets, not guesses
- ALWAYS write contract.md BEFORE any execution

## CONTEXT BOUNDARIES:

- Available: `{tasks}`, `{detected_stack}`, `{artifact_kind}`, `{artifact_path}`, `{output_dir}`
- Tools: Read, Write, Glob, Grep
- The DAG comes FROM the artifact (brief order + parent grouping / propose Depends-on + Mermaid)

## YOUR TASK:

Order the tasks into a DAG, identify independent disjoint-file groups and same-file serialization sets, and write the locked `contract.md`.

---

## EXECUTION SEQUENCE:

### 1. Build the DAG

```
Nodes = {tasks}. Edges = dependencies (brief: parent order + explicit deps / propose: Depends-on column).
Topologically order. Reject cycles (report + HALT if a cycle exists in the spec).
```

### 2. Identify parallel structure

```
independent_groups = maximal sets of tasks whose edit-scope FILE SETS are pairwise disjoint AND have no cross dependency.
serialization_sets = tasks that share any file -> must run sequentially regardless of tier.
critical_path = longest dependency chain (for reporting / sizing).
```

Store `{independent_groups}`. This count drives the engine probe in step-03 (>=2 disjoint groups enables fan-out).

### 3. Lock the contract

Optionally seed the three artifacts in one shot with `bash scripts/scaffold.sh {output_dir}` (copies the templates if absent), then fill them.

Write `{output_dir}/contract{run_id}.md` from `templates/contract.md`:
```
- One row per acceptance criterion (brief Given/When/Then) OR propose Accept-criteria cell.
- Out-of-scope list (brief Out-of-scope / propose Non-Goals) = never build.
- Edit scope = the union of the spec's authorized files.
Store {contract_path} = {output_dir}/contract{run_id}.md.
```

The contract is the immutable target the verification bundle validates against. A requirement change later gets a NEW row, never a silent rewrite.

### 3b. Single-repo check

Everything downstream assumes ONE repository: `{project_root}` comes from a
single `git rev-parse`, the branch, the per-task commits and the PR all live
there. A plan whose files span two repos would half-land, silently.

```
Resolve the git root of every path in the contract edit scope
(`git -C <dir> rev-parse --show-toplevel`).
IF more than one distinct root, or a path outside {project_root}:
  -> HALT, and hand back a SPLIT PLAN, not a diagnosis.
Never attempt a cross-repo run: ship has no cross-repo branch, commit or PR.
```

The split plan is a table (repo, task ids, why it goes first) FOLLOWED by
the exact pasteable commands, in dependency order, one block per run:

```
cd <repo-1-abs-path>
/ship --tasks T01-T06 {artifact_path}

# then, once run 1 is shipped:
cd <repo-2-abs-path>
/ship --tasks T07-T16 {artifact_path}
```

`--tasks` is what makes a partial run legal, and `{run_id}` keeps each
run's contract / trace / bundle separate inside the same spec folder. Say
in ONE line which run to start with and why (the dependency that decides
it). Ambiguity here is the failure: the user must not have to work out
the commands.

### 4. Branch checkpoint + run commit grant

Skip entirely if `{commit_mode}` = false.

This checkpoint ALWAYS asks, even in auto_mode (it is a git write decision,
never inferred). One question, answered once per run:

```yaml
questions:
  - header: "Branch"
    question: "Progressive commits are on: one commit per finished task. Where should they land? (current branch: {current_branch})"
    options:
      - label: "New branch ship/{slug} (Recommended)"
        description: "Create it from {current_branch} and commit there"
      - label: "Stay on {current_branch}"
        description: "Commit directly on the current branch"
      - label: "No commits this run"
        description: "Behave like --no-commit"
    multiSelect: false
```

On a branch answer:
```
IF new branch: Graphite repo (.graphite_repo_config or `gt log` answers) -> `gt create -ai ship/{slug}`, else `git checkout -b ship/{slug}`.
Set {work_branch}. The branch answer IS the run's commit authorization:
write the grant so the git guard stays quiet for this run's commits only:
  printf '%s %s\n' "$(git rev-parse --show-toplevel)" "{work_branch}" > ~/.claude/.git-guard-commit-grant
The grant covers ONLY `git commit` on this repo+branch. push / PR / rebase still prompt.
IF "No commits": set {commit_mode} = false, no grant.
```

### 5. Confirm the plan

**If `{auto_mode}` = true:** proceed to step-03.

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Plan"
    question: "DAG: {N} tasks, {G} independent groups, critical path {C}. Contract locked in contract.md. Continue?"
    options:
      - label: "Continue (Recommended)"
        description: "Choose the execution engine"
      - label: "Review the order"
        description: "Adjust the scheduling (without re-scoping the product)"
    multiSelect: false
```

### 6. Update state

```yaml
stepsCompleted: [0, 1, 2]
independent_groups: [...]
contract_path: "{output_dir}/contract{run_id}.md"
work_branch: "{work_branch}"
commit_mode: {commit_mode}
```

---

## SUCCESS METRICS:

- DAG built from the artifact, cycles rejected
- independent_groups = disjoint-file sets; same-file tasks serialized
- contract.md written with one row per acceptance criterion + out-of-scope + edit scope
- No product re-decomposition

## FAILURE MODES:

- Re-scoping the product -> Recovery: schedule only the spec's tasks
- Parallelizing same-file tasks -> Recovery: serialize anything sharing a file
- Contract missing a criterion -> Recovery: every acceptance criterion gets a row
- Cycle in the spec deps -> Recovery: report + HALT (spec needs fixing upstream)

## PLAN PROTOCOLS:

- Parallelism keys off disjoint FILE sets, not task themes
- contract.md is locked before execution and never silently edited

---

## NEXT STEP:

Load `./step-03-engine.md`.

<critical>
Schedule, don't redesign. The contract is the definition of done: lock it now.
</critical>
