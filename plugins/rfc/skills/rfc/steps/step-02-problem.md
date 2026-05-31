## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER propose solutions or alternatives here
- 🛑 NEVER skip motivation: "why now" is load-bearing
- ✅ ALWAYS interview user via AskUserQuestion if not auto
- ✅ ALWAYS write problem statement that someone outside the project understands
- 📋 YOU ARE a problem definer, not a solver
- 💬 FOCUS on problem + motivation + goals/non-goals
- 🚫 FORBIDDEN to draft design or pick approach

## EXECUTION PROTOCOLS:

- 🎯 Ask 3-5 sharp questions, no more
- 💾 Write sections 3 + 4 of RFC.md
- 📖 Complete fully before loading step-03
- 🚫 FORBIDDEN to load step-03 until problem + non-goals are explicit

## CONTEXT BOUNDARIES:

- Variables: `{rfc_path}`, `{auto_mode}`, `context_collected` (from step-01)
- Output: sections 3 (Problem & Motivation) + 4 (Goals / Non-Goals) filled
- Reference: `references/interview-questions.md` (problem block)

## YOUR TASK:

Define the problem rigorously (what hurts, why now, who's affected) and lock the goals/non-goals boundary.

## EXECUTION SEQUENCE:

### 1. Load interview questions

Read `references/interview-questions.md` → problem section.

### 2. Interview user (unless auto_mode)

Use AskUserQuestion in batches of 1-4 max. Example sequence:

```yaml
questions:
  - header: "Symptôme"
    question: "Quel problème concret tu observes aujourd'hui ?"
    options:
      - label: "Bug / dysfonctionnement"
        description: "Comportement incorrect actuel"
      - label: "Friction / lenteur"
        description: "Process pénible, lent, coûteux"
      - label: "Limite / blocage"
        description: "Impossible de faire X aujourd'hui"
      - label: "Risque / dette"
        description: "Pas encore cassé mais danger"
    multiSelect: false
```

Suivi par questions ouvertes (free text via user response) :
- "Depuis quand ?"
- "Qui est impacté (utilisateurs, équipes, systèmes) ?"
- "Pourquoi maintenant ? (deadline, incident, opportunité)"
- "Quels signaux quantitatifs ? (metrics, errors, latency)"

If `auto_mode` → infer from title + context_collected. Mark assumptions explicitly.

### 3. Goals / Non-goals

AskUserQuestion or infer:
- 3-5 goals max, measurable if possible
- 3-5 non-goals, explicit "we are NOT solving X"

Non-goals = critical. Sans non-goals → scope creep dans steps suivants.

### 4. Write sections 3 + 4

```markdown
## 3. Problem & Motivation

### Current state
{What happens today, with refs to symbols/modules from section 2}

### Pain
{Who suffers, how often, what cost}

### Why now
{Trigger: deadline, incident, dependency, opportunity}

### Signals
- {quantitative metric or "no metric yet"}
- ...

## 4. Goals / Non-Goals

### Goals
- {goal 1: measurable}
- {goal 2}
- ...

### Non-Goals
- We are NOT {scope X}
- We are NOT {scope Y}
- ...
```

### 5. Update frontmatter

```yaml
stepsCompleted: [0, 1, 2]
updated: "{today}"
problem_summary: "{one-line problem}"
goals_count: N
nongoals_count: M
```

## SUCCESS METRICS:

✅ Section 3 has current state + pain + why now
✅ Section 4 has ≥3 goals AND ≥3 non-goals
✅ At least one non-goal explicitly rejects a "obvious" extension
✅ Assumptions flagged if `auto_mode` was used
✅ `stepsCompleted` includes 2

## FAILURE MODES:

❌ Vague problem ("better DX", "improve perf") without numbers or refs
❌ Missing non-goals: guarantees scope creep step-03+
❌ Drafting solutions ("we should use X") in motivation
❌ More than 5 questions to user: interview overload
❌ Inventing facts in auto_mode without flagging

## NEXT STEP:

If `{auto_mode}` → load `./step-03-alternatives.md`.
Else AskUserQuestion:

```yaml
questions:
  - header: "Étape suivante"
    question: "Problème défini. Explorer alternatives ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Step 03: Alternatives Considered"
      - label: "Affiner le problème"
        description: "Reboucler : la définition n'est pas assez nette"
      - label: "Retour contexte"
        description: "Step 01 : manque de contexte technique"
    multiSelect: false
```

<critical>
"Why before what" (Guy Bary). No solution leak here. If you catch yourself writing "we could…" → stop, that goes in step-03.
</critical>
