## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip arg parsing: title is REQUIRED
- 🛑 NEVER load step-01 before frontmatter exists on disk
- 🛑 NEVER pick the format silently: it decides the size of everything after
- ✅ ALWAYS create proposal dir + PROPOSAL.md with frontmatter
- 📋 YOU ARE an initializer, not a designer
- 💬 FOCUS on setup only
- 🚫 FORBIDDEN to gather codebase context, ask design questions, or draft content

## EXECUTION PROTOCOLS:

- 🎯 Show parsed config before writing files
- 💾 Write `PROPOSAL.md` with the stubs OF THE CHOSEN FORMAT ONLY
- 📖 Complete init fully before loading step-01
- 🚫 FORBIDDEN to load step-01 until `proposal_path` exists on disk

## CONTEXT BOUNDARIES:

- Input: raw arguments from skill invocation
- Output: state variables populated + PROPOSAL.md skeleton on disk
- No prior context: this is the entry step

## YOUR TASK:

Parse args, settle the format, compute paths, create proposal dir + skeleton
file with frontmatter.

## EXECUTION SEQUENCE:

### 1. Parse arguments

Extract from raw args:
- **Title** = everything before first flag (required). If empty → STOP, ask user.
- `--short` → `{format} = short`
- `--full` → `{format} = propose-full`
- `--auto` → `{auto_mode} = true`
- `--scope <path>` → `{scope_path}`
- `--no-review` → `{skip_review} = true`
- `--out <dir>` → `{out_dir}`

### 2. Settle the format

`{format}` drives the section set and the size ceiling
(`references/proposal-template.md`). It is the one decision that cannot be
deferred: every later step writes only the sections its format owns.

| Format | Sections | Ceiling | For |
|---|---|---|---|
| `short` | 1, 5, 6, 7, 10 | 80 lines | one reversible decision, one system |
| `propose` | 1, 3, 4, 5, 6, 7, 9, 10 | 250 lines | a change inside one system |
| `full` | 1-11 | 600 lines | crosses systems, teams or versions |

If a format flag was passed, use it and say so in one line.

Otherwise ASK, in the conversation language, in ONE short prose question:
name the format you would pick from the title and why in half a line, and
list the other two. Do NOT use AskUserQuestion. Do NOT explain the three
formats at length; the user picks a word.

Under `--auto`, skip the question and pick: `short` if the title names a
single choice ("choix de X", "passer à Y"), `full` if it names a
migration or several systems, `propose` otherwise. State the pick in one line.

### 3. Compute paths

- `{proposal_slug}` = title kebab-cased, lowercase, ascii-only, max 60 chars
- `{out_dir}` default:
  - if `git rev-parse --show-toplevel` succeeds → `<repo_root>/docs/proposals`
  - else → `~/.claude/proposes`
- `{proposal_id}` = next 4-digit id by scanning `{out_dir}/NNNN-*` dirs (start at `0001`)
- `{proposal_dir}` = `{out_dir}/{proposal_id}-{proposal_slug}`
- `{proposal_path}` = `{proposal_dir}/PROPOSAL.md`
- `{scope_path}` default = git repo root or `cwd`

### 4. Create dir + skeleton

```bash
mkdir -p {proposal_dir}
```

Write `{proposal_path}`: frontmatter, then ONLY the section stubs owned by
`{format}`. Section titles go in the conversation language (mapping in
`references/proposal-template.md`); the NUMBER is the anchor and never changes.

```markdown
---
proposal_id: "{proposal_id}"
slug: "{proposal_slug}"
title: "{title}"
status: Draft
format: {format}
author: "{git config user.name}"
created: "{YYYY-MM-DD}"
updated: "{YYYY-MM-DD}"
stepsCompleted: [0]
scope_path: "{scope_path}"
auto_mode: {auto_mode}
skip_review: {skip_review}
---

# {proposal_id} : {title}
```

Then one stub per owned section, e.g. for `short` in French:

```markdown
## 1. Décision
_TBD: step-09_

## 5. Alternatives envisagées
_TBD: step-03_

## 6. Conception retenue
_TBD: step-04_

## 7. Inconvénients et risques
_TBD: step-05_

## 10. Plan d'implémentation
_TBD: step-07_
```

A section absent from `{format}` is NOT written, not even as a stub.

### 5. Display parsed config

One line, in the conversation language:

```
proposal {proposal_id} | {format} (ceiling {N} lines) | "{title}" | dir: {proposal_dir} | review: {!skip_review}
```

## SUCCESS METRICS:

✅ `{proposal_path}` exists with valid YAML frontmatter including `format`
✅ Only the sections owned by `{format}` are present
✅ `stepsCompleted: [0]`
✅ User saw the format and its ceiling in one line

## FAILURE MODES:

❌ Missing title: stop and prompt user
❌ Format picked silently without a flag and without asking
❌ Writing all 11 stubs regardless of format: that is the bug this fixes
❌ Cannot create dir (perm/path): surface error, stop
❌ Loading step-01 before file exists on disk

## NEXT STEP:

Load `./step-01-context.md`

<critical>
This step is ONLY setup. No design, no questions about the problem, no
codebase exploration. Just format, files, state.
</critical>
