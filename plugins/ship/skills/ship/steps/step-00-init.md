# Resume and scope

Read the exact requested artifact and its existing trace once. Restore the
root, completed units, current work, outstanding permissions, and anything an
earlier unit recorded as carried forward for this one. Do not re-run completed
units. A terminal trace or shipped marker means done.

Defaults: solo, no commits, no extra reviewers, no full suite. Ask only for
a blocking missing decision. Use absolute target paths, never the Eval cwd.
For multi-session work, keep one trace.md beside the spec. Inline work needs
no durable files unless requested. A native todo mirrors this progress.

If a command is still running, recover its job instead of starting another.
The OMP controller status is authoritative for its processes and execution
evidence; the trace stores task intent and cross-session acceptance status.

## Branch

On the first run of a spec, when `vcs` is `git`: read `base` and `branch`
from the artifact frontmatter. Missing, ask once in one line (`base` defaults
to the branch checked out now, `branch` to `feat/<slug>`) and write both. Then
`git fetch origin` and `git switch -c <branch> origin/<base>`; if `<branch>`
already exists, switch to it and rebase it on `origin/<base>` only when it
is behind. Never commit on `base`. Graphite repositories use `gt create`.
A dirty tree that is not this spec's work stays untouched and is reported.

## Issue context

A task heading that links an issue: read that issue's Pickup Directive and
comments before the task, with `gh issue view <N>`. They are input, not a
second spec; the brief's acceptance criteria still decide what done means.
