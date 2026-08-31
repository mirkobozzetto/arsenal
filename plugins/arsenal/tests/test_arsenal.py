import contextlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
import tomllib
import unittest
from unittest import mock
from pathlib import Path

PLUGIN_ROOT = Path(__file__).resolve().parents[1]
SKILL_ROOT = PLUGIN_ROOT / "skills" / "arsenal"
RENDERER = SKILL_ROOT / "scripts" / "render.py"
INSTALLER = SKILL_ROOT / "scripts" / "install_agents.py"


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise AssertionError(f"Missing frontmatter: {path}")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise AssertionError(f"Unclosed frontmatter: {path}")
    fields = {}
    for line in text[4:end].splitlines():
        if line and not line.startswith(" ") and ":" in line:
            key, value = line.split(":", 1)
            fields[key] = value.strip()
    return fields, text[end + 5 :]


class SkillContractTests(unittest.TestCase):
    def test_skill_uses_portable_frontmatter(self):
        fields, _ = frontmatter(SKILL_ROOT / "SKILL.md")
        self.assertEqual(fields["name"], "arsenal")
        self.assertIn("description", fields)
        self.assertNotIn("argument-hint", fields)
        self.assertNotIn("allowed-tools", fields)
        self.assertLessEqual(len("arsenal"), 64)

    def test_every_step_and_reference_exists(self):
        expected = [
            *(SKILL_ROOT / "steps" / f"step-0{i}-{name}.md"
              for i, name in enumerate((
                  "init", "interview", "research", "plan", "render", "discuss"
              ))),
            SKILL_ROOT / "references" / "capability-contract.md",
            SKILL_ROOT / "references" / "agent-contracts.md",
            *(SKILL_ROOT / "references" / "adapters" / f"{name}.md"
              for name in ("solo", "claude-code", "omp", "codex")),
        ]
        self.assertTrue(all(path.is_file() for path in expected))

    def test_roadmap_schema_remains_six_numbered_sections(self):
        plan = (SKILL_ROOT / "steps" / "step-03-plan.md").read_text()
        self.assertEqual(plan.count("## 1."), 1)
        for number in range(2, 7):
            self.assertEqual(plan.count(f"## {number}."), 1)
        self.assertNotIn("## 7.", plan)
        self.assertIn("execution_trace: <single-line JSON array, optional>", plan)

    def test_all_adapters_use_the_canonical_roadmap_schema(self):
        adapter_dir = SKILL_ROOT / "references" / "adapters"
        for path in adapter_dir.glob("*.md"):
            adapter = path.read_text(encoding="utf-8")
            for number in range(1, 7):
                self.assertNotIn(f"## {number}.", adapter)
        research = (SKILL_ROOT / "steps" / "step-02-research.md").read_text()
        planning = (SKILL_ROOT / "steps" / "step-03-plan.md").read_text()
        self.assertIn("active harness adapter", research)
        self.assertIn("adapter-formatted resume command", planning)


class AgentContractTests(unittest.TestCase):
    def test_three_agents_exist_for_every_harness(self):
        claude = sorted((PLUGIN_ROOT / "agents").glob("arsenal-*.md"))
        omp = sorted((PLUGIN_ROOT / "agents" / "omp").glob("arsenal-*.md"))
        codex = sorted((PLUGIN_ROOT / "agents" / "codex").glob("arsenal_*.toml"))
        self.assertEqual(len(claude), 3)
        self.assertEqual(len(omp), 3)
        self.assertEqual(len(codex), 3)

    def test_claude_agents_are_read_only_and_bounded(self):
        for path in (PLUGIN_ROOT / "agents").glob("arsenal-*.md"):
            fields, body = frontmatter(path)
            self.assertIn(fields["model"], {"haiku", "sonnet"})
            self.assertNotRegex(fields["tools"], r"Write|Edit|Bash")
            self.assertIn("Never question the user", body)

    def test_omp_agents_have_models_and_output_schemas(self):
        expected = {
            "arsenal-product-scout": "openai-codex/gpt-5.6-luna",
            "arsenal-harness-analyst": "openai-codex/gpt-5.6-terra",
            "arsenal-adversarial-reviewer": "openai-codex/gpt-5.6-terra",
        }
        for path in (PLUGIN_ROOT / "agents" / "omp").glob("*.md"):
            fields, body = frontmatter(path)
            self.assertEqual(fields["model"], expected[fields["name"]])
            self.assertIn("output", fields)
            self.assertNotRegex(fields["tools"], r"write|edit|bash")
            self.assertIn("Never question the user", body)

    def test_codex_agents_parse_and_are_read_only(self):
        for path in (PLUGIN_ROOT / "agents" / "codex").glob("*.toml"):
            data = tomllib.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(data["sandbox_mode"], "read-only")
            self.assertIn(data["model"], {"gpt-5.6-luna", "gpt-5.6-terra"})
            self.assertIn("Never question the user", data["developer_instructions"])


class InstallerTests(unittest.TestCase):
    def run_installer(self, action, harness, target):
        result = subprocess.run(
            [sys.executable, str(INSTALLER), action, harness,
             "--target-dir", str(target)],
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def test_install_is_idempotent_and_uninstall_restores_backup(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            existing = target / "arsenal-product-scout.md"
            existing.write_text("user-owned\n", encoding="utf-8")

            first = self.run_installer("install", "omp", target)
            second = self.run_installer("install", "omp", target)
            removed = self.run_installer("uninstall", "omp", target)

            self.assertIn(existing.name, first["backed_up"])
            self.assertEqual(len(second["unchanged"]), 3)
            self.assertIn(existing.name, removed["restored"])
            self.assertEqual(existing.read_text(encoding="utf-8"), "user-owned\n")


class RendererTests(unittest.TestCase):
    def test_headless_browser_failure_keeps_successful_render(self):
        spec = importlib.util.spec_from_file_location("arsenal_renderer", RENDERER)
        renderer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(renderer)
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "roadmap.md"
            source.write_text("# Headless\n", encoding="utf-8")
            output = io.StringIO()
            errors = io.StringIO()
            with mock.patch.object(sys, "argv", [str(RENDERER), str(source)]):
                with mock.patch.object(
                    renderer.webbrowser, "open", return_value=False
                ) as browser_open:
                    with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
                        renderer.main()
        self.assertTrue(output.getvalue().strip().endswith(".html"))
        self.assertIn("Browser unavailable", errors.getvalue())
        opened_uri = browser_open.call_args.args[0]
        self.assertTrue(opened_uri.startswith("file://"))

    def test_renderer_inlines_vendor_scripts_without_network(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "roadmap.md"
            fence = chr(96) * 3
            source.write_text(
                "---\ntype: roadmap\nslug: smoke\nstatus: draft\n---\n\n"
                "# Smoke\n\n## 1. Objective\n\nText.\n\n"
                f"## 4. Mockup\n\n{fence}mermaid\ngraph TD\nA --> B\n{fence}\n",
                encoding="utf-8",
            )
            result = subprocess.run(
                [sys.executable, str(RENDERER), str(source), "--no-open"],
                check=True,
                capture_output=True,
                text=True,
            )
            output = Path(result.stdout.strip()).read_text(encoding="utf-8")

        self.assertIn("marked.parse(raw)", output)
        self.assertIn("mermaid.initialize", output)
        self.assertNotRegex(output, r"<script[^>]+src=[\"']https?://")
        self.assertNotIn("__MARKED__", output)
        self.assertNotIn("__MERMAID__", output)


if __name__ == "__main__":
    unittest.main()
