## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER skip arg parsing: title is REQUIRED
- 🛑 NEVER load step-01 before frontmatter exists on disk
- ✅ ALWAYS create RFC dir + RFC.md with frontmatter
- 📋 YOU ARE an initializer, not a designer
- 💬 FOCUS on setup only
- 🚫 FORBIDDEN to gather codebase context, ask design questions, or draft content

## EXECUTION PROTOCOLS:

- 🎯 Show parsed config before writing files
- 💾 Write `RFC.md` with empty section stubs + frontmatter
- 📖 Complete init fully before loading step-01
- 🚫 FORBIDDEN to load step-01 until `rfc_path` exists on disk

## CONTEXT BOUNDARIES:

- Input: raw arguments from skill invocation
- Output: state variables populated + RFC.md skeleton on disk
- No prior context: this is the entry step

## YOUR TASK:

Parse args, compute paths, create RFC dir + skeleton file with frontmatter.

## EXECUTION SEQUENCE:

### 1. Parse arguments

Extract from raw args:
- **Title** = everything before first flag (required). If empty → STOP, ask user.
- `--auto` → `{auto_mode} = true`
- `--scope <path>` → `{scope_path}`
- `--no-review` → `{skip_review} = true`
- `--out <dir>` → `{out_dir}`

### 2. Compute paths

- `{rfc_slug}` = title kebab-cased, lowercase, ascii-only, max 60 chars
- `{out_dir}` default:
  - if `git rev-parse --show-toplevel` succeeds → `<repo_root>/docs/rfcs`
  - else → `~/.claude/rfcs`
- `{rfc_id}` = next 4-digit id by scanning `{out_dir}/NNNN-*` dirs (start at `0001`)
- `{rfc_dir}` = `{out_dir}/{rfc_id}-{rfc_slug}`
- `{rfc_path}` = `{rfc_dir}/RFC.md`
- `{scope_path}` default = git repo root or `cwd`

### 3. Create dir + skeleton

```bash
mkdir -p {rfc_dir}
```

Write `{rfc_path}` with frontmatter + empty section stubs from `references/rfc-template.md`:

```markdown
---
rfc_id: "{rfc_id}"
slug: "{rfc_slug}"
title: "{title}"
status: Draft
author: "{git config user.name}"
created: "{YYYY-MM-DD}"
updated: "{YYYY-MM-DD}"
stepsCompleted: [0]
scope_path: "{scope_path}"
auto_mode: {auto_mode}
skip_review: {skip_review}
---

# {rfc_id}: {title}

## 1. Summary
_TBD: completed in step-09_

## 2. Context / Codebase
_TBD: step-01_

## 3. Problem & Motivation
_TBD: step-02_

## 4. Goals / Non-Goals
_TBD: step-02_

## 5. Alternatives Considered
_TBD: step-03_

## 6. Proposed Design
_TBD: step-04_

## 7. Drawbacks & Risks
_TBD: step-05_

## 8. Open Questions
_TBD: step-05_

## 9. Recommendation & Rationale
_TBD: step-06_

## 10. Implementation Plan
_TBD: step-07_

## 11. Review Findings
_TBD: step-08 (optional)_
```

### 4. Display parsed config

One-line summary:

```
RFC {rfc_id} | "{title}" | dir: {rfc_dir} | auto: {auto_mode} | scope: {scope_path} | review: {!skip_review}
```

## SUCCESS METRICS:

✅ `{rfc_path}` exists with valid YAML frontmatter
✅ `stepsCompleted: [0]`
✅ State variables populated
✅ User sees one-line config summary

## FAILURE MODES:

❌ Missing title: stop and prompt user
❌ Cannot create dir (perm/path): surface error, stop
❌ Skipping frontmatter write: breaks state tracking downstream
❌ Loading step-01 before file exists on disk

## NEXT STEP:

Load `./step-01-context.md`

<critical>
This step is ONLY setup. No design, no questions about the problem, no codebase exploration. Just files + state.
</critical>
