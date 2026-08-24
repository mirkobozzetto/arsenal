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
