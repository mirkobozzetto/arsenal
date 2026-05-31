---
name: step-03-engine
description: Probe capabilities, select the engine tier, confirm, suggest ultracode if complex
prev_step: steps/step-02-plan.md
next_step: steps/step-04-execute.md
---

# Step 3 (Engine): Tier Selection + Ultracode Awareness

## MANDATORY EXECUTION RULES:

- YOU ARE A SELECTOR, not an implementer
- NEVER set effort/ultracode yourself — only the user can, via /effort
- NEVER pick a fan-out tier when independent groups < 2
- ALWAYS bound fan-out by the DAG (same-file tasks serialize)
- ALWAYS announce the selected tier (and confirm unless auto_mode)

## CONTEXT BOUNDARIES:

- Available: `{independent_groups}`, `{economy_mode}`, `{engine_override}`, `{auto_mode}`, `{tasks}`
- Tools: Bash (read env), AskUserQuestion
- ultracode is an effort SETTING, not a tier ship can launch

## YOUR TASK:

Select `{engine_tier}` (teams / subagents / solo), confirm it, and suggest enabling ultracode when the spec looks complex.

---

## EXECUTION SEQUENCE:

### 1. Probe capabilities

```
teams_env = (echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS == 1)
groups = count({independent_groups})
```

### 2. Select the tier

```
IF {engine_override} set                 -> engine_tier = override
ELSE IF {economy_mode}                    -> engine_tier = solo
ELSE IF teams_env AND groups >= 2         -> engine_tier = teams
ELSE IF groups >= 2                       -> engine_tier = subagents
ELSE                                      -> engine_tier = solo
```

Fan-out is ALWAYS bounded by the DAG; even in teams/subagents, same-file serialization sets run sequentially.

### 3. Assess ultracode signal

```
complex = (groups >= 3) OR (sum of task effort is large) OR (critical_path is long)

Read the LIVE effort via Bash: `echo $CLAUDE_EFFORT` (exposed to hook commands + the Bash tool; values low/medium/high/xhigh/max).
NOTE: ultracode is NOT a distinct value — it reports as "xhigh" (CC hooks reference). So ship detects "high-effort mode", it cannot distinguish pure xhigh from ultracode.
Set {ultracode_signal}:
  - "on"      if $CLAUDE_EFFORT in (xhigh, max)      # strong reasoning / possible ultracode auto-workflows
  - "off"     if $CLAUDE_EFFORT in (low, medium, high)
  - "unknown" if unreadable / empty
ship STILL cannot SET the effort (read-only; hooks cannot set it either — CC issue #30806). Only the user toggles /effort.
IF complex AND {ultracode_signal} = "off":
  -> prepare a SUGGESTION line for the confirm gate ("ce spec gagnerait à /effort xhigh|ultracode"), never auto-enable.
IF {ultracode_signal} = "on":
  -> note that the harness may auto-launch dynamic workflows in parallel, orthogonal to the tier ship picks.
```

### 4. Engine-confirm gate

**If `{auto_mode}` = true:** proceed with the selected tier (still print the suggestion line if complex).

**If `{auto_mode}` = false:**
```yaml
questions:
  - header: "Moteur"
    question: "Tier sélectionné: {engine_tier} ({groups} groupes indépendants). [Si complexe: ce spec gagnerait à ultracode — active /effort ultracode|xhigh toi-même (ship ne peut pas).] Continuer ?"
    options:
      - label: "Continuer (Recommended)"
        description: "Exécuter sur le tier {engine_tier}"
      - label: "Forcer solo"
        description: "Un seul worker, séquentiel, plus sûr"
      - label: "Forcer teams"
        description: "Équipe d'agents (nécessite le flag teams + groupes disjoints)"
    multiSelect: false
```

Route the override to `{engine_tier}` (teams only honored if teams_env true; else explain and fall back).

### 5. Update state

```yaml
stepsCompleted: [0, 1, 2, 3]
engine_tier: "teams|subagents|solo"
ultracode_signal: "on|off|unknown"
```

---

## SUCCESS METRICS:

- Tier selected by env + group count + flags, override honored
- Fan-out only when groups >= 2; bounded by the DAG
- ultracode SUGGESTED when complex, never set by ship
- Tier announced; confirmed unless auto_mode

## FAILURE MODES:

- Setting ultracode itself -> Recovery: only suggest; the user toggles /effort
- teams selected without the env flag -> Recovery: fall back to subagents/solo, explain
- Fan-out with < 2 disjoint groups -> Recovery: force solo

## ENGINE PROTOCOLS:

- ultracode is awareness + suggestion only, never a tier ship runs
- teams requires CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 AND >=2 disjoint groups

---

## NEXT STEP:

Load `./step-04-execute.md`.

<critical>
ship picks an engine; it never flips the effort setting. Suggest ultracode, do not set it.
</critical>
