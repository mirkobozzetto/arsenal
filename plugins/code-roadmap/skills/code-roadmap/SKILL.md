---
name: code-roadmap
description: Use when the user explicitly invokes the legacy code-roadmap command for advisory orientation. Prefer Arsenal for new tasks.
---

# Code roadmap compatibility alias

Resolve Arsenal from the live installed skill inventory and read its SKILL.md.
Pass through the user's context with an advisory-only outcome: recommend the
shortest sufficient route, without executing it. Arsenal owns all routing rules.
Never resolve this alias again from Arsenal.

If Arsenal is missing or unreadable, explain that code-roadmap now requires
Arsenal and offer its installation. Do not install automatically or maintain
a second routing implementation. For execution, invoke Arsenal with an explicit
implementation request.
