# ship usage

/ship <clear request>
/ship <brief-folder or PROPOSAL.md>
/ship -r <artifact>
/ship --tasks T01-T04 <artifact>

Solo and no commits are defaults. --commit requests immediate green commits
per coherent unit. --no-commit disables them. -e/-m solo forbid delegation;
other modes still require explicit agent consent. -a skips redundant
questions, never safety or agent permission. --yolo requests relevant safe
checks, not live-data changes or deployment.

On OMP and Pi, /arsenal-mode on routes every request through Arsenal without
changing native tools or permissions. /arsenal-mode off returns to native
behavior, and /arsenal-mode status shows the current state.
