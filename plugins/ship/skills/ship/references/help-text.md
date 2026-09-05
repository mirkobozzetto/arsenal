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

OMP controlled mode uses LangGraph transitions, a restricted tool bridge,
sandboxed shell commands and workspace locks. /arsenal-mode status shows the
state; /arsenal-mode runtime [root] starts a new checked run; edit-only is for
prose/configuration; off explicitly returns to native OMP behavior.
No network in sandboxed shell. Unavailable capabilities are reported, not
silently replaced by unsandboxed execution. Other harnesses get the same
concise workflow policy, not a claim of OMP runtime enforcement.
