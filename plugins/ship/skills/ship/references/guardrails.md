# Guardrails: irreversible-op hazards + the Bash boundary

Loaded on demand by step-04-execute (risk-boundary) and step-05-verify (Bash boundary).

## Risk-boundary hazard list

A task crosses a risk boundary if it does ANY of the following. ship checkpoints BEFORE the op (AskUserQuestion), records the decision in trace.md, and never proceeds on the always-ask set without explicit approval.

| Hazard | Always-ask (even with -a) | Why |
|--------|---------------------------|-----|
| Database schema / data migration | YES | "Jamais modif DB sans approval explicit" |
| Deleting a file or directory | YES | Irreversible loss |
| Removing or downgrading a dependency | YES | Breaks consumers silently |
| Breaking a public API / exported contract | YES | Outward-facing blast radius |
| Security-relevant change (auth, secrets, perms, crypto) | YES | High cost of error |
| Adding a new dependency | no (log to trace) | Reversible, but note it |
| Touching > the spec's declared edit scope | no (log + re-confirm scope) | Scope creep guard |

Routine edits inside the spec's edit scope do NOT trigger a checkpoint. The boundary fires on the table above only.

## Bash boundary

Default run-authority for ship itself:

- ALLOWED without asking: `Glob`, `Grep`, `Read`, and read-only filesystem inspection (`ls`, `test -f`, `wc -l`, `cat` of a tracked file).
- FORBIDDEN by default: any command that compiles, executes, type-checks, builds, tests, installs, migrates, or deploys: including `node --check`, dry-runs, `tsc`, `eslint`, `pytest`, `cargo build`, `go build`, `npm`/`pnpm`/`yarn`/`bun` of any kind. These go into the verification bundle for the USER to run.
- `--yolo` relaxes ONLY the SAFE verification set (typecheck / lint / test / build the detected stack), and ONLY after ship lists the exact commands and how it will run them. Destructive/DB/deploy commands stay user-only even under --yolo.
- The creator-verifier self-check (step-05) is READ-ONLY: it reasons over diffs with Read/Grep; it never shells out.

## Cleanup boundary

- Removal is `trash` only, NEVER `rm -rf`.
- Team/task orphan files: `trash ~/.claude/teams/{team_name}/` and `trash ~/.claude/tasks/{team_name}/`.
- Never auto-commit/push/PR; the git write-guard prompt must fire on any git write the user explicitly requests.
