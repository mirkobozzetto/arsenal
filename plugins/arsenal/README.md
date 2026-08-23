# arsenal

The **orientation** stage, upstream of the whole `brief → propose → ship`
pipeline. `arsenal` takes a fuzzy idea ("I want to build something like…")
and turns it into a phased roadmap you believe in - by interviewing you
first, one non-obvious question at a time, then researching how others
solved the same problem.

**Deliverable:** `docs/roadmap/<slug>/roadmap.md`, rendered and opened as a
styled HTML page with:

- the objective, out-of-scope, and cited inspirations,
- a wireframe mockup of the core screen or flow,
- 2-4 ruthless phases, each with copy-paste command blocks,
- a handoff line: which phase to `/brief` first.

The roadmap stays re-discussable: `/arsenal -r <slug>` reopens the loop,
edits the same artifact, re-renders the page.

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install arsenal@arsenal
```

## Usage

```bash
/arsenal a tool that turns my meeting notes into follow-up emails
/arsenal -r meeting-notes-emails     # re-discuss an existing roadmap
/arsenal -a <idea>                   # infer instead of interviewing (vague ideas: don't)
```

## Boundaries

- Chain: `arsenal → brief → propose → ship`. arsenal decides WHAT and in
  which order; it never specs (brief), designs (propose) or implements
  (ship).
- Writes `docs/roadmap/<slug>/roadmap.md` and nothing else in the repo.
- Web research via Exa MCP only; every inspiration is cited.
- Not `code-roadmap`: that plugin routes to skills, this one shapes the
  product objective.
