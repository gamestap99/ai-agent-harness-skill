<!--
  DESIGN.md — design source of truth for this project.
  Format: https://github.com/google-labs-code/design.md  (spec: docs/spec.md)

  Two layers: exact tokens in the YAML front matter, the reasoning in the prose body.
  Fill the PROSE first, tokens second — clear intent guides an agent better than exact values.
  Replace every REPLACE_ME. Delete token groups and sections the project doesn't use.
  Validate with:  npx @google/design.md lint DESIGN.md
-->
---
name: REPLACE_ME
description: REPLACE_ME  # one line: what this product is and who it's for
colors:
  # neutrals / surfaces
  background: "#ffffff"
  surface: "#ffffff"
  on-surface: "#151c27"
  outline: "#867461"
  # brand
  primary: "#REPLACE"
  on-primary: "#ffffff"
  primary-container: "#REPLACE"
  secondary: "#REPLACE"
  on-secondary: "#ffffff"
  # status
  error: "#ba1a1a"
  on-error: "#ffffff"
typography:
  display:
    fontFamily: REPLACE_ME
    fontSize: 44px
    fontWeight: "800"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: REPLACE_ME
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  body-md:
    fontFamily: REPLACE_ME
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: REPLACE_ME
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  lg: 1rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.sm}"
---

## Brand & Style

REPLACE_ME — the brand personality and emotional intent in a few sentences. Prefer a
concrete reference over adjectives: "1970s lecture handout," "high-end fintech dashboard,"
"kids' educational app." Specificity implies what to avoid, for free.

## Colors

REPLACE_ME — what the palette is doing and when to reach for each role (primary drives
action, secondary is calmer/administrative, neutrals keep it premium, on-* pairs guarantee contrast).

## Typography

REPLACE_ME — the font choice and why, plus how headline / body / label roles create hierarchy.

## Layout & Spacing

REPLACE_ME — grid model, whitespace philosophy, and the base spacing rhythm (e.g. strict 8px scale).

## Elevation & Depth

REPLACE_ME — how depth is expressed (shadows, tonal layers) and how interactive elements respond.

## Shapes

REPLACE_ME — the corner-radius philosophy and what each radius level is used for.

## Components

REPLACE_ME — styling guidance and interaction states for the key components (buttons, inputs, cards, lists).

## Do's & Don'ts

- Do: REPLACE_ME
- Don't: REPLACE_ME
