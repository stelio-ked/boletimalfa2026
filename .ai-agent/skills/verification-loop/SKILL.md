---
name: verification-loop
description: Fecha a alça de verificação antes de dar qualquer tarefa por concluída — checagens estáticas, compilação, testes e teste em runtime via MCP. Use ao final de TODA mudança de código.
argument-hint: "[static|full]"
---

# Alça de verificação

Garantir, de forma comprovada, que a mudança funciona para quem usa a aplicação antes de dizer "pronto".

## Regra inegociável

NENHUMA tarefa é considerada concluída sem que a alça de verificação (testes estáticos, compilação e teste E2E/runtime via MCP) seja executada e validada autonomamente.

## Passos

1. Rode `node .ai-agent/helpers/verify.js` (ou a ferramenta MCP `run_verification` do `shell-verifier`). Use `--static` só durante o desenvolvimento.
2. Se algo falhar, leia o log indicado (`.ai-agent/work/tmp/logs/`), corrija a causa e rode de novo. Não use `any`, `@ts-ignore` nem desligue regras para passar.
3. Runtime: com o MCP `playwright`, suba a aplicação, abra a rota afetada (veja `.ai-agent/feature_map.md`), exercite o fluxo pelos `data-testid` e leia o console. Erro de console ou rede é falha.
4. Desempenho de interface: meça com `node .ai-agent/helpers/capture-metrics.js build` e, no navegador, confirme que a interação não passa de 16 ms por quadro quando a mudança mexe em renderização.
5. Só então reporte.

## Regras

- Nunca escreva "funciona" sem ter rodado os passos 1 e 3. Se algo não pôde rodar (sem servidor, sem script), diga qual passo ficou de fora e por quê.
- Mudança sem tela (só back-end ou biblioteca): os passos 1 e 2 bastam, e o passo 3 vira teste de integração.

## Encerramento

Entregue uma tabela curta: ✅ passou / ⚠ atenção / ❌ bloqueia para tipos, lint, dependências, testes, build e runtime, com o caminho dos logs.
