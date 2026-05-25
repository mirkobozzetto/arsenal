# /websearch - Guide complet

## Utilisation rapide

```
/websearch <query>                    Recherche rapide
/websearch --deep <query>             Recherche approfondie multi-passes
/websearch --code <query>             Exemples de code, API, libs
/websearch --docs <lib>               Documentation officielle d'une lib
/websearch --debug <erreur>           Colle une erreur, trouve le fix
/websearch --news <sujet>             Actualités récentes
/websearch --compare <A> vs <B>       Comparaison côte à côte
/websearch --research <sujet>         Articles académiques
/websearch --similar <url>            Pages similaires à une URL
/websearch --info                     Ce guide
```

## Modes en détail

### Recherche rapide (défaut)
```
/websearch comment fonctionne gRPC
```
Une seule passe, 5 résultats, réponse en bullet points avec sources.
Idéal pour les questions factuelles rapides.

### Deep research (`--deep`)
```
/websearch --deep state management React 2026
```
Décompose la query en 3-5 sous-queries par angle :
- Définitionnel, pratique, comparatif, récent, expert.
- Évalue les résultats, identifie les gaps.
- Itère jusqu'à 3 passes max.
- Produit un rapport structuré avec sections thématiques.
Usage : décisions techniques, veille approfondie, exploration de sujet.

### Code (`--code`)
```
/websearch --code FastAPI middleware authentication
/websearch --code Python asyncio gather timeout
```
Utilise `get_code_context_exa` optimisé pour :
- Extraire des snippets de code réels (GitHub, SO, docs officielles).
- Résultats orientés code d'abord, explication ensuite.
Usage : trouver un exemple d'API, un pattern d'implémentation.

### Documentation (`--docs`)
```
/websearch --docs prisma
/websearch --docs next.js app router
```
Workflow en 2 temps :
1. Trouve le site de docs officiel.
2. Crawl la page pertinente + sous-pages liées.
Usage : comprendre une API spécifique, lire la doc sans quitter le terminal.

### Debug (`--debug`)
```
/websearch --debug "TypeError: Cannot read properties of undefined (reading 'map')"
/websearch --debug CORS error preflight blocked
```
Workflow intelligent :
1. Nettoie l'erreur (retire paths, timestamps, données user).
2. Cherche l'erreur exacte d'abord.
3. Élargit en sémantique si pas assez de résultats.
4. Cible Stack Overflow, GitHub Issues.
Format : solution d'abord, explication ensuite.

### News (`--news`)
```
/websearch --news AI agents
/websearch --news --after 2026-05-01 Claude Code
```
Filtre par catégorie "news" Exa.
Par défaut : 7 derniers jours.
Format : timeline, plus récent en premier.

### Compare (`--compare`)
```
/websearch --compare React vs Vue vs Svelte
/websearch --compare Prisma vs Drizzle
```
Lance une query parallèle par option.
Produit un tableau comparatif + verdict.

### Research (`--research`)
```
/websearch --research transformer architecture scaling laws
```
Filtre catégorie "research paper" Exa.
Résultats d'arxiv, ACM, IEEE, Nature.
Format : résumé + findings clés + méthodologie.

### Similar (`--similar`)
```
/websearch --similar https://blog.example.com/great-article
```
Trouve des pages sémantiquement similaires à une URL donnée.

## Filtres

Combinables avec tous les modes :

```
--after <date>        Résultats après cette date
                      Formats : 2026-05-01, "last week", "3 days ago"

--before <date>       Résultats avant cette date

--domain <d>          Restreindre aux domaines (virgules)
                      Ex: --domain github.com,stackoverflow.com

--exclude <d>         Exclure des domaines
                      Ex: --exclude reddit.com,medium.com

--fresh               Force le live crawl (contenu temps réel)
                      Exa recrawl les pages au lieu du cache

--locale <CC>         Résultats localisés (code pays ISO)
                      Ex: --locale FR, --locale US

-n <num>              Nombre de résultats (défaut: 5, max: 20)
```

## Sortie

```
--save <fichier>      Sauvegarde le rapport en markdown
                      Ex: --save ./rapport-react.md

--json                Sortie JSON structurée (pour piping)

--full                Texte complet au lieu des highlights
                      Plus de tokens mais plus de contexte
```

## Exemples d'usage quotidien

```bash
# Question rapide
/websearch quel est le port par défaut de PostgreSQL

# Trouver un snippet
/websearch --code React useOptimistic example

# Débugger une erreur
/websearch --debug "ECONNREFUSED 127.0.0.1:5432"

# Lire les docs d'une lib
/websearch --docs zod validation

# Veille techno
/websearch --news --after "last week" Anthropic Claude

# Choix technique
/websearch --compare Bun vs Deno vs Node.js 2026

# Recherche approfondie pour un article
/websearch --deep --save rapport.md impact IA sur le développement logiciel

# Papers récents
/websearch --research --after 2026-01-01 LLM code generation evaluation

# Trouver du contenu similaire
/websearch --similar https://exa.ai/blog/search-for-ai
```

## Comment ça marche

La skill utilise 4 outils Exa MCP :

| Outil | Usage |
|-------|-------|
| `web_search_exa` | Recherche sémantique générale |
| `get_code_context_exa` | Code, API, docs techniques |
| `web_search_advanced_exa` | Filtres catégorie (news, research, company) |
| `crawling_exa` | Lecture complète d'une URL + sous-pages |

Le workflow adapte automatiquement :
- L'outil Exa utilisé selon le mode.
- Les domaines ciblés selon l'écosystème détecté.
- La formulation de query (sémantique, pas mots-clés).
- Le format de sortie selon le type de recherche.

Mode `--deep` : itère jusqu'à 3 passes avec analyse de gaps entre chaque passe.
Tous les résultats sont cités inline avec `[source](url)`.
