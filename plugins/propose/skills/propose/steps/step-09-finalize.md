## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip summary: section 1 must be filled last (not first)
- 🛑 NEVER downgrade from Accepted silently: the default IS Accepted, the user objects to change it
- ✅ ALWAYS write section 1 (Summary) now, with full doc as context
- ✅ ALWAYS update proposal index (`docs/proposals/README.md`) if present
- 📋 YOU ARE a closer, not a designer
- 💬 FOCUS on summary + status + handoff
- 🚫 FORBIDDEN to modify sections 2-11 substance

## EXECUTION PROTOCOLS:

- 🎯 Summary written LAST → reflects full doc accurately
- 💾 Finalize PROPOSAL.md + update index + emit next-step suggestion
- 📖 Terminal step: no further loads
- 🚫 FORBIDDEN to execute impl plan: handoff via ship

## CONTEXT BOUNDARIES:

- Variables: all from previous steps
- Output: section 1 (Summary), updated frontmatter, optional proposal index entry

## YOUR TASK:

Write the executive summary, set final status, register in index, surface handoff options.

## EXECUTION SEQUENCE:

### 1. Generate summary (section 1)

Read full PROPOSAL.md. Write 3-paragraph summary:

```markdown
## 1. Summary

**Problem:** {1-2 sentences from section 3}

**Recommendation:** {1-2 sentences from section 9: recommendation + confidence}

**Impact:** {1-2 sentences: modules touched, breaking changes, effort, key risks}
```

≤ 6 sentences total. Someone reading only section 1 knows the verdict.

### 2. Determine final status

Default is `Accepted`: the user read the reviewed proposal and stays in
command through objection, not through a gate. Set `Accepted` when every
review BLOCKER is resolved. A blocker you FIXED during step-08 counts as
resolved: it does not license a status question.

WRITE the status, THEN say in ONE line, verbatim in shape:
"Statut : Accepted. Dis 'repasse en Draft/Review/Rejected' pour le
redescendre."

FORBIDDEN, in every phrasing: "Je le passe en Accepted ?", "ou tu veux le
relire d'abord ?", "je finalise ?". The user objects after the fact; a
status question here is a failure of this step.

Exceptions, the only ones:
- an UNRESOLVED BLOCKER from step-08 → status `Review`, say which blocker;
- the user already asked for a different status this session → honor it.

### 3. Update frontmatter

```yaml
status: {chosen}
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
finalized: "{today}"
next_action: "{one line: what implementing this delivers}"
resume_cmd: "/ship {proposal_path}"
```

### 3b. Close the sibling brief (only if `{source_brief}`)

Two shippable artifacts for one feature is how a feature gets built twice.
The proposal now carries the HOW, so the brief stops being a ship target:

```
- Write `proposal: <proposal_path>` into {source_brief}/brief.md frontmatter.
- Set that brief.md `status: superseded` (it leaves the /next board; its
  content stays readable, nothing is deleted).
- Say it in ONE line: "le brief passe en superseded, /ship vise la proposal".
```

`next_action` + `resume_cmd` are the fields the `next` open-work board reads so an Accepted proposal surfaces with its exact resume command. On `status: shipped` (set by ship at finish, or a sibling `PROPOSAL.shipped` marker since PROPOSAL.md stays immutable) the item leaves the board.

### 4. Update proposal index (if applicable)

If `{out_dir}/README.md` exists OR ≥2 proposals in `{out_dir}`:

Append/update entry:

```markdown
| {proposal_id} | [{title}](./NNNN-slug/PROPOSAL.md) | {status} | {finalized} | {recommendation summary} |
```

Create `README.md` with header row if none exists.

### 4b. Enforce the size ceiling

Count the lines of `{proposal_path}`. Ceilings: `short` 80, `propose` 250, `full`
600 (`references/proposal-template.md`).

Over the ceiling means the SUBJECT is too wide, not the prose too long.
Say so in one line, name the section that grew, and offer to split it into
a second proposal. Never compress the writing to fit, and never silently pass.

Under the ceiling with an empty section: delete the section.

### 5. Display summary to user

```
proposal {proposal_id}: {title}
Status: {status} | Format: {format} | {N} lines (ceiling {ceiling})
Path: {proposal_path}
```

### 5b. Open the HTML view (MANDATORY)

After PROPOSAL.md is written and the status set, render it to a clean, styled HTML page and open it in the browser for easy reading, by running the plugin renderer: `python3 <this skill dir>/scripts/render.py {proposal_path}` (Bash tool; the script writes the page to $TMPDIR and opens it). This gives the user a visual, readable summary of the whole proposal, with Section 1 leading on the verdict. MANDATORY: ending finalize without the browser opening is a FAILURE of this step, like a missing status. The rendered page is the deliverable; raw markdown is storage. Only a rendering ERROR (script crash, no browser) may be reported in one line and skipped past.

### 6. Suggest handoff

Use AskUserQuestion (unless `auto_mode`):

```yaml
questions:
  - header: "Next"
    question: "proposal finalized. Next action?"
    options:
      - label: "Run ship on the plan"
        description: "Spec-driven executor: ship reads this proposal (gate status: Accepted), builds the DAG from section 10, implements, returns a verification-bundle + trace. Honors 'no auto tests/builds'. Terminal of the propose -> ship chain."
      - label: "Stop here"
        description: "proposal = artifact. Impl later via ship on the Accepted proposal."
      - label: "Save to brain"
        description: "Push to the Obsidian vault via /brain"
    multiSelect: false
```

Whatever the choice, print the next command as a pasteable two-line block:

```
/clear
/ship {proposal_path}
```

The design debate and the adversarial review are spent context: ship reads
the document, not the conversation, and carrying the argument in biases it
toward what was discussed instead of what was written. Say that in half a
line. Never clear anything yourself - `/clear` is the user's to type.

If ship is chosen -> invoke it with `{proposal_path}` (it refuses if status != Accepted). If brain -> invoke /brain with `{proposal_path}`. (sdd stays available manually: /speckit.specify.) proposal Accepted != implemented: only launch on explicit choice.

## SUCCESS METRICS:

✅ Section 1 (Summary) ≤ 6 sentences, factual
✅ Status explicitly defined
✅ Frontmatter `stepsCompleted` complete 0→9
✅ Index `{out_dir}/README.md` up to date (if applicable)
✅ HTML view rendered and opened in the browser (or its failure reported)
✅ User sees recap + handoff options

## FAILURE MODES:

❌ Summary too long → it is not a summary
❌ Asking a status question instead of defaulting to Accepted
❌ Accepting with an unresolved BLOCKER: that is the one hard stop
❌ No index update → orphaned proposal
❌ Finalize ends without the HTML view opening: the user reads raw markdown in a terminal, the exact experience this step exists to prevent
❌ Auto-exec ship without asking: proposal = decision, not execution

## NEXT STEP:

Terminal. If user chooses handoff → Skill tool on ship/brain.

<critical>
proposal is artifact + decision. Implementation is a separate concern. Don't conflate. "Accepted ≠ implemented."
</critical>
