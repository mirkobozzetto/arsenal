#!/usr/bin/env node
// Weighs the instruction files Claude Code loads at launch from the current
// directory, as listed in https://code.claude.com/docs/en/memory.
//   weigh.cjs [--json] [--save <file>] [--compare <file>] [--window <tokens>]
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

// ponytail: chars x ratio, measured at 0.4014 on French rules (03/11);
// /context gives the exact count inside a session.
const TOKENS_PER_CHAR = 0.4;
const WINDOW_TOKENS = 1_000_000;
const MEMORY_MAX_LINES = 200;
const MEMORY_MAX_BYTES = 25 * 1024;
const IMPORT_MAX_DEPTH = 4;
const PROJECT_FILES = ["CLAUDE.md", ".claude/CLAUDE.md", "CLAUDE.local.md"];

const HOME = os.homedir();
const CONFIG = process.env.CLAUDE_CONFIG_DIR || path.join(HOME, ".claude");

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---[ \t]*(\n|$)/);
  return m ? { yaml: m[1], body: text.slice(m[0].length) } : { yaml: "", body: text };
}

const pathScoped = (text) => /^paths\s*:/m.test(frontmatter(text).yaml);

// Block-level HTML comments outside code fences never reach Claude.
function stripComments(text) {
  const out = [];
  let fence = false;
  let comment = false;
  for (const line of text.split(/(?<=\n)/)) {
    if (!comment && /^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && !comment && /^\s*<!--/.test(line)) comment = true;
    if (comment) {
      if (line.includes("-->")) comment = false;
      continue;
    }
    out.push(line);
  }
  return out.join("");
}

function memoryHead(text) {
  let head = text.split(/(?<=\n)/).slice(0, MEMORY_MAX_LINES).join("");
  const bytes = Buffer.from(head);
  if (bytes.length > MEMORY_MAX_BYTES) head = new TextDecoder().decode(bytes.subarray(0, MEMORY_MAX_BYTES));
  return head;
}

function loaded(file, kind) {
  const text = fs.readFileSync(file, "utf8");
  if (kind === "memory") return memoryHead(text);
  if (/^CLAUDE(\.local)?\.md$/.test(path.basename(file))) return stripComments(text);
  return frontmatter(text).body;
}

function imports(file, real, text) {
  const found = [];
  let fence = false;
  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    for (const m of line.replace(/`[^`]*`/g, "").matchAll(/(?:^|\s)@([^\s`]+)/g)) {
      const ref = m[1].replace(/[.,;:)!?]+$/, "");
      const candidates = ref.startsWith("~/")
        ? [path.join(HOME, ref.slice(2))]
        : path.isAbsolute(ref)
          ? [ref]
          : [path.resolve(path.dirname(file), ref), path.resolve(path.dirname(real), ref)];
      const hit = candidates.find(isFile);
      if (hit) found.push(hit);
    }
  }
  return found;
}

function rulesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => path.join(dir, f))
    .filter((f) => isFile(f) && !pathScoped(fs.readFileSync(f, "utf8")));
}

function gitRoot(cwd) {
  try {
    const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return path.basename(common) === ".git" ? path.dirname(common) : null;
  } catch {
    return null;
  }
}

function discover(cwd) {
  const files = [];
  const seen = new Set();
  const add = (file, kind, depth = 0) => {
    if (!isFile(file)) return;
    const real = fs.realpathSync(file);
    if (seen.has(real)) return;
    seen.add(real);
    // Claude Code trims each file: the counts match /context and the transcript.
    const text = loaded(file, kind).trim();
    files.push({ path: file, real, kind, chars: text.length, tokens: Math.round(text.length * TOKENS_PER_CHAR) });
    if (kind === "memory" || depth >= IMPORT_MAX_DEPTH) return;
    for (const next of imports(file, real, text)) add(next, kind, depth + 1);
  };

  add(path.join(CONFIG, "CLAUDE.md"), "user");
  for (const rule of rulesIn(path.join(CONFIG, "rules"))) add(rule, "user");

  const dirs = [];
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    dirs.unshift(dir);
    if (dir === path.dirname(dir)) break;
  }
  for (const dir of dirs) {
    for (const name of PROJECT_FILES) add(path.join(dir, name), "project");
    for (const rule of rulesIn(path.join(dir, ".claude", "rules"))) add(rule, "project");
  }

  const root = gitRoot(cwd) || path.resolve(cwd);
  const slug = process.env.CLAUDE_CODE_PROJECT_DIR_NAME || root.replace(/[^A-Za-z0-9]/g, "-");
  add(path.join(CONFIG, "projects", slug, "memory", "MEMORY.md"), "memory");

  const chars = files.reduce((sum, f) => sum + f.chars, 0);
  return { files, total: { chars, tokens: Math.round(chars * TOKENS_PER_CHAR) } };
}

const short = (p) => (p.startsWith(HOME + path.sep) ? "~" + p.slice(HOME.length) : p);
const pct = (part, whole) => `${whole ? ((100 * part) / whole).toFixed(1) : "0.0"}%`;
const signed = (n) => (n > 0 ? `+${n}` : String(n));

function table(rows) {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  return rows.map((r) => r.map((c, i) => (i ? String(c).padStart(widths[i]) : String(c).padEnd(widths[i]))).join("  ")).join("\n");
}

function show(report, window) {
  const rows = [["file", "kind", "chars", "~tokens", "share"]];
  for (const f of report.files) rows.push([short(f.real), f.kind, f.chars, f.tokens, pct(f.tokens, report.total.tokens)]);
  rows.push(["total", "", report.total.chars, report.total.tokens, pct(report.total.tokens, window) + " of window"]);
  return table(rows);
}

function compare(before, after, window) {
  const rows = [["file", "before", "after", "diff"]];
  const old = new Map(before.files.map((f) => [f.real, f.tokens]));
  const now = new Map(after.files.map((f) => [f.real, f.tokens]));
  for (const real of new Set([...old.keys(), ...now.keys()])) {
    const a = old.get(real) || 0;
    const b = now.get(real) || 0;
    rows.push([short(real), a, b, signed(b - a)]);
  }
  const a = before.total.tokens;
  const b = after.total.tokens;
  rows.push(["total", a, b, `${signed(b - a)} (${pct(a, window)} -> ${pct(b, window)} of window)`]);
  return `~tokens, before and after\n${table(rows)}`;
}

function main(argv) {
  const opt = (name) => {
    const i = argv.indexOf(name);
    return i < 0 ? null : argv[i + 1];
  };
  const window = Number(opt("--window")) || WINDOW_TOKENS;
  const report = discover(process.cwd());
  if (opt("--save")) fs.writeFileSync(opt("--save"), JSON.stringify(report, null, 2));
  if (argv.includes("--json")) return console.log(JSON.stringify(report, null, 2));
  if (opt("--compare")) return console.log(compare(JSON.parse(fs.readFileSync(opt("--compare"), "utf8")), report, window));
  console.log(show(report, window));
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { discover };
