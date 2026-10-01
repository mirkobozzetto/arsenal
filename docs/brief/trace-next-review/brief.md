---
type: brief
slug: trace-next-review
title: Sauvegarde, reprise et revue de code dans Arsenal
status: superseded
proposal: docs/proposals/0001-trace-next-review/PROPOSAL.md
created: 2026-10-01
next_action: /trace sauvegarde avant /clear, /next reprend, /review analyse le code et propose la skill qui règle chaque point
resume_cmd: /ship docs/brief/trace-next-review
base: main
branch: feat/trace-next-review
---

# Sauvegarde, reprise et revue de code dans Arsenal

## Problème

Mirko compacte ses longues conversations faute de mieux : un `/clear` lui
fait perdre le fil, et il doit réexpliquer ce qu'il faisait. Trace devait
garder ce fil, mais il ne note que « 13 fichiers modifiés », sans le
pourquoi, et il ne voit plus rien depuis que Ship committe à chaque étape :
le journal de ce repo s'arrête au 31 août.

Next sait dire ce qui reste dans les briefs et les proposals, mais il ne lit
ni les issues, ni une vraie sauvegarde de session.

Il n'existe pas non plus de revue de code profonde dans Arsenal : rien qui
demande ce qu'on veut analyser, lance des agents sur le code, dise ce qui
n'est pas logique et propose la skill qui le règle.

Enfin, les skills ne se proposent pas entre elles : une issue créée ne
propose pas de brief, un brief flou ne propose pas de propose.

## Utilisateurs

- Mirko, seul développeur, sur Claude Code, Codex, OMP, Pi et Prime.

## Objectifs

- Pouvoir `/clear` à tout moment sans perdre le fil, au lieu de compacter.
- Reprendre une session sans rien réexpliquer.
- Avoir une revue de code qui interroge, analyse en profondeur et oriente
  vers la bonne skill.
- Que chaque skill propose la suivante, sans jamais la lancer seule.

## Acceptance criteria

### Sauvegarde avec `/trace`

- AC1 En pleine conversation, `/trace` affiche en 5 lignes au plus ce qui a
  été fait, ce qui n'est pas fini et ce qui est prévu (briefs, proposals,
  issues), y compris le travail fait hors brief, propose ou issue.
- AC2 Ce résumé inclut le travail commité pendant la session, par Ship ou à
  la main, pas seulement les fichiers non commités.
- AC3 `/trace` se lance en fin de session. Il ne pose une question que si le
  contexte ne suffit pas, une à la fois, en texte : « On continue quoi à la
  prochaine session ? », avec une suggestion tirée du contexte, ou
  « Quelque chose à retenir que je n'ai pas vu ? » (une décision, une piste
  qui a échoué).
- AC4 Chaque `/trace` ajoute une sauvegarde datée à un historique, marquée
  ouverte. Elle est écrite et `/trace` finit par
  « Tu peux /clear. ». La sauvegarde reste privée : elle n'entre jamais dans
  un commit.
- AC5 `/trace` fonctionne sans le plugin Remember.

### Reprise avec `/next`

- AC6 Dans Claude Code, après un `/clear` ou au lancement, quand une
  sauvegarde ouverte attend, la première réponse demande tout seule « On
  continue quoi ? ». Sans sauvegarde ouverte, rien ne change. Dans les
  autres harness, `/next` fait la même chose.
- AC7 Next lit tout ce qui a été laissé : les tâches non finies des briefs,
  les proposals, les issues ouvertes d'Arsenal, les sauvegardes de trace et
  les points non traités des revues.
- AC8 Quand Mirko choisit, Arsenal lance la skill qui reprend ce travail, par
  exemple Ship sur la tâche suivante d'un brief, après son accord.
- AC9 S'il y a plusieurs sauvegardes ouvertes, Next les montre en liste
  numérotée, chacune avec ce qui a été fait et ce qui reste, suivies des
  briefs, proposals et issues en cours. Mirko choisit un numéro ; la
  sauvegarde choisie passe en « reprise » et n'est plus proposée.

### Revue avec `/review`

- AC10 `/review` pose ses questions une par une : quoi analyser (projet,
  dossier, fonctionnalité, branche, PR), quoi chercher (bugs, sécurité,
  code trop compliqué, performance, cohérence avec ce qui était prévu, ou
  tout), ce qui inquiète Mirko, le modèle et le niveau de réflexion des
  agents (par défaut ceux de la session, avec seulement les choix que le
  harness permet), puis l'accord pour lancer les agents.
- AC11 Avec cet accord, des agents analysent en parallèle, en lecture seule,
  seulement le périmètre et les angles choisis. Aucun fichier du projet
  n'est modifié pendant l'analyse.
- AC12 La session vérifie chaque problème trouvé avant le rapport : elle lit
  le code cité et ce qui l'appelle, le reproduit quand c'est possible, et
  retire les fausses alertes. GitNexus confirme les appels quand il est
  installé ; sinon `/review` le recommande une fois, sans l'imposer.
- AC13 Le rapport s'ouvre en HTML : problèmes classés du plus grave au moins
  grave, une partie « ce qui n'est pas logique », et pour chaque point la
  skill qui le règle (Ship, Issue, Brief ou Propose). Il est gardé dans
  `docs/review/`.
- AC14 La revue finit par « On traite lesquels ? ». Elle peut aussi proposer
  de relancer un angle plus en profondeur. Sur réponse, Arsenal lance la
  skill choisie.
- AC15 Sans agents disponibles, la revue se fait seule, angle par angle, et
  le dit en une ligne.

### Chaîne entre les skills

- AC16 Après chaque issue créée, Issue demande toujours « On en fait un
  brief ? ».
- AC17 Un brief qui garde une décision technique ouverte finit par « On
  lance une propose ? ».
- AC18 Arsenal connaît les entrées `/trace`, `/next` et `/review`, et
  enchaîne d'une skill à l'autre avec l'accord de Mirko à chaque maillon.
  Rien ne part tout seul.

### Partout

- AC19 Les trois commandes se comportent pareil dans Claude Code, Codex,
  OMP, Pi et Prime, chacune avec sa syntaxe de commande.

## Success metrics

Mirko fait `/trace` puis `/clear` au lieu de compacter. Après un `/clear`,
la première réponse reprend le bon travail sans qu'il réexplique. Une revue
débouche sur des issues, des briefs ou des corrections, pas sur un rapport
oublié.

## Out-of-scope

- La revue ne corrige rien elle-même : elle oriente vers Ship, Issue, Brief
  ou Propose.
- Aucun enchaînement automatique : chaque maillon attend un oui.
- Désinstaller ou modifier le plugin Remember.
- Partager les sauvegardes de trace avec d'autres personnes.

## Constraints and assumptions

- Une skill n'en lance jamais une autre : Arsenal porte les transitions
  (`plugins/arsenal/skills/arsenal/SKILL.md`). Seules, les skills suggèrent
  la commande suivante en une ligne, comme Ship.
- Toute délégation à des agents demande l'accord de Mirko : la dernière
  question de `/review` est cet accord.
- Questions en texte, une par message, jamais via un formulaire à options.
- Claude Code distingue `startup`, `clear` et `compact` au démarrage d'une
  session et peut injecter du texte avant le premier message
  (https://code.claude.com/docs/en/hooks).
- Hypothèse à vérifier : OMP, Pi, Codex et Prime n'ont pas de point
  d'accroche équivalent au démarrage ; la reprise y passe par `/next`.
- Les agents Arsenal existent déjà par harness (`plugins/arsenal/agents/`,
  `agents/codex/`, `agents/omp/`, agents intégrés de Pi). La revue suit le
  même modèle.
- Choix techniques laissés à Propose : forme et emplacement de la
  sauvegarde, nombre et rôle exact des agents, façon de vérifier les
  trouvailles, reprise dans chaque harness.

## Boundary

Owns:
- `plugins/trace/`
- `plugins/next/`
- `plugins/review/`
- `plugins/issue/skills/issue/`
- `plugins/brief/skills/brief/steps/step-04-finalize.md`
- `plugins/arsenal/`
- `.claude-plugin/marketplace.json`
- `package.json`
- `README.md`

Must not touch:
- `plugins/ship/`
- `plugins/propose/`
- `plugins/websearch/`
