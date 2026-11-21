# Evals das skills

Testes de regressão para as regras e skills do agente. Cada cenário roda num diretório temporário isolado.

- `scenarios/`: caso de teste (prompt, fixture, regras de checagem automática).
- `rubrics/`: rubrica de 0 a 10; critérios `auto` (calculados pelo script) e `judge` (nota de um modelo juiz diferente do agente).
- `fixtures/`: mini-projetos copiados para o sandbox.
- `run-eval.js`: executa tudo e gera `report.json` fora do repositório.

```
node .ai-agent/evals/run-eval.js --dry-run                 # valida e monta o sandbox, sem modelo
node .ai-agent/evals/run-eval.js --scenario ui-bugfix-001  # roda um cenário
node .ai-agent/evals/run-eval.js --rules ../variante       # testa uma variante das regras
```

Hill climbing: altere a variante das regras, rode, compare as notas com a versão atual e só promova a variante quando a nota chegar a 10 de forma estável em mais de um modelo (`--model` e `--judge-model`).
