# State contract

The frontmatter fields the brief/propose/ship skills maintain so `next` can derive the open-work board. The artifact is the single source of truth; there is no separate ledger.

## brief.md frontmatter

| Field | Set by | Values |
|-------|--------|--------|
| `status` | brief (draft -> ready), ship (-> shipped) | `draft`, `ready`, `in_progress`, `shipped`, `superseded` |
| `next_action` | brief at finalize | one line: what shipping this does |
| `resume_cmd` | brief at finalize | `/ship docs/brief/<slug>` |
| `shipped_at` | ship on finish | ISO timestamp |
| `proposal` | propose at finalize, when it designs this brief | path to the sibling `PROPOSAL.md` |

`tasks.md` checkbox counts (`- [ ]` vs `- [x]`) give progress.

## Derived, never written

| Field | Source |
|-------|--------|
| `progress` | `tasks.md` checkbox counts |
| `next_task` | the first unfinished checkbox in `tasks.md`, reported with the `##` heading it sits under |
| `next_task_id` | the leading `T01` identifier, or legacy numeric identifier, of that heading |
| `next_command` | `resume_cmd` scoped with `--tasks <next_task_id>` when the target is a brief |

The scanner recomputes these on every run, so they cannot go stale. Do not
mirror the current task into `next_action`: that field is the artifact-level
outcome — one line on what shipping this does — and a hand-written task name
becomes wrong the moment a box is ticked.

## Detection

An artifact is a brief when its frontmatter says `type: brief` (or the legacy
`prd`) **or** the file is named `brief.md`; a proposal when `type` says so or
the file is `PROPOSAL.md` / `RFC.md`. The filename is authoritative on its own,
so an artifact written to this contract — which requires no `type` field — is
always seen.

A brief whose HOW moved into a proposal is set `superseded` by propose at
finalize: it leaves the board, and ship has ONE target for the feature
instead of two.

## PROPOSAL.md frontmatter

| Field | Set by | Values |
|-------|--------|--------|
| `status` | propose (Draft -> Review -> Accepted), ship (-> shipped) | `Draft`, `Review`, `Accepted`, `Rejected`, `shipped` |
| `next_action` | propose at finalize | one line |
| `resume_cmd` | propose at finalize | `/ship <path>/PROPOSAL.md` |
| `source_brief` | propose at init, when a sibling brief exists | `docs/brief/<slug>/` |

PROPOSAL.md is otherwise immutable. The only mutation ship makes is the `status` flip to `shipped` on finish; if that immutability must be absolute, ship instead writes a sibling `PROPOSAL.shipped` marker and the scanner treats its presence as shipped.

## The loop

ship closes the loop at finish: a `shipped` run flips the upstream `status`, which removes the item from the board on the next scan. A `halted`/paused run stamps `status: in_progress` + `resume_cmd: /ship -r <artifact>`. This is what prevents a stale "ready"/"Accepted" item from lingering after the work is done.

## Buckets (how the scanner classifies)

- OPEN (actionable): brief `ready`/`in_progress`, propose `Accepted`.
- WIP (authoring): brief `draft`, propose `Draft`/`Review`.
- DONE (hidden by default): `shipped`, `superseded`, `Rejected`.
- roadmap (`type: roadmap`): OPEN when `ready`, else WIP; `superseded` is DONE.
