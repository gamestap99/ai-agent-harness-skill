# harness-creator

A compact skill for building and auditing harnesses around AI coding agents.

It helps a repository provide five things agents need: instructions, state, verification, scope boundaries, and lifecycle handoff.

## Install

Symlink it for live development (edits here are immediately active):

```bash
ln -s "$PWD/skills/harness-creator" ~/.claude/skills/harness-creator
```

Or install a plain copy on a machine without this repo:

```bash
cp -r skills/harness-creator ~/.claude/skills/
```

For claude.ai, upload `skills/harness-creator.zip` or paste `SKILL.md` into the conversation.

## Use

```bash
node skills/harness-creator/scripts/create-harness.mjs --target /path/to/project
node skills/harness-creator/scripts/validate-harness.mjs --target /path/to/project
node skills/harness-creator/scripts/improve-harness.mjs --target /path/to/project
node skills/harness-creator/scripts/run-benchmark.mjs --target /path/to/project --html /path/to/report.html
```

The scripts use only Node.js built-in modules. They can be run after copying the skill directory into another repository.

## What It Creates

- `AGENTS.md` or `CLAUDE.md`
- `feature_list.json`
- `progress.md`
- `init.sh`
- `session-handoff.md`
- `DESIGN.md` — only with `--design`, for UI/frontend projects

`create-harness.mjs` detects common project types and package managers. It supports Node/npm/pnpm/yarn/bun, Python, Go, Rust, Maven, Gradle, and .NET at a basic verification-command level.

## What It Improves

`improve-harness.mjs` audits an existing harness, prints a concrete remediation for every failed check, and — with `--apply` — scaffolds only the standard files that are missing (never overwriting what already exists). It backs the "improve" half of the skill: audit → actionable fixes → optional gap-fill.

## What It Checks

`validate-harness.mjs` scores the five harness subsystems:

1. Instructions
2. State
3. Verification
4. Scope
5. Lifecycle

The score is structural. It tells you whether the harness is present and coherent; it does not replace real before/after agent-session testing.

## Status

- [x] Minimal harness scaffolding
- [x] Five-subsystem validation (structural anchors + semantic checks)
- [x] Non-destructive improve / gap-fill path
- [x] Optional `DESIGN.md` design-system scaffold for UI projects
- [x] HTML assessment report
- [x] Structural benchmark report
- [x] 12 eval cases
- [x] Generic verification detection for common stacks
- [ ] Optional real before/after agent-session replay

## Files

```text
harness-creator/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── scripts/
│   ├── create-harness.mjs
│   ├── validate-harness.mjs
│   ├── improve-harness.mjs
│   ├── render-assessment-html.mjs
│   ├── run-benchmark.mjs
│   └── lib/harness-utils.mjs
├── templates/
│   ├── agents.md
│   ├── design.md
│   ├── feature-list.json
│   ├── feature-list.schema.json
│   ├── init.sh
│   ├── progress.md
│   └── session-handoff.md
├── references/
│   ├── context-engineering-pattern.md
│   ├── design-system-pattern.md
│   ├── gotchas.md
│   ├── lifecycle-bootstrap-pattern.md
│   ├── memory-persistence-pattern.md
│   ├── minimalism-restraint-pattern.md
│   ├── multi-agent-pattern.md
│   ├── skill-runtime-pattern.md
│   └── tool-registry-pattern.md
└── evals/evals.json
```

## Boundaries

This skill is for harness engineering, not model selection, prompt tuning alone, or app architecture. Keep project-specific facts in the target repository.
