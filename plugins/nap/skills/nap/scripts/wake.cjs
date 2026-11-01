#!/usr/bin/env node
// Wakes a napping Claude Code session: once its turn ends, types /clear in its
// own terminal, runs next, and answers "oui" to a single "On reprend". Launch
// it from a background Bash: a foreground one may run in another terminal.
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
const RESUME = "On reprend";
const NEXT_MARK = "next:next";
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

// Only what follows the typed next counts: the SessionStart banner above it
// also quotes "On reprend".
const offered = (screen) => {
  const at = screen.lastIndexOf(NEXT_MARK);
  return at >= 0 && screen.slice(at).includes(RESUME);
};

function nap(name, target) {
  const m = MUX[name](target);
  if (!waitQuiet(m)) return console.log(`session in ${target} never went quiet, nothing typed`);
  m.clear();
  sleep(SETTLE_TICKS);
  if (!waitQuiet(m)) return console.log(`clear typed in ${target}, the session never went quiet after it`);
  m.next();
  for (let i = 0, quiet = 0, worked = false; i < MAX_POLLS; i++) {
    sleep(POLL_TICKS);
    if (m.busy()) {
      worked = true;
      quiet = 0;
      continue;
    }
    quiet++;
    if (offered(m.screen())) {
      m.yes();
      return console.log(`clear, next and ${YES} typed in ${target}`);
    }
    // A numbered list, or anything but a single resume, waits for the user.
    if (worked && quiet >= QUIET_POLLS) break;
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
