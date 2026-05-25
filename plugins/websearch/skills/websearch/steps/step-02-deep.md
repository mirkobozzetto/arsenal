## MANDATORY EXECUTION RULES (READ FIRST):

- NEVER use WebSearch, WebFetch, or Context7. Exa MCP ONLY.
- ALWAYS evaluate results BEFORE generating follow-up queries.
- ALWAYS stop at max 3 iteration passes. Hard limit.
- FORBIDDEN to synthesize here. Only collect and iterate.
- FOCUS on identifying gaps and filling them with targeted queries.

## CONTEXT BOUNDARIES:

- Variables from step-01: {results}, {query}, {filters}, {pass_count}
- This step adds to {results} and updates {gaps}
- Only runs when {mode} = "deep"
- Max 3 passes (initial search in step-01 counts as pass 1)

## YOUR TASK:

Iteratively evaluate search results, identify knowledge gaps, and fill them with targeted follow-up queries until research is sufficient or budget exhausted.

## EXECUTION SEQUENCE:

### 1. Evaluate current results

For each result in {results}, assess:
- **Relevance**: directly answers part of the query?
- **Freshness**: recent enough for the topic?
- **Depth**: surface-level or detailed?
- **Agreement**: do sources agree or conflict?

### 2. Identify gaps

Ask:
- What aspects of {query} are NOT covered by any result?
- Are there contradictions that need resolution?
- Is there a perspective missing (technical/business/academic/practical)?
- Are sources too similar (need diversity)?

Store gaps in {gaps} array.

### 3. Termination check

**STOP iterating if ANY of these are true**:
- {pass_count} >= 3 (hard budget limit)
- {gaps} is empty (all aspects covered)
- New results repeat already-seen URLs (saturation)
- Last pass added < 2 new relevant results (diminishing returns)

If stopping → go to NEXT STEP.

### 4. Generate follow-up queries

For each gap in {gaps}, create a targeted query:
- Be specific: "React Server Components performance benchmarks production" not "React performance"
- Use different angles than initial queries
- Target specific source types if needed (add domain filters)

### 5. Execute follow-up searches

Run follow-up queries in parallel via `mcp__exa__web_search_exa`.
Use `get_code_context_exa` if gap is code-specific.
Use `web_search_advanced_exa` with category filter if gap is news/research-specific.

### 6. Merge new results

Append to {results}, deduplicate by URL.
Increment {pass_count}.
Return to step 1 of this sequence.

## NEXT STEP:

When iteration complete → Load `steps/step-03-report.md`

<critical>
Max 3 passes total (including initial search). No exceptions.
Gap-driven queries outperform variations of the same query.
If results are saturating, STOP. Don't waste Exa calls.
</critical>
