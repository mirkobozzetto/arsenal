# ship usage

/ship <clear request>
/ship <brief-folder or PROPOSAL.md>
/ship -r <artifact>
/ship --tasks T01-T04 <artifact>
/ship -w <brief-folder or PROPOSAL.md>

Solo is the default. Each closed unit is committed and pushed on the work
branch (created from origin/<base> on the first run). --no-commit disables
both, --no-push keeps commits local, --commit is accepted and changes
nothing. A fully shipped spec ends with the ready PR command and a go
question; after the merge, ship removes the worktree and its branch, closes
the issues and realigns <base>. -w gives the spec its own worktree under
.worktrees/<slug> and hands the run to a session opened there, so a second
spec can run at the same time; one worktree per spec, never per task.
-e/-m solo forbid delegation;
other modes still require explicit agent consent. -a skips redundant
questions, never safety or agent permission. --yolo requests relevant safe
checks, not live-data changes or deployment.

On OMP and Pi, /arsenal-mode on routes every request through Arsenal without
changing native tools or permissions. /arsenal-mode off returns to native
behavior, and /arsenal-mode status shows the current state.
