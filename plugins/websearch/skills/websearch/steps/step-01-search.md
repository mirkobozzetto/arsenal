## MANDATORY EXECUTION RULES (READ FIRST):

- NEVER use WebSearch, WebFetch, or Context7. Exa MCP ONLY.
- ALWAYS use the correct Exa tool per mode (see routing table).
- ALWAYS include filters from {filters} in every Exa call.
- FORBIDDEN to synthesize in this step. Just collect raw results.
- FOCUS on executing the search strategy for the detected {mode}.

## CONTEXT BOUNDARIES:

- Variables from step-00: {mode}, {query}, {filters}, {output_opts}, {lib_name}, {similar_url}
- This step populates {results} with raw Exa responses
- Consult `references/query-patterns.md` for query formulation
- Consult `references/domain-presets.md` for domain lists

## YOUR TASK:

Execute the appropriate Exa search strategy based on {mode} and collect results.

## EXECUTION SEQUENCE:

### 1. Tool routing per mode

| Mode | Primary tool | Exa params | Strategy |
|------|-------------|------------|----------|
| quick | `web_search_exa` | query + filters | Single call, {filters}.numResults results |
| deep | `web_search_exa` | decomposed queries | Decompose into 3-5 sub-queries, execute all |
| code | `get_code_context_exa` | query + filters | Code-focused, append ecosystem from query |
| docs | `crawling_exa` | official docs URL | Find docs URL first, then crawl with subpages |
| debug | `get_code_context_exa` then `web_search_exa` | error message | Clean error → search exact → search semantic |
| news | `web_search_advanced_exa` | category: news | Date filter: last 7 days default if no --after |
| compare | `web_search_exa` | parallel queries | Split into N queries (one per option), run parallel |
| research | `web_search_advanced_exa` | category: research paper | Academic focus, include date range |
| similar | `web_search_exa` | findSimilar pattern | Search for content similar to {similar_url} |

### 2. Mode-specific execution

**quick**:
```
mcp__exa__web_search_exa(query: "{query}", numResults: {filters}.numResults)
```
Apply includeDomains, excludeDomains, dates from {filters}.

**deep**:
1. Decompose {query} into 3-5 sub-queries targeting different angles:
   - Definitional: "what is {topic}"
   - Practical: "how to {topic} implementation examples"
   - Comparison: "{topic} vs alternatives tradeoffs"
   - Recent: "{topic} latest developments 2025 2026"
   - Expert: "{topic} best practices production lessons"
2. Execute ALL sub-queries in parallel via `web_search_exa`
3. Store all results in {results}
4. Proceed to step-02-deep for gap analysis

**code**:
```
mcp__exa__get_code_context_exa(query: "{query}", numResults: {filters}.numResults)
```
Formulate query as: "{query} code examples API usage". Load domain-presets for ecosystem.

**docs**:
1. Search for official docs: `web_search_exa(query: "{lib_name} official documentation", numResults: 3)`
2. Identify official docs URL from results
3. Crawl with: `crawling_exa(url: <docs_url>)` — extract structure
4. If user asked specific question, crawl targeted page with subpages

**debug**:
1. Clean error message: strip file paths, line numbers, timestamps, user-specific data
2. Search exact error: `get_code_context_exa(query: "<cleaned error>", numResults: 5)`
3. If < 3 useful results, broaden: `web_search_exa(query: "<semantic description of error>", numResults: 5)`
4. Load domain-presets for Stack Overflow, GitHub Issues

**news**:
```
mcp__exa__web_search_advanced_exa(query: "{query}", category: "news", numResults: {filters}.numResults)
```
Default startPublishedDate to 7 days ago if no --after specified.

**compare**:
1. Extract comparison targets from query (e.g., "React vs Vue" → ["React", "Vue"])
2. For each target, run parallel: `web_search_exa(query: "{target} features pros cons benchmarks")`
3. Merge results into {results} tagged by target

**research**:
```
mcp__exa__web_search_advanced_exa(query: "{query}", category: "research paper", numResults: {filters}.numResults)
```

**similar**:
```
mcp__exa__web_search_exa(query: "pages similar to {similar_url} {query}", numResults: {filters}.numResults)
```
Include the URL context in the semantic query.

### 3. Content extraction

For each result, prefer **highlights** (10x fewer tokens) unless {output_opts}.fullText = true.
If highlights insufficient for a key result, follow up with `crawling_exa` on that URL.

### 4. Store results

Append to {results}:
```
{
  title: string,
  url: string,
  content: string (highlights or full text),
  publishedDate: string,
  source_query: string (which sub-query found this)
}
```

## NEXT STEP:

- If {mode} = "deep" → Load `steps/step-02-deep.md`
- All other modes → Load `steps/step-03-report.md`

<critical>
Do NOT synthesize or format results. Raw collection only. Synthesis happens in step-03.
For deep mode, step-02 handles iteration before step-03.
</critical>
