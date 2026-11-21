#!/usr/bin/env node
'use strict';
// Roda uma suíte isolada. Uso: node .ai-agent/helpers/run-tests.js [arquivo-ou-padrão]
const lib = require('./_run.js');

const root = lib.projectRoot();
const dir = lib.findAppDir(root);
if (!dir) { console.error('Nenhum package.json encontrado.'); process.exit(2); }
const pattern = process.argv[2];
const r = lib.runScript(root, dir, 'test', pattern ? [pattern] : []);
lib.printReport({ mode: 'test', appDir: dir, results: [r], passed: r.status !== 'failed' });
process.exit(r.status === 'failed' ? 1 : r.status === 'skipped' ? 2 : 0);
