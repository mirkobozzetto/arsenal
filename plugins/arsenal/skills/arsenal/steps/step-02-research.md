---
name: step-02-research
description: Exa research - how others solved this, cited inspirations
prev_step: steps/step-01-interview.md
next_step: steps/step-03-plan.md
---

# Step 2 (Research): Learn From What Exists

## MANDATORY EXECUTION RULES:

- Exa MCP only (`mcp__exa__web_search_exa`, `get_code_context_exa`,
  `crawling_exa`). Never native WebSearch/WebFetch.
- 2-3 searches maximum, driven by `{answers}` (the domain + the quirk),
  not by generic keywords.
- Every retained inspiration gets: name, URL, the ONE thing to borrow,
  the ONE thing to avoid.

## EXECUTION SEQUENCE:

1. Search: existing products/tools solving `{answers}.objective` for
   `{answers}.users`; current best practices of the domain (this year).
2. Filter to 2-5 inspirations that actually inform THIS roadmap.
   Discard anything that only pads the page.
3. Report to the user in <=8 lines: what exists, what it means for the
   plan (e.g. "X already does the hard part, phase 1 can wrap it").
   If research contradicts an interview answer, SAY SO now, before
   planning: one line + let the user react.

## STATE:

Store `{research}` = [{name, url, borrow, avoid}].

## NEXT STEP:

Load `./step-03-plan.md`.
