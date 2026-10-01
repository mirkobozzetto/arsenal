# review

A deep code review that starts with a short interview: what to analyze,
what to look for, what worries you, which model, and your go. One read-only
reader per angle (bugs, security, simplicity, performance, consistency with
the planned work, or a domain you name) runs in parallel. The lead verifies
every finding against the code, with GitNexus when it is installed, drops
the false alarms and writes a report in `docs/review/`. Each point names the
skill that fixes it: `ship`, `issue`, `brief` or `propose`. The review never
edits your code.

## Install

```bash
/plugin install review@arsenal
```

Pi loads it with the Arsenal package. For OMP, link
`plugins/review/skills/review` into `~/.omp/agent/skills/` and copy
`agents/omp/review-reader.md` into `~/.omp/agent/agents/`. For Codex, the
reader runs without installation; copying `agents/codex/review_reader.toml`
into `~/.codex/agents/` makes it read-only by sandbox.

## Usage

```bash
/review:review                     # Claude Code
/review:review docs/review/2026-10-01-auth/report.md   # pick up a report
```

`next` lists reports with unchecked points.
