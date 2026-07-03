# ai-agent-harness-skill

The **harness-creator** skill for AI coding agents — build, audit, and improve lightweight harnesses so a repository is easy for an agent to start in, stay in scope, verify, and resume across sessions.

It covers the five core subsystems (instructions, state, verification, scope, lifecycle) plus optional add-ons: memory persistence, context engineering, tool safety, multi-agent coordination, minimalism/restraint, and a **design-system pattern** — a persistent `DESIGN.md` in the [google-labs-code/design.md](https://github.com/google-labs-code/design.md) format, with [Google Stitch](https://stitch.withgoogle.com) (first-party MCP + [`stitch-skills`](https://github.com/google-labs-code/stitch-skills)) as the optional generation front-end.

## The skill

Lives in [`skills/harness-creator/`](skills/harness-creator/). Start with its [SKILL.md](skills/harness-creator/SKILL.md) and [README](skills/harness-creator/README.md); load a [reference](skills/harness-creator/references/) only when the problem calls for it.

## Install

**Claude Code** — copy, or symlink for development (edit here, live immediately):

```bash
cp -r skills/harness-creator ~/.claude/skills/
# or, for development:
ln -s "$PWD/skills/harness-creator" ~/.claude/skills/harness-creator
```

**claude.ai** — upload `skills/harness-creator.zip`, or paste `SKILL.md` into the conversation.

## Use

The scripts use only Node.js built-ins:

```bash
node skills/harness-creator/scripts/create-harness.mjs   --target /path/to/project
node skills/harness-creator/scripts/validate-harness.mjs --target /path/to/project
```

## License

MIT — see [LICENSE](LICENSE).
