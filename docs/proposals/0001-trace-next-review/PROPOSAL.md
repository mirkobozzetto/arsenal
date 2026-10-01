---
proposal_id: "0001"
slug: "trace-next-review"
title: "Sauvegarde trace, reprise next, revue de code review"
status: Accepted
format: standard
author: "Mirko Bozzetto"
created: "2026-10-01"
updated: "2026-10-01"
stepsCompleted: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
scope_path: "/Users/mirkobozzetto/code/skills/arsenal"
source_brief: "docs/brief/trace-next-review/"
auto_mode: false
skip_review: false
next_action: "Ship trace saves, next resume and the review plugin"
resume_cmd: "/ship docs/proposals/0001-trace-next-review/PROPOSAL.md"
base: main
branch: feat/trace-next-review
---

# 0001 : Sauvegarde trace, reprise next, revue de code review

## 1. Résumé

**Problème.** Un `/clear` fait perdre le fil, trace ne voit plus les commits,
Next ignore les issues, et Arsenal n'a pas de revue de code profonde.

**Recommandation.** `/trace` écrit une sauvegarde datée dans le journal qui
existe déjà. Next lit ces sauvegardes, avec les briefs, proposals, issues et
revues, puis propose une liste numérotée. Un nouveau plugin `review` mène
l'interrogatoire, lance un relecteur générique par angle, vérifie, puis
oriente chaque point vers Ship, Issue, Brief ou Propose.

**Impact.** Mirko peut `/clear` au lieu de compacter, reprendre sans
réexpliquer, et faire analyser son code dans les cinq harness.

## 3. Problème et motivation

Le hook de trace ne compare que les fichiers non commités d'un tour à
l'autre (`trace.cjs`, `runHook`). Un fichier modifié puis commité dans le
même tour n'apparaît jamais : depuis que Ship committe à chaque étape, son
travail ne laisse aucune trace. Le journal de ce repo s'arrête au
2026-08-31.

Next (`scan.cjs`) lit les briefs, les proposals et les lignes du journal,
mais ni les issues, ni une sauvegarde de session. Les skills ne se
proposent pas entre elles, sauf Ship. Il n'existe aucune revue de code dans
Arsenal.

## 4. Objectifs et non-objectifs

Objectifs : les AC1 à AC19 du brief.

Non-objectifs :

- la revue ne corrige rien ;
- aucun enchaînement automatique ;
- pas de fichiers d'agent temporaires ;
- ne pas toucher au plugin Remember, ni à `plugins/ship/` ou
  `plugins/propose/`.

## 5. Alternatives envisagées

| Option | Pourquoi non |
|---|---|
| Statu quo : compacter, plus le plugin Remember | Remember écrase sa note à chaque fois, ne voit pas le travail prévu et n'existe que dans Claude Code |
| Une skill « handoff » séparée | nouveau nom à retenir, alors que trace et next portent déjà ces rôles |
| Sauvegarde dans un fichier à part | deux journaux à lire ; le journal de trace sait déjà se faire lire par Next |
| Revue : router vers les revues existantes (`code-review`, `/security-review`, `ponytail-review`) | elles ne sont installées que dans Claude Code, chez Mirko seulement |
| Revue : un agent spécialisé par angle | quatre fichiers par harness, au lieu d'un seul |
| Fichiers d'agent temporaires pour choisir le modèle | inutiles là où le modèle se passe au lancement, et peu fiables dans Claude Code (anthropics/claude-code#75432) |

## 6. Conception retenue

### 6.1 Trace voit les commits

`.claude/.trace-state` garde aussi le dernier `HEAD` vu. À chaque fin de
tour, le hook lit `git log <dernier HEAD>..HEAD`. Une ligne est écrite par
commit nouveau : `done: commit <sha court> <sujet>`, avec ses fichiers.
L'ancienne détection des fichiers non commités reste.

### 6.2 `/trace` sauvegarde

Nouveau mode du script : `trace.cjs save --done … --left … --next …
--remember … --planned …`. Le modèle prépare les champs à
partir de la conversation, de `git log` depuis la dernière sauvegarde, de
`scan.cjs --json` et de `gh issue list --label arsenal`. Il ne pose une
question que si un champ reste vide (« On continue quoi ? » avec une
suggestion, ou « Quelque chose à retenir ? »). Bloc ajouté au journal :

```markdown
### save 2026-10-01T21:40Z | branch feat/trace-next-review | status: open
- done: brief et proposal 0001 écrits
- left: proposal à accepter
- next: accepter 0001 ; puis /ship T01
- remember: pas de fichiers d'agent temporaires (bug Claude Code)
- planned: brief:trace-next-review, proposal:0001
```

`trace.cjs resume <date>` passe le statut à `resumed`. La sauvegarde reste
privée : au premier `save`, le script ajoute `.claude/trace.md` et
`.claude/.trace-state` à `.git/info/exclude`, un fichier local que git ne
partage jamais. Le `.gitignore` du projet n'est pas touché. La copie vers
`.remember/` reste optionnelle et ne sert plus à rien d'essentiel.

### 6.3 Next reprend

`scan.cjs` gagne trois lecteurs :

- `readSaves` : les blocs `### save` ouverts, du plus récent au plus ancien ;
- `readReviews` : `docs/review/*/report.md` (`type: review`), dont les cases
  non cochées sont des points non traités ;
- `readIssues`, seulement pour `/next` : `gh issue list --label arsenal
  --state open`, avec un délai court. Le bandeau de démarrage n'appelle
  jamais le réseau.

Le bandeau (`--banner`) ne change pas sans sauvegarde ouverte. Avec au
moins une, il imprime la liste numérotée suivie d'une consigne pour le
modèle : « Montre cette liste à ta première réponse et demande : On
continue quoi ? ». `hooks.json` limite le hook à `startup|clear`. Dans
Codex, le même hook tourne déjà (`session_start` du plugin `next`).

Quand Mirko choisit un numéro, la session appelle `trace.cjs resume` puis
confie la suite à Arsenal. Next ne lance rien lui-même.

### 6.4 Plugin `review`

```text
plugins/review/
  skills/review/SKILL.md
  skills/review/references/angles.md      consigne par angle
  skills/review/references/report-template.md
  skills/review/scripts/render.py          copie de celui de propose
  agents/review-reader.md                  Claude Code, model: inherit
  agents/codex/review_reader.toml          sandbox read-only
  agents/omp/review-reader.md              tools: read, grep, glob
```

Déroulé :

1. Questions une par une : quoi analyser, quoi chercher, ce qui inquiète,
   quel modèle et quel niveau, puis l'accord pour lancer les agents.
2. Un relecteur est lancé par angle choisi, en parallèle, avec le
   périmètre, la consigne de l'angle et un format de réponse JSON
   (`severity`, `file`, `line`, `issue`, `evidence`, `fix_skill`).
3. La session vérifie chaque point : elle lit le code cité et ce qui
   l'appelle (GitNexus `context` et `impact` si l'index répond, sinon
   recherche simple), et le reproduit quand c'est possible. Chaque point
   devient confirmé, probable ou retiré. Un second agent contradicteur
   reste une option, sur demande.
4. Le rapport est écrit dans `docs/review/<date>-<slug>/report.md`, une
   case par point, puis rendu en HTML. Il finit par « On traite
   lesquels ? » et peut proposer de relancer un angle plus en profondeur.

Le modèle se choisit au lancement, selon le harness :

| Harness | Relecteur | Modèle | Niveau |
|---|---|---|---|
| Claude Code | `review:review-reader` | paramètre `model` de l'agent | celui de la session |
| Codex | `review_reader` | `model` de `spawn_agent` | `reasoning_effort` de `spawn_agent` |
| OMP | `review-reader` | `agentModelOverrides` | frontmatter |
| Pi | `reviewer` intégré | `provider/model` | suffixe `:low`, `:medium`, `:high` |
| Prime | délégation `rlm` | sélecteur de `rlm.find_models` | à vérifier |

Sans agent disponible, la session fait chaque angle elle-même, l'un après
l'autre, et le dit. GitNexus absent : une ligne de recommandation, une seule
fois.

### 6.5 La chaîne

- `issue` : après chaque `create`, une ligne « On en fait un brief ? ».
- `brief`, à la fin : si une décision technique reste ouverte, une ligne
  « On lance une propose ? ».
- `arsenal` : trois routes de plus (finir une session : trace ; reprendre :
  next ; analyser du code : review). Quand une skill finit par une
  suggestion, Arsenal la propose comme étape suivante et attend un oui.

## 7. Inconvénients et risques

- **Le modèle peut ignorer la consigne du bandeau.** D'autres outils l'ont
  vu (claude-handoff a dû forcer une annonce visible). La consigne est
  courte, impérative, en tête du bandeau.
- **`gh` lent ou absent.** Il ne sert qu'à `/next` et à `/trace save`, avec
  un délai court. En cas d'échec, les issues sont omises et c'est dit.
- **Coût des agents.** Un relecteur par angle consomme des tokens ; l'accord
  est demandé avant, avec le nombre d'agents annoncé.
- **`render.py` copié une fois de plus.** Chaque plugin s'installe seul, donc
  chacun porte sa copie, comme brief, propose et arsenal aujourd'hui.
- **Prime n'a pas d'adaptateur dans le repo.** La façon de lancer un agent
  et de régler son niveau y est à vérifier ; sans preuve, la revue s'y fait
  seule.
- **Le hook ne tourne pas dans OMP, Pi ni Prime.** La reprise y passe par
  `/next`. C'est une hypothèse à vérifier, sans risque si elle est fausse.

## 9. Recommandation et justification

Étendre trace et next plutôt que créer une skill « handoff » : ce sont les
deux noms que Mirko utilise déjà, et next sait déjà lire le journal. Un
seul relecteur paramétré par angle plutôt que quatre agents : un fichier
par harness. Le modèle passé au lancement plutôt que des fichiers
temporaires : supporté partout sauf le niveau dans Claude Code, et sans le
bug de rechargement. La vérification dans la session plutôt qu'un agent :
elle a déjà le contexte, et GitNexus la renforce quand il est là.

Ce qui ferait changer d'avis : un harness où le modèle ne se règle pas au
lancement (alors un fichier d'agent fixe par niveau), ou un bandeau ignoré
en pratique (alors une commande `/next` affichée en premier).

## 10. Plan d'implémentation

Boundary : possède `plugins/trace/`, `plugins/next/`, `plugins/review/`,
`plugins/issue/skills/issue/`, `plugins/brief/skills/brief/steps/step-04-finalize.md`,
`plugins/arsenal/`, `.claude-plugin/marketplace.json`, `package.json`,
`README.md` ; ne touche pas `plugins/ship/`, `plugins/propose/`,
`plugins/websearch/`.

| ID | Title | Files | Depends on | Effort |
|---|---|---|---|---|
| T01 | Trace logs commits since last HEAD | `plugins/trace/skills/trace/scripts/trace.cjs` | - | S |
| T02 | `trace save` and `trace resume`, private via `.git/info/exclude` | `trace.cjs`, `trace/SKILL.md`, `references/format.md` | T01 | M |
| T03 | Scanner reads saves, reviews and issues | `plugins/next/skills/next/scripts/scan.cjs` | T02 | M |
| T04 | Numbered resume banner on `startup|clear`, next skill hands choice to Arsenal | `scan.cjs`, `next/hooks/hooks.json`, `next/SKILL.md` | T03 | S |
| T05 | `review` plugin: interview, reader agents per harness, model choice | `plugins/review/**`, `install_agents.py`, `adapters/*.md` | - | L |
| T06 | `review` verification, report and HTML | `plugins/review/skills/review/**` | T05 | M |
| T07 | Chain lines in issue and brief | `issue/SKILL.md`, `brief/steps/step-04-finalize.md` | - | XS |
| T08 | Arsenal routes, transitions, versions and README | `arsenal/SKILL.md`, `marketplace.json`, `package.json`, `README.md` | T04, T06, T07 | S |

Vérification par tâche : T01 à T04, un commit factice dans un repo
jetable, `scan.cjs --banner`, et le test existant `scan.test.cjs` qui doit
rester vert ;
T05 et T06, une revue réelle de ce repo dans Claude Code et dans un second
harness ; T07 et T08, relecture des textes modifiés.
