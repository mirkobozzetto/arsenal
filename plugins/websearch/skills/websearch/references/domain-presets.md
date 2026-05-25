# Domain Presets

Curated domain lists for Exa `includeDomains` filter, organized by intent.

## Code & Development

### General code
```
github.com, stackoverflow.com, dev.to, medium.com
```

### JavaScript/TypeScript
```
github.com, stackoverflow.com, developer.mozilla.org, nodejs.org, typescriptlang.org, npmjs.com
```

### Python
```
github.com, stackoverflow.com, docs.python.org, pypi.org, realpython.com
```

### Rust
```
github.com, stackoverflow.com, doc.rust-lang.org, crates.io, docs.rs
```

### Go
```
github.com, stackoverflow.com, go.dev, pkg.go.dev
```

### React ecosystem
```
github.com, stackoverflow.com, react.dev, nextjs.org, vercel.com
```

### DevOps / Infrastructure
```
github.com, stackoverflow.com, docs.docker.com, kubernetes.io, terraform.io, aws.amazon.com
```

## Documentation

### Official docs (general pattern)
Use Exa search to find: `"{library} official documentation site"`
Then crawl with `crawling_exa` + subpages.

### Common doc sites
```
docs.python.org, developer.mozilla.org, react.dev, nextjs.org, 
docs.docker.com, kubernetes.io, docs.aws.amazon.com, cloud.google.com/docs,
learn.microsoft.com, docs.github.com, vercel.com/docs
```

## Debug / Troubleshooting

```
stackoverflow.com, github.com/issues, github.com/discussions,
serverfault.com, superuser.com, askubuntu.com
```

## News / Tech

```
techcrunch.com, theverge.com, arstechnica.com, hackernews.com,
wired.com, reuters.com, bloomberg.com
```

## Research / Academic

Use `category: "research paper"` in `web_search_advanced_exa` instead of domain filter.
Fallback domains:
```
arxiv.org, scholar.google.com, semanticscholar.org, 
acm.org, ieee.org, nature.com, science.org
```

## Business / Companies

Use `category: "company"` in `web_search_advanced_exa`.
Fallback:
```
linkedin.com, crunchbase.com, pitchbook.com, 
glassdoor.com, builtin.com
```

## People

Use `category: "people"` in `web_search_advanced_exa`.
Fallback:
```
linkedin.com, twitter.com, github.com
```

## Usage

When {mode} matches an ecosystem detected in the query:
1. Look up matching preset above
2. Pass as `includeDomains` in Exa call
3. Only if no `--domain` flag was explicitly set by user (user flags override presets)
