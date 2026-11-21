#!/usr/bin/env node
'use strict';
// Servidor MCP mínimo (stdio) que expõe só a alça de verificação do projeto.
// Não executa comandos arbitrários: apenas scripts npm da lista fixa abaixo.
const readline = require('node:readline');
const lib = require('./_run.js');

const METRIC_SCRIPTS = ['build', 'typecheck', 'lint', 'test', 'test:e2e'];
const TOOLS = [
  {
    name: 'run_verification',
    description: 'Roda a alça de verificação (typecheck, lint, depcheck e, no modo full, testes, build e e2e). Obrigatória antes de dar uma tarefa por concluída.',
    inputSchema: { type: 'object', properties: { mode: { type: 'string', enum: ['static', 'full'] } } },
  },
  {
    name: 'run_tests',
    description: 'Roda a suíte de testes isolada, opcionalmente filtrando por arquivo ou padrão.',
    inputSchema: { type: 'object', properties: { pattern: { type: 'string' } } },
  },
  {
    name: 'run_lint',
    description: 'Roda o linter e o verificador de tipos.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'capture_metrics',
    description: 'Mede o tempo (mediana de N execuções) de um script do projeto e guarda o log.',
    inputSchema: {
      type: 'object',
      properties: { script: { type: 'string', enum: METRIC_SCRIPTS }, runs: { type: 'integer', minimum: 1, maximum: 10 } },
      required: ['script'],
    },
  },
];

function withApp(fn) {
  const root = lib.projectRoot();
  const dir = lib.findAppDir(root);
  if (!dir) return { passed: false, error: 'Nenhum package.json encontrado.' };
  return fn(root, dir);
}

function callTool(name, args = {}) {
  switch (name) {
    case 'run_verification':
      return lib.verify(lib.projectRoot(), args.mode === 'static' ? 'static' : 'full');
    case 'run_tests':
      return withApp((root, dir) => {
        const r = lib.runScript(root, dir, 'test', args.pattern ? [String(args.pattern)] : []);
        return { passed: r.status !== 'failed', results: [r] };
      });
    case 'run_lint':
      return withApp((root, dir) => {
        const results = ['lint', 'typecheck'].map((s) => lib.runScript(root, dir, s));
        return { passed: results.every((r) => r.status !== 'failed'), results };
      });
    case 'capture_metrics':
      return withApp((root, dir) => {
        if (!METRIC_SCRIPTS.includes(args.script)) throw new Error('script não permitido');
        const runs = Math.min(10, Math.max(1, Number(args.runs) || 3));
        const times = [];
        let last;
        for (let i = 0; i < runs; i += 1) {
          last = lib.runScript(root, dir, args.script);
          if (last.status !== 'passed') break;
          times.push(last.ms);
        }
        times.sort((a, b) => a - b);
        return { passed: last.status !== 'failed', last, runs: times.length, medianMs: times[Math.floor(times.length / 2)] ?? null };
      });
    default:
      throw new Error(`ferramenta desconhecida: ${name}`);
  }
}

const send = (msg) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...msg })}\n`);

function handle(m) {
  if (m.id === undefined) return;
  try {
    switch (m.method) {
      case 'initialize':
        return send({ id: m.id, result: {
          protocolVersion: (m.params && m.params.protocolVersion) || '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'shell-verifier', version: '1.0.0' },
        } });
      case 'ping':
        return send({ id: m.id, result: {} });
      case 'tools/list':
        return send({ id: m.id, result: { tools: TOOLS } });
      case 'tools/call': {
        const { name, arguments: args } = m.params || {};
        let out;
        try {
          out = callTool(name, args);
        } catch (e) {
          return send({ id: m.id, result: { content: [{ type: 'text', text: String(e.message) }], isError: true } });
        }
        return send({ id: m.id, result: { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }], isError: out.passed === false } });
      }
      default:
        return send({ id: m.id, error: { code: -32601, message: `método não suportado: ${m.method}` } });
    }
  } catch (e) {
    return send({ id: m.id, error: { code: -32603, message: String(e.message) } });
  }
}

readline.createInterface({ input: process.stdin }).on('line', (line) => {
  try { handle(JSON.parse(line)); } catch (e) { process.stderr.write(`entrada inválida: ${e.message}\n`); }
});
