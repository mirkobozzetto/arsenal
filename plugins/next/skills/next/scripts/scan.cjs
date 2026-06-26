#!/usr/bin/env node
// Open-work scanner: the single source of truth for "what's left and how to resume it".
// Reads prd/rfc artifacts' frontmatter (the ground truth) + tasks.md checkboxes, classifies
// open vs terminal, ranks, and emits the next command. Shared by the /next skill (full board)
// and the SessionStart hook (--banner). Zero dependencies.

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const roots = args.filter((a) => !a.startsWith("--"));
if (roots.length === 0) roots.push(process.cwd());

const SKIP = new Set(["node_modules", ".git", "target", "dist", ".next", "vendor"]);

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".") continue;
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// Minimal frontmatter reader: the leading --- fenced block, flat key: value pairs.
function frontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = text.slice(3, end);
  const map = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) map[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return map;
}

function countTasks(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const boxes = text.match(/^\s*-\s*\[( |x|X|~|-)\]/gm);
  if (!boxes) return null;
  let done = 0;
  let inprog = 0;
  for (const b of boxes) {
    if (/\[x\]/i.test(b)) done++;
    else if (/\[(~|-)\]/.test(b)) inprog++;
  }
  return { done, inprog, total: boxes.length };
}

// Project activity ledger (written by the `trace` plugin). Parsed best-effort:
// a malformed line is skipped, a missing file yields []. This is what lets the
// board show out-of-ship work - edits, other skills, plain conversation.
function readTrace(root) {
  let text;
  try {
    text = fs.readFileSync(path.join(root, ".claude", "trace.md"), "utf8");
  } catch {
    return [];
  }
  const out = [];
  for (const line of text.split("\n")) {
    const m = line.match(
      /^- \[([^\]]+)\]\s+(\S+)\s+\|\s+done:\s+(.*?)\s+\|\s+files:\s+(.*?)\s+\|\s+status:\s+(\w+)\s*$/,
    );
    if (m) out.push({ context: m[1], date: m[2], what: m[3], files: m[4], status: m[5], repo: path.basename(root) });
  }
  return out;
}

// status -> bucket. open = actionable now; wip = still authoring; done = hidden by default.
function bucket(kind, status) {
  const s = (status || "").toLowerCase();
  if (kind === "prd") {
    if (s === "in_progress") return "open";
    if (s === "ready") return "open";
    if (s === "shipped" || s === "superseded") return "done";
    return "wip"; // draft or unknown = still being authored
  }
  // rfc
  if (s === "accepted") return "open";
  if (s === "shipped" || s === "rejected") return "done";
  return "wip"; // draft / review
}

const RANK = { in_progress: 0, ready: 1, accepted: 1 };
function rank(status) {
  const s = (status || "").toLowerCase();
  return RANK[s] !== undefined ? RANK[s] : 2;
}

function relTo(root, p) {
  const r = path.relative(root, p);
  return r.startsWith("..") ? p : r;
}

function collect(root) {
  const items = [];
  for (const file of walk(root, [])) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const fm = frontmatter(text);
    if (!fm) continue;
    const isPrd = fm.type === "prd";
    const isRfc = fm.type === "rfc" || path.basename(file) === "RFC.md";
    if (!isPrd && !isRfc) continue;
    const kind = isPrd ? "prd" : "rfc";
    const status = fm.status || (isRfc ? "Draft" : "draft");
    const b = bucket(kind, status);

    let progress = null;
    if (isPrd) {
      const tasks = path.join(path.dirname(file), "tasks.md");
      const c = countTasks(tasks);
      if (c) progress = `${c.done}/${c.total} tasks`;
    }

    // resume command: explicit frontmatter wins; else derive from the artifact path.
    let resume = fm.resume_cmd;
    if (!resume) {
      const target = isPrd ? relTo(root, path.dirname(file)) : relTo(root, file);
      resume = `/ship ${target}`;
    }

    items.push({
      kind,
      slug: isPrd ? path.basename(path.dirname(file)) : path.basename(file, ".md"),
      name: fm.feature || fm.title || fm.slug || path.basename(path.dirname(file)),
      status,
      bucket: b,
      rank: rank(status),
      progress,
      next: fm.next_action || "",
      resume,
      repo: path.basename(root),
      path: relTo(root, file),
    });
  }
  return items;
}

let all = [];
let trace = [];
for (const root of roots) {
  const r = path.resolve(root);
  all = all.concat(collect(r));
  trace = trace.concat(readTrace(r));
}
all.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

// When trace says a prd shipped but its frontmatter still reads open, the board
// is stale (work landed outside ship). Flag it instead of trusting the checkbox.
const shippedCtx = new Set(trace.filter((t) => /shipped/i.test(t.status)).map((t) => t.context));
for (const i of all) {
  if (i.kind === "prd" && i.bucket === "open" && shippedCtx.has(`prd:${i.slug}`)) i.traceShipped = true;
}

const open = all.filter((i) => i.bucket === "open");
const wip = all.filter((i) => i.bucket === "wip");
const done = all.filter((i) => i.bucket === "done");

if (flags.has("--json")) {
  process.stdout.write(
    JSON.stringify({ open, wip, done, top: open[0] || null, trace: trace.slice(-20) }, null, 2) + "\n",
  );
  process.exit(0);
}

// --banner: terse, raw text for the SessionStart hook. Silent only when there is
// neither open artifact work nor recent trace activity to resurface.
if (flags.has("--banner")) {
  if (open.length === 0 && trace.length === 0) process.exit(0);
  const lines = [];
  if (open.length) {
    lines.push("OPEN WORK (run /next for detail):");
    for (const i of open.slice(0, 3)) {
      lines.push(`  - ${i.name} [${i.status}]${i.progress ? " " + i.progress : ""} -> ${i.resume}`);
    }
    if (open.length > 3) lines.push(`  (+${open.length - 3} more)`);
  }
  if (trace.length) {
    lines.push("RECENT (from trace):");
    for (const t of trace.slice(-2).reverse()) lines.push(`  - [${t.context}] ${t.what}`);
  }
  process.stdout.write(lines.join("\n") + "\n");
  process.exit(0);
}

// default: the full board for /next.
function row(i) {
  const tag = i.kind.toUpperCase();
  const prog = i.progress ? `  ${i.progress}` : "";
  const stale = i.traceShipped ? "  (trace: shipped - board may be stale)" : "";
  const nxt = i.next ? `\n      ${i.next}` : "";
  return `  ${i.name} [${i.status}] (${tag}${i.repo ? ", " + i.repo : ""})${prog}${stale}\n      resume: ${i.resume}${nxt}`;
}

const out = [];
if (open.length === 0 && wip.length === 0) {
  out.push(
    trace.length
      ? "No open prd/rfc work. Recent activity below (from trace)."
      : "No open prd/rfc work found. Nothing to resume.",
  );
} else {
  if (open.length) {
    out.push("OPEN (ready to act):");
    out.push(open.map(row).join("\n"));
  }
  if (wip.length && flags.has("--all")) {
    out.push("\nIN AUTHORING:");
    out.push(wip.map(row).join("\n"));
  } else if (wip.length) {
    out.push(`\n(${wip.length} in authoring; --all to show)`);
  }
  if (open.length) out.push(`\nNext: ${open[0].resume}`);
}
if (done.length && flags.has("--all")) {
  out.push("\nDONE:");
  out.push(done.map((i) => `  ${i.name} [${i.status}]`).join("\n"));
}
if (trace.length) {
  const n = flags.has("--all") ? 20 : 6;
  out.push("\nRECENT ACTIVITY (from .claude/trace.md):");
  out.push(
    trace
      .slice(-n)
      .reverse()
      .map((t) => `  ${t.date}  [${t.context}] ${t.what} (${t.status})`)
      .join("\n"),
  );
}
process.stdout.write(out.join("\n") + "\n");
