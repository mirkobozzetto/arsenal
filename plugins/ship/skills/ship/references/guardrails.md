# Operation boundaries

Keep explicit authorization and backup for live databases, destructive
changes, deployment, publication and security-sensitive operations. A request
for implementation is not permission for unrelated production changes.
Distinguish editing a migration source from executing it on a live database.

Work solo unless delegation was specifically approved. Workers never approve
other workers. Read-only tools are preferred for investigation. Use the
smallest meaningful runtime check for code; no automatic validation of prose.

One owner handles shared build resources. Inspect real command effects.
Timeouts do not prove child exit. In controlled mode, shell is sandboxed and
Eval is restricted to native tool calls; never attempt an alternate escape.
The runtime enforces mechanical boundaries, not semantic correctness.
