# Design System Pattern

The five core subsystems keep an agent on-track for *logic*: where to start, what's in scope, how to verify, how to resume. UI work has a parallel failure they don't cover — without a persistent, structured design source of truth, an agent regenerates visually inconsistent UI across sessions: different spacing, palette, radii, and type each time. Nothing in `progress.md` or `feature_list.json` catches "the button looks wrong."

A `DESIGN.md` is the persistent **design** artifact, the way `progress.md` is the persistent state artifact. This pattern adopts the [google-labs-code/design.md](https://github.com/google-labs-code/design.md) format so the design source of truth is machine-readable, not a screenshot or a Slack thread.

## When to add it

Add a `DESIGN.md` only when the project **renders UI** — web/mobile frontend, component libraries, design-token pipelines, Tailwind/CSS, or a Figma-to-code handoff. Skip it for pure backend, CLI, data, or library work. Like restraint, this is a conditional concern, not a universal subsystem — don't scaffold it into a harness that has no UI.

## The format (two layers)

A `DESIGN.md` is one file combining:

1. **YAML front matter — exact tokens.** `name` (required), plus optional `colors`, `typography`, `rounded`, `spacing`, and `components`. Components reference other tokens with brace syntax: `backgroundColor: "{colors.primary}"`, `typography: "{typography.label-md}"`. Colors accept hex, `rgb()`, `oklch()`, `color-mix()`, etc.
2. **Markdown body — the reasoning.** `##` sections, conventionally in order: Brand & Style, Colors, Typography, Layout & Spacing, Elevation & Depth, Shapes, Components, and Do's & Don'ts. Prose is normative narrative; tokens are exact values.

Agents consuming it must preserve unknown sections and tolerate non-standard token names; duplicate `##` headings are the one hard error.

## The one principle that matters

> The quality of a generated design is determined less by the precision of its values than by how clearly the intent is described.

Write **prose over tokens**, and **specific references over adjectives**: "1970s lecture handout" steers an agent better than "modern, clean, trustworthy," and specificity implies the negatives (what *not* to do) for free. A `DESIGN.md` that is all tokens and no story is a worse harness than one with vivid prose and a few tokens.

## How to bake it into a harness (minimal fold-in)

1. Put the `DESIGN.md` where the agent will find it — repo root by default, or `.stitch/DESIGN.md` if Stitch manages it (see below). Start from [templates/design.md](../templates/design.md) and fill the prose first, tokens second.
2. Add **one line** to the generated `AGENTS.md`/`CLAUDE.md`: *"UI work: read `DESIGN.md` and conform to it — it is the source of truth for color, type, spacing, radius, and components. Reuse its tokens; don't invent new values."* That pointer is what makes the artifact load-bearing; a `DESIGN.md` no instruction file references gets ignored.
3. Keep it to **one** canonical `DESIGN.md`. Don't over-tokenize — not every CSS value needs a token; capture intent and the handful of decisions that must stay consistent.

`create-harness.mjs --design` does steps 1-2 mechanically: it scaffolds `DESIGN.md` from the template, adds the Design pointer section to the instruction file, and leaves a commented `design.md lint` hook in `init.sh` to enable once the placeholders are filled.

## Generating the design with Google Stitch (optional)

A `DESIGN.md` *documents* a design; it doesn't *create* one. When a UI project is greenfield or getting a redesign, recommend **[Google Stitch](https://stitch.withgoogle.com)** — the Google-native UI generator that speaks this exact format (the `design.md` spec originates from Stitch's docs). It ships a **first-party MCP server** and an **official skill suite**, so an agent can drive the whole loop.

Two entry points, both from `google-labs-code`:

- **Stitch MCP** — register the server ([setup](https://stitch.withgoogle.com/docs/mcp/setup/); needs Stitch credentials). It exposes concrete tools: `create_project`, `generate_screen_from_text`, `generate_variants`, and `edit_screens` for generation; `upload_design_md` + `create_design_system_from_design_md` (plus `apply_design_system`, `list_design_systems`) to turn a `DESIGN.md` into a live Stitch design system. The official skills allow-list the whole namespace as `stitch*:*` (tools live under a `stitch` MCP prefix) with credentials bound at install (`authentication: ON_INSTALL`); scope it the same way — see [Tool Registry & Safety](tool-registry-pattern.md).
- **Stitch skills** ([`google-labs-code/stitch-skills`](https://github.com/google-labs-code/stitch-skills)) — install into Claude Code with `npx plugins add google-labs-code/stitch-skills --scope project --target claude-code`. Three plugins: `stitch-design` (generate/edit screens, `code-to-design`, `extract-design-md`), `stitch-utilities` (`design-md` and `taste-design` **emit a DESIGN.md**; `enhance-prompt`), and `stitch-build` (`react-components`, `react-native`, `shadcn-ui` — codegen from the design).

The round-trip is what makes it a harness fit:

1. **Generate** the UI in Stitch (`generate-design`), or **extract** it from existing code (`extract-design-md` / `code-to-design`).
2. **Emit** a `DESIGN.md` (`design-md`, or `taste-design` for a premium/anti-generic bar). Stitch's skills write it to `.stitch/DESIGN.md` (with a sibling `.stitch/metadata.json`) — commit that as the persistent design artifact this pattern is built around, and point the instruction file at that path.
3. Agents **conform** to it for hand-written UI, or **codegen** with `stitch-build` and keep code in sync via `manage-design-system`.

Recommend, don't require. Stitch is the richest path when the user wants generation *and* a canonical `DESIGN.md` in one loop; a hand-written `DESIGN.md` + the `design.md` CLI is the zero-dependency path. Both converge on the same artifact.

## Verification (this is the design subsystem's "tests")

The `@google/design.md` CLI turns the file into something runnable — wire the relevant command into `init.sh` for UI projects:

- `npx @google/design.md lint DESIGN.md` — validates structure, flags broken token references, and checks WCAG contrast ratios. This is the design equivalent of running tests before claiming done. Add `--format json` for machine-readable output.
- `npx @google/design.md export --format css-tailwind DESIGN.md > theme.css` — emits tokens into the codebase so hand-written styles and `DESIGN.md` don't drift (`json-tailwind` and `dtcg` formats are also available).
- `npx @google/design.md diff DESIGN.md DESIGN-v2.md` — catches design regressions between versions, the way a test suite catches logic regressions.

Package: `@google/design.md` (bins: `design.md`, or the dot-free `designmd` alias if a shell mangles the dotted name — `npx -p @google/design.md designmd lint DESIGN.md`). `npx @google/design.md spec` prints the full spec. If the CLI isn't available offline, the file still works as prose guidance; `lint` is the enhancement, not a hard dependency.

## Why this is not a scored subsystem

`validate-harness.mjs` scores the five *universal* structural files. Design is conditional (UI only), so — like restraint — don't add a design score there; a backend harness would fail a check for a file it correctly doesn't have. The real signal isn't "does `DESIGN.md` exist," it's "does `design.md lint` pass and does generated UI actually match the prose." Measure it with a before/after UI task, not a file-presence check.

## Guardrails

- `DESIGN.md` governs *appearance*, not *scope* or *logic* — it pairs with the five subsystems, it doesn't replace any.
- It's descriptive of intent, not a rigid spec. When prose and a token conflict, the prose is the intent; fix the token to match, and flag it.
- Don't let it balloon into a full manual. Same ethos as the root instruction file: the version an agent actually reads beats the exhaustive one it skims.
