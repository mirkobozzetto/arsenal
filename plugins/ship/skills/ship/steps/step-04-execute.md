# Execute and prove

Read relevant code, fix only the requested behavior, preserve unrelated work.
Use native editing tools and explicit target paths. Do not assume a JS or
Python kernel shares the shell working directory.

Run the smallest real check after the change. One owner runs compiler/check
commands; workers return patches and evidence, never competing builds.
Never repeat a passing check without a relevant change. A timeout requires
job inspection, not duplicate execution. Stop retrying without new evidence.

Record completed work immediately in the existing task ledger. Separate
implemented, checked and awaiting-user-acceptance states. Once its check is
green, commit and push the unit now (steps/step-02-plan.md), before the
next one. Only `--no-commit` leaves it uncommitted; `--no-push` keeps it local.
