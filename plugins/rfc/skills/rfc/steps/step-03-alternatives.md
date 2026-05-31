## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER converge to one approach here
- 🛑 NEVER write fewer than 3 alternatives (incl. "do nothing")
- ✅ ALWAYS include "do nothing / status quo" as alternative 0
- ✅ ALWAYS list pros AND cons for each
- 📋 YOU ARE an option explorer, not a chooser
- 💬 FOCUS on surfacing tradeoffs
- 🚫 FORBIDDEN to recommend — that's step-06

## EXECUTION PROTOCOLS:

- 🎯 Use Exa for industry patterns / prior art
- 💾 Write section 5 (Alternatives Considered)
- 📖 Complete fully before loading step-04
- 🚫 FORBIDDEN to load step-04 until ≥3 alternatives written with pros/cons

## CONTEXT BOUNDARIES:

- Variables: `{rfc_path}`, `{auto_mode}`, `problem_summary`, `context_collected`
- Output: section 5 of RFC.md
- Resources: Exa MCP (web_search, get_code_context, web_search_advanced)

## YOUR TASK:

Surface ≥3 distinct alternatives with explicit pros/cons. Goal = make tradeoffs visible, not pick a winner.

## EXECUTION SEQUENCE:

### 1. Generate candidate alternatives

Mandatory alternatives:
- **Alt 0 — Status quo / do nothing**: cost of inaction
- **Alt 1 — Minimal change**: smallest patch solving the immediate pain
- **Alt 2 — Standard / industry pattern**: most common approach
- **Alt 3+ — Bold / novel**: bigger refactor or unconventional approach

If only 2 emerge → push harder. There's always a "do nothing" + at least 2 ways forward.

### 2. Research prior art (Exa)

For each non-status-quo alternative:
- `mcp__exa__web_search_exa({query: "<problem> vs <approach> tradeoffs"})`
- `mcp__exa__get_code_context_exa({query: "<lib/pattern> example"})` if code-flavored
- Capture: who uses it, what failed, what worked

### 3. Build pros/cons matrix

For each alternative, document:
- **Summary** (1-2 sentences)
- **How it solves the problem**
- **Pros** (3-5 bullets)
- **Cons** (3-5 bullets)
- **Cost** (effort, ops, $, learning curve)
- **Reversibility** (can we undo if wrong?)
- **References** (links/quotes from research)

### 4. Write section 5

```markdown
## 5. Alternatives Considered

### Alt 0 — Status Quo
**Summary:** Keep current behavior.
**Cost of inaction:** {what breaks if we do nothing}
**Pros:** zero effort, zero risk of regression
**Cons:** {pain from section 3 persists}

### Alt 1 — {Name}
**Summary:** {1-2 sentences}
**How it solves:** {link to goals}
**Pros:**
- ...
**Cons:**
- ...
**Cost:** {effort/ops/$/learning}
**Reversibility:** {easy / hard / one-way door}
**References:** {url, ADR-NNNN}

### Alt 2 — {Name}
...

### Alt 3 — {Name}
...
```

### 5. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2, 3]
updated: "{today}"
alternatives_count: N
```

## SUCCESS METRICS:

✅ ≥3 alternatives (status quo + ≥2 forward)
✅ Each has pros, cons, cost, reversibility
✅ ≥1 alternative has external reference (Exa-sourced)
✅ Pros/cons asymmetric — if every alt has same cons, you're not differentiating
✅ "One-way door" decisions explicitly flagged

## FAILURE MODES:

❌ Only 1-2 alternatives — premature convergence
❌ Strawman alternatives (obviously bad) to make Alt 2 look good
❌ Recommending winner here — that's step-06
❌ Skipping Exa research → reinventing wheel
❌ No reversibility note — biggest gap in junior RFCs
❌ Identical cost for all alts — means you didn't think hard

## NEXT STEP:

If `{auto_mode}` → load `./step-04-design.md`.
Else AskUserQuestion:

```yaml
questions:
  - header: "Étape suivante"
    question: "Alternatives surfacées. Détailler le design proposé ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Step 04 — Proposed Design (l'approche détaillée)"
      - label: "Ajouter une alternative"
        description: "Reboucler — je vois un autre angle"
      - label: "Stop ici"
        description: "RFC suffit comme exploration — pas besoin de design détaillé"
    multiSelect: false
```

<critical>
This is the section reviewers value most. "Alternatives considered" is the most undervalued section per [youngju.dev]. Prevents future devs from relitigating decisions.
</critical>
