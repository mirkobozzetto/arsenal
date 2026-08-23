---
name: step-04-render
description: Render the roadmap to a styled HTML page and open it
prev_step: steps/step-03-plan.md
next_step: steps/step-05-discuss.md
---

# Step 4 (Render): The HTML Deliverable

## YOUR TASK:

```
python3 <this skill dir>/scripts/render.py {roadmap_dir}/roadmap.md
```

The script writes the page to $TMPDIR and opens it in the browser: status
banner, side TOC, mermaid and inline HTML mockup rendered, command blocks
styled. MANDATORY: ending this step without the browser opening is a
FAILURE. Only a rendering ERROR (script crash, no browser) may be reported
in one line and skipped past.

The rendered page is the deliverable; the markdown is storage.

## NEXT STEP:

Load `./step-05-discuss.md`.
