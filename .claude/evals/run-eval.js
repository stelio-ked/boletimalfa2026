#!/usr/bin/env node
'use strict';
/*
 * Eval de skills: roda cada cenário num diretório TEMPORÁRIO isolado (cópia das regras + fixture,
 * repositório git próprio) e nunca toca o repositório principal.
 *
 * Uso:
 *   node .ai-agent/evals/run-eval.js [--scenario <id>] [--rules <pasta>] [--model sonnet]
 *        [--judge-model opus] [--threshold 8] [--max-turns 30] [--out <pasta>] [--keep] [--dry-run]
 *
 *   --rules   pasta com AGENTS.md e .ai-agent/ da VARIANTE a testar (padrão: este projeto).
 *             Use para comparar mudanças de regras (hill climbing) sem alterar o original.
 *   --dry-run valida cenários/rubricas e monta o sandbox, sem chamar o modelo.
 * Sai com código 1 se algum cenário ficar abaixo do limite.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const EVALS = __dirname;
const DEFAULT_RULES = path.resolve(EVALS, '..', '..');

function parseArgs(argv) {
  const a = { threshold: 8, model: 'sonnet', judgeModel: 'opus', maxTurns: 30, rules: DEFAULT_RULES, keep: false, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === '--scenario') a.scenario = next();
    else if (k === '--rules') a.rules = path.resolve(next());
    else if (k === '--model') a.model = next();
    else if (k === '--judge-model') a.judgeModel = next();
    else if (k === '--threshold') a.threshold = Number(next());
    else if (k === '--max-turns') a.maxTurns = Number(next());
    else if (k === '--out') a.out = path.resolve(next());
    else if (k === '--keep') a.keep = true;
    else if (k === '--dry-run') a.dryRun = true;
    else { console.error(`Opção desconhecida: ${k}`); process.exit(2); }
  }
  return a;
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const listJson = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.json')).sort();

function loadAll(only) {
  const rubrics = {};
  for (const f of listJson(path.join(EVALS, 'rubrics'))) {
    const r = readJson(path.join(EVALS, 'rubrics', f));
    rubrics[r.id] = r;
  }
  let scenarios = listJson(path.join(EVALS, 'scenarios')).map((f) => readJson(path.join(EVALS, 'scenarios', f)));
  if (only) scenarios = scenarios.filter((s) => s.id === only);
  return { rubrics, scenarios };
}

function validate({ rubrics, scenarios }) {
  const errors = [];
  if (!scenarios.length) errors.push('nenhum cenário encontrado');
  for (const r of Object.values(rubrics)) {
    const sum = r.criteria.reduce((t, c) => t + c.points, 0);
    if (sum !== 10) errors.push(`rubrica ${r.id}: pontos somam ${sum}, devem somar 10`);
  }
  for (const s of scenarios) {
    if (!rubrics[s.rubric]) errors.push(`cenário ${s.id}: rubrica "${s.rubric}" não existe`);
    if (!fs.existsSync(path.join(EVALS, s.fixture))) errors.push(`cenário ${s.id}: fixture "${s.fixture}" não existe`);
    if (!s.prompt) errors.push(`cenário ${s.id}: sem prompt`);
  }
  return errors;
}

function run(cmd, args, opts = {}) {
  const win = process.platform === 'win32';
  const finalArgs = win ? args.map((x) => (/[\s()]/.test(x) ? `"${x}"` : x)) : args;
  return spawnSync(cmd, finalArgs, { encoding: 'utf8', maxBuffer: 1 << 28, shell: win && cmd === 'claude', ...opts });
}

const git = (cwd, ...a) => run('git', ['-c', 'user.name=eval', '-c', 'user.email=eval@example.invalid', '-c', 'commit.gpgsign=false', ...a], { cwd });

function makeSandbox(sc, rules) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ked-eval-'));
  for (const f of ['AGENTS.md', 'CLAUDE.md']) {
    if (fs.existsSync(path.join(rules, f))) fs.copyFileSync(path.join(rules, f), path.join(dir, f));
  }
  const skip = new Set(['work', 'evals', '__pycache__']);
  fs.cpSync(path.join(rules, '.ai-agent'), path.join(dir, '.ai-agent'), {
    recursive: true,
    filter: (src) => !skip.has(path.basename(src)) && !src.endsWith('.local.txt'),
  });
  fs.cpSync(path.join(EVALS, sc.fixture), dir, { recursive: true, force: true });
  const sync = path.join(dir, '.ai-agent', 'scripts', 'sync_adapters.py');
  if (fs.existsSync(sync)) {
    const r = ['python3', 'python'].map((p) => run(p, [sync], { cwd: dir })).find((x) => x.status === 0);
    if (!r) console.warn('  aviso: sync_adapters.py não rodou (python ausente?); .claude/ não foi gerado');
  }
  git(dir, 'init', '-q');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'base');
  return dir;
}

function analyzeStream(text) {
  const events = [];
  let finalText = '';
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type === 'assistant') {
      for (const c of (e.message && e.message.content) || []) {
        if (c.type === 'tool_use') events.push({ name: c.name, input: c.input || {} });
      }
    } else if (e.type === 'result') finalText = e.result || '';
  }
  return { events, finalText };
}

const WRITE = /^(Edit|Write|MultiEdit|NotebookEdit)$/;
const AUTO = {
  readFeatureMap: ({ events }) => {
    for (const ev of events) {
      if (WRITE.test(ev.name)) return false;
      const ref = ev.input.file_path || ev.input.command || ev.input.path || '';
      if (/feature_map\.md/.test(ref)) return true;
    }
    return events.some((ev) => /feature_map\.md/.test(ev.input.file_path || ev.input.command || ''));
  },
  verificationRun: ({ events }) => events.some((ev) => /run_verification/.test(ev.name)
    || (ev.name === 'Bash' && /helpers[\\/](verify|run-lint|run-tests)\.js/.test(ev.input.command || ''))),
  changedExpectedFiles: ({ changed, sc }) => (sc.checks.mustChange || []).every((f) => changed.includes(f)),
  noForbiddenPatterns: ({ diff, sc }) => {
    const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
    return !(sc.checks.forbiddenPatterns || []).some((p) => added.some((l) => new RegExp(p).test(l)));
  },
};

function collectChanges(dir) {
  git(dir, 'add', '-A');
  const ex = ':(exclude).ai-agent/work/tmp';
  const names = git(dir, 'diff', '--cached', '--name-only', '--', '.', ex).stdout.split('\n').filter(Boolean);
  const diff = git(dir, 'diff', '--cached', '--', '.', ex).stdout;
  return { changed: names, diff };
}

const clip = (t, n) => (t.length > n ? `${t.slice(0, n)}\n[... cortado ...]` : t);

function judge(sc, rubric, ctx, args) {
  const items = rubric.criteria.filter((c) => c.type === 'judge');
  if (!items.length) return {};
  const prompt = [
    'Você é um juiz imparcial. Avalie o trabalho de um agente de IA contra os critérios abaixo, usando SOMENTE as evidências fornecidas.',
    'Dê pontos inteiros de 0 até o máximo de cada critério. Sem evidência clara, dê 0.',
    `\nTAREFA PEDIDA AO AGENTE:\n${sc.prompt}`,
    `\nCRITÉRIOS:\n${items.map((c) => `- id=${c.id} (máx ${c.points}): ${c.description}`).join('\n')}`,
    `\nRESPOSTA FINAL DO AGENTE:\n${clip(ctx.finalText, 6000)}`,
    `\nDIFF PRODUZIDO:\n${clip(ctx.diff || '(nenhuma alteração)', 20000)}`,
    '\nResponda APENAS com JSON: {"scores":[{"id":"...","points":0,"evidence":"..."}]}',
  ].join('\n');
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'ked-judge-'));
  const r = run('claude', ['-p', '--output-format', 'json', '--model', args.judgeModel, '--max-turns', '1'], { cwd: empty, input: prompt, timeout: 300000 });
  fs.rmSync(empty, { recursive: true, force: true });
  const out = {};
  try {
    const text = JSON.parse(r.stdout).result;
    const parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    for (const s of parsed.scores) out[s.id] = { points: s.points, evidence: s.evidence };
  } catch (e) {
    console.warn(`  aviso: resposta do juiz inválida (${e.message}); critérios de juiz = 0`);
  }
  return out;
}

function scoreScenario(sc, rubric, ctx, args) {
  const judged = judge(sc, rubric, ctx, args);
  const rows = rubric.criteria.map((c) => {
    if (c.type === 'auto') {
      const ok = AUTO[c.check](ctx);
      return { id: c.id, type: 'auto', max: c.points, points: ok ? c.points : 0, evidence: c.check };
    }
    const j = judged[c.id] || { points: 0, evidence: 'sem avaliação' };
    return { id: c.id, type: 'judge', max: c.points, points: Math.max(0, Math.min(c.points, Math.round(j.points))), evidence: j.evidence };
  });
  return { rows, total: rows.reduce((t, r) => t + r.points, 0) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const all = loadAll(args.scenario);
  const errors = validate(all);
  if (errors.length) { console.error(`Cenários/rubricas inválidos:\n  - ${errors.join('\n  - ')}`); process.exit(2); }
  if (!fs.existsSync(path.join(args.rules, '.ai-agent'))) { console.error(`--rules sem .ai-agent/: ${args.rules}`); process.exit(2); }

  const outDir = args.out || path.join(os.tmpdir(), 'ked-eval-reports', new Date().toISOString().replace(/[:.]/g, '-'));
  const report = { rules: args.rules, model: args.model, judgeModel: args.judgeModel, threshold: args.threshold, results: [] };
  let failed = false;

  for (const sc of all.scenarios) {
    console.log(`\n== ${sc.id} (${sc.skill})`);
    const dir = makeSandbox(sc, args.rules);
    if (args.dryRun) {
      const n = fs.readdirSync(dir, { recursive: true }).length;
      console.log(`  dry-run: sandbox ok em ${dir} (${n} entradas); modelo não chamado`);
      report.results.push({ id: sc.id, dryRun: true });
    } else {
      const tools = 'Read,Edit,Write,Glob,Grep,Bash(node:*),Bash(npm:*)';
      const r = run('claude', ['-p', '--output-format', 'stream-json', '--verbose', '--model', args.model, '--max-turns', String(args.maxTurns), '--permission-mode', 'acceptEdits', '--allowedTools', tools], { cwd: dir, input: sc.prompt, timeout: 15 * 60 * 1000 });
      const { events, finalText } = analyzeStream(r.stdout || '');
      const { changed, diff } = collectChanges(dir);
      const s = scoreScenario(sc, all.rubrics[sc.rubric], { events, finalText, changed, diff, sc }, args);
      const pass = s.total >= args.threshold;
      failed = failed || !pass;
      console.log(`  nota ${s.total}/10 ${pass ? 'OK' : 'ABAIXO DO LIMITE'}`);
      for (const row of s.rows) console.log(`    ${row.points}/${row.max} ${row.id} [${row.type}]${row.type === 'judge' ? ` — ${row.evidence}` : ''}`);
      report.results.push({ id: sc.id, skill: sc.skill, total: s.total, pass, criteria: s.rows, changed, toolCalls: events.length });
    }
    if (args.keep) console.log(`  sandbox mantido: ${dir}`);
    else fs.rmSync(dir, { recursive: true, force: true });
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\nRelatório: ${path.join(outDir, 'report.json')}`);
  process.exit(failed ? 1 : 0);
}

main();
