#!/usr/bin/env python3
"""Generate every harness's agent files from plugins/*/agents/src/*.toml."""

import json
import re
import tomllib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SOURCES = "plugins/*/agents/src/*.toml"
OMP_RETURNS = "Return only data matching the output schema."
PLAIN_YAML = re.compile(r"[A-Za-z][\w ,./()'-]*")
YAML_WORDS = {"true", "false", "null", "yes", "no", "on", "off"}


def yaml_value(value):
    if isinstance(value, bool):
        return str(value).lower()
    if PLAIN_YAML.fullmatch(value) and value.lower() not in YAML_WORDS:
        return value
    return json.dumps(value, ensure_ascii=False)


def toml_value(value):
    if isinstance(value, bool):
        return str(value).lower()
    return json.dumps(value, ensure_ascii=False)


def markdown(fields, body):
    lines = []
    for key, value in fields.items():
        # A multi-line value is a YAML fragment, such as OMP's output schema.
        if isinstance(value, str) and "\n" in value:
            lines.append(f"{key}:")
            lines += [f"  {line}" for line in value.strip().splitlines()]
        else:
            lines.append(f"{key}: {yaml_value(value)}")
    return "---\n" + "\n".join(lines) + "\n---\n\n" + body


def render(source):
    agent = tomllib.loads(source.read_text(encoding="utf-8"))
    plugin = source.parents[2]
    name = agent["name"]
    codex_name = name.replace("-", "_")
    head = {"name": name, "description": agent["description"]}
    instructions = agent["instructions"].strip()
    returns = agent["returns"].strip()
    codex = {**head, "name": codex_name, **agent["codex"]}
    return {
        plugin / "agents" / f"{name}.md": markdown(
            {**head, **agent["claude"]}, f"{instructions}\n\n{returns}\n"
        ),
        plugin / "harness" / "omp" / f"{name}.md": markdown(
            {**head, **agent["omp"]}, f"{instructions}\n\n{OMP_RETURNS}\n"
        ),
        plugin / "harness" / "codex" / f"{codex_name}.toml": "".join(
            f"{key} = {toml_value(value)}\n" for key, value in codex.items()
        ) + f"developer_instructions = '''\n{instructions}\n\n{returns}\n'''\n",
    }


def outputs():
    files = {}
    for source in sorted(REPO_ROOT.glob(SOURCES)):
        files.update(render(source))
    return files


def main():
    for path, text in outputs().items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        print(path.relative_to(REPO_ROOT))


if __name__ == "__main__":
    main()
