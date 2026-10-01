---
type: tasks
slug: trace-next-review
source_brief: docs/brief/trace-next-review/brief.md
---

# Tasks: Sauvegarde, reprise et revue de code dans Arsenal

## Relevant Files

- `plugins/trace/skills/trace/scripts/trace.cjs` - le hook qui ne voit pas les commits, et l'écriture de la sauvegarde
- `plugins/trace/skills/trace/SKILL.md` - le mode sauvegarde avec interrogatoire
- `plugins/trace/skills/trace/references/format.md` - le format du journal, à étendre
- `plugins/next/skills/next/scripts/scan.cjs` - lit briefs, proposals et trace ; doit lire issues, sauvegardes et revues
- `plugins/next/hooks/hooks.json` - le bandeau de démarrage dans Claude Code
- `plugins/next/skills/next/SKILL.md` - la question « On continue quoi ? »
- `plugins/issue/skills/issue/SKILL.md` - la proposition de brief après création
- `plugins/brief/skills/brief/steps/step-04-finalize.md` - la proposition de propose
- `plugins/arsenal/skills/arsenal/SKILL.md` - les routes et l'enchaînement
- `plugins/arsenal/agents/` - le modèle des agents par harness
- `plugins/arsenal/skills/arsenal/scripts/install_agents.py` - l'installation des agents Codex et OMP

## Tasks

Ordered. Each task closes the acceptance criteria it names.

## T01 - Trace voit les commits

Closes: AC2

- [ ] Le travail commité pendant la session apparaît dans le journal de trace
- [ ] Un commit de Ship dans le même tour qu'une modification est noté

## T02 - /trace sauvegarde avec un interrogatoire

Closes: AC1, AC3, AC4, AC5

- [ ] `/trace` affiche fait, pas fini et prévu en 5 lignes au plus
- [ ] Les deux questions arrivent une par une, avec une suggestion pour la première
- [ ] La sauvegarde est écrite, privée, puis « Tu peux /clear. »
- [ ] Tout marche sans le plugin Remember

## T03 - Next lit tout ce qui a été laissé

Closes: AC7, AC9

- [ ] Next liste les issues ouvertes d'Arsenal
- [ ] Next montre la dernière sauvegarde de trace non reprise
- [ ] Next montre les points non traités des revues
- [ ] Une sauvegarde reprise passe derrière le reste

## T04 - Reprise au démarrage

Closes: AC6, AC8

- [ ] Dans Claude Code, après `/clear`, le bandeau montre sauvegarde et travail ouvert
- [ ] La première réponse demande « On continue quoi ? »
- [ ] `/next` fait la même chose dans les autres harness
- [ ] Le choix de Mirko fait lancer la bonne skill par Arsenal, après accord

## T05 - /review : interrogatoire et agents

Closes: AC10, AC11, AC15, AC19

- [ ] Les quatre questions arrivent une par une
- [ ] Les agents tournent en parallèle, en lecture seule, sur le périmètre choisi
- [ ] Les agents existent pour Claude Code, Codex, OMP et Pi
- [ ] Sans agents, la revue se fait seule et le dit

## T06 - /review : vérification et rapport

Closes: AC12, AC13, AC14

- [ ] Chaque trouvaille est vérifiée avant le rapport
- [ ] Le rapport HTML classe par gravité, avec « ce qui n'est pas logique »
- [ ] Chaque point nomme la skill qui le règle
- [ ] Le rapport est gardé dans `docs/review/` et finit par « On traite lesquels ? »

## T07 - La chaîne entre les skills

Closes: AC16, AC17

- [ ] Après chaque issue créée : « On en fait un brief ? »
- [ ] Un brief avec une décision technique ouverte : « On lance une propose ? »

## T08 - Arsenal relie le tout

Closes: AC18, AC19

- [ ] Arsenal route vers `/trace`, `/next` et `/review`
- [ ] Arsenal enchaîne avec un accord à chaque maillon
- [ ] Versions, catalogue et README à jour
