---
name: step-04-render
description: Render a self-contained HTML roadmap and optionally open it
prev_step: steps/step-03-plan.md
next_step: steps/step-05-discuss.md
---

# Step 4: Render the HTML Deliverable

Run:

```text
python3 <skill-dir>/scripts/render.py {roadmap_dir}/roadmap.md
```

The script writes a self-contained HTML file to the platform temporary
directory and prints its path. Marked and Mermaid are bundled and inlined. No
network access is required.

Opening the default browser is best effort. A missing browser is not failure
when the HTML file was written and its path was printed. Use `--no-open` on a
headless host.

The rendered page is the deliverable. The Markdown file is durable storage.
Load `./step-05-discuss.md` after a successful render.
