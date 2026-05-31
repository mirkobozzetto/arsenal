---
artifact: "{artifact_path}"
stack: "{detected_stack.language} / {detected_stack.package_manager}"
generated: "{date}"
ran_by: "user"
---

# Verification Bundle — {feature_or_rfc_title}

> ship does NOT run these by default (your rule: tests/builds are yours). Run them yourself; each line states what it proves and the expected pass signal. Commands are STACK-DETECTED, not assumed.

## Safe checks (you run; --yolo may run these)

| Command | Validates | Expected pass signal |
|---------|-----------|----------------------|
| `{detected typecheck_cmd}` | types compile | exit 0, no errors |
| `{detected lint_cmd}` | style/static | exit 0 |
| `{detected test_cmd}` | C1, C3 (acceptance) | all green |
| `{detected build_cmd}` | bundles | exit 0 |

## Destructive / stateful (USER ONLY — ship never runs, even --yolo)

| Command | Validates | Warning |
|---------|-----------|---------|
| `{migration cmd}` | schema change | mutates DB — run only after review |
| `{deploy cmd}` | release | outward-facing — your call |

## Contract coverage

- C1 -> {command / self-check that covers it}
- C2 -> {...}
- Uncovered criteria (manual check needed): {list or "none"}
