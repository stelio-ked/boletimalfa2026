#!/usr/bin/env node
'use strict';
// Roda o linter e o verificador de tipos. Uso: node .ai-agent/helpers/run-lint.js
const lib = require('./_run.js');

const root = lib.projectRoot();
const dir = lib.findAppDir(root);
if (!dir) { console.error('Nenhum package.json encontrado.'); process.exit(2); }
const results = ['lint', 'typecheck'].map((s) => lib.runScript(root, dir, s));
const passed = results.every((r) => r.status !== 'failed');
lib.printReport({ mode: 'lint', appDir: dir, results, passed });
process.exit(passed ? (results.some((r) => r.status === 'passed') ? 0 : 2) : 1);
