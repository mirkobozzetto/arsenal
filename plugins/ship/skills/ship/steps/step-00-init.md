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
Before this or any later switch, the tree must be clean and the current
branch pushed: commit and push the in-scope work first. A dirty tree holding
work outside this spec stays untouched and is reported, never committed,
reset or discarded to force the switch through.

## Worktree, with `-w` only

A second session in the same directory overwrites the first. With `-w`, and
only then, give this spec its own checkout and hand the run over. Read the
spec's `base` and `branch` first, exactly as above: the worktree branches
from `origin/<base>`, never from the repository's default branch.

1. Refuse and stop if `vcs` is not `git`, if `.worktrees/<slug>` already
   exists, or if `git worktree list` already holds `<branch>`. Report which.
2. `git fetch origin`, then
   `git worktree add .worktrees/<slug> -b <branch> origin/<base>`. When
   `<branch>` already exists, `git worktree add .worktrees/<slug> <branch>`.
3. Copy the local files the checkout lacks, from the repository root:
   `git ls-files -z --others --ignored --exclude-from=.worktreeinclude`
   piped through `tar` into the worktree. Never move or link `.env` itself;
   the originals stay untouched. Without a `.worktreeinclude`, offer one
   holding `.env` and `.env.local` in one line before continuing, and say
   which files were copied.
4. Run the project's own install command, read from its manifest, inside the
   worktree. No symlinked dependency directory by default.
5. Open a session there according to `session_launcher` and send it the
   spec's ship run with `-a` and the absolute spec path, in the syntax of
   the matching adapter. With `herdr`, create the tab without stealing
   focus; with `tmux`, a new window; with `none`, print the directory and
   the command for the user to run.
6. Return immediately: the worktree path, the branch, and where that session
   is. Do not implement any task in this session.

## Issue context

A task heading that links an issue: read that issue's Pickup Directive and
comments before the task, with `gh issue view <N>`. They are input, not a
second spec; the brief's acceptance criteria still decide what done means.
