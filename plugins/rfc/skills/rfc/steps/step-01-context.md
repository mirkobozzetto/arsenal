## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER propose design, alternatives, or recommendation here
- 🛑 NEVER skip GitNexus if available — it's the codebase truth
- ✅ ALWAYS write findings to section 2 of RFC.md
- 📋 YOU ARE a context gatherer, not a designer
- 💬 FOCUS on what exists in the codebase + prior art
- 🚫 FORBIDDEN to draft solutions

## EXECUTION PROTOCOLS:

- 🎯 Use GitNexus first, grep/Glob as fallback
- 💾 Append findings to RFC.md section 2 + state in frontmatter
- 📖 Complete context gathering before loading step-02
- 🚫 FORBIDDEN to load step-02 until section 2 is written

## CONTEXT BOUNDARIES:

- Variables from step-00: `{rfc_path}`, `{scope_path}`, `{auto_mode}`
- Output: section 2 filled + `context_collected` in frontmatter
- Resources: GitNexus MCP, Read, Grep, Glob

## YOUR TASK:

Gather objective codebase context — modules, symbols, prior art — relevant to the RFC scope. No interpretation, no design.

## EXECUTION SEQUENCE:

### 1. Ask user for scope keywords

If `{auto_mode}` = false, use AskUserQuestion:

```yaml
questions:
  - header: "Scope"
    question: "Quels mots-clés / symboles / chemins définissent la zone impactée ?"
    options:
      - label: "Auto-détect depuis le titre"
        description: "Extract keywords du titre RFC"
      - label: "Spécifier manuellement"
        description: "Je liste les modules/fonctions ciblés"
    multiSelect: false
```

If auto → derive 3-5 keywords from title.

### 2. Query GitNexus (if available)

For each keyword:
- `mcp__gitnexus__query({query: "<keyword>"})` → find execution flows
- `mcp__gitnexus__context({name: "<symbol>"})` → callers/callees for top symbols
- Note: index freshness — if stale warning, suggest `npx gitnexus analyze`

If GitNexus unavailable / no match:
- Fallback: `Grep` + `Glob` on `{scope_path}`
- Capture: file paths, function names, related tests

### 3. Identify prior art

Look for:
- ADRs (`docs/adr/**`, `docs/decisions/**`)
- Previous RFCs (`docs/rfcs/**`)
- Related TODOs/FIXMEs in scope
- CHANGELOG entries touching the area

### 4. Write section 2 of RFC.md

Replace `_TBD — step-01_` under `## 2. Context / Codebase` with:

```markdown
## 2. Context / Codebase

### Affected modules
- `path/to/module.ts` — short purpose
- `path/to/other.py` — short purpose

### Key symbols
- `functionName()` — callers: N, callees: M
- `ClassX` — used in: ...

### Prior art
- ADR-NNNN: title
- RFC-NNNN: title (status)
- TODO/FIXME refs

### Execution flows touched
- Flow A: entry → ... → exit
- Flow B: ...
```

### 5. Update frontmatter

```yaml
stepsCompleted: [0, 1]
updated: "{today}"
context_collected:
  modules: [...]
  symbols: [...]
  prior_art: [...]
```

## SUCCESS METRICS:

✅ Section 2 of RFC.md filled with concrete refs
✅ Frontmatter `stepsCompleted` includes 1
✅ At least 3 modules OR 3 symbols OR explicit "greenfield — no prior code" note
✅ Prior art section either has refs or explicit "none found"

## FAILURE MODES:

❌ Writing speculative design here
❌ Skipping GitNexus when it's configured for the repo
❌ Empty section 2 with vague "explored codebase"
❌ Not noting greenfield case explicitly

## NEXT STEP:

If `{auto_mode}` = true → load `./step-02-problem.md` directly.
Else AskUserQuestion:

```yaml
questions:
  - header: "Étape suivante"
    question: "Contexte collecté. Passer à la définition du problème ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Step 02 — Problem & Motivation"
      - label: "Enrichir le contexte"
        description: "Boucler sur step-01 avec keywords supplémentaires"
    multiSelect: false
```

<critical>
This step describes WHAT EXISTS, not what should be. No "we should", no "I propose". Pure inventory.
</critical>
