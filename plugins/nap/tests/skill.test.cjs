const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const SKILL_DIR = path.join(__dirname, "../skills/nap");
const SKILL = fs.readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8");
const TRACE = path.join(__dirname, "../../trace/skills/trace/scripts/trace.cjs");
const NEXT_TEXT = 'T02 du brief docs/brief/nap : le skill ; puis "T03"';

test("the skill is /nap, takes the next step as its argument", () => {
  assert.match(SKILL, /^---\nname: nap\n/);
  assert.match(SKILL, /^argument-hint: /m);
});

test("saves with trace, asks nothing, keeps the given text as next", () => {
  assert.match(SKILL, /trace:trace/);
  assert.match(SKILL, /Ask nothing/);
  assert.match(SKILL, /`--next`.*word for word/s);
});

test("arms the wake-up from a background Bash, only under a multiplexer", () => {
  assert.ok(fs.existsSync(path.join(SKILL_DIR, "scripts/wake.cjs")));
  assert.match(SKILL, /scripts\/wake\.cjs --detect/);
  assert.match(SKILL, /run_in_background/);
  assert.match(SKILL, /`none`.*« Tu peux \/clear\. ».*`\/next:next`/s);
});

test("trace writes the /nap text as the save's next line, as is", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-nap-skill-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync(process.execPath, [TRACE, "save", "--done", "nap test", "--next", NEXT_TEXT], { cwd: root });
  const ledger = fs.readFileSync(path.join(root, ".claude/trace.md"), "utf8");
  fs.rmSync(root, { recursive: true, force: true });
  assert.ok(ledger.includes(`- next: ${NEXT_TEXT}\n`), ledger);
});
