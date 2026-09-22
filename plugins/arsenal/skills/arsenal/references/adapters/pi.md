# Pi Adapter

Detect Pi from Pi-owned session capabilities: the `subagent` tool, the
`~/.pi/agent/` configuration root, or Pi-owned resource schemes. Do not
infer it from the active model — Pi routes Anthropic, OpenAI and other
providers alike.

## Agents

Pi ships executable agents; none has to be installed for Arsenal to run.

- Probe with `subagent({ action: "list", capabilities: true })`. That call
  is authoritative: it reports executable, non-disabled agents, and for
  external CLI agents whether the runner is available. A file on disk or a
  name in settings is not proof.
- Definitions live in `~/.pi/agent/agents/**/*.md` (user scope) and
  `.pi/agents/**/*.md` (project scope, wins on conflict). Legacy
  `.agents/**/*.md` is still read.
- Map semantic roles to Pi builtins, which need no installation:

  | Arsenal role | Pi agent | Notes |
  |---|---|---|
  | scout | `scout` | fast recon, returns compressed context |
  | analyst | `oracle` | forked context, high thinking, decision consistency |
  | reviewer | `reviewer` | diffs, plans, codebase health |

  A user agent of the same name overrides the builtin. When a role has no
  executable agent, run that contract in the lead rather than substituting
  an unrelated one.

## Dispatch

- One child: `subagent({ agent, task })`. Several children in one
  authorized workflow: a single top-level `subagent` call with
  `workflowScript` and `async: true`; children launch only inside it.
- **Delegation requires an explicit request.** Pi's own guidance forbids
  spawning agents on task size or complexity alone. Arsenal must obtain
  consent before any child, exactly as `--no-agents` already implies, and
  a user or project instruction authorizing delegation counts as consent.
- Keep one writer per working directory. Use `worktree: true` only on a
  clean tree, and read-only reviewers for independent review.
- Async runs notify the session natively on completion. Do not poll, do
  not sleep; end the turn and consume the result when it arrives.

## Models

- The lead keeps the active session model.
- Override per child with `model: "provider/model"`. Thinking level is a
  suffix on that string — `provider/model:low|medium|high` — never a
  separate field; an agent's frontmatter otherwise imposes its own.
- Resolve names from `subagent({ action: "models" })` and copy them
  exactly. Announce the resolved agent, model and thinking level before
  launching. Never claim an effective model that was not verified.
- Bundled templates request no concrete identifier: Pi sessions span
  providers, so semantic roles stay semantic and the operator's
  configuration decides. Provenance is `session` when the child inherits,
  `agent-file` when frontmatter sets it, `explicit` on an override.

## Capabilities

- `questions`: native structured form through `ask_user`, when the active
  mode permits it. Otherwise plain text.
- `web_search`: `exa` when the Exa MCP server is connected — the tools are
  `mcp__exa_web_search_exa`, `mcp__exa_web_search_advanced_exa` and
  `mcp__exa_web_fetch_exa`. MCP servers are declared in
  `~/.pi/agent/mcp.json`. Fall back to `none` and mark inspirations as
  inferred.
- `structured_output`: true. Pass `outputSchema` on the child, or a `gate`
  command whose JSON stdout becomes the structured result.
- `subagents`: `parallel` inside a workflow script, `sequential` for a
  single child, `none` when the probe returns nothing executable.
- `browser_open`: true. Render with Python; opening stays optional.

## Resume

Pi exposes skills as `/skill:<name>` when `enableSkillCommands` is on.
Format resume as `/arsenal -r <slug>` only when that routing is active;
otherwise show the plain-text action without assuming a command syntax.

## Worktree session

- Start the harness in an existing worktree with `pi` run from that
  directory. Pi's own `worktree: true` belongs to `subagent` and creates a
  child's checkout; it never opens the session ship needs, and it ignores
  the `base` the spec recorded.
- Send ship as `/skill:ship <absolute spec path> -a` when
  `enableSkillCommands` is on, otherwise as the plain sentence.

## Fallback

Missing agents, missing authentication, or an unprovable model resolution
falls back to the solo adapter. A workflow, child launch or extension
failure is an infrastructure blocker: report the exact failure and the
run status rather than silently switching to a foreground CLI.
