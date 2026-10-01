#!/usr/bin/env node
// Open-work scanner: the single source of truth for "what's left and how to resume it".
// Reads prd/rfc artifacts' frontmatter (the ground truth) + tasks.md checkboxes, classifies
// open vs terminal, ranks, and emits the next command. Shared by the /next skill (full board)
// and the SessionStart hook (--banner). Zero dependencies.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const roots = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--resume");
if (roots.length === 0) roots.push(process.cwd());

const SKIP = new Set(["node_modules", ".git", "target", "dist", ".next", "vendor"]);

// Claude Code scopes plugin skills: `/ship` is only callable as `/ship:ship`. Artifacts
// keep the neutral form; it is rewritten here, at display time.
const ARSENAL_SKILLS = new Set(["arsenal", "brief", "propose", "ship", "next", "issue", "trace", "review", "websearch"]);
const IN_CLAUDE_CODE =
  flags.has("--claude-code") || Boolean(process.env.CLAUDECODE || process.env.CLAUDE_PLUGIN_ROOT);

function harnessCommand(cmd) {
  if (!IN_CLAUDE_CODE) return cmd;
  return cmd.replace(/^\/([a-z-]+)(?=\s|$)/, (m, name) => (ARSENAL_SKILLS.has(name) ? `/${name}:${name}` : m));
}

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

// Counts checkboxes and derives the first unfinished one, with the heading
// it sits under. Derived on every scan, so it cannot go stale the way a
// hand-written frontmatter line does. tasks.md stays the single source.
function countTasks(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  let done = 0;
  let inprog = 0;
  let total = 0;
  let heading = "";
  let headingId = null;
  let next = null;
  let nextId = null;
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^(#{2,3})\s+(.*\S)\s*$/);
    if (h) {
      if (h[1] === "##") {
        heading = h[2];
        headingId = heading.match(/^(T\d+|\d+(?:\.\d+)*)\b/i)?.[1] || null;
      }
      continue;
    }
    const box = line.match(/^\s*-\s*\[( |x|X|~|-)\]\s*(.*)$/);
    if (!box) continue;
    total++;
    const mark = box[1];
    if (/x/i.test(mark)) {
      done++;
      continue;
    }
    if (/[~-]/.test(mark)) inprog++;
    if (!next) {
      next = heading || box[2].trim();
      nextId = headingId;
    }
  }
  if (!total) return null;
  return { done, inprog, total, next, nextId };
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

// End-of-session saves written by `/trace` (format: trace references/format.md).
const SAVE_HEADER = /^### save (\S+) \| branch (.*?) \| status: (\w+)\s*$/;
const SAVE_FIELDS = ["done", "left", "next", "remember", "planned"];

function readSaves(root) {
  let text;
  try {
    text = fs.readFileSync(path.join(root, ".claude", "trace.md"), "utf8");
  } catch {
    return [];
  }
  const saves = [];
  let cur = null;
  for (const line of text.split("\n")) {
    const h = line.match(SAVE_HEADER);
    if (h) {
      cur = { date: h[1], branch: h[2], status: h[3], repo: path.basename(root), root };
      saves.push(cur);
      continue;
    }
    const f = cur && line.match(/^- (\w+): (.*)$/);
    if (f && SAVE_FIELDS.includes(f[1])) cur[f[1]] = f[2];
    else if (line.startsWith("#")) cur = null;
  }
  return saves.filter((s) => s.status === "open").reverse();
}

// Marks a save as taken up once the user picked it, so it is not offered again.
function resumeSave(root, date) {
  const file = path.join(root, ".claude", "trace.md");
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return false;
  }
  const target = `### save ${date} |`;
  const out = text
    .split("\n")
    .map((l) => (l.startsWith(target) ? l.replace(/status: open\s*$/, "status: resumed") : l))
    .join("\n");
  if (out === text) return false;
  fs.writeFileSync(file, out);
  return true;
}

// Open GitHub issues left by the `issue` skill. Network, so never in --banner.
// ponytail: only the `arsenal` label; legacy `claude-memory` issues are not listed.
const ISSUE_TIMEOUT_MS = 4000;
function readIssues(root) {
  try {
    const origin = execSync("git remote get-url origin", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString();
    if (!origin.includes("github.com")) return [];
  } catch {
    return [];
  }
  try {
    const raw = execSync("gh issue list --label arsenal --state open --limit 10 --json number,title,url", {
      cwd: root,
      timeout: ISSUE_TIMEOUT_MS,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    return JSON.parse(raw).map((i) => ({ ...i, repo: path.basename(root) }));
  } catch {
    return null;
  }
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
  if (kind === "review") return status === "done" ? "done" : "open";
  if (kind === "roadmap") {
    if (s === "ready") return "open"; // next move: /brief a phase, or re-discuss
    if (s === "superseded") return "done";
    return "wip";
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
    // New vocabulary (brief / propose) with legacy acceptance (prd / rfc).
    // Filename is authoritative alongside `type`: state-contract.md never
    // required a `type` field, so a brief written to spec must still be seen.
    const base = path.basename(file);
    const isPrd = fm.type === "brief" || fm.type === "prd" || base === "brief.md";
    const isRfc =
      fm.type === "propose" ||
      fm.type === "rfc" ||
      ["PROPOSAL.md", "RFC.md"].includes(base);
    const isRoadmap = fm.type === "roadmap";
    const isReview = fm.type === "review";
    if (!isPrd && !isRfc && !isRoadmap && !isReview) continue;
    const kind = isPrd ? "prd" : isRoadmap ? "roadmap" : isReview ? "review" : "rfc";
    const shippedMarker = isRfc && fs.existsSync(path.join(path.dirname(file), `${path.basename(file, ".md")}.shipped`));
    let status = shippedMarker ? "shipped" : fm.status || (isRfc ? "Draft" : "draft");

    let progress = null;
    let nextTask = null;
    let nextTaskId = null;
    if (isPrd) {
      const tasks = path.join(path.dirname(file), "tasks.md");
      const c = countTasks(tasks);
      if (c) {
        progress = `${c.done}/${c.total} tasks`;
        nextTask = c.next;
        nextTaskId = c.nextId;
      }
    }
    // A review report is open while one of its points is unchecked.
    if (isReview) {
      const c = countTasks(file);
      status = c && c.done < c.total ? "open" : "done";
      if (c) progress = `${c.done}/${c.total} points`;
    }
    const b = bucket(kind, status);

    // resume command: explicit frontmatter wins; else derive from the artifact path.
    let resume = fm.resume_cmd;
    if (!resume) {
      if (isRoadmap) resume = `/arsenal -r ${fm.slug || path.basename(path.dirname(file))}`;
      else if (isReview) resume = `/review ${relTo(root, file)}`;
      else {
        const target = isPrd ? relTo(root, path.dirname(file)) : relTo(root, file);
        resume = `/ship ${target}`;
      }
    }
    const nextCommand =
      isPrd && nextTaskId && /^\/ship(?:\s|$)/.test(resume)
        ? resume.replace(/^\/ship/, `/ship --tasks ${nextTaskId}`)
        : resume;

    items.push({
      kind,
      slug: isPrd || isReview ? path.basename(path.dirname(file)) : path.basename(file, ".md"),
      name: fm.feature || fm.title || fm.slug || path.basename(path.dirname(file)),
      status,
      bucket: b,
      rank: rank(status),
      progress,
      next_task: nextTask,
      next_task_id: nextTaskId,
      next: fm.next_action || "",
      base: fm.base || null,
      branch: fm.branch || null,
      resume: harnessCommand(resume),
      next_command: harnessCommand(nextCommand),
      repo: path.basename(root),
      path: relTo(root, file),
    });
  }
  return items;
}

const resumeIdx = args.indexOf("--resume");
if (resumeIdx !== -1) {
  const date = args[resumeIdx + 1];
  const ok = roots.some((r) => resumeSave(path.resolve(r), date));
  process.stdout.write(ok ? `Resumed save ${date}\n` : `No open save ${date}\n`);
  process.exit(ok ? 0 : 1);
}

let all = [];
let trace = [];
let saves = [];
let issues = [];
let issuesFailed = false;
const BANNER = flags.has("--banner");
for (const root of roots) {
  const r = path.resolve(root);
  all = all.concat(collect(r));
  trace = trace.concat(readTrace(r));
  saves = saves.concat(readSaves(r));
  if (!BANNER) {
    const found = readIssues(r);
    if (found === null) issuesFailed = true;
    else issues = issues.concat(found);
  }
}
all.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

// When trace says a prd shipped but its frontmatter still reads open, the board
// is stale (work landed outside ship). Flag it instead of trusting the checkbox.
const shippedCtx = new Set(trace.filter((t) => /shipped/i.test(t.status)).map((t) => t.context));
for (const i of all) {
  if (
    i.kind === "prd" &&
    i.bucket === "open" &&
    (shippedCtx.has(`brief:${i.slug}`) || shippedCtx.has(`prd:${i.slug}`))
  )
    i.traceShipped = true;
}

const open = all.filter((i) => i.bucket === "open");
const wip = all.filter((i) => i.bucket === "wip");
const done = all.filter((i) => i.bucket === "done");

if (flags.has("--json")) {
  process.stdout.write(
    JSON.stringify(
      { saves, open, wip, done, issues, issues_failed: issuesFailed, top: open[0] || null, trace: trace.slice(-20) },
      null,
      2,
    ) + "\n",
  );
  process.exit(0);
}

// --banner: terse, raw text for the SessionStart hook. Silent only when there is
// neither open artifact work nor recent trace activity to resurface.
function saveLines(sv, n) {
  const head = `  ${n}. session ${sv.date} (branch ${sv.branch})`;
  const body = ["done", "left", "next", "remember"].filter((k) => sv[k]).map((k) => `       ${k}: ${sv[k]}`);
  return [head, ...body];
}

// The numbered resume list: open saves first, newest first, then open specs
// and reviews, then issues. Shared by the banner and the board.
function resumeList(withIssues) {
  const lines = [];
  let n = 0;
  for (const sv of saves) lines.push(...saveLines(sv, ++n));
  for (const i of open) lines.push(`  ${++n}. ${i.name} [${i.status}]${i.progress ? " " + i.progress : ""} -> ${i.next_command}`);
  if (withIssues) for (const is of issues) lines.push(`  ${++n}. issue #${is.number} ${is.title} -> ${harnessCommand("/issue")} resume #${is.number}`);
  return lines;
}

if (BANNER && saves.length) {
  const lines = ["RESUME (left by the last sessions):", ...resumeList(false)];
  lines.push(
    "",
    "INSTRUCTION: in your first reply, before anything else, show this numbered list to the user in their language,",
    `then ask only "On continue quoi ?" (translated) and wait. Open issues: ${harnessCommand("/next")}.`,
    `When the user picks a session, run: node "${__filename}" "${roots[0]}" --resume <its date>,`,
    "then hand its next action to Arsenal. Never start the work before the user picks.",
  );
  process.stdout.write(lines.join("\n") + "\n");
  process.exit(0);
}

if (BANNER) {
  if (open.length === 0 && trace.length === 0) process.exit(0);
  const lines = [];
  if (open.length) {
    lines.push(`OPEN WORK (run ${harnessCommand("/next")} for detail):`);
    for (const i of open.slice(0, 3)) {
      lines.push(
        `  - ${i.name} [${i.status}]${i.progress ? " " + i.progress : ""} -> ${i.next_command}`,
      );
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
  const nextTask = i.next_task ? `\n      next task: ${i.next_task}` : "";
  const git = i.branch && i.base ? `\n      branch: ${i.branch} -> ${i.base}` : "";
  const nxt = i.next ? `\n      ${i.next}` : "";
  return `  ${i.name} [${i.status}] (${tag}${i.repo ? ", " + i.repo : ""})${prog}${stale}\n      resume: ${i.next_command}${nextTask}${git}${nxt}`;
}

const out = [];
if (saves.length || issues.length) {
  out.push("TO RESUME (pick a number):");
  out.push(resumeList(true).join("\n"));
  out.push("");
}
if (issuesFailed) out.push("(GitHub issues not listed: gh unavailable or too slow)\n");
if (open.length === 0 && wip.length === 0) {
  out.push(
    trace.length
      ? "No open brief/propose work. Recent activity below (from trace)."
      : "No open brief/propose work found. Nothing to resume.",
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
  if (open.length) out.push(`\nNext: ${open[0].next_command}`);
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
