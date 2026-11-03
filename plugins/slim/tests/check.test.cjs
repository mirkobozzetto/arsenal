const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const test = require("node:test");

const CHECK = path.join(__dirname, "../skills/slim/scripts/check.cjs");
const CITATION = "Mirko, 12/10 15 h 46 : « ne jamais rester en train d'attendre »";
const RULE = [
  "# Tests",
  "",
  "Jamais plus de 5 secondes sans agir sur un écran de test",
  `(${CITATION}). Une attente prouvée nécessaire plafonne à 5 secondes.`,
  "",
  "- Je prends le parcours le plus court.",
  "- Je relance depuis l'écran affiché.",
  "",
  "| Besoin | Commande |",
  "| --- | --- |",
  "| Lire | `hc read <t>` |",
  "",
].join("\n");
const SLIM = [
  "# Tests",
  "",
  "Jamais plus de 5 secondes sans agir sur un écran de test.",
  "Une attente prouvée nécessaire plafonne à 5 secondes.",
  "",
  "- Je prends le parcours le plus court.",
  "- Je relance depuis l'écran affiché.",
  "",
  "| Besoin | Commande |",
  "|---|---|",
  "| Lire | `hc read <t>` |",
  "",
].join("\n");
const EVIDENCE = `# rules/tests.md\n\n- Jamais plus de 5 secondes : ${CITATION}.\n`;

function git(cwd, ...args) {
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, stdio: "ignore" });
}

function sandbox() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "arsenal-slim-check-")));
  const repo = path.join(root, "claude");
  const rule = path.join(repo, "rules", "tests.md");
  fs.mkdirSync(path.dirname(rule), { recursive: true });
  fs.writeFileSync(rule, RULE);
  git(repo, "init", "-q");
  git(repo, "add", ".");
  git(repo, "commit", "-qm", "init");
  const work = path.join(root, "work");
  const evidence = path.join(repo, "evidence", "tests.md");
  return { root, repo, rule, work, evidence };
}

const run = (...args) => spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

test("a citation moved to the evidence file loses nothing", () => {
  const box = sandbox();
  assert.equal(run("save", box.work, box.rule).status, 0);
  write(box.rule, SLIM);
  write(box.evidence, EVIDENCE);
  const res = run("verify", box.work, "--in", path.dirname(box.evidence));
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.equal(fs.readFileSync(box.rule, "utf8"), SLIM);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("a lost sentence puts its file back as it was, and is named", () => {
  const box = sandbox();
  run("save", box.work, box.rule);
  write(box.rule, SLIM.replace("- Je relance depuis l'écran affiché.\n", ""));
  write(box.evidence, EVIDENCE);
  const res = run("verify", box.work, "--in", path.dirname(box.evidence));
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Je relance depuis l'écran affiché/);
  assert.equal(fs.readFileSync(box.rule, "utf8"), RULE);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("a citation dropped instead of moved is caught", () => {
  const box = sandbox();
  run("save", box.work, box.rule);
  write(box.rule, SLIM);
  const res = run("verify", box.work);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /12\/10 15 h 46/);
  assert.equal(fs.readFileSync(box.rule, "utf8"), RULE);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("a validated rewrite or removal counts, an unwritten one does not", () => {
  const box = sandbox();
  run("save", box.work, box.rule);
  const shorter = SLIM.replace("Une attente prouvée nécessaire plafonne à 5 secondes.", "Attente prouvée : 5 s au plus.")
    .replace("- Je relance depuis l'écran affiché.\n", "");
  const rewrites = path.join(box.root, "rewrites.json");
  const validated = [
    { from: "Une attente prouvée nécessaire plafonne à 5 secondes.", to: "Attente prouvée : 5 s au plus." },
    { from: "Je relance depuis l'écran affiché.", to: "" },
  ];
  write(box.evidence, EVIDENCE);
  write(box.rule, shorter);
  write(rewrites, JSON.stringify([{ ...validated[0], to: "Attente : 5 s." }, validated[1]]));
  assert.equal(run("verify", box.work, "--in", path.dirname(box.evidence), "--rewrites", rewrites).status, 1);
  write(box.rule, shorter);
  write(rewrites, JSON.stringify(validated));
  const res = run("verify", box.work, "--in", path.dirname(box.evidence), "--rewrites", rewrites);
  assert.equal(res.status, 0, res.stdout);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("a block moved into a new skill loses nothing", () => {
  const box = sandbox();
  run("save", box.work, box.rule);
  const skill = path.join(box.repo, "skills", "short-path", "SKILL.md");
  write(skill, "---\nname: short-path\n---\n\n- Je prends le parcours le plus court.\n- Je relance depuis l'écran affiché.\n");
  write(box.rule, SLIM.replace("- Je prends le parcours le plus court.\n- Je relance depuis l'écran affiché.\n", ""));
  write(box.evidence, EVIDENCE);
  const res = run("verify", box.work, "--in", path.dirname(box.evidence), "--in", skill);
  assert.equal(res.status, 0, res.stdout);
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("refuses a file with changes not recorded in Git", () => {
  const box = sandbox();
  fs.appendFileSync(box.rule, "Pas encore commité.\n");
  const res = run("save", box.work, box.rule);
  assert.equal(res.status, 2);
  assert.match(res.stdout + res.stderr, /tests\.md/);
  assert.ok(!fs.existsSync(path.join(box.work, "originals.json")));
  fs.rmSync(box.root, { recursive: true, force: true });
});

test("a file outside Git gets a backup copy first", () => {
  const box = sandbox();
  const loose = path.join(box.root, "loose", "CLAUDE.md");
  write(loose, RULE);
  assert.equal(run("save", box.work, loose).status, 0);
  assert.equal(fs.readFileSync(`${loose}.slim.bak`, "utf8"), RULE);
  fs.rmSync(box.root, { recursive: true, force: true });
});
