---
name: harness-creator
description: >-
  Build, audit, and improve lightweight harnesses for AI coding agents: AGENTS.md/CLAUDE.md,
  feature state, verification workflows, scope boundaries, lifecycle handoff,
  memory persistence, context control, tool safety, and multi-agent coordination.
license: MIT
---

# Harness Creator

Use this skill to make a repository easier for coding agents to start, stay in scope, verify work, and resume across sessions. Keep the harness small enough that agents actually follow it.

Not for model selection, prompt tuning in isolation, chat UI design, or general app architecture.

## Core Model

Every useful coding-agent harness has five subsystems:

| Subsystem | Minimal artifact | Purpose |
|---|---|---|
| Instructions | `AGENTS.md` or `CLAUDE.md` | Startup path, working rules, definition of done |
| State | `feature_list.json`, `progress.md` | Current feature, status, evidence, next step |
| Verification | `init.sh` or documented commands | Tests/checks the agent must run before claiming done |
| Scope | Feature dependencies and done criteria | Prevents overreach and half-finished work |
| Lifecycle | `session-handoff.md`, end-of-session routine | Makes the next session restartable |

## First Move

1. Inspect what already exists: instruction files, feature/state files, verification commands, docs, package manifests.
2. Ask only for missing context that cannot be inferred safely: target agent, desired file name, tolerance for structure, and whether overwriting is allowed.
3. Prefer a minimal harness first. Add memory, tool safety, multi-agent, design-system, or benchmark details only when the user's problem calls for them.

## Common Tasks

### Create a harness

Use the bundled script when working on a local repository:

```bash
node skills/harness-creator/scripts/create-harness.mjs --target /path/to/project
```

Options:

- `--agent-file CLAUDE.md` for Claude-oriented projects.
- `--package-manager npm|pnpm|yarn|bun` when detection is wrong.
- `--commands "cmd one,cmd two"` for custom verification.
- `--design` for UI projects: also scaffolds `DESIGN.md` (google-labs-code/design.md format), a Design section in the instruction file, and a commented lint hook in `init.sh`. When any frontend project is detected (React/Vue/Svelte/Angular/Astro, Tailwind, static HTML+CSS, React Native/Flutter, …) without `--design`, the script suggests it — and Google Stitch as the generator — instead of scaffolding uninvited. If the Stitch MCP is not already configured (checked in `./.mcp.json` and `~/.claude.json`), the suggestion includes the `claude mcp add stitch …` command; if it is, it skips the command and just points the agent at the tools. See [Design System](references/design-system-pattern.md).
- `--force` only after confirming overwrites are acceptable.

Then explain what was created and how the user should replace placeholder feature entries.

### Audit an existing harness

Run:

```bash
node skills/harness-creator/scripts/validate-harness.mjs --target /path/to/project
```

Report the five subsystem scores, the lowest-scoring area, and the first 2-3 changes that would improve reliability. Treat the lowest score as a candidate bottleneck; confirm with failures, logs, or task outcomes before claiming causality.

The rubric assumes a feature-development repo. When the target has no project manifest and no feature tracker (a workspace, docs, or meta-repo), the script prints a caveat — read low state/lifecycle scores there as "not applicable", not as defects, and do not scaffold files the repo doesn't need to chase the number.

### Improve an existing harness

When a harness exists but scores below target, run:

```bash
node skills/harness-creator/scripts/improve-harness.mjs --target /path/to/project
```

It prints a concrete remediation for every failed check, lowest subsystem first. Text-level gaps (missing sections, rules) are hand edits you make from those remediations. To fill *structural* gaps mechanically, add `--apply`: it scaffolds only the standard files that are missing and never overwrites an existing one (existing files are reported "skipped"). Re-score with `validate-harness.mjs` afterward, and remember a structural fix is not a behavioral guarantee — confirm with a real agent session.

### Produce a report

Use when the user wants a shareable assessment:

```bash
node skills/harness-creator/scripts/render-assessment-html.mjs --target /path/to/project
node skills/harness-creator/scripts/run-benchmark.mjs --target /path/to/project --html /path/to/report.html
```

Be clear that this is a structural benchmark. Real effectiveness still needs before/after agent sessions on representative tasks.

## When to Read References

Load only the reference needed for the user's problem. The references serve two audiences — know which one you're in:

**Harnessing a repo** — the default. Artifacts an agent reads and writes in a project (`AGENTS.md`, state files, design, restraint):

- Design source of truth for UI/frontend work: [Design System](references/design-system-pattern.md)
- Restraint / anti-over-engineering: [Minimalism & Restraint](references/minimalism-restraint-pattern.md)
- Reusable workflows packaged as skills: [Skill Runtime](references/skill-runtime-pattern.md)
- Non-obvious failure modes: [Gotchas](references/gotchas.md)

**Building an agent runtime** — advanced. Mechanisms *inside* the agent (memory stores, tool gating, context budget, orchestration). Read these for the design principle; skip the runtime-implementation detail if you only need a repo harness:

- Memory across sessions: [Memory Persistence](references/memory-persistence-pattern.md)
- Context budget and progressive disclosure: [Context Engineering](references/context-engineering-pattern.md)
- Permissions, tools, concurrency: [Tool Registry & Safety](references/tool-registry-pattern.md)
- Delegation and parallel agents: [Multi-Agent Coordination](references/multi-agent-pattern.md)
- Hooks, startup, long-running work: [Lifecycle & Bootstrap](references/lifecycle-bootstrap-pattern.md)

## Design Rules

- Keep the root instruction file short: routing and invariants, not a full manual.
- Put project facts in project docs, not in the skill.
- Make verification commands explicit and runnable.
- Require evidence before marking a feature done.
- Use one active feature unless the harness has explicit multi-agent ownership boundaries.
- Prefer append/update state files over relying on chat history.
- Separate rules from state by *lifetime*: durable conventions (external-tool usage, delegation/review policy) belong in the instruction file; ephemeral state (current feature, progress) in state files. When a feature closes, promote the long-lived rules it produced out of the feature notes. See [Gotchas](references/gotchas.md) #18.
- For external async operations (generation, remote builds, cloud jobs), bake in: record fire timestamps, poll patiently, treat client timeout as "still running" not "failed", and never re-fire before the service's known latency elapses. See [Gotchas](references/gotchas.md) #16.
- Govern restraint, not just scope: bake a short minimalism clause (YAGNI → reuse → stdlib → native → one line) into the instruction file so agents don't over-build *inside* an in-scope feature. See [Minimalism & Restraint](references/minimalism-restraint-pattern.md); for always-on enforcement, point the user at the `ponytail-resolve` skill.
- For UI/frontend projects, give agents a persistent design source of truth: add a `DESIGN.md` (google-labs-code/design.md format) at the repo root and point the instruction file at it. Skip it for backend/CLI/library work. When the design must be *generated* (greenfield/redesign), recommend Google Stitch and its first-party MCP + `stitch-skills` suite, which emit that same `DESIGN.md`. See [Design System](references/design-system-pattern.md).
- Never hide destructive behavior in scripts; overwrites require explicit user approval.

## Deliverable Checklist

For a usable minimal harness, leave the target project with:

- [ ] `AGENTS.md` or `CLAUDE.md`
- [ ] `feature_list.json`
- [ ] `progress.md`
- [ ] `init.sh`
- [ ] Optional `session-handoff.md` for multi-session work
- [ ] Optional `DESIGN.md` (with an instruction-file pointer) for UI/frontend projects
- [ ] Documented verification evidence or next action

If you cannot create files, provide exact file contents and commands instead.
