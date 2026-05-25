## MANDATORY EXECUTION RULES (READ FIRST):

- NEVER fabricate information not found in {results}.
- ALWAYS cite sources inline with [title](url) for every factual claim.
- ALWAYS organize by theme/answer, not by source.
- FORBIDDEN to drop sources. Every result that contributed must be cited.
- FOCUS on synthesis, not repetition.

## CONTEXT BOUNDARIES:

- Variables from previous steps: {results}, {query}, {mode}, {output_opts}, {filters}
- This is the final step. Output goes to user (and optionally to file).
- No more Exa calls unless a critical gap is found during synthesis.

## YOUR TASK:

Synthesize search results into a clear, cited report formatted for the detected mode.

## EXECUTION SEQUENCE:

### 1. Format selection by mode

| Mode | Format |
|------|--------|
| quick | Direct answer (2-5 bullet points) + sources list |
| deep | Structured report: summary → sections → conflicts → sources |
| code | Code snippets first, explanation second, source links |
| docs | Extracted doc content, organized by section, link to full docs |
| debug | Solution first → explanation → related issues → sources |
| news | Timeline/bullet list, most recent first, date + source |
| compare | Side-by-side table + verdict + sources |
| research | Abstract summaries + key findings + methodology notes |
| similar | List of similar pages with relevance notes |

### 2. Synthesis rules

**Organize by theme, not by source**:
- Group results that answer the same sub-question
- Cross-reference: "According to [Source A](url) and [Source B](url), ..."
- Flag contradictions: "Source A claims X, while Source B reports Y"

**Citation format**:
- Inline: [Title or domain](URL) after each claim
- Every factual statement needs at least one citation
- If multiple sources agree, cite the best one + note agreement

**Confidence signals**:
- Strong consensus (3+ sources agree): state directly
- Mixed signals (sources disagree): flag explicitly
- Single source only: note "per [source]" to flag limited evidence

### 3. Mode-specific formatting

**quick**:
```markdown
**{query}**

- Point 1. [source](url)
- Point 2. [source](url)
- Point 3. [source](url)

Sources: [1](url) [2](url) [3](url)
```

**deep**:
```markdown
## {query} - Research Report

### Summary
2-3 sentence executive summary.

### Key Findings
#### {Theme 1}
Content with [citations](url).

#### {Theme 2}
Content with [citations](url).

### Conflicting Information
- {Conflict 1}: Source A says X, Source B says Y

### Sources
1. [Title](url) - one-line description
2. [Title](url) - one-line description
```

**code**:
```markdown
**{query}**

\`\`\`{language}
// Best example found
code here
\`\`\`
Source: [repo/docs](url)

**Explanation**: Brief context.

**See also**: [link1](url), [link2](url)
```

**compare**:
```markdown
## {Option A} vs {Option B}

| Aspect | {A} | {B} |
|--------|-----|-----|
| ... | ... | ... |

**Verdict**: ...

Sources: ...
```

**debug**:
```markdown
## Fix: {error summary}

**Solution**:
\`\`\`
fix code or config
\`\`\`

**Why**: Explanation of root cause. [source](url)

**Related**: [issue](url), [discussion](url)
```

### 4. Output handling

**Default**: Display formatted report in conversation.

**If {output_opts}.save**:
- Write report to {output_opts}.savePath as markdown
- Confirm: "Report saved to {path}"

**If {output_opts}.json**:
- Output structured JSON with: query, mode, results array, synthesis, sources array

### 5. Follow-up prompt

After report, suggest:
- "Dig deeper on any section? (e.g., `/websearch --deep {subtopic}`)"
- "Crawl a specific source? (e.g., `/websearch --docs {url}`)"

<critical>
Never present information not found in {results}.
Every claim needs a citation. No citation = no trust.
Organize by answer, not by source. Weave sources together.
</critical>
