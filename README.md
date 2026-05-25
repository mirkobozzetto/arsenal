# claude-skills-mb

Curated Claude Code skills by [Mirko Bozzetto](https://github.com/mirkobozzetto).

## Install

```
/plugin marketplace add mirkobozzetto/claude-skills-mb
/plugin install websearch@claude-skills-mb
```

## Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [websearch](./plugins/websearch) | 1.0.0 | Intent-routed web search via Exa MCP (8 modes: quick, deep, code, docs, debug, news, compare, research) |

## Prerequisites

All plugins in this marketplace use [Exa MCP](https://docs.exa.ai/reference/mcp) as the sole web access layer.

Setup before installing:

1. Get an Exa API key at [exa.ai](https://exa.ai).
2. Add the Exa MCP server to your Claude Code config.
3. Verify `mcp__exa__*` tools are available in a Claude Code session.

## Why a personal marketplace

- Versioned releases via semver tags.
- `/plugin update` works out of the box.
- Same install pattern as official Anthropic plugins.

## License

MIT - see [LICENSE](./LICENSE).

## Contributing

Open an issue or PR. One concern per PR. Keep skill files focused (single responsibility).
