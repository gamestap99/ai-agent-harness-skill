#!/usr/bin/env node
import { chmod } from 'node:fs/promises';
import path from 'node:path';
import {
  copyTemplate,
  detectPackageManager,
  detectProject,
  exists,
  initScriptFromCommands,
  loadHarnessFiles,
  parseArgs,
  scoreHarness,
  verificationCommands,
  writeText
} from './lib/harness-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: node scripts/improve-harness.mjs [--target DIR] [--apply] [--agent-file AGENTS.md|CLAUDE.md] [--package-manager npm|pnpm|yarn|bun]

Audits an existing harness and prints a concrete remediation for every failed check.
With --apply, scaffolds ONLY the standard files that are missing — it never overwrites
an existing file. This is the "improve" half of the skill: audit -> fixes -> optional gap-fill.`);
  process.exit(0);
}

// One remediation per scoreHarness check message. Keep them concrete and actionable.
// Unmapped failures fall back to a generic hint, so a message rename degrades gracefully.
const REMEDIATIONS = {
  'Agent instruction file exists': 'Add an AGENTS.md (or CLAUDE.md) at the repo root — the startup path and working rules an agent reads first.',
  'Startup workflow documented': 'Add a "Startup Workflow" section: confirm cwd, read this file, run ./init.sh, read feature_list.json, check recent commits.',
  'Definition of done documented': 'Add a "Definition of Done" section requiring implemented behavior + verification run + evidence recorded + restartable repo.',
  'Verification commands discoverable': 'Reference the verification path from the instruction file (`./init.sh` and the test/lint/type commands).',
  'State artifacts routed from instructions': 'Point the instruction file at `feature_list.json` and `progress.md` so the agent knows where state lives.',
  'Feature tracker exists': 'Add a feature_list.json with 3-5 features (id, name, description, dependencies, status, evidence).',
  'Feature tracker is valid (schema, one active feature, evidence on done)': 'Fix feature_list.json: each feature needs id/name/description/status; keep at most one feature "in-progress"; give every "done" feature non-empty evidence.',
  'Progress log exists': 'Add a progress.md session-continuity log.',
  'Progress log supports restart': 'Give progress.md the sections a restart needs: Current State, What is Done / In Progress / Next.',
  'Handoff captures blockers/files/next step': 'Record Blockers, Files changed, and Next Session steps in session-handoff.md (or progress.md).',
  'Verification entrypoint exists': 'Add an executable init.sh as the single startup + verification entrypoint.',
  'Verification runs a real command and fails fast (set -e)': 'init.sh must start with `set -e` and actually run something (install/test/build) — not just echo lines.',
  'Test command documented': 'Wire the real test command into init.sh (e.g. npm test / pytest / go test / cargo test).',
  'Static/build check documented': 'Add a static/build check to init.sh (type-check, lint, compile, or build).',
  'Verification evidence is recorded': 'Add an evidence slot (command + output) in feature_list.json or progress.md, and require filling it before "done".',
  'One-feature-at-a-time rule exists': 'Add a "one feature at a time" working rule to the instruction file.',
  'Feature dependencies are tracked': 'Add a `dependencies` array to each feature in feature_list.json.',
  'Feature status is explicit': 'Track an explicit `status` per feature (not-started / in-progress / blocked / done).',
  'Scope boundary documented': 'Add a "Stay in scope" rule: do not modify files unrelated to the active feature.',
  'Completion gate limits scope closure': 'Add a Definition of Done so a feature cannot be closed without meeting the gate.',
  'Startup script exists': 'Add init.sh (also serves as the startup entrypoint).',
  'End-of-session procedure exists': 'Add an "End of Session" checklist: update progress.md + feature_list.json, record blockers, leave a clean restart.',
  'Session handoff template exists': 'Add session-handoff.md for multi-session work.',
  'Session restart markers exist': 'Add restart markers (Last Updated, Current Objective, Recommended Next Step) to progress.md / session-handoff.md.',
  'Clean restart path documented': 'State that the next session can run ./init.sh immediately from a clean state.'
};

const target = path.resolve(args.target || args._[0] || process.cwd());
const apply = Boolean(args.apply);
const agentFile = args.agentFile
  || (await exists(path.join(target, 'CLAUDE.md')) ? 'CLAUDE.md' : 'AGENTS.md');

const before = scoreHarness(await loadHarnessFiles(target));

console.log(`Harness improvement plan for ${target}`);
console.log(`Current score: ${before.overall}/100 (bottleneck: ${before.bottleneck})`);
console.log('');

const failing = [];
for (const [subsystem, sub] of Object.entries(before.subsystems)) {
  for (const check of sub.checks) {
    if (!check.pass) failing.push({ subsystem, check });
  }
}

if (!failing.length) {
  console.log('No failing checks — the harness is structurally complete.');
  console.log('Remember: a full score is structural. Confirm real effectiveness with before/after agent sessions.');
  process.exit(0);
}

console.log(`${failing.length} check(s) to address, lowest subsystem first:`);
const order = Object.entries(before.subsystems).sort((a, b) => a[1].score - b[1].score).map(([name]) => name);
failing.sort((a, b) => order.indexOf(a.subsystem) - order.indexOf(b.subsystem));
for (const { subsystem, check } of failing) {
  const fix = REMEDIATIONS[check.message]
    || 'Review this subsystem against SKILL.md and add the missing artifact or section.';
  console.log('');
  console.log(`[${subsystem}] ${check.message}`);
  console.log(`  -> ${fix}`);
}

if (!apply) {
  console.log('');
  console.log('Re-run with --apply to scaffold only the standard files that are missing (never overwrites existing ones).');
  console.log('Text-level fixes (sections, rules) are edits you make by hand using the remediations above.');
  process.exit(0);
}

// --apply: scaffold ONLY missing standard files. copyTemplate with force:false is
// inherently non-destructive — an existing file is reported "skipped", never overwritten.
const project = await detectProject(target);
project.packageManager = detectPackageManager(target, args.packageManager);
const commands = verificationCommands(project, args.packageManager);
const replacements = {
  AGENT_FILE_NAME: agentFile,
  PROJECT_PURPOSE: project.stack === 'generic'
    ? 'Project harness for reliable agent-assisted development.'
    : `Project harness for reliable agent-assisted development in a ${project.stack} codebase.`,
  VERIFICATION_COMMANDS: commands.map((command) => `- \`${command}\``).join('\n'),
  PRIMARY_VERIFICATION_COMMAND: './init.sh',
  DESIGN_SECTION: ''
};

const results = [];
results.push(await copyTemplate('agents.md', path.join(target, agentFile), replacements, { force: false }));
results.push(await copyTemplate('feature-list.json', path.join(target, 'feature_list.json'), {}, { force: false }));
results.push(await copyTemplate('progress.md', path.join(target, 'progress.md'), {}, { force: false }));
results.push(await copyTemplate('session-handoff.md', path.join(target, 'session-handoff.md'), {}, { force: false }));

const initPath = path.join(target, 'init.sh');
if (!await exists(initPath)) {
  await writeText(initPath, initScriptFromCommands(commands));
  await chmod(initPath, 0o755);
  results.push({ path: initPath, status: 'written' });
} else {
  results.push({ path: initPath, status: 'skipped', reason: 'exists' });
}

console.log('');
console.log('Gap-fill (missing standard files only):');
for (const result of results) {
  console.log(`  ${result.status.toUpperCase()} ${path.relative(target, result.path)}${result.reason ? ` (${result.reason})` : ''}`);
}

const after = scoreHarness(await loadHarnessFiles(target));
console.log('');
console.log(`Score after gap-fill: ${after.overall}/100 (was ${before.overall}/100).`);
console.log('Scaffolding only fills structural gaps — fill placeholder features and the remaining text sections by hand.');
