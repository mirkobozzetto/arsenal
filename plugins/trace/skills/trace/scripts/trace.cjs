#!/usr/bin/env node
// trace: a project-level progress ledger written automatically.
// One ledger (<project_root>/.claude/trace.md), three entry points:
//   --hook        Stop-hook writer. Logs the working-tree delta since the last
//                 fire, but only when real work happened. Silent otherwise.
//   --read [n]    Print the last n entries (the /trace reader).
//   done <what>   Manual entry with the intent the mechanical hook can't infer.
//   save ...      End-of-session save that next offers to resume.
//   resume <date> Mark a save as taken up.  saves [--all]: list them as JSON.
// Zero dependencies. Mechanical mode never calls the model.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Resolve the project root, not the launch directory: a command run from
// inside a git submodule must still land the ledger in the superproject,
// never inside the submodule (which then shows as a dirty submodule pointer).
function resolveRoot() {
  const tryGit = (args) => {
    try {
      return execSync(`git ${args}`, { cwd: process.cwd(), stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
    } catch {
      return "";
    }
  };
  return (
    tryGit("rev-parse --show-superproject-working-tree") ||
    tryGit("rev-parse --show-toplevel") ||
    process.cwd()
  );
}

const ROOT = resolveRoot();
const TRACE_DIR = path.join(ROOT, ".claude");
const TRACE_FILE = path.join(TRACE_DIR, "trace.md");
const STATE_FILE = path.join(TRACE_DIR, ".trace-state");
// A branch switch can put hundreds of commits between two fires.
const MAX_COMMITS = 10;

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

// docs/brief/<slug>/... -> brief:<slug>; docs/proposals/<NNNN-...>/... ->
// proposal:<NNNN>; legacy docs/prd and docs/rfcs keep their old tags;
// otherwise the top-level dir of the first path, else "chat".
function inferContext(files) {
  for (const f of files) {
    const brief = f.match(/(?:^|\/)docs\/brief\/([^/]+)\//);
    if (brief) return `brief:${brief[1]}`;
    const proposal = f.match(/(?:^|\/)docs\/proposals\/(\d+)[^/]*\//);
    if (proposal) return `proposal:${proposal[1]}`;
    const prd = f.match(/(?:^|\/)docs\/prd\/([^/]+)\//);
    if (prd) return `prd:${prd[1]}`;
    const rfc = f.match(/(?:^|\/)docs\/rfcs\/(\d+)[^/]*\//);
    if (rfc) return `rfc:${rfc[1]}`;
  }
  const first = files[0] || "";
  const top = first.split("/")[0];
  return top && top.includes(".") === false ? top : "chat";
}

function ensureLedger() {
  fs.mkdirSync(TRACE_DIR, { recursive: true });
  if (!fs.existsSync(TRACE_FILE)) {
    fs.writeFileSync(
      TRACE_FILE,
      "# Trace\n\nProject progress ledger. Written automatically by the Stop hook and by `/trace`.\nNewest entries at the bottom. `next` reads this to show what moved.\n\n",
    );
  }
}

function appendEntry({ context, what, files, status }) {
  ensureLedger();
  const fileStr = files && files.length ? files.join(", ") : "-";
  const line = `- [${context}] ${now()} | done: ${what} | files: ${fileStr} | status: ${status}\n`;
  fs.appendFileSync(TRACE_FILE, line);
}

// ---- modes ----

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return null;
  }
}

// Commits made since the last fire. A file edited then committed in the same
// turn never shows in porcelain, so without this, per-unit commits leave no trace.
function commitsSince(sha) {
  if (!sha) return [];
  const raw = git(`log --reverse --format=%x1e%h%x09%s --name-only ${sha}..HEAD`);
  if (!raw) return [];
  return raw
    .split("\x1e")
    .filter((c) => c.trim())
    .map((chunk) => {
      const [header, ...rest] = chunk.split("\n");
      const [hash, subject] = header.split("\t");
      const files = rest.map((l) => l.trim()).filter((l) => l && !l.startsWith(".claude/"));
      return { hash, subject, files };
    });
}

function shortList(files) {
  const shown = files.slice(0, 8);
  const extra = files.length - shown.length;
  return extra > 0 ? shown.concat(`+${extra} more`) : shown;
}

function runHook() {
  const cur = porcelain();
  if (cur === null) process.exit(0); // not a git repo: nothing to observe
  const state = loadState();
  const prev = state.files || {};
  const head = (git("rev-parse HEAD") || "").trim() || null;

  // delta = paths that are newly dirty or whose status changed since last fire.
  // ponytail: re-edits that leave the porcelain code identical are not re-logged;
  //           upgrade path is the model-written entry (see references/format.md).
  const changed = Object.keys(cur).filter((f) => cur[f] !== prev[f]);
  // First fire has no previous HEAD: record it, never dump the whole history.
  const commits = commitsSince(state.head);

  // always advance the snapshot so a later revert/commit is detected as a change.
  // merge, never overwrite: the digest cursor lives in the same state file.
  saveState({ ...state, files: cur, head });

  const recent = commits.slice(-MAX_COMMITS);
  if (commits.length > recent.length) {
    appendEntry({ context: "git", what: `${commits.length - recent.length} earlier commits`, files: [], status: "wip" });
  }
  for (const c of recent) {
    const context = c.files.length ? inferContext(c.files) : "chat";
    appendEntry({ context, what: `commit ${c.hash} ${c.subject}`, files: shortList(c.files), status: "wip" });
  }

  if (changed.length === 0) process.exit(0); // zero noise: nothing moved

  const what = `edited ${changed.length} file${changed.length > 1 ? "s" : ""}`;
  appendEntry({ context: inferContext(changed), what, files: shortList(changed), status: "wip" });
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

// ---- saves: what /trace leaves for the next session ----

const SAVE_FIELDS = ["done", "left", "next", "remember", "planned"];
const SAVE_HEADER = /^### save (\S+) \| branch (.*?) \| status: (\w+)\s*$/;

// Saves are private to this machine. .git/info/exclude is local and never
// shared, so the project's .gitignore stays untouched.
function keepPrivate() {
  if (git("check-ignore -q .claude/trace.md") !== null) return;
  const rel = (git("rev-parse --git-path info/exclude") || "").trim();
  if (!rel) return;
  const file = path.resolve(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, "\n.claude/trace.md\n.claude/.trace-state\n");
}

function parseSaves(text) {
  const saves = [];
  let cur = null;
  for (const line of text.split("\n")) {
    const h = line.match(SAVE_HEADER);
    if (h) {
      cur = { date: h[1], branch: h[2], status: h[3] };
      saves.push(cur);
      continue;
    }
    const f = cur && line.match(/^- (\w+): (.*)$/);
    if (f && SAVE_FIELDS.includes(f[1])) cur[f[1]] = f[2];
    else if (line.startsWith("#")) cur = null;
  }
  return saves;
}

function runSave(rest) {
  const fields = {};
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].replace(/^--/, "");
    if (SAVE_FIELDS.includes(key)) fields[key] = (rest[++i] || "").replace(/\s+/g, " ").trim();
  }
  if (!fields.done && !fields.next) {
    process.stderr.write('Usage: trace.cjs save --done "<what>" --next "<a ; b>" [--left ..] [--remember ..] [--planned ..]\n');
    process.exit(1);
  }
  ensureLedger();
  keepPrivate();
  const branch = (git("branch --show-current") || "").trim() || "-";
  const date = now();
  const lines = [`\n### save ${date} | branch ${branch} | status: open`];
  for (const k of SAVE_FIELDS) if (fields[k]) lines.push(`- ${k}: ${fields[k]}`);
  fs.appendFileSync(TRACE_FILE, lines.join("\n") + "\n\n");
  process.stdout.write(`Saved ${date}\n`);
  process.exit(0);
}

function runResume(date) {
  let text;
  try {
    text = fs.readFileSync(TRACE_FILE, "utf8");
  } catch {
    process.exit(1);
  }
  const target = `### save ${date} |`;
  const out = text
    .split("\n")
    .map((l) => (l.startsWith(target) ? l.replace(/status: open\s*$/, "status: resumed") : l));
  if (out.join("\n") === text) {
    process.stderr.write(`No open save ${date}\n`);
    process.exit(1);
  }
  fs.writeFileSync(TRACE_FILE, out.join("\n"));
  process.stdout.write(`Resumed ${date}\n`);
  process.exit(0);
}

function runSaves(all) {
  let text = "";
  try {
    text = fs.readFileSync(TRACE_FILE, "utf8");
  } catch {}
  const saves = parseSaves(text).filter((s) => all || s.status === "open").reverse();
  process.stdout.write(JSON.stringify(saves, null, 2) + "\n");
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
else if (argv[0] === "save") runSave(argv.slice(1));
else if (argv[0] === "resume") runResume(argv[1]);
else if (argv[0] === "saves") runSaves(argv.includes("--all"));
else {
  process.stderr.write("Usage: trace.cjs --hook | --digest | --read [n] | done <what> [...] | save [...] | resume <date> | saves [--all]\n");
  process.exit(1);
}
