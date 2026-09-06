<p align="center">
  <img src="./assets/arsenal-hero.jpeg" alt="arsenal: idea to shipped, through brief and propose" width="100%">
</p>

<h1 align="center">arsenal</h1>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  Mirko Bozzetto's curated skills for AI coding agents: one entry point, specialized skills underneath.
</p>

Native plugins for Claude Code and Codex, built from the same portable markdown skills. Install Arsenal and the specialist plugins you need. Eight primary plugins share one workflow; code-roadmap remains a legacy alias.

---

## What's in the arsenal

| Plugin | What it does | You type |
|--------|--------------|----------|
|  [`arsenal`](./plugins/arsenal) | One entry point: clarify, select and apply the skills the task needs. | `/arsenal add OAuth login` |
|  [`brief`](./plugins/brief) | The **what & why**. Interview → product spec + task list. | `/brief add OAuth login` |
|  [`propose`](./plugins/propose) | The **how**. Alternatives, tradeoffs, risks, plan. One page or a few, hard ceilings. | `/propose OAuth token storage` |
|  [`ship`](./plugins/ship) | The **build**. Implements a clear request or approved spec and reports verification. | `/ship docs/brief/oauth-login/` |
|  [`issue`](./plugins/issue) | The 1am bug, logged so you can pick it up cold. | `/issue log this bug` |
|  [`next`](./plugins/next) | Monday morning: what's open, what's next, exact resume command. | `/next` |
|  [`trace`](./plugins/trace) | Progress ledger that writes itself. A hook, not a habit. | nothing |
|  [`websearch`](./plugins/websearch) | Evidence-backed web search via [Exa](https://exa.ai). | `/websearch <question>` |

---

## One entry point

Use `/arsenal` in Claude Code or `$arsenal` in Codex.

- Without a description: a short adaptive form clarifies the outcome and whether you want advice, a document or implementation.
- With a description: Arsenal reads the available context first and asks only route-changing questions.
- It selects an installed skill, reads its complete instructions and applies them.
- After each result it reassesses what remains, within your authorization.

| What is missing or requested | Route |
|---|---|
| Product decisions need a specification | `brief` |
| A consequential technical choice needs resolution | `propose` |
| Implementation is clear and authorized | `ship` |
| External evidence | `websearch` |
| GitHub issue memory | `issue` |
| Unfinished work or activity history | `next` or `trace` |
| A real phased roadmap | Arsenal's optional roadmap branch |

There is no complexity score and no mandatory `brief → propose → ship` sequence.
A bug does not automatically create an issue; a small clear change goes straight to ship.
A proposal still needs explicit acceptance. Advice-only requests never become implementation.

The specialist skills remain directly usable. Their procedures are not copied into Arsenal.
Install each needed plugin separately: Arsenal does not bundle or silently install its dependencies.
Missing skills are reported, with installation or an explicitly labeled fallback offered.

`code-roadmap` is deprecated: it forwards advisory requests to Arsenal, without a second router.
Work stays solo unless you approve delegation. No mandatory roadmap, HTML or new state file.

### Optional controlled OMP runtime (macOS)

Install dependencies in `plugins/ship/runtime` with Bun, then add its absolute
`extension.ts` path to OMP's `extensions` configuration and restart OMP.
The nine skill commands activate the controller; ordinary sessions stay native.
`/arsenal-mode runtime [root]` or `edit-only [root]` selects scope and proof
policy. `status` reports persisted state; `off` explicitly restores native tools.

The LangGraph controller persists transitions, serializes shell commands and
reuses an identical successful check until the revision changes. Runtime
completion requires recorded successful execution, not an assertion from a
reviewer. Exit status alone does not prove semantic correctness.

Controlled Eval accepts literal tool calls only. The macOS sandbox refuses
shell networking and writes outside the root/scratch. This deliberately
excludes browser automation, dependency downloads and external GitHub writes;
authorize a separate native operation when needed. A missing command result
stays blocked rather than assuming its process stopped. Other operating
systems refuse controlled shell execution. No general-purpose security or
token-saving percentage is claimed.

---

## The lineage

Plain names, old discipline. **propose** is the RFC tradition ([RFC 1, 1969](https://www.rfc-editor.org/rfc/rfc1.html), [Rust](https://rust-lang.github.io/rfcs/), [Oxide](https://oxide.computer/blog/rfd-1-requests-for-discussion)) plus [Nygard's one-page decision records](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions). **brief** is the PRD tradition ([Cagan](https://www.svpg.com/wp-content/uploads/2024/07/How-To-Write-a-Good-PRD.pdf)) sized by the short-doc school ([Google](https://www.industrialempathy.com/posts/design-docs-at-google/), [Shape Up](https://basecamp.com/shapeup/1.5-chapter-06), [Linear](https://www.lennysnewsletter.com/p/how-linear-builds-product)).

> The classic failure is letting the *what* and the *how* bleed together. One checkable artifact per question - that's the whole point.

---

## Why I built this

`brief` pins the what and why. `propose` settles the how. `ship` builds. 
The gates gave me a precision I never had; and when I just want to move, `ship` takes a one-line prompt. 
Discipline when the stakes call for it, out of the way when they don't.

Mirko

---

## Quick install

### Claude Code

```bash
# Inside Claude Code:
/plugin marketplace add mirkobozzetto/arsenal

# Install the whole pipeline:
/plugin install arsenal@arsenal
/plugin install brief@arsenal
/plugin install propose@arsenal
/plugin install ship@arsenal
/plugin install issue@arsenal
/plugin install next@arsenal
/plugin install trace@arsenal
/plugin install websearch@arsenal

# ...or just one:
/plugin install ship@arsenal
```

Then use the entry point or a specialist directly:

```text
/arsenal
/arsenal implement the agreed OAuth login
/arsenal compare token storage approaches, do not implement
/arsenal create a phased roadmap for a meeting-notes app
/brief add OAuth login
/propose OAuth token storage
/ship docs/brief/oauth-login/
/next
```

Per-plugin setup, flags, and dependencies live in each plugin's README.

### Codex

```bash
# Add the repository marketplace:
codex plugin marketplace add https://github.com/mirkobozzetto/arsenal

# Install the plugins you need:
codex plugin add arsenal@arsenal
codex plugin add brief@arsenal
codex plugin add propose@arsenal
codex plugin add ship@arsenal
codex plugin add issue@arsenal
codex plugin add next@arsenal
codex plugin add trace@arsenal
codex plugin add websearch@arsenal
```

In Codex, invoke a skill with `$arsenal`, `$brief`, `$propose`, `$ship`, `$next`,
or the corresponding skill name. In Claude Code, use the `/` forms shown above.

`next` and `trace` bundle lifecycle hooks for both runtimes. Codex asks you to
review and trust those hooks before running them. ChatGPT does not run plugin
hooks, so both skills remain available there on demand without automation.

---

## Good to know

- Published **as I actually use them** - adapt to your setup.
- Web lookups go through [Exa](https://exa.ai) MCP; `propose` also taps [GitNexus](https://github.com/mirkobozzetto/gitnexus) when present, greps when not.
- `ship` uses the smallest meaningful verification permitted by your project instructions and reports what was actually checked.
- Commits and pushes are not automatic. Request Git delivery explicitly; `ship --commit` requests progressive commits.
- `issue` needs an authenticated `gh` CLI.
- **Other agents** (pi, oh-my-pi, Cursor): copy `plugins/<name>/skills/<name>/` into the agent's skill directory and wire its MCPs.
- **Codex and Claude Code:** both use the native plugin manifests included in each plugin folder.
- Companion: [**espresso**](https://github.com/mirkobozzetto/espresso), the token-economy side. arsenal is what you build with; espresso keeps it cheap.

---

## License

MIT: see [LICENSE](./LICENSE).
