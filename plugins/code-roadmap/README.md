# code-roadmap

Orientation for the **start** of a coding task. Given an intent, `code-roadmap` matches it against the skills you have installed this session and prints a recommended chain of skills + a suggested execution mode + a suggested reflection level: options with a *why*, never a forced path. It is advisory only: it never launches a skill and never makes the choice for you.

---

## What it does

`code-roadmap` reads the **live** skill inventory (the list your agent already has in context), reasons about the *shape* of your task across a few signals (scope, independent surfaces, risk, ambiguity, repo familiarity), and prints:

```
CHAÎNE CANONIQUE
1. <skill>   : why
2. <skill>   : why

RÉFLEXION (suggérée) : <trivial | standard | deep | ultracode> : why
EXÉCUTION (à toi de choisir) :
  <option> → why
  <option> → why

ALTERNATIVES / GAP / À toi de choisir.
```

Because the inventory is read live, adding or removing a skill changes its routing next session with **zero edits** to the plugin: there is no hardcoded catalog to drift. It has **no Skill tool on purpose**: it structurally cannot execute anything, only orient.

---

## Install

```bash
/plugin marketplace add mirkobozzetto/arsenal
/plugin install code-roadmap@arsenal
```

## Usage

```bash
/code-roadmap migrate the auth module to the new token format
/code-roadmap par où commencer pour ajouter un cache Redis
```

## What it will and won't do

- **Will** suggest a chain (e.g. `prd → rfc → ship`), a reflection level, and an execution menu, each with a reason.
- **Will** point you to a creator skill or `find-skills` when nothing installed fits.
- **Won't** run any skill, force one executor, or set your effort level (it can *suggest* `ultracode`, but only you toggle `/effort`).

## Notes

The plugin references code-intelligence index gates and creator skills that you may or may not have installed: it only ever *suggests*, so adapt the printed chain to your own toolbox.
