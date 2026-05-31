# Interview Questions Bank

Used by steps that need user input. AskUserQuestion preferred; free-text for follow-ups.

## Step 02 — Problem & Motivation

### Symptom (single-select)
**Q:** Quel problème concret tu observes aujourd'hui ?
- Bug / dysfonctionnement (comportement incorrect)
- Friction / lenteur (process pénible, lent, coûteux)
- Limite / blocage (impossible de faire X)
- Risque / dette (pas cassé mais danger)

### Trigger (single-select)
**Q:** Pourquoi maintenant ?
- Incident récent (post-mortem, fire)
- Deadline (release, conformité, deadline business)
- Dépendance (lib EOL, vendor change, upstream migration)
- Opportunité (nouvelle techno mature, refacto opportuniste)

### Stakeholders (multi-select)
**Q:** Qui est impacté ?
- Utilisateurs finaux
- Équipe dev interne
- Ops / SRE
- Sécurité / compliance
- Business / produit

### Signals (free-text)
- Métriques quantitatives observées ?
- Logs / errors ?
- Volume / fréquence ?

### Goals (free-text, structured)
- 3-5 objectifs mesurables. Format: "X passe de A à B" ou "Permettre X sans Y".

### Non-Goals (free-text, structured)
- 3-5 explicit. Format: "Nous ne résolvons PAS X dans ce RFC".

---

## Step 03 — Alternatives

### Alt generation (free-text)
- Status quo cost ? (mandatory)
- Approche minimale ? (smallest patch)
- Approche standard ? (industry pattern)
- Approche bold ? (novel / bigger refactor)

### Per-alternative drill (single-select per alt)
**Reversibility:**
- Easy (one PR revert)
- Hard (data migration, multi-system)
- One-way door (can't undo without major effort)

**Cost dominant:**
- Engineering effort
- Ongoing ops cost
- $ (license, infra)
- Cognitive load / learning curve

---

## Step 04 — Design

### Base alternative pick (single-select)
**Q:** Quelle alternative sert de base ?
- Liste générée depuis step-03
- Option "Hybride" → préciser ce qui vient de chaque

### Diagram type (multi-select)
**Q:** Quels diagrammes nécessaires ?
- Architecture (flowchart)
- Sequence (API/flows)
- ER (schema)
- State (lifecycle)
- C4 (system boundary)

### Breaking changes (single-select)
- Aucun
- API public breaking
- Schema breaking (migration)
- Behavior breaking (silent semantics change)

---

## Step 05 — Risks

### Rollout strategy (single-select)
- Feature flag (per-user, percentage)
- Canary (1 pod → 10% → 100%)
- Blue/green
- Big bang
- Dark launch (shadow traffic)

### Rollback feasibility (single-select)
- PR revert suffit
- Migration reversible (down script)
- Backup + restore requis
- Irreversible — flag prominent

### Open questions ownership (free-text)
Par question :
- Owner (nom / rôle)
- Deadline (date ou "before T0X")

---

## Step 06 — Recommendation

### Confidence (single-select)
- High (≥80% sûr design tient sur 12 mois)
- Medium (50-80%, dépend de variables identifiées)
- Low (<50%, hypothèse à valider via prototype)

### Revisit triggers (free-text)
- Conditions concrètes qui invalideraient le choix
- Ex: "load > 10x", "vendor change", "team size double"

---

## Step 07 — Impl Plan

### Task split heuristic
Si effort > 1 jour → split. Critère :
- Compilable / testable indépendamment
- Reviewer peut suivre la diff sans trop de contexte
- Acceptance criteria distincts

### Verification depth (single-select per task)
- Unit only
- Unit + integration
- Unit + integration + perf
- Manuel (rare, justifier)

---

## Step 08 — Review

### Subagent flavors (multi-select)
- Gap hunter (requirements manquants, edge cases)
- Impl realism (tasks underestimated, ops surprises)
- Security review (OWASP, authz, secrets)
- Perf review (latency, throughput, memory)

### Action on BLOCKER (single-select)
- Revoir RFC (reboucler aux steps concernées)
- Accepter blockers (documenter, continuer)
- Abandonner RFC (status: Rejected)

---

## Step 09 — Finalize

### Status (single-select)
- Draft (prêt à circuler)
- Review (en cours)
- Accepted (validé, permission d'impl)
- Rejected (décision = ne pas faire)

### Handoff (single-select)
- Stop ici (artefact only)
- Lancer /ship sur impl plan
- Lancer /sdd (spec-driven)
- Push vers /brain (Obsidian)
