## MANDATORY EXECUTION RULES (READ FIRST):

- NEVER use WebSearch, WebFetch, or Context7. Exa MCP ONLY.
- ALWAYS parse ALL flags before any search call.
- YOU ARE A QUERY ROUTER, not a search executor. Parse and route only.
- FOCUS on flag parsing and intent classification only.
- FORBIDDEN to execute any Exa call in this step.

## CONTEXT BOUNDARIES:

- Input: raw user arguments from skill invocation
- Output: populated state variables for step-01
- No prior context needed: this is the entry step

## YOUR TASK:

Parse the user's input into mode, query, filters, and output options, then route to the correct search step.

## EXECUTION SEQUENCE:

### 0. Check for --info flag

If arguments contain `--info` or `-i`:
1. Load and display `references/info-text.md` verbatim
2. STOP. Do not proceed to any other step.

### 1. Extract flags from arguments

Parse the raw arguments string. Extract:

**Mode flags** (first match wins):
- `--deep` → {mode} = "deep"
- `--code` → {mode} = "code"
- `--docs <lib>` → {mode} = "docs", {lib_name} = next arg
- `--debug` → {mode} = "debug"
- `--news` → {mode} = "news"
- `--compare` → {mode} = "compare"
- `--research` → {mode} = "research"
- `--similar <url>` → {mode} = "similar", {similar_url} = next arg
- *(none)* → {mode} = "quick"

**Filter flags**:
- `--after <date>` → {filters}.startPublishedDate (convert natural dates: "last week" → ISO 8601)
- `--before <date>` → {filters}.endPublishedDate
- `--domain <d>` → {filters}.includeDomains (split on comma)
- `--exclude <d>` → {filters}.excludeDomains (split on comma)
- `--fresh` → {filters}.maxAgeHours = 0
- `--locale <CC>` → {filters}.userLocation
- `-n <num>` → {filters}.numResults (default 5, cap 20)

**Output flags**:
- `--save <file>` → {output_opts}.savePath
- `--json` → {output_opts}.json = true
- `--full` → {output_opts}.fullText = true

**Query**: everything remaining after flag extraction.

### 2. Auto-detect mode if not explicit

If {mode} = "quick", apply heuristics:
- Query contains stack trace or error pattern → switch to "debug"
- Query starts with "compare" or "vs" or contains " vs " → switch to "compare"
- Query asks "what's new" or "latest" → switch to "news"
- Query mentions specific library + "docs"/"API"/"reference" → switch to "docs"

### 3. Validate and set defaults

- {filters}.numResults default = 5 (quick), 8 (deep), 10 (code), 3 (docs)
- {pass_count} = 0
- {results} = []
- {gaps} = []

### 4. Display parsed config

Show user a one-line summary:
```
Mode: {mode} | Query: "{query}" | Filters: {active filters} | Output: {options}
```

## NEXT STEP:

- If {mode} = "deep" → Load `steps/step-01-search.md` (will chain to step-02-deep)
- All other modes → Load `steps/step-01-search.md`

<critical>
Do NOT search. Only parse and route. Search happens in step-01.
</critical>
