# Verification without extra agents

The lead verifies. No mandatory creator-verifier, read-back of every file,
full suite, new tests, or model session. Reuse evidence already obtained.

Prose/simple configuration: successful edit unless the user asked to check.
Behavioral change: execute the relevant existing command or disposable smoke
scenario. A meaningful command, not an arbitrary zero exit, proves behavior.
Data migration: backup and real-copy checks remain required. Ask before
permanent tests or live-data changes.

Under the OMP controller, use bash verification:true for the relevant final
check and arsenal_finish when complete. Report unavailable native/UI/network
capabilities honestly. A saved bundle is optional; do not make the user rerun
checks that you already executed successfully.
