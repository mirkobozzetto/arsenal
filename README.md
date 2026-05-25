# websearch-exa

Power web search skill for Claude Code, powered by [Exa MCP](https://docs.exa.ai/reference/mcp).

Single `/websearch` command with 8 intent-routed modes (quick, deep, code, docs, debug, news, compare, research).

## Install

```
/plugin marketplace add mirkobozzetto/websearch-exa
/plugin install websearch@websearch-exa
```

## Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [websearch](./plugins/websearch) | 1.0.0 | Intent-routed web search via Exa MCP (8 modes) |

## Prerequisites

Uses [Exa MCP](https://docs.exa.ai/reference/mcp) as the sole web access layer.

Setup before installing:

1. Get an Exa API key at [exa.ai](https://exa.ai).
2. Add the Exa MCP server to your Claude Code config.
3. Verify `mcp__exa__*` tools are available in a Claude Code session.

## Why a marketplace, not a bare skill

- Versioned releases via semver tags.
- `/plugin update` works out of the box.
- Same install pattern as official Anthropic plugins.

## License

MIT - see [LICENSE](./LICENSE).

## Contributing

Open an issue or PR at [github.com/mirkobozzetto/websearch-exa](https://github.com/mirkobozzetto/websearch-exa).
