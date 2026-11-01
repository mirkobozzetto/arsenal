# nap

`/nap` lets a Claude Code session take a nap and wake up fresh: it saves
where it stands, empties its context, and picks the same work back up, with
no question and no gesture from anyone.

It chains three steps you would otherwise type yourself: `trace` saves the
session, `/clear` empties it, `next` offers « On reprend : <suite> ? » and
gets « oui ».

---

## Use

```text
/nap
/nap finish T02, then open the PR
```

Without text, trace writes the next step itself. With text, that text is the
save's `next` line, word for word. `/nap:nap` works too.

Once the turn ends, a small waker types in the session's own terminal:

| Multiplexer | Detected by | Typed |
|---|---|---|
| Herdr app | `HC_TERMINAL_ID` | `/clear` key by key, then the messages « Lance le skill next:next. » and « oui » (`hc send` never runs a slash command) |
| herdr | `HERDR_ENV=1` | `/clear`, `/next:next`, « oui » in the Claude pane |
| tmux | `TMUX` | `/clear`, `/next:next`, « oui » in the Claude pane |
| none | | nothing: the answer ends with « Tu peux /clear. » and `/next:next` |

It waits for the real end of the turn (two quiet polls in a row: one can fall
between two tool calls). Herdr reports whether Claude is working; under tmux
the pane counts as busy while Claude's spinner keeps redrawing it. It never
types into a terminal that does not run Claude, such as a command shell.
When next shows a numbered list instead of a single « On reprend », nothing
more is typed: you choose.

The waker runs from a background Bash, the only one that sees the session's
own terminal, in its own process session so the `/clear` it types does not
end it.

---

## Install

```bash
/plugin install trace@arsenal
/plugin install next@arsenal
/plugin install nap@arsenal
```

Needs `node`, plus `hc`, `herdr` or `tmux` for the automatic wake-up.
Claude Code only. The automatic « oui » answers next's French « On reprend »;
in another language next still runs and waits for your answer.

## Tests

```bash
node --test plugins/nap/tests/*.test.cjs
```

Fake `hc`, `herdr` and `tmux` stand in for the real ones; no real terminal
is touched.
