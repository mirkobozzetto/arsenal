# State contract

The frontmatter fields the prd/rfc/ship skills maintain so `next` can derive the open-work board. The artifact is the single source of truth; there is no separate ledger.

## prd.md frontmatter

| Field | Set by | Values |
|-------|--------|--------|
| `status` | prd (draft -> ready), ship (-> shipped) | `draft`, `ready`, `in_progress`, `shipped`, `superseded` |
| `next_action` | prd at finalize | one line: what shipping this does |
| `resume_cmd` | prd at finalize | `/ship docs/prd/<slug>` |
| `shipped_at` | ship on finish | ISO timestamp |

`tasks.md` checkbox counts (`- [ ]` vs `- [x]`) give progress.

## RFC.md frontmatter

| Field | Set by | Values |
|-------|--------|--------|
| `status` | rfc (Draft -> Review -> Accepted), ship (-> shipped) | `Draft`, `Review`, `Accepted`, `Rejected`, `shipped` |
| `next_action` | rfc at finalize | one line |
| `resume_cmd` | rfc at finalize | `/ship <path>/RFC.md` |

RFC.md is otherwise immutable. The only mutation ship makes is the `status` flip to `shipped` on finish; if that immutability must be absolute, ship instead writes a sibling `RFC.shipped` marker and the scanner treats its presence as shipped.

## The loop

ship closes the loop at finish: a `shipped` run flips the upstream `status`, which removes the item from the board on the next scan. A `halted`/paused run stamps `status: in_progress` + `resume_cmd: /ship -r <artifact>`. This is what prevents a stale "ready"/"Accepted" item from lingering after the work is done.

## Buckets (how the scanner classifies)

- OPEN (actionable): prd `ready`/`in_progress`, rfc `Accepted`.
- WIP (authoring): prd `draft`, rfc `Draft`/`Review`.
- DONE (hidden by default): `shipped`, `superseded`, `Rejected`.
