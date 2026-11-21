---
name: feature-map
description: Lê, gera e mantém o Feature Map (.ai-agent/feature_map.md). Leitura OBRIGATÓRIA antes de qualquer alteração visual ou de UI; geração quando o mapa estiver vazio ou desatualizado.
argument-hint: "[ler|gerar|atualizar]"
---

# Feature Map

Saber exatamente qual tela e qual arquivo está sendo tratado, sem adivinhar.

## Leitura obrigatória

1. Antes de qualquer alteração visual, leia `.ai-agent/feature_map.md` por inteiro.
2. Localize a tela pela rota ou pelo `data-testid` citado no relato. Se o relato for vago ("o botão azul não funciona"), cruze com as linhas do mapa e confirme com o usuário só se houver mais de uma candidata.
3. Abra o componente principal indicado e só então proponha a mudança.
4. Se a tela não está no mapa, ela entra no passo "Atualizar".

## Gerar ou atualizar

1. Liste rotas (arquivo de rotas ou páginas) e `src/features/*`.
2. Para cada tela: componente principal, `data-testid` reais (busque no código; nunca invente), atalhos de teclado e estados do fluxo.
3. Confirme em runtime com o MCP `playwright` que cada rota abre e que os seletores existem.
4. Atualize as três tabelas do arquivo e apague as linhas EXEMPLO.
5. Rode `python .ai-agent/scripts/sync_adapters.py`.

## Regras

- Mudou rota, tela, seletor ou atalho? O mapa é atualizado na mesma tarefa.
- Elemento interativo sem `data-testid` ganha um (`kebab-case`) e entra no mapa.

## Encerramento

Diga em uma frase quais telas foram mapeadas ou atualizadas e quais ficaram sem confirmação em runtime.
