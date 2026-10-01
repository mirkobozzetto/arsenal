# Review report template

Written to `docs/review/<YYYY-MM-DD>-<slug>/report.md`. Headings and prose
follow the conversation language; frontmatter keys and point ids stay in
English. `next` reads `type: review` and counts the checkboxes: the report
stays open while one point is unchecked.

```markdown
---
type: review
slug: <slug>
title: <title>
created: <YYYY-MM-DD>
scope: <what was analyzed>
angles: <bugs, security, ...>
readers: <harness, model, level, or solo>
dropped: <number of findings removed at verification>
---

# <title>

<two lines: what was analyzed, what stands out>

## Points

- [ ] R01 [critical] `<file>:<line>` <issue>. Proof: <evidence>. -> ship
- [ ] R02 [major] `<file>:<line>` <issue>. Proof: <evidence>. -> issue

## Ce qui n'est pas logique

- [ ] R03 [major] <contradiction, with both sides cited>. -> propose

## Vérification

<confirmed / probable counts, dropped count, GitNexus used or not>
```

Each point ends with `-> <skill>`. Tick it only once that skill has
delivered.
