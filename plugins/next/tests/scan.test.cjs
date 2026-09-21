const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const scanner = path.join(__dirname, "../skills/next/scripts/scan.cjs");

function scan(tasks) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-next-"));
  const artifact = path.join(root, "docs/brief/demo");
  fs.mkdirSync(artifact, { recursive: true });
  fs.writeFileSync(
    path.join(artifact, "brief.md"),
    "---\ntitle: Demo\nstatus: ready\n---\n",
  );
  fs.writeFileSync(path.join(artifact, "tasks.md"), tasks);
  const output = execFileSync(process.execPath, [scanner, root, "--json"]);
  fs.rmSync(root, { recursive: true, force: true });
  return JSON.parse(output).top;
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
