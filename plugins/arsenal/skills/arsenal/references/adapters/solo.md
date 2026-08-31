# Solo Adapter

Use when the harness is unknown, agents are disabled, native agents are absent,
or authentication and model resolution cannot be proved.

- Set `subagents: none` and all `agents_available` values to false.
- Keep the parent model for every semantic role.
- Execute scout, analyst, and reviewer contracts sequentially in the lead.
- Use any available semantic web-search capability. If none exists, mark
  inspirations as inferred.
- Set trace provenance to `parent` and status to `solo`.
- Render with Python. Opening the browser remains optional.
- Show plain-text next actions without assuming a command syntax.
