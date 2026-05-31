#!/usr/bin/env bash
set -euo pipefail
out="${1:?usage: scaffold.sh <output_dir>}"
here="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$out"
for t in contract verification-bundle trace; do
  if [ -f "$out/$t.md" ]; then
    echo "skip (exists): $out/$t.md"
  else
    cp "$here/templates/$t.md" "$out/$t.md"
    echo "created: $out/$t.md"
  fi
done
