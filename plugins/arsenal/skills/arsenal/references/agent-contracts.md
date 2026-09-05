# Agent Contracts

Agents receive a frozen context packet under 3,000 tokens:

- objective, users, current workaround, and success signal;
- minimal version, out of scope, constraints, domain, and quirks;
- one precise unit question;
- the required output schema;
- prohibitions against user questions, roadmap writes, and repository writes.

## Product scout

Semantic role: `fast`.

Return only a JSON array containing zero to five supported objects:

```json
[{"name":"","url":"","borrow":"","avoid":"","confidence":"high|medium|low","risk":""}]
```

Research only the assigned product pattern. Do not synthesize the roadmap.

## Harness analyst

Semantic role: `balanced`.

Return only this JSON object:

```json
{"capability_matrix":{},"risks":[{"risk":"","impact":"","mitigation":""}],"recommendations":[""]}
```

Inspect only the assigned harness constraints. Do not decide product scope.

## Adversarial reviewer

Semantic role: `balanced`.

Return only a JSON array:

```json
[{"severity":"BLOCKER|MAJOR|MINOR|NIT","section":"","issue":"","suggestion":""}]
```

Review the complete draft read-only. Find missing requirements, contradictions,
unsafe assumptions, and non-runnable phases. No praise and no roadmap edits.
