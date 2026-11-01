#!/usr/bin/env node
// Wakes a napping Claude Code session: once its turn ends, types /clear in its
// own terminal, runs next, and answers "oui" to its single resume question.
// Launch it from a background Bash: a foreground one may run elsewhere.
//   wake.cjs            arm the wake-up (prints what was typed at the end)
//   wake.cjs --detect   print herdr-app, herdr, tmux or none
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawn } = require("node:child_process");

const TICK_MS = Number(process.env.NAP_TICK_MS) || 1000;
const POLL_TICKS = 2;
// One quiet poll can fall between two tool calls.
const QUIET_POLLS = 2;
const SETTLE_TICKS = 3;
const MAX_POLLS = 120;
const NEXT_MARK = "next:next";
// Claude Code opens each message and tool call with ⏺ (● on some systems)
// and indents what follows; a tool call reads `⏺ Name(args)`.
const BULLETS = ["⏺", "●"];
const TOOL_CALL = /^\S+ [\w:.-]+\(/;
const TOOL_OUTPUT = /^\s*⎿/;
const QUESTION = /[?？؟]/;
const LIST_ITEM = /^\s*(\d+[.)]|[-*•])\s/;
const HC_NEXT = "Lance le skill next:next.";
const YES = "oui";

const sleep = (ticks) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ticks * TICK_MS);
const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const ask = (cmd, args) => {
  try {
    return run(cmd, args);
  } catch {
    return null;
  }
};
// Never type when unsure: a status that cannot be read, or a terminal that
// runs something other than Claude (the "cmd" shell), counts as busy.
const working = (out, pick) => {
  try {
    const { agent, status } = pick(JSON.parse(out));
    return (agent && agent !== "claude") || status === "working";
  } catch {
    return true;
  }
};

function detect(env = process.env) {
  if (env.TMUX && env.TMUX_PANE) return ["tmux", env.TMUX_PANE];
  if (env.HERDR_ENV === "1" && env.HERDR_PANE_ID) return ["herdr", env.HERDR_PANE_ID];
  if (env.HC_TERMINAL_ID) return ["herdr-app", env.HC_TERMINAL_ID];
  return ["none"];
}

const MUX = {
  // No key types ":" and `hc send` wraps text in a tag where a slash command
  // never runs: /clear goes key by key, next as a message.
  "herdr-app": (t) => ({
    busy: () => working(ask("hc", ["ls", "--json"]), (d) => d.terminals.find((x) => x.address === t)),
    clear: () => run("hc", ["keys", t, "/", ..."clear", "enter"]),
    next: () => run("hc", ["send", t, HC_NEXT]),
    yes: () => run("hc", ["send", t, YES]),
    screen: () => ask("hc", ["read", t, "--lines", "40"]) || "",
  }),
  herdr: (p) => {
    const type = (text) => {
      run("herdr", ["pane", "send-text", p, text]);
      run("herdr", ["pane", "send-keys", p, "Enter"]);
    };
    return {
      busy: () =>
        working(ask("herdr", ["pane", "get", p]), ({ result: { pane } }) => ({
          agent: pane.agent,
          status: pane.agent_status,
        })),
      clear: () => type("/clear"),
      next: () => type("/next:next"),
      yes: () => type(YES),
      screen: () => ask("herdr", ["pane", "read", p, "--source", "recent"]) || "",
    };
  },
  // tmux knows nothing of the agent: the pane is busy while Claude's spinner
  // keeps redrawing it, idle once two captures in a row are identical.
  tmux: (p) => {
    const type = (text) => {
      run("tmux", ["send-keys", "-t", p, "-l", text]);
      run("tmux", ["send-keys", "-t", p, "Enter"]);
    };
    let last = null;
    return {
      busy: () => {
        const now = ask("tmux", ["capture-pane", "-p", "-t", p, "-S", "-40"]);
        const changed = now === null || now !== last;
        last = now;
        return changed;
      },
      clear: () => type("/clear"),
      next: () => type("/next:next"),
      yes: () => type(YES),
      screen: () => last || "",
    };
  },
};

function waitQuiet(m) {
  for (let i = 0, quiet = 0; i < MAX_POLLS; i++) {
    sleep(POLL_TICKS);
    quiet = m.busy() ? 0 : quiet + 1;
    if (quiet >= QUIET_POLLS) return true;
  }
  return false;
}

// Claude's last message after the typed next, as lines, or null while there
// is none. What precedes next (the SessionStart banner) never counts.
function lastReply(screen) {
  const at = screen.lastIndexOf(NEXT_MARK);
  if (at < 0) return null;
  let reply = null;
  let cur = null;
  for (const line of screen.slice(at).split("\n")) {
    if (BULLETS.includes(line[0])) {
      cur = TOOL_CALL.test(line) ? null : [line.slice(1).trim()];
      if (cur) reply = cur;
    } else if (cur && (line.trim() === "" || (/^\s/.test(line) && !TOOL_OUTPUT.test(line)))) cur.push(line);
    else cur = null;
  }
  return reply;
}

// The resume offer, in whatever language: one question, no list. next's
// numbered list, or any list, is left to the user.
const singleQuestion = (reply) => {
  const lines = reply.filter((l) => l.trim());
  return QUESTION.test(lines.at(-1)) && !lines.some((l) => LIST_ITEM.test(l));
};

function nap(name, target) {
  const m = MUX[name](target);
  if (!waitQuiet(m)) return console.log(`session in ${target} never went quiet, nothing typed`);
  m.clear();
  sleep(SETTLE_TICKS);
  if (!waitQuiet(m)) return console.log(`clear typed in ${target}, the session never went quiet after it`);
  m.next();
  for (let i = 0, quiet = 0; i < MAX_POLLS; i++) {
    sleep(POLL_TICKS);
    quiet = m.busy() ? 0 : quiet + 1;
    const reply = quiet >= QUIET_POLLS && lastReply(m.screen());
    if (!reply) continue;
    if (!singleQuestion(reply)) break;
    m.yes();
    return console.log(`clear, next and ${YES} typed in ${target}`);
  }
  console.log(`clear and next typed in ${target}, no single resume offered`);
}

// The waker runs in its own session, so a /clear that kills the background
// task's process group leaves it alive to type next.
// ponytail: setsid only; a killer walking the process tree would still reach
// it, double-fork then.
function arm() {
  const [name, target] = detect();
  if (name === "none") return console.log("no multiplexer detected: nothing typed");
  const log = path.join(os.tmpdir(), `arsenal-nap-${process.pid}.log`);
  const fd = fs.openSync(log, "w");
  const child = spawn(process.execPath, [__filename, "--run", name, target], {
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  child.on("exit", (code) => {
    process.stdout.write(fs.readFileSync(log, "utf8"));
    fs.rmSync(log, { force: true });
    process.exitCode = code ?? 1;
  });
}

const argv = process.argv.slice(2);
if (argv[0] === "--detect") console.log(detect()[0]);
else if (argv[0] === "--run") nap(argv[1], argv[2]);
else arm();
