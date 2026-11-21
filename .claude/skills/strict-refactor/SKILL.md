---
name: strict-refactor
description: Refatora código TypeScript/React com tipagem estrita, sem any, ts-ignore ou qualquer bypass do compilador ou do linter. Use ao refatorar, tipar código legado ou corrigir erros de compilação.
argument-hint: "<arquivo, feature ou objetivo da refatoração>"
---

# Refatoração estrita

Melhorar a estrutura do código sem mudar o que a pessoa vê e sem enfraquecer o compilador.

## Passos

1. Rode `node .ai-agent/helpers/verify.js --static` e anote a linha de base (erros e avisos).
2. Leia `.ai-agent/feature_map.md` se a refatoração tocar tela, e o `<feature>.skill.md` da feature.
3. Garanta testes que cobrem o comportamento atual; se faltarem, escreva antes de refatorar.
4. Refatore em passos pequenos, rodando os testes a cada passo.
5. Tipos: use tipos precisos, `unknown` com estreitamento, genéricos e uniões discriminadas. Valide dados externos na borda (parse), não com asserção.
6. Hooks: toda dependência de `useEffect`, `useMemo` e `useCallback` é declarada; prefira estado derivado a efeito.
7. Rode `/verification-loop` completo. A linha de base não pode piorar.

## Proibido

- `any`, `as any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` sem motivo, `// eslint-disable`, `!` não justificado, asserção `as` para calar erro.
- Afrouxar `tsconfig.json` ou o ESLint para passar.
- `useEffect` sem lista de dependências.

## Encerramento

Resuma o que ficou mais simples, mostre o antes e depois dos erros estáticos (deve ser igual ou menor) e confirme que o comportamento não mudou.
