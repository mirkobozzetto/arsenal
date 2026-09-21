# Plan only the necessary dependencies

For complex work, order existing tasks by dependency. File separation alone
does not establish independence: account for shared APIs, data and build
resources. One lead owns integration and compilations. Do not add a DAG or
a confirmation gate to a small fix.

Commit each coherent unit immediately after its targeted green check and
push it, before starting the next unit. This is the default, on the work
branch only; `--no-commit` turns both off and `--no-push` keeps the commits
local. Preserve the green-commit discipline: no unchecked commits, no
catch-all final commit, no unrelated staged changes, explicit paths,
Conventional Commits, no signature or session link in the message.

The first push of a branch asks once; that answer covers every later push
of the same branch in the run, and a harness permission hook keeps the last
word. A push that is refused is reported and the commits stay local. Use the
project Git/Graphite conventions (`gt modify`, `gt submit`) and preserve
unrelated dirty work. With `vcs` `none`, skip this block and say so once.
