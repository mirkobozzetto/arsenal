---
name: step-05-discuss
description: Re-discuss, finalize, and hand off through the active adapter
prev_step: steps/step-04-render.md
---

# Step 5: Discuss and Finalize

Ask one plain-text question: "What feels wrong or missing?"

While the user amends the roadmap:

- Apply each meaningful batch to the same `roadmap.md` and update `updated`.
- If the objective changes, ask one interview question to re-anchor it.
- Render again after each meaningful batch.
- Close only when the user explicitly says the roadmap is ready.

Set `status: ready`, `stepsCompleted: [0, 1, 2, 3, 4, 5]`, and
`next_action` to one semantic line describing the first phase handoff.

Load the active adapter and format a handoff of at most four lines:

1. Roadmap path.
2. How to start the next product-specification action.
3. How to resume this roadmap.

Do not execute the next action, clear the session, or assume slash commands
exist. The roadmap carries the interview and research context.
