const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const WEIGH = path.join(__dirname, "../skills/slim/scripts/weigh.cjs");
const MEMORY_LINES_LOADED = 200;

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

// The layout Mirko runs under: a per-account config dir whose CLAUDE.md,
// RTK.md and rules/ are links into ~/.claude, a project with its own rules,
// and the project's auto memory under the account's config dir.
function sandbox() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-slim-weigh-")));
  const home = path.join(root, "home");
  const shared = path.join(home, ".claude");
  const config = path.join(home, ".claude-acct");
  const project = path.join(home, "code", "proj");
  write(path.join(shared, "CLAUDE.md"), "# Global\n\n<!-- maintainer note -->\n\nKeep it short.\n\n@RTK.md\n");
  write(path.join(shared, "RTK.md"), "# RTK\n\nUse rtk.\n");
  write(path.join(shared, "rules", "a.md"), "# A\n\nAlways A.\n");
  write(path.join(shared, "rules", "b.md"), "---\npaths:\n  - \"**/*.tsx\"\n---\n\n# B\n\nOnly tsx.\n");
  write(path.join(shared, "rules", "sub", "c.md"), "# C\n\nAlways C.\n");
  fs.mkdirSync(config, { recursive: true });
  for (const name of ["CLAUDE.md", "RTK.md", "rules"]) {
    fs.symlinkSync(path.join(shared, name), path.join(config, name));
  }
  write(path.join(project, "CLAUDE.md"), "# Project\n\nProject rule.\n");
  write(path.join(project, ".claude", "rules", "p.md"), "# P\n\nAlways P.\n");
  write(path.join(project, ".claude", "rules", "q.md"), "---\npaths: \"src/**\"\n---\n\nOnly src.\n");
  execFileSync("git", ["init", "-q"], { cwd: project });
  const memoryDir = path.join(config, "projects", project.replace(/[^A-Za-z0-9]/g, "-"), "memory");
  const lines = Array.from({ length: 250 }, (_, i) => `- line ${i}`);
  write(path.join(memoryDir, "MEMORY.md"), lines.join("\n") + "\n");
  return { root, home, shared, config, project, memory: path.join(memoryDir, "MEMORY.md"), lines };
}

function weigh(box, ...args) {
  return execFileSync(process.execPath, [WEIGH, ...args], {
    cwd: box.project,
    env: { ...process.env, HOME: box.home, CLAUDE_CONFIG_DIR: box.config },
    encoding: "utf8",
  });
}

test("lists every file loaded at launch, once, and skips path-scoped rules", () => {
  const box = sandbox();
  const report = JSON.parse(weigh(box, "--json"));
  assert.deepEqual(
    report.files.map((f) => f.real),
    [
      path.join(box.shared, "CLAUDE.md"),
      path.join(box.shared, "RTK.md"),
      path.join(box.shared, "rules", "a.md"),
      path.join(box.shared, "rules", "sub", "c.md"),
      path.join(box.project, "CLAUDE.md"),
      path.join(box.project, ".claude", "rules", "p.md"),
      box.memory,
    ],
  );
  assert.deepEqual(
    report.files.map((f) => f.kind),
    ["user", "user", "user", "user", "project", "project", "memory"],
  );
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("counts what Claude gets: no HTML comment, first 200 memory lines", () => {
  const box = sandbox();
  const report = JSON.parse(weigh(box, "--json"));
  const claude = report.files.find((f) => f.real === path.join(box.shared, "CLAUDE.md"));
  assert.equal(claude.chars, "# Global\n\n\nKeep it short.\n\n@RTK.md".length);
  const memory = report.files.find((f) => f.kind === "memory");
  assert.equal(memory.chars, box.lines.slice(0, MEMORY_LINES_LOADED).join("\n").length);
  assert.equal(report.total.chars, report.files.reduce((sum, f) => sum + f.chars, 0));
  assert.ok(report.total.tokens > 0);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("prints a table, then the gain against a saved weighing", () => {
  const box = sandbox();
  const before = path.join(box.root, "before.json");
  const table = weigh(box, "--save", before);
  assert.match(table, /pane|a\.md/);
  assert.match(table, /total/i);
  write(path.join(box.shared, "rules", "a.md"), "# A\n");
  const gain = weigh(box, "--compare", before);
  assert.match(gain, /before/i);
  assert.match(gain, /after/i);
  assert.match(gain, /a\.md.*-\d/);
  assert.match(gain, /total.*-\d/i);
  fs.rmSync(box.root, { recursive: true, force: true });
});
