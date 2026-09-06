# step 03 plan

Write docs/roadmap/<slug>/roadmap.md with the schema below. Reuse an existing
roadmap and preserve completed phases. Use only as many phases as needed.
Review in the lead; an independent reviewer requires consent even if installed.

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

## 1. Objective
<Problem, users, smallest useful outcome and success signal.>

## 2. Out of scope
<Deliberate exclusions.>

## 3. Inspirations
<Sources and what to borrow or avoid, only if researched.>

## 4. Mockup
<A diagram only if it materially clarifies the result.>

## 5. Phases
<For each phase: outcome, evidence of completion and real commands if known.>

## 6. Next step
<The next useful action and any required approval.>
```

Translate prose and headings to the conversation language; retain section
numbers and frontmatter keys. Omit an empty execution_trace. Keep optional
sections short rather than inventing research or diagrams. Use the active
runtime's actual resume syntax; load an adapter only when needed.

The current SKILL.md owns the workflow policy. User consent is required
before any agent, reviewer or advisor. No automatic validation sessions
for prose; no continuation after a user stop or completed result.
