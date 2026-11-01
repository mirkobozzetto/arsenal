const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawn } = require("node:child_process");
const test = require("node:test");

const WAKE = path.join(__dirname, "../skills/nap/scripts/wake.cjs");
const FAKE = path.join(__dirname, "fake-mux.cjs");
const TICK_MS = "5";
const HC_TERMINAL = "t4h";
const HERDR_PANE = "w1:p2";
const TMUX_PANE = "%3";
const RESUME = "On reprend : ship T02 ?";
const LIST = "1. session A\n2. session B\nOn continue quoi ?";
// The SessionStart banner above the typed next also says "On reprend".
const BANNER = 'INSTRUCTION: ask only "On reprend : older save ?"';
// A pause between two tool calls: idle once, then working again.
const TURN = ["working", "idle", "working", "idle", "idle"];
const QUERIES = /^(hc ls|hc read|herdr pane get|herdr pane read|tmux capture-pane)/;

const MUX = {
  "herdr-app": { HC_TERMINAL_ID: HC_TERMINAL },
  herdr: { HERDR_ENV: "1", HERDR_PANE_ID: HERDR_PANE },
  tmux: { TMUX: "/tmp/tmux-501/default,1,0", TMUX_PANE },
};

function sandbox(env, scenario = {}, tick = TICK_MS) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-nap-"));
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin);
  fs.chmodSync(FAKE, 0o755);
  for (const name of ["hc", "herdr", "tmux"]) fs.symlinkSync(FAKE, path.join(bin, name));
  const stateFile = path.join(dir, "state.json");
  const nextShown = env.HC_TERMINAL_ID ? "Lance le skill next:next." : "/next:next";
  const state = {
    target: HC_TERMINAL,
    queue: [...TURN],
    afterClear: [],
    afterNext: ["working", "working"],
    banner: BANNER,
    nextShown,
    reply: RESUME,
    screen: "",
    tick: 0,
    log: [],
    ...scenario,
  };
  fs.writeFileSync(stateFile, JSON.stringify(state));
  return {
    env: {
      PATH: `${bin}:${path.dirname(process.execPath)}:/usr/bin:/bin`,
      FAKE_STATE: stateFile,
      NAP_TICK_MS: tick,
      ...env,
    },
    log: () => JSON.parse(fs.readFileSync(stateFile, "utf8")).log,
  };
}

function wake(env, scenario, args = []) {
  const box = sandbox(env, scenario);
  const out = execFileSync(process.execPath, [WAKE, ...args], { env: box.env, encoding: "utf8" });
  const log = box.log();
  return { out, log, typed: log.filter((l) => !QUERIES.test(l)) };
}

const lastQuery = (log) => log.map((l, i) => (QUERIES.test(l) ? i : -1)).filter((i) => i >= 0);

test("detects the multiplexer the session runs in", () => {
  for (const [name, env] of Object.entries(MUX)) {
    assert.equal(wake(env, {}, ["--detect"]).out.trim(), name);
  }
  assert.equal(wake({}, {}, ["--detect"]).out.trim(), "none");
});

test("Herdr app: /clear key by key, next and oui as messages, in the session terminal", () => {
  const { typed, log } = wake(MUX["herdr-app"]);
  assert.deepEqual(typed, [
    `hc keys ${HC_TERMINAL} / c l e a r enter`,
    `hc send ${HC_TERMINAL} Lance le skill next:next.`,
    `hc send ${HC_TERMINAL} oui`,
  ]);
  assert.ok(!log.some((l) => l.includes("t-cmd")));
});

test("old herdr: /clear, /next:next and oui typed in the Claude pane", () => {
  const { typed } = wake(MUX.herdr);
  const type = (text) => [`herdr pane send-text ${HERDR_PANE} ${text}`, `herdr pane send-keys ${HERDR_PANE} Enter`];
  assert.deepEqual(typed, [...type("/clear"), ...type("/next:next"), ...type("oui")]);
});

test("tmux: /clear, /next:next and oui typed in the Claude pane", () => {
  const { typed } = wake(MUX.tmux);
  const type = (text) => [`tmux send-keys -t ${TMUX_PANE} -l ${text}`, `tmux send-keys -t ${TMUX_PANE} Enter`];
  assert.deepEqual(typed, [...type("/clear"), ...type("/next:next"), ...type("oui")]);
});

test("waits for the real end of the turn, not a pause between tool calls", () => {
  for (const env of Object.values(MUX)) {
    const { log } = wake(env);
    const clear = log.findIndex((l) => l.includes("/clear") || l.includes("c l e a r"));
    assert.ok(clear > lastQuery(log)[TURN.length - 1], log.join("\n"));
  }
});

test("a numbered list from next gets no answer", () => {
  for (const env of Object.values(MUX)) {
    const { typed, out } = wake(env, { reply: LIST });
    assert.ok(!typed.some((l) => l.includes("oui")), typed.join("\n"));
    assert.match(out, /no single resume/);
  }
});

test("without a multiplexer nothing is typed", () => {
  const { log, out } = wake({});
  assert.deepEqual(log, []);
  assert.match(out, /no multiplexer/);
});

test("survives the /clear it types, even when its launcher is killed", async () => {
  const box = sandbox(MUX["herdr-app"], { afterClear: Array(20).fill("working") }, "20");
  const launcher = spawn(process.execPath, [WAKE], { env: box.env, detached: true, stdio: "ignore" });
  const until = async (done, ms = 10000) => {
    for (const end = Date.now() + ms; Date.now() < end; ) {
      if (done(box.log())) return true;
      await new Promise((r) => setTimeout(r, 5));
    }
    return false;
  };
  assert.ok(await until((log) => log.some((l) => l.includes("c l e a r"))));
  assert.ok(!box.log().some((l) => l.includes("next:next")));
  process.kill(-launcher.pid, "SIGKILL");
  assert.ok(await until((log) => log.includes(`hc send ${HC_TERMINAL} oui`)), box.log().join("\n"));
});
