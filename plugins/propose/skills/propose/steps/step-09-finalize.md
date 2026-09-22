# step 09 finalize

Leave Draft/Review until explicit user acceptance; never default to Accepted. After acceptance, preserve source-brief links and normal handoff without launching implementation. Render only when requested. Do not automatically open a browser or update unrelated indexes.

On acceptance, when `vcs` is `git`, write `base` (the branch checked out
now) and `branch` (`feat/<slug>`, or the user's name for it) into the
proposal frontmatter, as a brief already does: ship then creates the work
branch from `origin/<base>` and returns the pull request to `base` without
asking. A proposal left in Draft or Review gets neither field.

The current SKILL.md owns the workflow policy. User consent is required
before any agent, reviewer or advisor. No automatic validation sessions
for prose; no continuation after a user stop or completed result.
