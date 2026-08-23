---
name: step-01-interview
description: Socratic interview - surface the real objective, one question at a time
prev_step: steps/step-00-init.md
next_step: steps/step-02-research.md
---

# Step 1 (Interview): Find the Real Objective

## MANDATORY EXECUTION RULES:

- ONE question at a time. Wait for the answer before the next.
- Ask NON-OBVIOUS questions: surface assumptions and force decisions,
  never collect a feature wishlist.
- Reflect what you heard in one line before each new question.
- If `{auto_mode}`: answer the dimensions yourself from {idea}, mark each
  inferred value `(inferred)`, skip to step-02.

## DIMENSIONS TO COVER (in waves, not as a checklist read aloud):

Wave 1 - the objective:
- What is the actual pain, in one sentence? (not the imagined solution)
- Who has it? What do they do TODAY without this?
- How will you know it worked? (one observable outcome)

Wave 2 - the shape:
- What is the minimal version vs the full vision? What survives a 50% cut?
- What are you deliberately NOT solving? (out of scope)
- Constraints: time, stack, budget, existing code?

Wave 3 - the blind spots (pick 1-3 that fit THIS idea):
- What would make the target user NOT adopt it?
- What is unusual about YOUR version of this? (the quirk generic
  questions miss)
- What contradicts something said earlier? Probe it.

## INTERVIEW TECHNIQUE:

- "it depends" / "we'll see later" -> pin it: "pick one for v1".
- A confident claim -> "what makes you sure? what if the opposite is true?"
- Stop when: objective statable in one sentence without qualifiers,
  minimal version named, out-of-scope explicit, success observable.
  Typically 5-9 questions. Then reflect the full picture in <=6 lines and
  ask ONE closing question: "Did I get the objective right, or correct me."

## STATE:

Store `{answers}` = {objective, users, today_workaround, success_signal,
minimal_version, out_of_scope, constraints, quirks}.

## NEXT STEP:

Load `./step-02-research.md`.

<critical>
The conversation IS the product. A roadmap built on an unexamined
objective is decoration.
</critical>
