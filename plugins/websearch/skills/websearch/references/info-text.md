# /websearch - Full guide

## Quick usage

```
/websearch <query>                    Quick search
/websearch --deep <query>             Deep multi-pass research
/websearch --code <query>             Code examples, API, libs
/websearch --docs <lib>               Official documentation for a lib
/websearch --debug <error>            Paste an error, find the fix
/websearch --news <topic>             Recent news
/websearch --compare <A> vs <B>       Side-by-side comparison
/websearch --research <topic>         Academic papers
/websearch --similar <url>            Pages similar to a URL
/websearch --info                     This guide
```

## Modes in detail

### Quick search (default)
```
/websearch how does gRPC work
```
Single pass, 5 results, answer in bullet points with sources.
Best for fast factual questions.

### Deep research (`--deep`)
```
/websearch --deep state management React 2026
```
Breaks the query into 3-5 sub-queries by angle:
- Definitional, practical, comparative, recent, expert.
- Evaluates results, identifies gaps.
- Iterates up to 3 passes max.
- Produces a structured report with thematic sections.
Usage: technical decisions, deep monitoring, topic exploration.

### Code (`--code`)
```
/websearch --code FastAPI middleware authentication
/websearch --code Python asyncio gather timeout
```
Uses `get_code_context_exa`, optimized to:
- Extract real code snippets (GitHub, SO, official docs).
- Code-first results, explanation second.
Usage: find an API example, an implementation pattern.

### Documentation (`--docs`)
```
/websearch --docs prisma
/websearch --docs next.js app router
```
Two-step workflow:
1. Find the official docs site.
2. Crawl the relevant page + linked sub-pages.
Usage: understand a specific API, read the docs without leaving the terminal.

### Debug (`--debug`)
```
/websearch --debug "TypeError: Cannot read properties of undefined (reading 'map')"
/websearch --debug CORS error preflight blocked
```
Smart workflow:
1. Clean the error (strip paths, timestamps, user data).
2. Search the exact error first.
3. Broaden to semantic if not enough results.
4. Target Stack Overflow, GitHub Issues.
Format: solution first, explanation second.

### News (`--news`)
```
/websearch --news AI agents
/websearch --news --after 2026-05-01 Claude Code
```
Filters by Exa "news" category.
Default: last 7 days.
Format: timeline, most recent first.

### Compare (`--compare`)
```
/websearch --compare React vs Vue vs Svelte
/websearch --compare Prisma vs Drizzle
```
Runs one parallel query per option.
Produces a comparison table + verdict.

### Research (`--research`)
```
/websearch --research transformer architecture scaling laws
```
Filters by Exa "research paper" category.
Results from arxiv, ACM, IEEE, Nature.
Format: summary + key findings + methodology.

### Similar (`--similar`)
```
/websearch --similar https://blog.example.com/great-article
```
Finds pages semantically similar to a given URL.

## Filters

Combinable with all modes:

```
--after <date>        Results after this date
                      Formats: 2026-05-01, "last week", "3 days ago"

--before <date>       Results before this date

--domain <d>          Restrict to domains (comma-separated)
                      Ex: --domain github.com,stackoverflow.com

--exclude <d>         Exclude domains
                      Ex: --exclude reddit.com,medium.com

--fresh               Force live crawl (real-time content)
                      Exa recrawls pages instead of using the cache

--locale <CC>         Localized results (ISO country code)
                      Ex: --locale FR, --locale US

-n <num>              Number of results (default: 5, max: 20)
```

## Output

```
--save <file>         Save the report as markdown
                      Ex: --save ./report-react.md

--json                Structured JSON output (for piping)

--full                Full text instead of highlights
                      More tokens but more context
```

## Daily usage examples

```bash
# Quick question
/websearch what is the default port of PostgreSQL

# Find a snippet
/websearch --code React useOptimistic example

# Debug an error
/websearch --debug "ECONNREFUSED 127.0.0.1:5432"

# Read a lib's docs
/websearch --docs zod validation

# Tech monitoring
/websearch --news --after "last week" Anthropic Claude

# Technical choice
/websearch --compare Bun vs Deno vs Node.js 2026

# Deep research for an article
/websearch --deep --save report.md AI impact on software development

# Recent papers
/websearch --research --after 2026-01-01 LLM code generation evaluation

# Find similar content
/websearch --similar https://exa.ai/blog/search-for-ai
```

## How it works

The skill uses 4 Exa MCP tools:

| Tool | Usage |
|-------|-------|
| `web_search_exa` | General semantic search |
| `get_code_context_exa` | Code, API, technical docs |
| `web_search_advanced_exa` | Category filters (news, research, company) |
| `crawling_exa` | Full read of a URL + sub-pages |

The workflow adapts automatically:
- The Exa tool used per mode.
- The targeted domains per detected ecosystem.
- The query phrasing (semantic, not keywords).
- The output format per search type.

`--deep` mode: iterates up to 3 passes with gap analysis between each pass.
All results are cited inline with `[source](url)`.
