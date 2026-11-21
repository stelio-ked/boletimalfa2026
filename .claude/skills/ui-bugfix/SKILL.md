---
name: ui-bugfix
description: Resolve de forma autônoma bugs de interface e regressões visuais reportados por quem usa o produto, com causa raiz comprovada e verificação em runtime. Use quando houver relato de tela quebrada, comportamento errado ou regressão.
argument-hint: "<relato do problema, rota ou print>"
---

# Resolução autônoma de bugs de UI

Devolver à pessoa uma tela que funciona, com a causa raiz comprovada.

## Passos

1. **Mapa.** Leia `.ai-agent/feature_map.md` (skill `/feature-map`) e identifique rota, `data-testid` e componente do relato.
2. **Reprodução.** Com o MCP `playwright`, abra a rota, siga o fluxo do relato pelos `data-testid` e capture o estado do console e da rede. Guarde o que viu.
3. **Causa raiz.** NUNCA suponha a causa sem ler os arquivos do componente, do hook e do estado envolvidos. Cite o arquivo e a linha.
4. **Teste primeiro.** Escreva um teste que falha com o bug (unitário na feature ou E2E) e rode para vê-lo falhar.
5. **Correção mínima.** Altere só o necessário, dentro de `src/features/<feature>/`. Erro de tipo se corrige no tipo; nunca com `any`, `@ts-ignore` ou supressão.
6. **Verificação.** Rode `/verification-loop` completo e repita o fluxo do passo 2 para confirmar a correção.
7. **Mapa.** Se algo mudou na UI, atualize o `feature_map.md`.

## Regras

- Sem reprodução não há correção: se não reproduzir, diga isso e peça o que falta.
- Proibido corrigir sintoma (esconder erro, `try/catch` vazio, `setTimeout` para "esperar").
- Linter e `tsc` rodam antes e depois da mudança.

## Encerramento

Em linguagem simples: o que a pessoa via, o que causava e como está agora, com a evidência (teste e fluxo em runtime).
