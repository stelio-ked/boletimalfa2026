'use strict';
// Biblioteca comum dos helpers de verificação (sem dependências externas).
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const STATIC_STEPS = ['typecheck', 'lint', 'depcheck'];
const FULL_STEPS = [...STATIC_STEPS, 'test', 'build', 'test:e2e'];
const SAFE_ARG = /^[A-Za-z0-9_@/.\-*]+$/;

function projectRoot(cwd) {
  return path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

function findAppDir(root) {
  for (const dir of [root, path.join(root, 'frontend')]) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
  }
  return null;
}

function scriptsOf(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).scripts || {};
  } catch {
    return {};
  }
}

function tail(text, lines) {
  return text.split(/\r?\n/).slice(-lines).join('\n');
}

function validateArgs(args) {
  for (const a of args) {
    if (!SAFE_ARG.test(a) || a.startsWith('-')) {
      throw new Error(`Argumento recusado por segurança: "${a}"`);
    }
  }
}

function runScript(root, dir, name, extra = []) {
  const scripts = scriptsOf(dir);
  if (!scripts[name]) {
    return { step: name, status: 'skipped', reason: `script "${name}" não existe em package.json` };
  }
  validateArgs(extra);
  const args = ['run', name, '--silent'];
  if (extra.length) args.push('--', ...extra);
  const started = Date.now();
  const opts = { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 28, env: process.env };
  const r = process.platform === 'win32'
    ? spawnSync(`npm ${args.join(' ')}`, { ...opts, shell: true })
    : spawnSync('npm', args, opts);
  const ms = Date.now() - started;
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const logDir = path.join(root, '.ai-agent', 'work', 'tmp', 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `${name.replace(/[^\w-]/g, '_')}.log`);
  fs.writeFileSync(logFile, out);
  const ok = r.status === 0;
  return {
    step: name,
    status: ok ? 'passed' : 'failed',
    code: r.status,
    ms,
    log: path.relative(root, logFile).split(path.sep).join('/'),
    tail: ok ? undefined : tail(out, 60),
  };
}

function verify(root, mode) {
  const dir = findAppDir(root);
  if (!dir) return { mode, appDir: null, results: [], ran: 0, passed: true, note: 'nenhum package.json encontrado' };
  const steps = mode === 'static' ? STATIC_STEPS : FULL_STEPS;
  const results = steps.map((s) => runScript(root, dir, s));
  const ran = results.filter((r) => r.status !== 'skipped').length;
  const passed = results.every((r) => r.status !== 'failed');
  return { mode, appDir: path.relative(root, dir) || '.', results, ran, passed };
}

function dirSize(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}

function printReport(report) {
  const icon = { passed: 'OK   ', failed: 'FALHA', skipped: 'pulou' };
  console.log(`Verificação (${report.mode}) em ${report.appDir ?? '-'}`);
  if (report.note) console.log(`  ${report.note}`);
  for (const r of report.results) {
    const extra = r.status === 'skipped' ? r.reason : `${r.ms} ms · log: ${r.log}`;
    console.log(`  [${icon[r.status]}] ${r.step} — ${extra}`);
    if (r.tail) console.log(r.tail.split('\n').map((l) => `      ${l}`).join('\n'));
  }
  console.log(report.passed ? 'RESULTADO: aprovado' : 'RESULTADO: REPROVADO');
}

module.exports = {
  STATIC_STEPS, FULL_STEPS, projectRoot, findAppDir, runScript, verify, dirSize, printReport, validateArgs,
};
