## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip summary: section 1 must be filled last (not first)
- 🛑 NEVER set status without user confirmation (unless auto_mode)
- ✅ ALWAYS write section 1 (Summary) now, with full doc as context
- ✅ ALWAYS update RFC index (`docs/rfcs/README.md`) if present
- 📋 YOU ARE a closer, not a designer
- 💬 FOCUS on summary + status + handoff
- 🚫 FORBIDDEN to modify sections 2-11 substance

## EXECUTION PROTOCOLS:

- 🎯 Summary written LAST → reflects full doc accurately
- 💾 Finalize RFC.md + update index + emit next-step suggestion
- 📖 Terminal step: no further loads
- 🚫 FORBIDDEN to execute impl plan: handoff via ship

## CONTEXT BOUNDARIES:

- Variables: all from previous steps
- Output: section 1 (Summary), updated frontmatter, optional RFC index entry

## YOUR TASK:

Write the executive summary, set final status, register in index, surface handoff options.

## EXECUTION SEQUENCE:

### 1. Generate summary (section 1)

Read full RFC.md. Write 3-paragraph summary:

```markdown
## 1. Summary

**Problem:** {1-2 sentences from section 3}

**Recommendation:** {1-2 sentences from section 9: recommendation + confidence}

**Impact:** {1-2 sentences: modules touched, breaking changes, effort, key risks}
```

≤ 6 sentences total. Someone reading only section 1 knows the verdict.

### 2. Determine final status

If `{auto_mode}` → set `Draft`.
Else AskUserQuestion:

```yaml
questions:
  - header: "Status"
    question: "Final RFC status?"
    options:
      - label: "Draft (Recommended)"
        description: "Ready to circulate for human review"
      - label: "Review"
        description: "Under review by others"
      - label: "Accepted"
        description: "Validated: permission to implement"
      - label: "Rejected"
        description: "Decision = do not do it (archive)"
    multiSelect: false
```

### 3. Update frontmatter

```yaml
status: {chosen}
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
finalized: "{today}"
```

### 4. Update RFC index (if applicable)

If `{out_dir}/README.md` exists OR ≥2 RFCs in `{out_dir}`:

Append/update entry:

```markdown
| {rfc_id} | [{title}](./NNNN-slug/RFC.md) | {status} | {finalized} | {recommendation summary} |
```

Create `README.md` with header row if none exists.

### 5. Display summary to user

```
RFC {rfc_id}: {title}
Status: {status}
Path: {rfc_path}
Tasks: {tasks_count} | Critical path: {critical_path_days}d
Blockers: {review_blockers} | Major: {review_major}
```

### 6. Suggest handoff

Use AskUserQuestion (unless `auto_mode`):

```yaml
questions:
  - header: "Next"
    question: "RFC finalized. Next action?"
    options:
      - label: "Run ship on the plan"
        description: "Spec-driven executor: ship reads this RFC (gate status: Accepted), builds the DAG from section 10, implements, returns a verification-bundle + trace. Honors 'no auto tests/builds'. Terminal of the rfc -> ship chain."
      - label: "Stop here"
        description: "RFC = artifact. Impl later via ship on the Accepted RFC."
      - label: "Save to brain"
        description: "Push to the Obsidian vault via /brain"
    multiSelect: false
```

If ship is chosen -> invoke it with `{rfc_path}` (it refuses if status != Accepted). If brain -> invoke /brain with `{rfc_path}`. (sdd stays available manually: /speckit.specify.) RFC Accepted != implemented: only launch on explicit choice.

## SUCCESS METRICS:

✅ Section 1 (Summary) ≤ 6 sentences, factual
✅ Status explicitly defined
✅ Frontmatter `stepsCompleted` complete 0→9
✅ Index `{out_dir}/README.md` up to date (if applicable)
✅ User sees recap + handoff options

## FAILURE MODES:

❌ Summary too long → it is not a summary
❌ Status left `Draft` when user validated blockers (should be Accepted)
❌ No index update → orphaned RFC
❌ Auto-exec ship without asking: RFC = decision, not execution

## NEXT STEP:

Terminal. If user chooses handoff → Skill tool on ship/brain.

<critical>
RFC is artifact + decision. Implementation is a separate concern. Don't conflate. "Accepted ≠ implemented."
</critical>
