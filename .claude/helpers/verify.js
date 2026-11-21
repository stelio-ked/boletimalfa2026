#!/usr/bin/env node
'use strict';
// Alça de verificação completa. Uso: node .ai-agent/helpers/verify.js [--static] [--json] [--allow-empty] [--cwd <pasta>]
const lib = require('./_run.js');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const cwdIdx = argv.indexOf('--cwd');
const root = lib.projectRoot(cwdIdx >= 0 ? argv[cwdIdx + 1] : undefined);
const report = lib.verify(root, flag('--static') ? 'static' : 'full');

if (flag('--json')) console.log(JSON.stringify(report, null, 2));
else lib.printReport(report);

if (!report.passed) process.exit(1);
if (report.ran === 0 && !flag('--allow-empty')) {
  console.error('Nenhuma verificação rodou (faltam scripts typecheck/lint/test em package.json). Use --allow-empty só em projeto sem app JS.');
  process.exit(2);
}
