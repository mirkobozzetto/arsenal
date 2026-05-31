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
    question: "Status final du RFC ?"
    options:
      - label: "Draft (Recommended)"
        description: "Prêt à circuler pour review humain"
      - label: "Review"
        description: "En cours de relecture par d'autres"
      - label: "Accepted"
        description: "Validé : permission d'implémenter"
      - label: "Rejected"
        description: "Décision = ne pas faire (archive)"
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
  - header: "Suite"
    question: "RFC finalisé. Action suivante ?"
    options:
      - label: "Lancer ship sur le plan"
        description: "Exécuteur spec-driven : ship lit ce RFC (gate status: Accepted), construit le DAG depuis section 10, implémente, rend un verification-bundle + trace. Respecte 'pas de tests/builds auto'. Terminal de la chaîne rfc -> ship."
      - label: "Stop ici"
        description: "RFC = artefact. Impl plus tard via ship sur le RFC Accepted."
      - label: "Sauver dans brain"
        description: "Push vers Obsidian vault via /brain"
    multiSelect: false
```

Si choix ship → invoque-le avec `{rfc_path}` (il refuse si status != Accepted). Si brain → invoque /brain avec `{rfc_path}`. (sdd reste dispo manuellement : /speckit.specify.) RFC Accepted != implémenté : ne lance que sur choix explicite.

## SUCCESS METRICS:

✅ Section 1 (Summary) ≤ 6 sentences, factuelle
✅ Status défini explicitement
✅ Frontmatter `stepsCompleted` complet 0→9
✅ Index `{out_dir}/README.md` à jour (si applicable)
✅ User sees recap + handoff options

## FAILURE MODES:

❌ Summary trop long → c'est pas un summary
❌ Status laissé `Draft` quand user a validé blockers (devrait être Accepted)
❌ Pas d'update index → RFC orphelin
❌ Auto-exec ship sans demander : RFC = décision, pas exécution

## NEXT STEP:

Terminal. Si user choisit handoff → Skill tool sur ship/brain.

<critical>
RFC is artifact + decision. Implementation is a separate concern. Don't conflate. "Accepted ≠ implemented."
</critical>
