#!/usr/bin/env node
// trace: a project-level progress ledger written automatically.
// One ledger (<project_root>/.claude/trace.md), three entry points:
//   --hook        Stop-hook writer. Logs the working-tree delta since the last
//                 fire, but only when real work happened. Silent otherwise.
//   --read [n]    Print the last n entries (the /trace reader).
//   done <what>   Manual entry with the intent the mechanical hook can't infer.
// Zero dependencies. Mechanical mode never calls the model.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const TRACE_DIR = path.join(ROOT, ".claude");
const TRACE_FILE = path.join(TRACE_DIR, "trace.md");
const STATE_FILE = path.join(TRACE_DIR, ".trace-state");

// Working-tree state as a path -> status-code map. Parsed by fixed porcelain
// columns (2 status chars, then the path); no global trim, which would eat the
// leading space of the first line and shift its path. Entries under .claude/
// are dropped so the ledger's own writes never re-trigger the hook (no self-loop).
function porcelain() {
  let raw;
  try {
    raw = execSync("git status --porcelain", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
  } catch {
    return null; // not a git repo
  }
  const map = {};
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const code = line.slice(0, 2).trim();
    const file = line.slice(2).replace(/^\s+/, "").replace(/^"|"$/g, "");
    if (file.startsWith(".claude/")) continue;
    map[file] = code;
  }
  return map;
}

function now() {
  return new Date().toISOString().replace(/\.\d+Z$/, "Z");
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { files: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(TRACE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

// docs/prd/<slug>/... -> prd:<slug>; docs/rfcs/<NNNN-...>/... -> rfc:<NNNN>;
// otherwise the top-level dir of the first path, else "chat".
function inferContext(files) {
  for (const f of files) {
    const prd = f.match(/(?:^|\/)docs\/prd\/([^/]+)\//);
    if (prd) return `prd:${prd[1]}`;
    const rfc = f.match(/(?:^|\/)docs\/rfcs\/(\d+)[^/]*\//);
    if (rfc) return `rfc:${rfc[1]}`;
  }
  const first = files[0] || "";
  const top = first.split("/")[0];
  return top && top.includes(".") === false ? top : "chat";
}

function appendEntry({ context, what, files, status }) {
  fs.mkdirSync(TRACE_DIR, { recursive: true });
  if (!fs.existsSync(TRACE_FILE)) {
    fs.writeFileSync(
      TRACE_FILE,
      "# Trace\n\nProject progress ledger. Written automatically by the Stop hook and by `/trace`.\nNewest entries at the bottom. `next` reads this to show what moved.\n\n",
    );
  }
  const fileStr = files && files.length ? files.join(", ") : "-";
  const line = `- [${context}] ${now()} | done: ${what} | files: ${fileStr} | status: ${status}\n`;
  fs.appendFileSync(TRACE_FILE, line);
}

// ---- modes ----

function runHook() {
  const cur = porcelain();
  if (cur === null) process.exit(0); // not a git repo: nothing to observe
  const state = loadState();
  const prev = state.files || {};

  // delta = paths that are newly dirty or whose status changed since last fire.
  // ponytail: re-edits that leave the porcelain code identical are not re-logged;
  //           upgrade path is the model-written entry (see references/format.md).
  const changed = Object.keys(cur).filter((f) => cur[f] !== prev[f]);

  // always advance the snapshot so a later revert/commit is detected as a change.
  // merge, never overwrite: the digest cursor lives in the same state file.
  saveState({ ...state, files: cur });

  if (changed.length === 0) process.exit(0); // zero noise: nothing moved

  const context = inferContext(changed);
  const shown = changed.slice(0, 8);
  const extra = changed.length - shown.length;
  const what = `edited ${changed.length} file${changed.length > 1 ? "s" : ""}`;
  const files = extra > 0 ? shown.concat(`+${extra} more`) : shown;
  appendEntry({ context, what, files, status: "wip" });
  process.exit(0);
}

function runRead(n) {
  let text;
  try {
    text = fs.readFileSync(TRACE_FILE, "utf8");
  } catch {
    process.stdout.write("No trace yet. Work a turn or run `/trace done <what>`.\n");
    process.exit(0);
  }
  const entries = text.split("\n").filter((l) => l.startsWith("- ["));
  const tail = entries.slice(-n);
  if (tail.length === 0) {
    process.stdout.write("Trace is empty.\n");
    process.exit(0);
  }
  process.stdout.write(`RECENT TRACE (last ${tail.length}):\n` + tail.join("\n") + "\n");
  process.exit(0);
}

function runDone(rest) {
  const opts = { files: [], id: null, status: "wip", context: null };
  const words = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--files") opts.files = (rest[++i] || "").split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--id") opts.id = rest[++i];
    else if (a === "--status") opts.status = rest[++i];
    else if (a === "--context") opts.context = rest[++i];
    else words.push(a);
  }
  let what = words.join(" ").trim();
  if (!what) {
    process.stderr.write('Usage: trace.cjs done "<what>" [--files a,b] [--id N.x] [--status shipped] [--context ...]\n');
    process.exit(1);
  }
  if (opts.id) what = `${opts.id} ${what}`;
  const context = opts.context || (opts.files.length ? inferContext(opts.files) : "chat");
  appendEntry({ context, what, files: opts.files, status: opts.status });
  process.stdout.write(`Logged: [${context}] ${what} (${opts.status})\n`);
  process.exit(0);
}

// Memory feed: append entries not yet digested to the .remember/ buffer so the
// session ledger survives a /clear. Consumer side, decoupled from the writer.
// Best-effort: SessionEnd can miss on /clear, and a manual /trace stays the
// reliable path. No-op when there is no .remember/ directory.
function runDigest() {
  const remDir = path.join(ROOT, ".remember");
  if (!fs.existsSync(remDir)) process.exit(0);
  let text;
  try {
    text = fs.readFileSync(TRACE_FILE, "utf8");
  } catch {
    process.exit(0);
  }
  const entries = text.split("\n").filter((l) => l.startsWith("- ["));
  const state = loadState();
  const fresh = entries.slice(state.digested || 0);
  if (fresh.length === 0) process.exit(0);
  fs.appendFileSync(path.join(remDir, "now.md"), `\n## trace digest ${now()}\n${fresh.join("\n")}\n`);
  saveState({ ...state, digested: entries.length });
  process.exit(0);
}

const argv = process.argv.slice(2);
if (argv[0] === "--hook") runHook();
else if (argv[0] === "--digest") runDigest();
else if (argv[0] === "--read") runRead(parseInt(argv[1], 10) || 10);
else if (argv[0] === "done") runDone(argv.slice(1));
else {
  process.stderr.write("Usage: trace.cjs --hook | --digest | --read [n] | done <what> [...]\n");
  process.exit(1);
}
