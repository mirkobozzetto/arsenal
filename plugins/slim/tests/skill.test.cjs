const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const SKILL_DIR = path.join(__dirname, "../skills/slim");
const SKILL = fs.readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8");

test("the skill is /slim, scoped by an optional argument", () => {
  assert.match(SKILL, /^---\nname: slim\n/);
  assert.match(SKILL, /^argument-hint: /m);
});

test("runs its scripts where the session's environment is seen", () => {
  for (const script of ["weigh.cjs", "check.cjs"]) assert.ok(fs.existsSync(path.join(SKILL_DIR, "scripts", script)));
  assert.match(SKILL, /run_in_background: true/);
  assert.match(SKILL, /weigh\.cjs --save/);
  assert.match(SKILL, /weigh\.cjs --compare/);
});

test("sorts every block to one of four destinations", () => {
  for (const place of ["stays loaded", "skill", "`paths:`", "evidence"]) assert.ok(SKILL.includes(place), place);
  assert.match(SKILL, /never inside `rules\/`/);
  assert.match(SKILL, /duplicates and contradictions/);
});

test("writes nothing before the go, proves nothing was lost, commits per file", () => {
  assert.match(SKILL, /Write nothing yet/);
  assert.match(SKILL, /go/);
  assert.match(SKILL, /check\.cjs save/);
  assert.match(SKILL, /check\.cjs verify/);
  assert.match(SKILL, /rewrites\.json/);
  assert.match(SKILL, /one commit per file/);
});

test("leaves MEMORY.md and generated blocks alone", () => {
  assert.match(SKILL, /Never edit `MEMORY\.md`/);
  assert.match(SKILL, /GitNexus/);
});
