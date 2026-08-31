#!/usr/bin/env python3
"""Install or uninstall Arsenal task agents for one harness."""

import argparse
import hashlib
import json
import shutil
from pathlib import Path

PLUGIN_ROOT = Path(__file__).resolve().parents[3]
MANIFEST_NAME = ".arsenal-agent-install.json"
HARNESS = {
    "omp": {
        "source": PLUGIN_ROOT / "agents" / "omp",
        "target": Path.home() / ".omp" / "agent" / "agents",
        "suffix": ".md",
    },
    "codex": {
        "source": PLUGIN_ROOT / "agents" / "codex",
        "target": Path.home() / ".codex" / "agents",
        "suffix": ".toml",
    },
}


def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_manifest(path, harness):
    if not path.exists():
        return {"version": 1, "harness": harness, "files": {}}
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("harness") != harness or not isinstance(data.get("files"), dict):
        raise SystemExit(f"Refusing incompatible manifest: {path}")
    return data


def save_manifest(path, manifest):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def install(harness, target):
    settings = HARNESS[harness]
    source = settings["source"]
    sources = sorted(source.glob(f"*{settings['suffix']}"))
    if not sources:
        raise SystemExit(f"No bundled {harness} agents found in {source}")

    target.mkdir(parents=True, exist_ok=True)
    manifest_path = target / MANIFEST_NAME
    manifest = load_manifest(manifest_path, harness)
    backup_dir = target / ".arsenal-agent-backups"
    summary = {"installed": [], "unchanged": [], "backed_up": []}

    for source_path in sources:
        destination = target / source_path.name
        previous = manifest["files"].get(source_path.name, {})
        source_digest = file_hash(source_path)

        if destination.exists() and file_hash(destination) == source_digest:
            previous["installed_hash"] = source_digest
            previous.setdefault("backup", None)
            manifest["files"][source_path.name] = previous
            summary["unchanged"].append(source_path.name)
            continue

        backup = previous.get("backup")
        if destination.exists():
            backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = backup_dir / f"{source_path.name}.bak"
            shutil.copy2(destination, backup_path)
            backup = str(backup_path.relative_to(target))
            summary["backed_up"].append(source_path.name)

        shutil.copy2(source_path, destination)
        manifest["files"][source_path.name] = {
            "backup": backup,
            "installed_hash": source_digest,
        }
        summary["installed"].append(source_path.name)

    save_manifest(manifest_path, manifest)
    print(json.dumps(summary, sort_keys=True))


def uninstall(harness, target):
    manifest_path = target / MANIFEST_NAME
    if not manifest_path.exists():
        print(json.dumps({"restored": [], "removed": [], "preserved": []}))
        return

    manifest = load_manifest(manifest_path, harness)
    summary = {"restored": [], "removed": [], "preserved": []}
    unresolved = {}

    for name, entry in sorted(manifest["files"].items()):
        destination = target / name
        installed_hash = entry.get("installed_hash")
        backup = entry.get("backup")

        if destination.exists() and file_hash(destination) != installed_hash:
            summary["preserved"].append(name)
            unresolved[name] = entry
            continue

        if destination.exists():
            destination.unlink()
            summary["removed"].append(name)

        if backup:
            backup_path = target / backup
            if backup_path.exists():
                shutil.copy2(backup_path, destination)
                backup_path.unlink()
                summary["restored"].append(name)

    if unresolved:
        manifest["files"] = unresolved
        save_manifest(manifest_path, manifest)
    else:
        manifest_path.unlink()

    print(json.dumps(summary, sort_keys=True))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("install", "uninstall"))
    parser.add_argument("harness", choices=tuple(HARNESS))
    parser.add_argument("--target-dir", type=Path)
    args = parser.parse_args()

    target = args.target_dir.expanduser() if args.target_dir else HARNESS[args.harness]["target"]
    if args.action == "install":
        install(args.harness, target)
    else:
        uninstall(args.harness, target)


if __name__ == "__main__":
    main()
