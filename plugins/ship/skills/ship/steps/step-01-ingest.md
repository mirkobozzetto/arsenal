---
name: step-01-ingest
description: Read the spec, apply the run-gate, parse tasks into a DAG, detect the toolchain
prev_step: steps/step-00-init.md
next_step: steps/step-02-plan.md
---

# Step 1 (Ingest): Read Spec, Gate, Parse, Detect Stack

## MANDATORY EXECUTION RULES:

- YOU ARE A READER, not an author or implementer
- NEVER invent tasks beyond the artifact; NEVER re-author acceptance criteria
- NEVER implement anything in this step
- ALWAYS apply the run-gate before parsing tasks
- ALWAYS detect the existing toolchain; NEVER assume pnpm/Node

## CONTEXT BOUNDARIES:

- Available: `{artifact_kind}`, `{artifact_path}`, `{output_dir}`, `{auto_mode}`, flags
- Tools: Read, Glob, Grep, Bash (read-only stack detection)
- The artifact is the source of truth; tasks must trace to it

## YOUR TASK:

Read the spec, enforce the run-gate, parse its tasks into `{tasks}`, and detect `{detected_stack}`.

---

## EXECUTION SEQUENCE:

### 1. Apply the run-gate

**CASE A (prd):**
```
Read {artifact_path}/prd.md frontmatter. Branch on status (the lifecycle is draft -> ready -> in_progress -> shipped):
  shipped     -> Refuse: "Already shipped (shipped_at: <ts>). Nothing to build. Bump the version for a change,
                 or pass -r to re-open a halted run." HALT. NEVER silently re-build a shipped spec.
  in_progress -> A prior run halted. Prefer resume: "This PRD is in_progress; resuming from trace.md."
                 Continue as a -r resume (read trace.md for done-vs-remaining) rather than restarting from zero.
  ready       -> proceed.
  draft/none  -> Refuse: "PRD not finalized (status != ready). Run prd step-04, or confirm an override."
                 HALT (route to step-06-finish, final_status = halted) unless the user explicitly overrides.
Pre-flight echo (before parsing): show status + task counts from tasks.md (done/total) so the user sees what will
  run before it runs. This is the "check before acting" pass; it never silently charges ahead.
Note: the "Do NOT implement" line in tasks.md is a PROHIBITION on prd, NOT an authorization. Do not treat it as the gate.
```

**CASE B (rfc):**
```
Read {artifact_path} (RFC.md) frontmatter.
GATE: status MUST be "Accepted".
  IF status in (Draft, Review, Rejected):
    -> Refuse: "RFC not Accepted (status: <x>). An RFC runs only once it is Accepted."
    -> HALT (route to step-06-finish with final_status = halted) unless explicit override.
```

**CASE C (inline, "ship direct"):**
```
No artifact, no status gate. Build the inline spec via a SHORT structured interview, then derive the contract.
1. Interview (AskUserQuestion, unless auto_mode): ask only what is missing to ship safely. Structure {raw_prompt}
   with the prompt-creator frame into four blocks:
     - CONTEXT: stack / files / branch in play (detect what you can, ask only the gaps).
     - TASK: one clear imperative restatement of what to build (drop "try to", "maybe").
     - REQUIREMENTS: explicit constraints + edit scope (which files/areas may change).
     - SUCCESS: 2-5 acceptance items that define "done".
   Keep it to 1-2 question rounds; never a full PRD interview.
2. Derive the MINIMAL execution spec from the four blocks:
     - a short ordered task list (outcomes, not code lines),
     - the 2-5 acceptance items as the contract,
     - the likely edit scope.
GATE: confirm the derived spec with the user (AskUserQuestion, unless auto_mode). The user's confirmation IS
  the run-gate. On decline -> adjust or HALT. Stays lightweight: no user stories, no product metrics. For a
  durable spec, run /prd.
```

### 2. Parse tasks into {tasks}

For CASE C (inline), {tasks} comes from the confirmed derived list in step 1 (no file to parse); skip to step 3.

**CASE A (prd):** read `{artifact_path}/tasks.md`
```
- Confirm frontmatter type: tasks; capture source_prd.
- Parse ## Relevant Files -> edit-scope hints.
- Parse ## Tasks nested checklist: each `- [ ] N.0 <parent> _(PRD: <ref>)_` with sub-tasks `- [ ] N.x`.
- Follow source_prd -> prd.md: capture Acceptance criteria (Given/When/Then), Success metrics, Out-of-scope.
- Build {tasks}: one entry per parent (N.0) with its sub-tasks, ordered by listed order + dependency, each tagged with its PRD criterion and edit-scope files.
```

**CASE B (rfc):** read section 10 Implementation Plan in `{artifact_path}`
```
- Parse the Tasks table rows (ID, title, files, deps, effort, accept).
- Cross-check the `graph TD` dependency Mermaid against the Depends-on column.
- Read section 6 Proposed Design (HOW), section 11 Review Findings.
- IF any section 11 BLOCKER or MAJOR is unresolved and blocks a task -> flag it; that task is HALT-gated until resolved.
- Effort sanity: an XL task should already be split; if not, note it for step-02 to serialize carefully.
- Build {tasks}: one entry per T-id with deps, accept-criterion, files, ordered topologically.
```

### 3. Detect the toolchain ({detected_stack})

Prefer the deterministic helper: `bash scripts/detect-stack.sh {project_root}` prints `{"language","package_manager"}`. Use it first; fall back to the manual mapping below only if it errors or returns "unknown".

Read-only detection (no execution):
```
Lockfile -> package_manager:  pnpm-lock.yaml=pnpm | bun.lockb/bun.lock=bun | yarn.lock=yarn | package-lock.json=npm
Manifest -> language + cmds:  Cargo.toml=rust(cargo) | go.mod=go | pyproject.toml/uv.lock=python(uv/poetry) | Gemfile=ruby(bundler) | pom.xml/build.gradle=jvm(maven/gradle) | package.json=js/ts
Read the manifest's scripts/targets to capture test_cmd / typecheck_cmd / lint_cmd / build_cmd as they actually exist.
IF unknown / polyglot / ambiguous:
  -> AskUserQuestion (unless auto_mode) which commands verify this project; store the answer.
```

Never assume pnpm. The detected stack drives ONLY the verification bundle contents later.

### 4. Update state

```yaml
stepsCompleted: [0, 1]
tasks: [...]
detected_stack: {language, package_manager, test_cmd, typecheck_cmd, lint_cmd, build_cmd}
```

---

## SUCCESS METRICS:

- Run-gate enforced (prd status: ready / rfc status: Accepted); refusal HALTs cleanly
- {tasks} parsed straight from the artifact, traceable to criteria, zero invented tasks
- rfc BLOCKER/MAJOR findings flagged before execution
- {detected_stack} detected from lockfile/manifest, unknown stacks asked

## FAILURE MODES:

- Treating the "Do NOT implement" header as the gate -> Recovery: real gate is prd.md status: ready
- Executing a non-Accepted RFC -> Recovery: HALT until status Accepted
- Inventing tasks not in the artifact -> Recovery: parse only what the spec lists
- Hardcoding pnpm -> Recovery: detect via lockfile/manifest, ask if unknown

## INGEST PROTOCOLS:

- Gate FIRST, parse SECOND, detect stack THIRD
- Every task carries its source criterion + edit scope
- Out-of-scope items never become tasks

---

## NEXT STEP:

Load `./step-02-plan.md`.

<critical>
Read and gate only. ship executes what the artifact already decomposed: it never re-specs.
</critical>
