#!/usr/bin/env bash
set -euo pipefail
dir="${1:-$PWD}"
pm="unknown"; lang="unknown"
if   [ -f "$dir/pnpm-lock.yaml" ];   then pm="pnpm";    lang="js"
elif [ -f "$dir/bun.lockb" ] || [ -f "$dir/bun.lock" ]; then pm="bun"; lang="js"
elif [ -f "$dir/yarn.lock" ];        then pm="yarn";    lang="js"
elif [ -f "$dir/package-lock.json" ];then pm="npm";     lang="js"
elif [ -f "$dir/Cargo.toml" ];       then pm="cargo";   lang="rust"
elif [ -f "$dir/go.mod" ];           then pm="go";      lang="go"
elif [ -f "$dir/uv.lock" ];          then pm="uv";      lang="python"
elif [ -f "$dir/pyproject.toml" ];   then pm="poetry";  lang="python"
elif [ -f "$dir/requirements.txt" ]; then pm="pip";     lang="python"
elif [ -f "$dir/Gemfile" ];          then pm="bundler"; lang="ruby"
elif [ -f "$dir/pom.xml" ];          then pm="maven";   lang="jvm"
elif [ -f "$dir/build.gradle" ] || [ -f "$dir/build.gradle.kts" ]; then pm="gradle"; lang="jvm"
elif [ -f "$dir/composer.json" ];    then pm="composer";lang="php"
fi
printf '{"language":"%s","package_manager":"%s"}\n' "$lang" "$pm"
