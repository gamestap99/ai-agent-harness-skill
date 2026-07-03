#!/usr/bin/env node
import path from 'node:path';
import {
  detectProject,
  formatScoreReport,
  htmlReport,
  loadHarnessFiles,
  parseArgs,
  scoreHarness,
  writeText
} from './lib/harness-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(`Usage: node scripts/validate-harness.mjs [--target DIR] [--json] [--html FILE]

Scores a project harness across five subsystems:
  instructions, state, verification, scope, lifecycle

Exit code is 0 when the harness scores at least --min-score (default 70).`);
  process.exit(0);
}

const target = path.resolve(args.target || args._[0] || process.cwd());
const minScore = Number(args.minScore || 70);
const files = await loadHarnessFiles(target);
const result = scoreHarness(files);

const project = await detectProject(target);
const hasTracker = files.some((file) => file.path === 'feature_list.json' || file.path === 'feature-list.json');
if (project.stack === 'generic' && !hasTracker) {
  result.caveat = 'No project manifest or feature tracker detected. This rubric assumes a feature-development repo; for a workspace, docs, or meta-repo, low state/lifecycle scores mean "not applicable", not "broken". Harness only what the repo actually needs.';
}

if (args.html) {
  const htmlPath = path.resolve(args.html);
  await writeText(htmlPath, htmlReport(result, `Harness Assessment: ${path.basename(target)}`));
  console.log(`HTML report written to ${htmlPath}`);
}

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(formatScoreReport(result, target));
  if (result.caveat) {
    console.log(`Note: ${result.caveat}`);
  }
}

if (result.overall < minScore) {
  process.exitCode = 1;
}
