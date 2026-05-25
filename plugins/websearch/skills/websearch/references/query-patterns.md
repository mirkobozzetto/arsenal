# Query Formulation Patterns

Exa uses semantic search - describe the ideal page, not keywords.

## Core principle

NOT: `"React vs Vue"`
YES: `"blog post comparing React and Vue performance and developer experience"`

NOT: `"python async"`
YES: `"Python asyncio tutorial with practical examples for web scraping"`

## Patterns by mode

### quick
- Keep user's query mostly intact
- Add context if too short: "how to {query} with examples"
- Remove noise words but keep semantic meaning

### deep (decomposition)
From a single query, generate 3-5 sub-queries:

| Angle | Pattern |
|-------|---------|
| Definitional | "comprehensive guide to {topic} fundamentals" |
| Practical | "how to implement {topic} real world examples production" |
| Comparison | "{topic} compared to alternatives tradeoffs" |
| Recent | "{topic} latest developments news 2025 2026" |
| Expert | "{topic} best practices lessons learned from production" |

### code
- Prefix with language/framework when known
- "Python FastAPI middleware authentication example code"
- "{language} {library} {specific API} usage example"
- For errors: quote the exact error string

### docs
- "{library} official documentation {specific feature}"
- "{library} API reference {class or method name}"
- "{library} migration guide from {version} to {version}"

### debug
1. Clean the error first:
   - Remove file paths, line numbers, timestamps
   - Keep: error type, message, key identifiers
2. Search exact: `"{ErrorType}: {message}"`
3. If no results, generalize: "how to fix {ErrorType} in {framework}"

### news
- "{topic} news latest announcements"
- Add time context: "released", "announced", "launched"

### compare
- Split into per-target queries:
  - "{target A} features pros cons benchmarks {year}"
  - "{target B} features pros cons benchmarks {year}"
- Then: "{A} vs {B} comparison developer experience"

### research
- Use academic language: "study", "analysis", "framework", "evaluation"
- "{topic} research paper empirical study analysis"
- Include field: "machine learning {topic} benchmark evaluation"

## Anti-patterns

- No boolean operators (AND/OR) - Exa ignores them
- No site: operators - use includeDomains filter instead
- Don't use keywords like a search engine - write natural descriptions
- Don't be too short (< 3 words) - add context
- Don't be too long (> 30 words) - keep focused

## Query enhancement

If user query is very short (< 5 words), enhance:
1. Detect topic domain (code, business, news, academic)
2. Add context words per domain
3. Keep user's original intent

Example:
- User: "redis caching" → "Redis caching patterns best practices with code examples"
- User: "CORS error" → "how to fix CORS error in web application browser console"
- User: "transformer architecture" → "transformer architecture explained with diagrams neural network deep learning"
