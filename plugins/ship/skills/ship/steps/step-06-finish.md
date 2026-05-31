---
name: step-06-finish
description: Team shutdown, force-trash orphans, print handoff; MANDATORY on every path
prev_step: steps/step-05-verify.md
---

# Step 6 (Finish): Shutdown + Handoff

## MANDATORY EXECUTION RULES:

- YOU ARE A CLOSER AND REPORTER, not an implementer
- NEVER use `rm -rf`; ALWAYS `trash`
- NEVER auto-commit/push/PR; the user ships from here (git write-guard)
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

Next:
  1. Run the verification bundle: {bundle_path}
  2. If green, commit / open a PR yourself (git write-guard will prompt).
  3. Resume later if needed: /ship -r {artifact_path}
```

For `final_status` = halted: state the HALT reason (gate failed / 3x self-check / rfc BLOCKER) and what to fix.

### 3. Commit?

```
NEVER auto-commit. ship does not commit/push/PR.
IF auto_mode = false AND final_status = shipped:
  AskUserQuestion:
    header: "Commit"
    question: "Commiter le travail ?"
    options:
      - label: "Non, je gère (Recommended)"
        description: "Rien commiter (git write-guard)"
      - label: "Commiter"
        description: "Stage + commit, message propre, sans signature (le guard fera son prompt)"
    multiSelect: false
  Route "Commiter" -> conventional message, no Claude signature, git write-guard prompt fires.
```

### 4. Final state update

```yaml
stepsCompleted: [0, 1, 2, 3, 4, 5, 6]
workflow_complete: true
```

---

## SUCCESS METRICS:

- Team (if any) shut down gracefully, TeamDelete + trash failsafe run
- Handoff printed: artifact, contract status, bundle path, trace path, next actions
- No auto-commit; git write-guard respected
- Plain ASCII, no emojis
- Runs on every path (shipped / halted / rejected)

## FAILURE MODES:

- `rm -rf` used -> CRITICAL Recovery: abort, use `trash`
- Auto-committing -> Recovery: never; the user commits
- Skipped on HALT -> Recovery: finish is mandatory on every path
- Emojis in the report -> Recovery: strip, plain ASCII
- Zombie teammate blocks cleanup -> Recovery: 10s timeout, mark zombie, proceed

## FINISH PROTOCOLS:

- Graceful shutdown FIRST, TeamDelete SECOND, force trash THIRD
- Handoff hands control to the user; ship never ships the commit
- trace.md is the resume anchor

---

## WORKFLOW COMPLETE

Terminal step. No next step.

<critical>
Mandatory on every path. trash never rm -rf. The user runs the bundle and commits — ship hands off, it does not push.
</critical>
