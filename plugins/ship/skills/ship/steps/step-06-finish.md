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

After a run scoped by `--tasks`, state the remaining checkbox count and the
first unfinished task in one factual line. Reporting what is left is not
expanding scope; do not offer to continue, and do not start it.

No mandatory HTML, extra report, fresh agent, final catch-all commit or PR
offer. Publish/push/create a PR only after explicit authorization. Preserve
a declined/deferred Git decision. Stop approved workers through the native
harness; do not delete unrelated team/session files.
