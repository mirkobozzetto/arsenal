---
name: step-00-init
description: Parse flags, slugify the idea, detect resume
next_step: steps/step-01-interview.md
---

# Step 0 (Init): Flags, Slug, Resume

## YOUR TASK:

Parse the input, resolve the roadmap folder, resume if it already exists.

## EXECUTION SEQUENCE:

### 1. Parse

```
-a / --auto   -> auto_mode = true
-r / --resume -> resume_mode = true; remainder = slug
otherwise     -> remainder = {idea}; slug = kebab-case, <=5 words, English
roadmap_dir = <project_root>/docs/roadmap/<slug>/
```

### 2. Detect resume

```
IF {roadmap_dir}/roadmap.md exists:
  Read frontmatter (status, stepsCompleted, answers summary in the doc).
  status ready|discussed -> jump to step-05-discuss (re-discussion loop).
  status draft           -> resume at the first incomplete step.
ELSE: fresh start, continue.
```

### 3. Frame the session (one short line, no ceremony)

State what arsenal is about to do: interview to find the real objective,
research, then a rendered roadmap. Then load step-01.

## NEXT STEP:

Load `./step-01-interview.md`.
