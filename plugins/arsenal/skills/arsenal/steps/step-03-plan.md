---
name: step-03-plan
description: Draft and adversarially review the phased roadmap
prev_step: steps/step-02-research.md
next_step: steps/step-04-render.md
---

# Step 3: Draft and Review the Roadmap

## Draft rules

- Write the file. Never dump raw roadmap Markdown into chat.
- Use the conversation language for prose. Keep frontmatter keys, identifiers,
  and commands in English.
- Phase 1 is the minimal shippable result from the interview. Use two to four
  phases total.
- Commands must be real and runnable for the user's stack.
- Include one wireframe or flow diagram under roughly forty lines.

## Roadmap schema

Write `{roadmap_dir}/roadmap.md` with this compatible shape:

```markdown
---
type: roadmap
slug: <slug>
status: draft
created: <date>
updated: <date>
stepsCompleted: [0, 1, 2, 3]
resume_cmd: "<adapter-formatted resume command>"
execution_trace: <single-line JSON array, optional>
---

# <Project name>

> <Objective and phase-1 promise>

## 1. <Objective heading in the conversation language>
<Problem, users, current workaround, and success signal.>

## 2. <Out-of-scope heading in the conversation language>
<Deliberate exclusions.>

## 3. <Inspirations heading in the conversation language>
| Source | Borrow | Avoid |
|--------|--------|-------|
<One linked row per research item.>

## 4. <Mockup heading in the conversation language>
<Inline HTML, SVG, or Mermaid.>

## 5. <Phases heading in the conversation language>
### Phase 1 - <Minimal version>
<Outcome, proof, and runnable commands.>

## 6. <Next-step heading in the conversation language>
<Semantic handoff for the first phase.>
```

Omit `execution_trace` when it is empty. Never rename or add numbered
sections.

## Adversarial review

After the complete draft exists, load `../references/agent-contracts.md`.
If the native reviewer is available, dispatch exactly one read-only
`arsenal-adversarial-reviewer`. Otherwise run the same review contract in
the lead.

Apply valid findings to the draft. Report each BLOCKER or MAJOR finding and its
fix in one line. Ignore praise and unsupported preferences. An unresolved
BLOCKER stops finalization but does not let the reviewer edit the roadmap.
Append the reviewer trace item only after its result is parsed and applied.

Load `./step-04-render.md` when the reviewed draft has no unresolved blocker.
