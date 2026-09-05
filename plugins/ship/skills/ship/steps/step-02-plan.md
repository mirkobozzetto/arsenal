# Plan only the necessary dependencies

For complex work, order existing tasks by dependency. File separation alone
does not establish independence: account for shared APIs, data and build
resources. One lead owns integration and compilations. Do not add a DAG or
a confirmation gate to a small fix.

Commits are optional and require the user delivery workflow. If requested,
commit each coherent unit immediately after its targeted green check, before
starting the next unit. Preserve the existing green-commit discipline: no
unchecked commits, no catch-all final commit, no unrelated staged changes.
Use the project Git/Graphite conventions and preserve unrelated dirty work.
No permission-grant file or push is inferred from a branch choice.
