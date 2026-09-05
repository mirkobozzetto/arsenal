# Execute and prove

Read relevant code, fix only the requested behavior, preserve unrelated work.
Use native editing tools and explicit target paths. Do not assume a JS or
Python kernel shares the shell working directory.

Run the smallest real check after the change. One owner runs compiler/check
commands; workers return patches and evidence, never competing builds.
Never repeat a passing check without a relevant change. A timeout requires
job inspection, not duplicate execution. Stop retrying without new evidence.

Record completed work immediately in the existing task ledger. Separate
implemented, checked and awaiting-user-acceptance states. If green commits
were requested, commit the unit now; otherwise leave the changes uncommitted.
