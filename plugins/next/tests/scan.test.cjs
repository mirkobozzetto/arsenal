const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const scanner = path.join(__dirname, "../skills/next/scripts/scan.cjs");

function scan(tasks, frontmatter = "", flags = ["--json"]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-next-"));
  const artifact = path.join(root, "docs/brief/demo");
  fs.mkdirSync(artifact, { recursive: true });
  fs.writeFileSync(
    path.join(artifact, "brief.md"),
    `---\ntitle: Demo\nstatus: ready\n${frontmatter}---\n`,
  );
  fs.writeFileSync(path.join(artifact, "tasks.md"), tasks);
  const output = execFileSync(process.execPath, [scanner, root, ...flags]);
  fs.rmSync(root, { recursive: true, force: true });
  return flags.includes("--json") ? JSON.parse(output).top : output.toString();
}

test("scopes the resume command to the first unfinished task", () => {
  const first = scan(`## 1. First\n- [ ] one\n\n## 2. Second\n- [ ] two\n`);
  assert.equal(first.next_task_id, "1");
  assert.equal(first.next_command, "/ship --tasks 1 docs/brief/demo");

  const second = scan(`## 1. First\n- [x] one\n\n## 2. Second\n- [ ] two\n`);
  assert.equal(second.next_task_id, "2");
  assert.equal(second.next_command, "/ship --tasks 2 docs/brief/demo");
});

test("supports stable T-prefixed task identifiers", () => {
  const item = scan(
    `## T01 — First\n- [x] one\n\n## T02 — Second\n### Detail\n- [ ] two\n`,
  );
  assert.equal(item.next_task_id, "T02");
  assert.equal(item.next_command, "/ship --tasks T02 docs/brief/demo");
});

test("carries base and branch when the brief declares them, tolerates their absence", () => {
  const legacy = scan(`## 1. First\n- [ ] one\n`);
  assert.equal(legacy.base, null);
  assert.equal(legacy.branch, null);
  assert.doesNotMatch(scan(`## 1. First\n- [ ] one\n`, "", []), /branch:/);

  const declared = scan(`## 1. First\n- [ ] one\n`, "base: pre-dev\nbranch: feat/demo\n");
  assert.equal(declared.base, "pre-dev");
  assert.equal(declared.branch, "feat/demo");
  assert.match(scan(`## 1. First\n- [ ] one\n`, "base: pre-dev\nbranch: feat/demo\n", []), /branch: feat\/demo -> pre-dev/);
});
