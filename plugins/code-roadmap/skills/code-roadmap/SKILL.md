---
name: code-roadmap
description: Orientation map for the start of a coding task. Reads your intent, matches it against the skills currently available in this session, and prints a recommended chain of skills plus a suggested execution mode and reflection level, as options with a WHY, never a forced path. Advisory only: it never launches a skill and never forces a choice. Triggers on "where do I start", "which skill for X", "which skill", "how should I approach this", "route this", "roadmap", "what's the path for". NOT find-skills (that installs external skills), NOT setup-audit (that checks config health), NOT brainstorm (that does the research itself).
argument-hint: "<task description>"
allowed-tools: Bash
---

# code-roadmap

Orient at the start of a task: given an intent, print the most relevant chain of installed skills + a suggested execution mode + a suggested reflection level, as facts the user picks from. Then stop.

## HARD INVARIANTS

- NEVER invoke a skill. This skill has no Skill tool on purpose: it orients, it does not execute.
- NEVER force one executor. Present execution options with a WHY; the user picks.
- ONLY SUGGEST the reflection/effort level (including ultracode). The user sets it; this skill cannot toggle effort.
- For gaps, PROPOSE a creator or find-skills. Never build the skill here.
- NEVER embed a fixed skill inventory. Read the live list every run.

## 1. Inventory = the live in-context list

The skill inventory is the list the harness already injected into this session ("The following skills are available…", name + description each). Treat THAT as the single source of truth.

Match the user's intent against those descriptions by SEMANTIC reasoning about the shape of the work, never substring grep (the word "review" must not blindly fire every skill with "review" in it). The description field is the routing signal; reason over it like a filter-then-pick.

Because the inventory is read live, adding or removing a skill changes routing next session with zero edits here. There is no catalog to drift.

## 2. Optional freshness re-list (escape hatch, not the default)

Run this ONLY when: the user says skills changed this session, an injected description was truncated mid-sentence, or project-local skills may exist. Otherwise skip it.

```bash
for d in "$HOME"/.claude/skills/*/SKILL.md "$PWD"/.claude/skills/*/SKILL.md; do [ -f "$d" ] && awk -F': ' '/^name:/{n=$2} /^description:/{print n": "substr($0,14,90); exit}' "$d"; done 2>/dev/null
```

Reconcile any result to the INJECTED display names (a skill's on-disk `name:` can differ from the harness display name). Use the scan only to detect added/removed skills, never to rename what you show the user.

## 3. Decompose intent into facets

Parse the intent into 1-3 capability FACETS (predicates about the work, not skill names):

- research: understand something external / explore options
- planning: decide what/why or design the how before coding
- execution: write or change code
- quality: verify, review, harden, fix CI
- code-intel: understand THIS repo's structure / impact / trace
- creation: a needed capability does not exist yet
- memory: persist or resume work across sessions
- git: ship via commit / PR / merge

For each active facet, pick the best-fitting skill by reading the injected descriptions.

## 4. Order the chain

Assemble in the natural pipeline order: Context/research → Planning → Execution → Quality → Git. Memory is transversal (note it where a multi-session boundary appears).

Index gate: code-intel skills that need a built index are eligible only if an index exists for this repo (check the project's CLAUDE.md GitNexus block or an index artifact on disk). If absent, prepend a note "index first (gitnexus-cli analyze)" instead of naming an index-dependent skill.

## 5. Two independent axes: suggest, never force

Score the intent on 5 signals (0/1/2): S1 scope (files/lines), S2 independent surfaces (parallelisable units), S3 risk (blast radius), S4 ambiguity (valid designs / boundary-crossing), S5 repo unfamiliarity.

REFLECTION (suggest one, driven by S4 → S3 → S5):

| level | when |
|-------|------|
| trivial | S4=0 and S3≤1: just do it |
| standard | S4=1 or S5=1 |
| deep | S4=2, or S3=2 with S4≥1: design first (rfc if boundary-crossing, plan-mode if design settled + high risk, prd if the gap is a product spec) |
| ultracode | when parallelising the thinking is worth it: only the USER can toggle this (effort menu); the skill ASKS, it cannot set it |

EXECUTION (offer a MENU with WHY, driven by S2 → S1 → S3): examples of the option set, choose from the live skills:

| option | when |
|--------|------|
| direct edit | S1=0, S2=0, S3≤1 |
| spec-driven exec (e.g. ship from a prd tasks.md / Accepted rfc) | a locked upstream spec already exists: execute it, don't re-spec |
| structured impl (e.g. ship inline contract; +adversarial if S3≥1) | one feature-shaped change, no upstream spec |
| multi-surface (e.g. ship, teams tier) | 2-3 independent surfaces |
| test-first (e.g. tdd) | behaviour-critical / fragile |
| refactor-scoped (e.g. clean-code) | cleanup, not new behaviour |
| Agent Team | heterogeneous coordinating roles |

The axes are independent: a hairy single-file algorithm = deep + solo; a mechanical 40-file codemod = trivial + fan-out. Present execution as options. Never crown one as the default.

## 6. Harness modes are not skills

ultracode (= effort xhigh + auto dynamic-workflow) and Agent Teams sit ABOVE the skill layer. Claude Code CANNOT change the effort level itself, exactly like high→max: only the user toggles it via the effort menu. So when a fan-out is warranted, do NOT emit a stray "set it yourself" note: ASK the user explicitly, e.g. "this task justifies ultracode: enable it in the effort menu (only you can do it), or ask me to create a workflow". Never present these as a skill to run, and never imply the skill/CC can flip the effort setting.

## 7. Gap protocol: when nothing installed fits the core task

1. Generic capability → propose `find-skills` (installing beats authoring). Bespoke / personal-ecosystem need → skip to building.
2. By output shape → propose the right creator: atomic single-file → skill-creator; phased with state → skill-workflow-creator; parallel merging roles → team-skill-creator; event-driven → hooks-creator; persona/subagent → agent-creator. Tie-break: parallel > phased > single-file.
3. PROPOSE only. This skill never authors the new skill and never does the underlying work.

## 8. Output contract

Print, then STOP:

```
CANONICAL CHAIN
1. <skill>   : WHY (facet/signal)
2. <skill>   : WHY
...

REFLECTION (suggested) : <level> : WHY. (If fan-out is warranted: ASK the user to enable ultracode via the effort menu (CC cannot do it itself); or propose creating a workflow.)

EXECUTION (your call) :
  <option> → WHY
  <option> → WHY

ALTERNATIVES
- <other chain/mode> : tradeoff

GAP (if nothing fits) : <find-skills | creator> : WHY

Your call.
```

Never proceed to run any named skill. The user (or the main session) drives from here.

## Delimitation

- `code-roadmap` != `find-skills` : find-skills discovers/installs EXTERNAL skills (npx). This routes among installed skills and only hands off to find-skills on a generic gap.
- `code-roadmap` != `setup-audit` : setup-audit checks config HEALTH and mutates config. This is read-only task-time orientation.
- `code-roadmap` != `brainstorm` : brainstorm does the research. This decides whether brainstorm belongs in the chain; it produces a routing decision, not domain conclusions.

## Constraints

No comments in generated code. Prose in English, technical terms in English. Web via Exa MCP only. Honor the git write-guard. Never modify a database.
