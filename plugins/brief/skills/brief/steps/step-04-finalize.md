# step 04 finalize

Keep the completed brief ready and report its path. No automatic commit, implementation, model session or browser. Render only on request. The user chooses whether to implement.

When `vcs` is `git`, write `base` (the branch checked out now) and `branch`
(`feat/<slug>`, or the user's name for it) into the brief frontmatter: ship
creates the work branch from `origin/<base>` and returns the PR to `base`.
Skip both fields when `vcs` is `none`.

When `vcs` is `git`, offer once, in one line, to add `docs/brief/` and
`.worktrees/` to the repository `.gitignore`, yes by default: the spec is
working memory, and the worktrees ship creates are checkouts. Add only what
is missing; never duplicate an entry or rewrite existing ones.

When `git_host` is `github-cli`, offer once, in one line: one GitHub issue
per top-level task, each with its Pickup Directive drawn from the task and
its acceptance criteria. On yes, read the `issue` skill and run its
`from-tasks` mode; it writes the issue link into each task heading and
`issues` into the frontmatter. On no, or with `git_host` `none`, continue
without issues; nothing later depends on them.

The current SKILL.md owns the workflow policy. User consent is required
before any agent, reviewer or advisor. No automatic validation sessions
for prose; no continuation after a user stop or completed result.
