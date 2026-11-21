#!/usr/bin/env node
'use strict';
// Mede tempo, tamanho do build e guarda o log. Uso:
//   node .ai-agent/helpers/capture-metrics.js <script> [--runs 3] [--budget-ms 60000] [--dist dist]
const path = require('node:path');
const lib = require('./_run.js');

const ALLOWED = new Set(['build', 'typecheck', 'lint', 'test', 'test:e2e']);
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const script = argv[0];
if (!ALLOWED.has(script)) {
  console.error(`Uso: capture-metrics.js <${[...ALLOWED].join('|')}> [--runs N] [--budget-ms N] [--dist pasta]`);
  process.exit(2);
}
const runs = Math.max(1, Number(opt('--runs', 3)));
const budget = Number(opt('--budget-ms', 0));
const root = lib.projectRoot();
const dir = lib.findAppDir(root);
if (!dir) { console.error('Nenhum package.json encontrado.'); process.exit(2); }

const times = [];
let last;
for (let i = 0; i < runs; i += 1) {
  last = lib.runScript(root, dir, script);
  if (last.status === 'skipped') { console.error(last.reason); process.exit(2); }
  if (last.status === 'failed') break;
  times.push(last.ms);
}
const sorted = [...times].sort((a, b) => a - b);
const metrics = {
  script,
  status: last.status,
  runs: times.length,
  ms: { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], max: sorted[sorted.length - 1] },
  distBytes: lib.dirSize(path.join(dir, opt('--dist', 'dist'))),
  log: last.log,
  budgetMs: budget || null,
  withinBudget: budget && sorted.length ? sorted[Math.floor(sorted.length / 2)] <= budget : null,
};
console.log(JSON.stringify(metrics, null, 2));
process.exit(last.status === 'failed' || metrics.withinBudget === false ? 1 : 0);
