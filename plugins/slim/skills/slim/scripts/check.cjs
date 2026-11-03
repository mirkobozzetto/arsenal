#!/usr/bin/env node
// Proves a slimming lost nothing: every sentence, parenthesis, list item,
// table cell and code line of each original file must still be found in the
// files written, or in a rewrite the user validated.
//   check.cjs save <workdir> <file>...
//   check.cjs verify <workdir> [--in <file|dir>]... [--rewrites <json>]
// verify puts back, as it was, every file with a piece found nowhere.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ORIGINALS = "originals.json";
const BACKUP_SUFFIX = ".slim.bak";
const EXIT_LOST = 1;
const EXIT_DIRTY = 2;

const HOME = os.homedir();
const short = (p) => (p.startsWith(HOME + path.sep) ? "~" + p.slice(HOME.length) : p);

function git(file, ...args) {
  return execFileSync("git", args, { cwd: path.dirname(file), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function tracked(file) {
  try {
    git(file, "ls-files", "--error-unmatch", "--", path.basename(file));
    return true;
  } catch {
    return false;
  }
}

function dirty(file) {
  try {
    return git(file, "status", "--porcelain", "--", path.basename(file)).trim() !== "";
  } catch {
    return false;
  }
}

function save(work, files) {
  const reals = files.map((f) => fs.realpathSync(f));
  const refused = reals.filter(dirty);
  if (refused.length) {
    console.log("refused, changes not recorded in Git (commit them first):");
    for (const f of refused) console.log(`  ${short(f)}`);
    process.exit(EXIT_DIRTY);
  }
  fs.mkdirSync(work, { recursive: true });
  const originals = reals.map((real) => ({ real, content: fs.readFileSync(real, "utf8") }));
  for (const o of originals) {
    if (!tracked(o.real)) {
      fs.writeFileSync(o.real + BACKUP_SUFFIX, o.content);
      console.log(`backup: ${short(o.real + BACKUP_SUFFIX)}`);
    }
  }
  fs.writeFileSync(path.join(work, ORIGINALS), JSON.stringify(originals));
  console.log(`saved ${originals.length} file(s) in ${work}`);
}

const norm = (s) => s.replace(/\s+/g, " ").replace(/ ([.,])/g, "$1");
const edges = (s) =>
  norm(s)
    .trim()
    .replace(/^(?:[-*+]|\d+[.)]|#{1,6}|>)\s+/, "")
    .replace(/^[\s.,;:!?]+|[\s.,;:!?]+$/g, "");

// Parentheses outside inline code become their own pieces and cut the text
// around them, so a citation can move to the evidence file on its own.
function splitParens(s) {
  const segments = [""];
  const groups = [];
  let depth = 0;
  let code = false;
  let buf = "";
  for (const ch of s) {
    if (ch === "`") code = !code;
    if (!code && ch === "(") {
      if (depth++ > 0) buf += ch;
      continue;
    }
    if (!code && ch === ")" && depth > 0) {
      if (--depth === 0) {
        groups.push(buf);
        buf = "";
        segments.push("");
      } else buf += ch;
      continue;
    }
    if (depth > 0) buf += ch;
    else segments[segments.length - 1] += ch;
  }
  if (depth > 0) segments[segments.length - 1] += "(" + buf;
  return [...segments, ...groups];
}

const sentences = (s) => s.split(/(?<=[.!?])\s+(?=[\p{Lu}«"`*[])/u);

function units(text) {
  const out = [];
  let para = [];
  let fence = false;
  const flush = () => {
    if (para.length) out.push({ prose: para.join(" ") });
    para = [];
  };
  const fm = text.match(/^---\n([\s\S]*?)\n---[ \t]*(\n|$)/);
  if (fm) {
    for (const line of fm[1].split("\n")) out.push({ code: line });
    text = text.slice(fm[0].length);
  }
  for (const raw of text.split("\n")) {
    const line = raw.replace(/^\s*>\s?/, "");
    if (/^\s*(```|~~~)/.test(line)) {
      flush();
      fence = !fence;
      continue;
    }
    if (fence) {
      out.push({ code: line });
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flush();
      if (!/^[\s|:-]+$/.test(line)) for (const cell of line.split("|")) out.push({ prose: cell });
      continue;
    }
    if (/^\s*(?:[-*+]|\d+[.)]|#{1,6})\s/.test(line)) flush();
    para.push(line.trim());
  }
  flush();
  return out;
}

function pieces(text) {
  const out = [];
  for (const u of units(text)) {
    const parts = u.code !== undefined ? [u.code] : splitParens(u.prose).flatMap(sentences);
    for (const p of parts) {
      const piece = u.code !== undefined ? norm(p).trim() : edges(p);
      if (/[\p{L}\p{N}]/u.test(piece)) out.push(piece);
    }
  }
  return out;
}

function mdFiles(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isFile()) return [target];
  return fs
    .readdirSync(target, { recursive: true })
    .map((f) => path.join(target, String(f)))
    .filter((f) => f.endsWith(".md") && fs.statSync(f).isFile());
}

function verify(work, targets, rewritesFile) {
  const originals = JSON.parse(fs.readFileSync(path.join(work, ORIGINALS), "utf8"));
  const rewrites = rewritesFile ? JSON.parse(fs.readFileSync(rewritesFile, "utf8")) : [];
  const extra = targets.flatMap(mdFiles).map((f) => fs.realpathSync(f));
  const restored = new Map();
  for (;;) {
    const paths = [...new Set([...originals.map((o) => o.real), ...extra])];
    const written = norm(paths.filter((p) => fs.existsSync(p)).map((p) => fs.readFileSync(p, "utf8").replace(/^\s*>\s?/gm, "")).join("\n"));
    const valid = rewrites.filter((r) => !edges(r.to) || written.includes(edges(r.to)));
    const found = (piece) => written.includes(piece) || valid.some((r) => edges(r.from).includes(piece));
    const lost = originals
      .filter((o) => !restored.has(o.real))
      .map((o) => ({ o, missing: pieces(o.content).filter((p) => !found(p)) }))
      .filter((x) => x.missing.length);
    if (!lost.length) break;
    for (const { o, missing } of lost) {
      fs.writeFileSync(o.real, o.content);
      restored.set(o.real, missing);
    }
  }
  for (const [real, missing] of restored) {
    console.log(`put back as it was: ${short(real)} (${missing.length} piece(s) found nowhere)`);
    for (const m of missing) console.log(`  - « ${m} »`);
  }
  const total = originals.reduce((sum, o) => sum + pieces(o.content).length, 0);
  const kept = originals.length - restored.size;
  console.log(`checked ${total} piece(s) in ${originals.length} file(s): ${kept} kept, ${restored.size} put back`);
  if (rewrites.length) console.log(`validated rewrites: ${rewrites.length}`);
  process.exit(restored.size ? EXIT_LOST : 0);
}

function main([cmd, work, ...rest]) {
  if (cmd === "save" && work && rest.length) return save(work, rest);
  if (cmd === "verify" && work) {
    const targets = [];
    let rewrites = null;
    for (let i = 0; i < rest.length; i += 2) {
      if (rest[i] === "--in") targets.push(rest[i + 1]);
      else if (rest[i] === "--rewrites") rewrites = rest[i + 1];
    }
    return verify(work, targets, rewrites);
  }
  console.error("usage: check.cjs save <workdir> <file>... | verify <workdir> [--in <path>]... [--rewrites <json>]");
  process.exit(64);
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { pieces };
