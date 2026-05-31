---
name: websearch
description: "Power search via Exa MCP. Modes: quick, deep research, code, docs, debug, news, compare. Use when searching the web, finding docs, debugging errors, or researching any topic."
argument-hint: "[query] [--deep|--code|--docs <lib>|--debug|--news|--compare|--research] [--domain <d>] [--after <date>] [--fresh] [--save <file>] [-n <num>] [--info]"
---

<objective>
Execute web searches via Exa MCP with intent-based routing, multi-pass deep research, and structured output with inline citations.
</objective>

<parameters>
**Query**: free-text after the skill name

**Modes** (mutually exclusive):
- *(none)*: quick search, single pass, `web_search_exa`
- `--deep`: multi-pass deep research with gap-driven iteration (3-5 sub-queries, max 3 passes)
- `--code`: code examples, API docs, library usage via `get_code_context_exa`
- `--docs <lib>`: crawl official documentation for a specific library
- `--debug`: paste error message, find solutions (Stack Overflow, GitHub issues)
- `--news`: recent news, category:news filter
- `--compare`: compare 2+ options side by side via parallel queries
- `--research`: academic papers, category:research paper
- `--similar <url>`: find pages similar to a given URL

**Filters**:
- `--after <date>`: results published after date (ISO 8601 or natural: "last week")
- `--before <date>`: results published before date
- `--domain <d>`: restrict to domain(s), comma-separated
- `--exclude <d>`: exclude domain(s)
- `--fresh`: force live crawl (maxAgeHours=0)
- `--locale <CC>`: country code for localized results
- `-n <num>`: number of results (default: 5, max: 20)

**Output**:
- `--save <file>`: save report to markdown file
- `--json`: structured JSON output
- `--full`: full text instead of highlights (more tokens)

**Help**:
- `--info`: display detailed tutorial with all modes, flags, and examples
</parameters>

<state_variables>
- {mode}: string (detected search mode: quick|deep|code|docs|debug|news|compare|research|similar)
- {query}: string (cleaned search query)
- {filters}: object (parsed Exa filters: dates, domains, locale, numResults)
- {output_opts}: object (save path, json flag, full text flag)
- {lib_name}: string (library name if --docs mode)
- {similar_url}: string (URL if --similar mode)
- {results}: array (accumulated search results across passes)
- {pass_count}: number (current iteration for deep mode)
- {gaps}: array (identified knowledge gaps for deep iteration)
</state_variables>

<entry_point>
Load `steps/step-00-triage.md`
</entry_point>

<step_files>
| Step | File | Purpose |
|------|------|---------|
| 00 | steps/step-00-triage.md | Parse flags, classify intent, build Exa params |
| 01 | steps/step-01-search.md | Execute search strategy per mode |
| 02 | steps/step-02-deep.md | Deep iteration: evaluate, find gaps, re-query |
| 03 | steps/step-03-report.md | Synthesize, cite, format, optionally save |
</step_files>

<references>
| File | Content |
|------|---------|
| references/domain-presets.md | Curated domain lists per ecosystem/intent |
| references/query-patterns.md | Optimal Exa query formulation per search type |
| references/info-text.md | Full tutorial displayed by --info flag |
</references>

<critical>
ALL web access via Exa MCP only. NEVER use WebSearch, WebFetch, or Context7.
Tools: mcp__exa__web_search_exa, mcp__exa__get_code_context_exa, mcp__exa__crawling_exa, mcp__exa__web_search_advanced_exa.
</critical>
