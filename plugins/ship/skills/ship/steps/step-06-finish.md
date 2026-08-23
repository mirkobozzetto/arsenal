---
name: step-06-finish
description: Team shutdown, force-trash orphans, print handoff; MANDATORY on every path
prev_step: steps/step-05-verify.md
---

# Step 6 (Finish): Shutdown + Handoff

## MANDATORY EXECUTION RULES:

- YOU ARE A CLOSER AND REPORTER, not an implementer
- NEVER use `rm -rf`; ALWAYS `trash`
- NEVER push. A PR only through the user-story validation gate below
- ALWAYS remove the run commit grant, on every path
- NEVER skip this step, even on HALT or refusal
- ALWAYS shut teammates down gracefully before TeamDelete

## CONTEXT BOUNDARIES:

- Available: `{team_name}`, `{engine_tier}`, `{final_status}`, `{contract_path}`, `{bundle_path}`, `{trace_path}`, `{artifact_path}`, `{output_dir}`
- Tools: SendMessage, TeamDelete, Bash (trash), text output
- This is the terminal step on every path (shipped / halted / rejected)

## YOUR TASK:

Shut down any team, force-trash orphans, and print the handoff (bundle + trace + next actions), respecting the git write-guard.

---

## EXECUTION SEQUENCE:

### 1. Team shutdown (teams tier only)

```
IF {engine_tier} = teams AND {team_name}:
  For each teammate: SendMessage shutdown_request; wait <=10s for approve.
    No response -> 2nd request -> wait 10s -> mark zombie, proceed.
  After all confirmed/zombie: TeamDelete team_name.
  Force cleanup (failsafe):
    trash ~/.claude/teams/{team_name}/ 2>/dev/null
    trash ~/.claude/tasks/{team_name}/ 2>/dev/null
  NEVER rm -rf. If trash missing: mv to /tmp/zombie-{team_name}-<ts>/.
ELSE: skip (subagents/solo have no team).
```

### 2. Print handoff (plain ASCII, no emojis)

```
===========================================
  ship: {final_status}
===========================================
Artifact:  {artifact_path} ({artifact_kind})
Engine:    {engine_tier}
Contract:  {contract_path}   ({P}/{N} criteria satisfied)
Bundle:    {bundle_path}      <- run these checks yourself
Trace:     {trace_path}       <- resume from here

Branch:    {work_branch}          ({K} progressive commits, see trace)

Next:
  1. Run the verification bundle: {bundle_path}
  2. If green, validate the user story below to open the PR.
  3. Resume later if needed: /ship -r {artifact_path}
```

For `final_status` = halted: state the HALT reason (gate failed / 3x self-check / propose BLOCKER) and what to fix.

### 3. Git closeout: leftovers, user story, PR

```
ALWAYS FIRST (every path): rm -f ~/.claude/.git-guard-commit-grant
IF {commit_mode} AND uncommitted contract-scoped changes remain (git status):
  offer ONE final commit for them (guard may prompt: grant is gone, expected).
```

**PR gate — only when `final_status` = shipped AND verification is green
(bundle run by the user came back clean, or --yolo SAFE checks all passed):**

```
1. Write the validation user story, in simple words, and PRINT it:
     As a <user of this feature>
     I want <what shipped>
     To validate: <2-5 concrete steps: what to click/run and what you must see>
   This is the PR's acceptance script, not marketing copy.
2. Ask: "Story accurate and validated on your side? Create the PR?"
   Options: "Create the PR" / "Not yet, I'll test first" / "No PR".
3. On "Create the PR":
   - base = `dev` if that branch exists (git branch --list dev / origin/dev), else `main`
   - Graphite repo -> `gt submit`; else `git push -u origin {work_branch}`
     then `gh pr create --base <base> --title "<conventional title>" --body "<summary + the user story>"`
   - push/PR still hit the guard prompt: that single ask IS the confirmation, expected.
4. On anything else: no PR; handoff stands, PR can happen later by hand.
IF verification NOT green or halted: no PR offer at all.
```

### 4. Close the loop (upstream status + task ledger)

Keep the `next` open-work board honest: an item must leave it once shipped, a halted run must point back to its resume command, and the upstream task checkboxes must match what trace.md recorded as done. trace.md is the live ledger during execute; this is the SINGLE point where its result is synced back into the brief's tasks.md, so `next` never reads a stale 0/N after a successful run.

```
IF final_status = shipped AND contract criteria all satisfied:
  CASE A (brief):
    1. set {artifact_path}/brief.md frontmatter status: shipped + shipped_at: <iso>.
    2. Reconcile {artifact_path}/tasks.md from {trace_path}:
       for every trace row with Status = done, take its Unit id (N.0 / N.x) and flip the
       matching `- [ ] <id> ...` line to `- [x] <id> ...`. Byte-preserving: only [ ] -> [x],
       no reorder/reformat; the "Do NOT implement" header and every other line stay intact.
       UNCONDITIONAL on this path (no confirm gate): shipped + criteria satisfied IS the
       authorization. A task with no done row stays unchecked.
  CASE B (propose): NEVER mutate PROPOSAL.md. Write a sibling marker {dir}/PROPOSAL.shipped with the date.
  CASE C (inline): no artifact; nothing to flip.
IF final_status = halted/paused:
  CASE A: set brief.md status: in_progress + resume_cmd: "/ship -r {artifact_path}"; ALSO reconcile
          tasks.md the same way (tick only the done rows) so the board shows honest partial progress.
  CASE B: leave PROPOSAL.md; note the resume command (/ship -r {artifact_path}) in the handoff + trace.md.
```

### 5. Final state update

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5, 6]
workflow_complete: true
```

---

## SUCCESS METRICS:

- Team (if any) shut down gracefully, TeamDelete + trash failsafe run
- Handoff printed: artifact, contract status, bundle path, trace path, next actions
- Commit grant removed on every path; no push outside the PR gate
- Plain ASCII, no emojis
- Runs on every path (shipped / halted / rejected)

## FAILURE MODES:

- `rm -rf` used -> CRITICAL Recovery: abort, use `trash`
- PR created without a validated user story -> Recovery: never; the gate is mandatory
- Grant left behind -> Recovery: rm -f it here, every path
- Skipped on HALT -> Recovery: finish is mandatory on every path
- Emojis in the report -> Recovery: strip, plain ASCII
- Zombie teammate blocks cleanup -> Recovery: 10s timeout, mark zombie, proceed

## FINISH PROTOCOLS:

- Graceful shutdown FIRST, TeamDelete SECOND, force trash THIRD
- Handoff hands control to the user; the PR ships only after the story is validated
- trace.md is the resume anchor

---

## WORKFLOW COMPLETE

Terminal step. No next step.

<critical>
Mandatory on every path. trash never rm -rf. The user runs the bundle; the PR only lands through the validated user story.
</critical>
