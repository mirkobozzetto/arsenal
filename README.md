<p align="center">
  <img src="./assets/arsenal-hero.jpeg" alt="arsenal: idea to shipped, through brief and propose" width="100%">
</p>

<h1 align="center">arsenal</h1>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/plugins-8-blue.svg" alt="8 plugins">
  <img src="https://img.shields.io/badge/agents-Claude%20Code%20%C2%B7%20pi%20%C2%B7%20Cursor%20%C2%B7%20Codex%20%C2%B7%20any%20CLI-7c3aed.svg" alt="Claude Code, pi, Cursor, Codex, any coding CLI">
</p>

<p align="center">
  Mirko Bozzetto's curated skills for AI coding agents: a spec-driven build pipeline plus the tools around it.
</p>

Skills here are plain markdown, portable across any coding agent or CLI (Claude Code, pi, oh-my-pi, Cursor, Codex, ...). Native plugin install is wired for Claude Code; every other agent can load the skill files directly. Every plugin installs on its own. Pick what you need.

---

## What's in the arsenal

| Plugin | Category | What it does | You type |
|--------|----------|--------------|----------|
| [`code-roadmap`](./plugins/code-roadmap) | orientation | At task start, matches your intent against the skills you have installed and prints a recommended chain + execution mode + reflection level. Advisory, never forces a path. | `/code-roadmap add OAuth login` |
| [`brief`](./plugins/brief) | planning | The *what* and *why*. Authors a product brief by interview (the PRD tradition, under a plainer name), then derives a nested task list. Stops before code. | `/brief add OAuth login` |
| [`propose`](./plugins/propose) | planning | The *how*. A design workflow in the RFC tradition: problem, alternatives, tradeoffs, design, risks, recommendation, impl plan. Two natural sizes with hard ceilings: one page for a bounded choice, a few pages for a real design question. Forces reasoning before action. | `/propose OAuth token storage` |
| [`ship`](./plugins/ship) | implementation | The *build*. Executes a finalized `brief` or an Accepted `propose` (or a bare prompt via an inline contract) on agent-teams / subagents / solo, and hands back a verification bundle you run + a trace ledger. | `/ship docs/brief/oauth-login/` |
| [`issue`](./plugins/issue) | memory | GitHub issues as cross-session resolution memory. Self-contained, cold-readable, resumable after any context reset. | `/issue log this bug`, later `resume issue #42` |
| [`next`](./plugins/next) | orientation | What's left and how to resume it. Derives an open-work board from `brief`/`propose` frontmatter and recommends the next command; a SessionStart hook auto-surfaces it so context survives `/clear`. | `/next` |
| [`trace`](./plugins/trace) | memory | A progress ledger that writes itself. A Stop hook logs the working-tree delta every turn that touched files (in `ship`, `propose`, or plain chat), so `next` shows what moved without you remembering to log it. | nothing: a hook logs it |
| [`websearch`](./plugins/websearch) | research | Intent-routed web search via [Exa](https://exa.ai) MCP: 8 modes (quick / deep / code / docs / debug / news / compare / research). | `/websearch <question>` |

**When the transversal three earn their keep.** `next` is Monday morning (or any `/clear`): three open workstreams, one command tells you which brief is `ready`, which proposal is `Accepted`, and the exact `/ship` to resume. `issue` is the gnarly bug you stop chasing at 1am: log the hypothesis and state to a GitHub issue, pick it up cold days later. `trace` is the hour of work done in plain chat that `ship` never stamped: a Stop hook records it, so `next` is not blind to it. They run alongside the pipeline, never as stages of it.

---

## The build pipeline

The four planning-to-build plugins form one chain. An idea enters, passes the **brief** gate (what/why) and, when the how is genuinely open, the **propose** gate (how), and comes out the other side as shipped code.

```
            code-roadmap                          issue
          (orient: which path?)             (memory: resume cold)
                  │                                  ▲
                  ▼                                  │  (log when work must
   idea ──▶ brief ──▶ propose ──▶ ship ──▶ shipped  │   survive a reset)
          what/why      how       build      code   │
            │            │          │                │
            └────────────┴──────────┴────────────────┘
```

**The default path is the short one.** Small senior teams that ship well (Basecamp's Shape Up pitch, Linear's 1-2 page spec, Amazon's single iterated PR/FAQ) write ONE document before code, not a pipeline. arsenal works the same way: `brief → ship` is the normal route, and `propose` is the exception that must justify itself. The threshold is rollback cost, never diff size.

| Situation | Path |
|---|---|
| Reversible in under a day, known pattern | `ship` directly (inline contract) |
| One feature, the how is obvious | `brief → ship` |
| A choice to settle, small or large | `propose → ship` |
| A feature AND an open design question | `brief → propose → ship` |

**What each step applies to:**

1. **`code-roadmap`**: when you're unsure where to start. Applies to *any* task; it only orients, it never runs anything. Skip it once the path is obvious.
2. **`brief`**: when the *what/why* isn't pinned down yet. Applies to a new feature or product change. Output: `docs/brief/<slug>/{brief.md, tasks.md}`.
3. **`propose`**: when the *how* is a real question: several valid designs where the wrong one is expensive to undo, an architecture change, a migration, a new pattern. A bounded choice ("SQS over Kafka") gets the one-page size; a design question gets the full treatment. Output: a proposal with alternatives + tradeoffs + an impl plan.
4. **`ship`**: to build. Applies to executing a finalized `brief` (`status: ready`) or an Accepted `propose` (`status: Accepted`). Output: code + a `verification-bundle.md` you run yourself + a `trace.md` ledger.
5. **`issue`**: transversal. When a problem must survive a context reset, log it as a resumable GitHub issue and pick it up cold later.
6. **`next`**: transversal. Asks "what is left and how do I resume it" - derives the board from each `brief`/`propose` status and points at the next `/ship`. `ship` closes the loop (flips `ready`/`Accepted` to `shipped` on finish, and reconciles the `tasks.md` checkboxes from its trace so the board's task count is never stale, even under `-a`), and a SessionStart hook re-surfaces the board so a `/clear` never loses the thread.
7. **`trace`**: transversal. A ledger that writes itself. `next` derives its board from `brief`/`propose` status, and only `ship` stamps that, so `next` is blind to work done outside `ship`. `trace` fills that gap: a Stop hook logs the working-tree delta on any turn that touches files, in any context, so the work is recorded without you remembering to log it.

`trace` and `next` are the continuity pair: `trace` records what happened, `next` tells you what is left. The record is deterministic (a hook, not a habit), so nothing depends on remembering.

```
   ship    ┐
   propose ├──▶  any turn that touches files  ──▶  .claude/trace.md  ──▶  next reads it
   chat    ┘        (Stop hook, automatic)            (one ledger)        "what moved"
```

**The document is the deliverable.** Each workflow ends by rendering the finished document to a clean HTML page: status banner, executive summary first, the decision boxed before the argument (inverted pyramid), a side table of contents. Readable by a developer, presentable to a client.

---

## A bit of history: where brief and propose come from

The names are plain on purpose, but the artifacts are decades-old engineering discipline: `brief` runs the PRD tradition, `propose` runs the RFC tradition. The plugins just turn them into repeatable workflows, and drop the acronyms at the door.

### propose: the RFC tradition (1969)

The RFC series began in **April 1969**, when **Steve Crocker**, then a UCLA graduate student, wrote **[RFC 1, "Host Software"](https://www.rfc-editor.org/rfc/rfc1.html)** to organize the working notes of the ARPANET's Network Working Group. The name was deliberately humble: in Crocker's words, *"the basic ground rules were that anyone could say anything and that nothing was official... and to emphasize the point, I labeled the notes 'Request for Comments'"* ([The Origins of RFCs](https://datatracker.ietf.org/doc/html/rfc1000)). The goal was to **start the conversation, not freeze a standard**. The series went on to become the Internet's permanent record of design decisions, managed today through the IETF, and edited for 28 years by Jon Postel.

Engineering organizations later borrowed the form for internal design docs: the [Rust RFC process](https://rust-lang.github.io/rfcs/), Oxide's [Requests for Discussion](https://oxide.computer/blog/rfd-1-requests-for-discussion), Google design docs, the Kubernetes and Go proposal processes. The throughline never changed: **write the proposal down, weigh the alternatives and tradeoffs, reach consensus, all before you build.** The one-page size of `propose` inherits from a sibling tradition, Michael Nygard's [Architecture Decision Records](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions): one decision, one page, written so it never gets re-litigated.

### brief: the PRD tradition

The PRD comes from product management. The acronym standardized in the **1990s** waterfall era; the artifact was rewritten for agile in the 2000s. **Marty Cagan's ~2006 [How to Write a Good PRD](https://www.svpg.com/wp-content/uploads/2024/07/How-To-Write-a-Good-PRD.pdf)** was the canonical guide of its generation and led to his 2008 book *Inspired*.

The enduring definition: a brief states **what** a release will do, **who** it's for, and **why** it matters, and is *deliberately silent on how*. The "how" belongs to the engineering-owned design doc (`propose`). Modern practice keeps it short: 1-3 pages, a living document, not a 50-page frozen spec. Cagan himself later [pushed teams toward discovery and prototypes over heavy documents](https://www.svpg.com/discovery-vs-documentation/): a reminder that the spec is a means to clarity, not an end. The `brief` plugin runs it as an interview → a tight spec + a derived task list, and stops before code.

> **Why this ordering matters:** the single most common failure is letting the *what* and the *how* bleed together. Keeping `brief` (what/why) upstream of `propose` (how) upstream of `ship` (build), each a separate and checkable artifact, is the whole point of the chain.

**Further reading**

- Brief / PRD: [How to Write a Good PRD (Marty Cagan / SVPG)](https://www.svpg.com/wp-content/uploads/2024/07/How-To-Write-a-Good-PRD.pdf) · [Discovery vs. Documentation (SVPG)](https://www.svpg.com/discovery-vs-documentation/) · [Product document naming (Peter Hilton)](https://hilton.org.uk/blog/product-documents)
- Propose / RFC: [RFC Editor history](https://www.rfc-editor.org/history/) · [RFC 1: Host Software (1969)](https://www.rfc-editor.org/rfc/rfc1.html) · [The Rust RFC Book](https://rust-lang.github.io/rfcs/) · [Oxide RFD 1](https://oxide.computer/blog/rfd-1-requests-for-discussion) · [Documenting Architecture Decisions (Michael Nygard)](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- Short docs: [Design Docs at Google (Malte Ubl)](https://www.industrialempathy.com/posts/design-docs-at-google/) · [Shape Up: the pitch (Basecamp)](https://basecamp.com/shapeup/1.5-chapter-06) · [How Linear builds product](https://www.lennysnewsletter.com/p/how-linear-builds-product)

---

## Why I built this

Splitting a task into checkable artifacts changed how I work.

`brief` pins down the what and the why.
`propose` decides the how, when the how is a real question.
`ship` executes the plan.

When I run the full chain, each stage keeps the previous one honest: `ship` will not execute a brief that is not marked `ready` or a proposal that is not `Accepted`. The spec has to be real before any code gets written.

That gate is what gave me a precision I had never reached before.

But the chain is never forced on me. When I just want to move, I hand `ship` a one-line prompt. It asks a couple of quick questions, builds a small contract on the spot, and ships.

The discipline is there when the stakes call for it, and out of the way when they do not. That balance is the whole point.

- Mirko

---

## Quick install (Claude Code)

Add the marketplace once, then install whichever plugins you want:

```bash
# Inside Claude Code:
/plugin marketplace add mirkobozzetto/arsenal

# Install the whole pipeline:
/plugin install code-roadmap@arsenal
/plugin install brief@arsenal
/plugin install propose@arsenal
/plugin install ship@arsenal
/plugin install issue@arsenal
/plugin install next@arsenal
/plugin install trace@arsenal

# ...or just one:
/plugin install ship@arsenal
```

Then drive the pipeline:

```bash
/code-roadmap add OAuth login          # orient
/brief add OAuth login                 # what/why  -> docs/brief/oauth-login/
/propose OAuth token storage           # how       -> the proposal document
/ship docs/brief/oauth-login/          # build     -> code + verification bundle + trace
/next                                  # what's left -> the next /ship, after any /clear
```

Per-plugin setup, flags, and dependencies live in each plugin's README (linked in the table above).

---

## Dependencies, per plugin

Plugins are published **as I actually use them**: adapt them to your own setup.

- **`ship`**, **`brief`**: use [Exa](https://exa.ai) MCP for any web lookup (no native WebSearch/WebFetch). `ship` is toolchain-agnostic (detects pnpm/bun/yarn/npm, cargo, go, uv, ... from your lockfile) and never runs your tests/builds. It hands you a bundle to run.
- **`propose`**: optionally integrates [GitNexus](https://github.com/) for codebase context; degrades to grep/Read when it's absent. Uses Exa for prior-art research.
- **`code-roadmap`**: reads the skills you have installed this session; mentions index-gated code-intel tools and creator skills that you may or may not have. It only suggests, so adapt the chain to your toolbox.
- **`issue`**: needs the `gh` CLI authenticated, inside a GitHub repo.
- **`websearch`**: needs the Exa MCP server connected.

---

## Companion: espresso

[**espresso**](https://github.com/mirkobozzetto/espresso) is the token-economy side of this setup: a hooks-based installer that wires up RTK, Caveman, GitNexus and Exa so these skills run lean. arsenal is the *what you build with*; espresso is *how you keep it cheap*.

---

## Install on other agents (Codex, Cursor, ...)

The skills are plain markdown. To use them outside Claude Code:

1. Copy `plugins/<name>/skills/<name>/` into your agent's skill/prompt directory.
2. Wire the agent's MCP config to whatever the skill needs (Exa for `ship`/`brief`/`websearch`, etc.).
3. Invoke per your agent's slash/skill mechanism.

---

## Contributing

Open an issue or PR at [github.com/mirkobozzetto/arsenal](https://github.com/mirkobozzetto/arsenal). One concern per PR. Bump the plugin's semver on any change that ships to users.

## License

MIT: see [LICENSE](./LICENSE).
