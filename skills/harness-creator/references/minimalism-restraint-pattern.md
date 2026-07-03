# Minimalism & Restraint Pattern

The five core subsystems govern *structure and process* — how an agent starts, stays in scope, verifies, and resumes. None of them govern **restraint**: how much code the agent writes *inside* an in-scope feature.

That is a distinct axis. The "Scope" subsystem stops an agent from starting feature B while on feature A (feature-level boundary). It does nothing to stop the agent from building a factory, an interface, and a config layer when one line would do (code-level over-engineering). Agents over-build inside legitimately in-scope work constantly, and a structural harness alone does not catch it.

This pattern adds that axis, adapted from [ponytail](https://github.com/DietrichGebert/ponytail) ("lazy senior dev mode").

## The decision ladder

Before writing code, stop at the first rung that holds — but only *after* understanding the problem and tracing the real flow:

1. **Does this need to exist at all?** Speculative need → skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** A helper, util, type, or pattern that already lives here → reuse it.
3. **Standard library does it?** Use it.
4. **Native platform feature covers it?** (`<input type="date">` over a picker lib, CSS over JS, DB constraint over app code.)
5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
6. **Can it be one line?** One line.
7. **Only then:** the minimum code that works.

Bug fix = root cause, not symptom: grep every caller of the function you touch and fix the shared function once — a smaller diff than a guard per caller, and it doesn't leave sibling callers broken.

## What restraint is NOT lazy about

Never simplify away: understanding the problem (a small diff you don't understand is laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, or anything explicitly requested. Non-trivial logic still leaves **one** runnable check behind (an assert-based self-check or one small test file). Trivial one-liners need none.

## How to bake it into a harness (minimal fold-in)

The lightweight, portable option: the generated `AGENTS.md`/`CLAUDE.md` carries a short **Restraint** clause (the template already includes it). No hooks, no plugin, works in any agent. This is the default and matches the "keep the harness small" ethos.

Add nothing more unless the user asks. A one-paragraph clause the agent actually reads beats a subsystem it ignores.

## Always-on enforcement (opt-in per project)

The static clause is passive — it depends on the agent re-reading the instruction file. For per-turn enforcement, ponytail injects the ruleset into every turn via `SessionStart`/`SubagentStart`/`UserPromptSubmit` hooks and adds `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt` commands.

To install that into a project, point the user at the **`ponytail-resolve`** skill (`/ponytail-resolve`), which clones ponytail to a canonical location and symlinks its skills + wires its hooks into the project's `.claude/`. Reserve this for projects with a real over-engineering problem; the always-on injection is heavier and philosophically pushes deletion, which can fight tasks that genuinely need to build structure.

## Why this is not a scored subsystem

Restraint is a behavioral principle carried in the instruction file, not a file whose presence can be scored. `validate-harness.mjs` scores the five *structural* subsystems (files that exist or don't). Don't add a restraint score there — measure restraint the way ponytail does, with real before/after LOC / cost / correctness on representative tasks, not by checking for a file.

## Conflict guardrails

- Restraint governs *what you build*, not *how much you understand*. It shortens the solution, never the reading.
- It does not override an explicit request for the full version. User insists → build it, no re-arguing.
- It pairs with, but is orthogonal to, the Scope subsystem. Scope = which feature. Restraint = how much code within it.
