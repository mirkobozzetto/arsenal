# websearch

Intent-routed web search skill for Claude Code. Wraps [Exa MCP](https://docs.exa.ai/reference/mcp) with 8 specialized modes, smart filters, and structured output with inline citations.

## What it does

Single `/websearch` command routes to the right Exa tool based on intent:

- **quick** (default) - one-shot semantic search.
- **deep** - multi-pass research with gap-driven iteration (up to 3 passes).
- **code** - real code snippets from GitHub, StackOverflow, official docs.
- **docs** - crawl official documentation for a library.
- **debug** - paste an error, find Stack Overflow / GitHub Issues solutions.
- **news** - recent news, category-filtered.
- **compare** - side-by-side comparison via parallel queries.
- **research** - academic papers (arxiv, ACM, IEEE, Nature).
- **similar** - find pages semantically similar to a given URL.

All results are cited inline with `[source](url)`.

## Install

```
/plugin marketplace add mirkobozzetto/websearch-exa
/plugin install websearch@websearch-exa
```

## Prerequisites

- Exa MCP server connected (`mcp__exa__*` tools available in session).
- Exa API key configured.
- See [Exa MCP setup](https://docs.exa.ai/reference/mcp).

The skill never falls back to native `WebSearch` / `WebFetch`. If Exa MCP is not reachable, it errors out.

## Modes

| Flag | Underlying tool | Use case |
|------|-----------------|----------|
| *(none)* | `web_search_exa` | Quick factual lookup |
| `--deep` | `web_search_exa` (looped) | Decision-grade research |
| `--code <q>` | `get_code_context_exa` | API snippets, patterns |
| `--docs <lib>` | `crawling_exa` | Read library docs |
| `--debug <err>` | `web_search_exa` | Error troubleshooting |
| `--news <topic>` | `web_search_advanced_exa` (category:news) | Recent news |
| `--compare <A> vs <B>` | parallel `web_search_exa` | Tech choice |
| `--research <topic>` | `web_search_advanced_exa` (category:research paper) | Academic papers |
| `--similar <url>` | `web_search_exa` | Find similar pages |
| `--info` | - | Display full tutorial |

## Filters

Combine with any mode:

| Flag | Effect |
|------|--------|
| `--after <date>` | Results published after (ISO 8601 or natural: "last week") |
| `--before <date>` | Results published before |
| `--domain <d>` | Restrict to domains (comma-separated) |
| `--exclude <d>` | Exclude domains |
| `--fresh` | Force live crawl (bypass cache) |
| `--locale <CC>` | Country code (e.g. `--locale FR`) |
| `-n <num>` | Number of results (default 5, max 20) |

## Output

| Flag | Effect |
|------|--------|
| `--save <file>` | Save markdown report |
| `--json` | Structured JSON output |
| `--full` | Full text (vs highlights, more tokens) |

## Examples

```
/websearch how does gRPC work
/websearch --code FastAPI middleware authentication
/websearch --docs prisma
/websearch --debug "ECONNREFUSED 127.0.0.1:5432"
/websearch --news --after "last week" Anthropic Claude
/websearch --compare Bun vs Deno vs Node.js
/websearch --deep --save report.md state management React 2026
/websearch --research --after 2026-01-01 LLM code generation
```

## How it works

```
SKILL.md (entry)
  └─> step-00-triage.md     parse flags, classify intent
      └─> step-01-search.md  execute Exa tool per mode
          └─> step-02-deep.md  (if --deep) evaluate gaps, re-query
              └─> step-03-report.md  synthesize, cite, format
```

Each step is a separate file (progressive disclosure). Triage detects the mode, builds Exa params, then dispatches to the right tool with the right query formulation.

Deep mode runs an evaluator loop: after each pass, the model identifies knowledge gaps and issues targeted sub-queries until coverage is sufficient or 3 passes are reached.

## Token cost (orders of magnitude)

| Mode | Tokens (approx) |
|------|-----------------|
| quick | 2-5k |
| code / docs / debug | 3-8k |
| news / compare | 4-10k |
| research | 5-12k |
| deep | 15-30k |

`--full` roughly doubles output tokens vs highlights.

## Limitations

- **Exa-only by design.** No fallback to native `WebSearch` or `WebFetch`. This is intentional - keeps citations consistent and lets the skill assume Exa's filter syntax.
- **Deep mode caps at 3 passes.** Hard limit to bound cost.
- **`--similar` requires a public URL.** Authenticated pages won't work.
- **News freshness** depends on Exa's index latency (typically minutes to hours).

## Contributing

Issues and PRs welcome at [github.com/mirkobozzetto/websearch-exa](https://github.com/mirkobozzetto/websearch-exa).

Keep changes focused: one mode, one flag, or one ref file per PR.

## License

MIT - see [LICENSE](../../LICENSE).
