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
- The DAG comes FROM the artifact (prd order + parent grouping / rfc Depends-on + Mermaid)

## YOUR TASK:

Order the tasks into a DAG, identify independent disjoint-file groups and same-file serialization sets, and write the locked `contract.md`.

---

## EXECUTION SEQUENCE:

### 1. Build the DAG

```
Nodes = {tasks}. Edges = dependencies (prd: parent order + explicit deps / rfc: Depends-on column).
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

Write `{output_dir}/contract.md` from `templates/contract.md`:
```
- One row per acceptance criterion (prd Given/When/Then) OR rfc Accept-criteria cell.
- Out-of-scope list (prd Out-of-scope / rfc Non-Goals) = never build.
- Edit scope = the union of the spec's authorized files.
Store {contract_path} = {output_dir}/contract.md.
```

The contract is the immutable target the verification bundle validates against. A requirement change later gets a NEW row, never a silent rewrite.

### 4. Confirm the plan

**If `{auto_mode}` = true:** proceed to step-03.

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Plan"
    question: "DAG: {N} tâches, {G} groupes indépendants, chemin critique {C}. Contrat verrouillé dans contract.md. Continuer ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Choisir le moteur d'exécution"
      - label: "Revoir l'ordre"
        description: "Ajuster l'ordonnancement (sans re-scoper le produit)"
    multiSelect: false
```

### 5. Update state

```yaml
stepsCompleted: [0, 1, 2]
independent_groups: [...]
contract_path: "{output_dir}/contract.md"
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
