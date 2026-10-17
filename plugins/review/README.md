# review

A deep code review that starts with a short interview: what to analyze,
what to look for, what worries you, which model, and your go. One read-only
reader per angle (bugs, security, simplicity, performance, consistency with
the planned work, or a domain you name) runs in parallel. The lead verifies
every finding against the code, with GitNexus when it is installed, drops
the false alarms and writes a report in `docs/review/`. On a branch or a
pull request, readers report only what the diff introduces. A re-review
after fixes reads only the new diff, three rounds at most. Each point names
the skill that fixes it: `ship`, `issue`, `brief` or `propose`. The review
never edits your code.

## Install

```bash
/plugin install review@arsenal
```

Pi loads it with the Arsenal package. For OMP, link
`plugins/review/skills/review` into `~/.omp/agent/skills/` and copy
`harness/omp/review-reader.md` into `~/.omp/agent/agents/`. For Codex, the
reader runs without installation; copying `harness/codex/review_reader.toml`
into `~/.codex/agents/` makes it read-only by sandbox.

## Usage

```bash
/review:review                     # Claude Code
/review:review docs/review/2026-10-01-auth/report.md   # pick up a report
/review:review docs/review/2026-10-01-auth/report.md --again   # next round
```

`next` lists reports with unchecked points.
