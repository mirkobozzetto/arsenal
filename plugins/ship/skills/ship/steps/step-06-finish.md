# Finish once

Close completed native todo items immediately. Keep external acceptance
blocked separately. Report the result and exact evidence, not workflow steps.
Never continue canceled work due to a reminder.

If using durable artifacts: update trace rows; reconcile completed brief
checkboxes and mark the brief shipped only when its entire scope is complete.
For a fully completed proposal, write PROPOSAL.shipped and leave the accepted
proposal unchanged. A scoped run does not close unfinished sibling work.

When the completed work invalidates something a later task in the same spec
relies on, record it in the trace in that same update: a changed behaviour a
sibling task was written against, an interface it will consume, a brief-level
open decision settled at task time, or a slice its checkboxes assume but do
not own. Write it for a reader with no memory of this session, because the
next run may be one. Nothing to carry forward is the normal case and needs
no entry; this is not a summary of the work already proven by the trace rows.

## Closing a task

Trace row, checkbox ticked, and when the task carries an issue, its
`Resolution:` comment through the `issue` skill (`close #N` only if the
task's evidence is complete; otherwise a progress comment). The final commit
of the task carries these updates too.

Show where to see it: with `browser_open`, open the running app at the page
where the change shows, and say in two or three lines what to click, what to
type, what must happen, with the local account when a login is needed. Without
a browser, give the URL and the same lines. A change with no visible surface
(migration, job, API without a screen) says so in one line and shows the
nearest trace: a query result, a `curl` call, a log line. Never "done"
without a place to see it.

After a run scoped by `--tasks`, state the remaining checkbox count and the
first unfinished task in one factual line, then end with the exact next
command as the last line (`/ship --tasks <id> <artifact>`, in the harness's
own syntax). Reporting what is left is not expanding scope; do not offer to
continue, and do not start it.

## Closing a spec

When the whole scope is shipped and `git_host` is `github-cli`: propose the
PR as the last lines, ready to run, and ask for a go in one word:
`gh pr create --base <base> --head <branch>` with a Conventional Commits
title, a body in English that lists what changed and how it was verified,
and `Closes #N` for every issue of the brief. Graphite repositories use
`gt submit`. Create it only on the go. A go the user withheld earlier in the
same run is not asked for again. With `git_host` `none`, print the manual
equivalent (branch pushed, base, title, body) and stop.

When the user reports the merge: `git fetch origin`, check that
`git log origin/<base>..<base>` holds nothing outside the merged work,
`git switch <base>`, `git reset --hard origin/<base>`, delete the work
branch. If `base` is not the repository's default branch, GitHub closes no
issue: close each one through the `issue` skill with the PR as resolution.
Then say what was closed and realigned.

A spec that ran in its own worktree is torn down in that same update, from
the main checkout: `git worktree remove .worktrees/<slug>`, then
`git branch -d <branch>`. Both refuse while something is unmerged or
uncommitted, and that refusal is the guardrail: report it as it came and
stop, never `--force` or `-D`. Close the tab or window that session used.
When `docs/brief/<slug>` is untracked, it has served its purpose: remove it
with `trash` when that exists, otherwise leave it and give the command. A
tracked spec directory is left alone.

No mandatory HTML, extra report, fresh agent or final catch-all commit.
Publish/push/create a PR only after explicit authorization. Preserve a
declined/deferred Git decision. Stop approved workers through the native
harness; do not delete unrelated team/session files.
