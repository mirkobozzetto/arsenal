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
Artifact:  {artifact_path} ({artifact_kind}){scoped: "  run: {run_id} ({N}/{M} spec tasks)"}
Engine:    {engine_tier}
Contract:  {contract_path}   ({P}/{N} criteria satisfied)
Bundle:    {bundle_path}      <- run these checks yourself
Trace:     {trace_path}       <- resume from here

Branch:    {work_branch}          ({K} progressive commits, see trace)

Next:
  1. Run the verification bundle: {bundle_path}
  2. If green, validate the user story below to open the PR.
  3. Resume later if needed:  /clear
                              /ship -r {artifact_path}
```

Do NOT suggest clearing before the bundle and the PR gate: verification and
the user story need what just happened. The clear belongs to a LATER resume.

### 2b. Remaining runs of this spec (MANDATORY when any remain)

A spec split into several runs is only half delivered when one run ends.
Ending without naming what is left is how a plan gets abandoned mid-way.

```
Compare the spec's full task list against every trace{*}.md in {output_dir}.
IF tasks remain uncovered by a shipped run, append to the handoff:

  Spec progress: {done}/{total} tasks. Runs left:

  # <repo or scope>, tasks <ids>{, waits on <run> for <dep>}
  /clear
  cd <repo-abs-path>
  /ship --tasks <ids> {artifact_path}

  One block per remaining run, in dependency order, ready to paste.
IF nothing remains: say the spec is fully shipped, in one line.
```

Reproduce that block VERBATIM, three lines, one per remaining run. Do not
reformat it into a table, do not collapse it to the /ship line alone, do not
drop `/clear` or `cd`. A summary table of the remaining tasks may sit ABOVE
the blocks, never instead of them. The next run usually starts in a
DIFFERENT repo than this one: a bare /ship line sends the user's next run
into the wrong working directory.

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

**"Green" means THIS run's code checks passed.** It does NOT mean the whole
system is live. A run whose own checks are clean but whose end-to-end test
waits on a deploy, another repo, or a manual step is still PR-ready: the PR
is often what unblocks the rest. Never withhold the offer because something
downstream is pending; say what is still pending in the PR body instead.

### 3b. Pending sibling PRs (re-offer until they exist)

A PR offered once and declined is forgotten forever today, so a green branch
sits unopened while the user waits on it.

```
For every sibling run of this spec (its trace{*}.md in {output_dir}) that
shipped green and whose branch has no PR yet (`gh pr list --head <branch>`):
  -> re-offer it here, one line each: branch, target base, what it unblocks.
```

### 3c. Propose the next move, do not just list it

The handoff enumerates what is left (that stays). Then pick the ONE step
that unblocks the most of it and OFFER to take it now:

```
Choose the unblocker: an unopened green PR beats a local check, which beats
anything waiting on a deploy the user must trigger.
Ask it as one plain question ("j'ouvre la PR backend vers main ?"), do it on
a yes, and stop there. ONE offer, never a queue of them.
Steps the user must run himself (deploy, device test, credentials) are listed,
never offered: naming who does what is the point.
```

### 4. Close the loop (upstream status + task ledger)

Keep the `next` open-work board honest: an item must leave it once shipped, a halted run must point back to its resume command, and the upstream task checkboxes must match what trace.md recorded as done. trace.md is the live ledger during execute; this is the SINGLE point where its result is synced back into the brief's tasks.md, so `next` never reads a stale 0/N after a successful run.

A SCOPED run ({run_id} non-empty) only ever closes its own slice: it never
marks the spec shipped while sibling runs remain. Check the sibling ledgers
in {output_dir}; close the spec only when every task of the spec is done
across all of them, and otherwise print the next run's command.

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
- Remaining runs of the spec named with their pasteable commands, or the spec declared fully shipped
- Every green branch without a PR re-offered; exactly one next move proposed, not just listed
- Plain ASCII, no emojis
- Runs on every path (shipped / halted / rejected)

## FAILURE MODES:

- `rm -rf` used -> CRITICAL Recovery: abort, use `trash`
- PR created without a validated user story -> Recovery: never; the gate is mandatory
- Listing "open the PR, then deploy" as prose instead of offering the PR -> Recovery: enumerate, then offer the unblocker
- Withholding the PR because a deploy or another repo is pending -> Recovery: green means this run's checks, not the whole system
- Grant left behind -> Recovery: rm -f it here, every path
- Ending a scoped run without naming the remaining ones -> Recovery: the spec looks done when it is not; always print the runs left
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
