---
name: feature-architecture
description: Aplica a arquitetura colocalizada Dune em frontend/src/features/ — uma pasta por funcionalidade, sem dependência circular, sem arquivo global monolítico. Use ao criar, mover ou reorganizar features.
argument-hint: "<feature a criar ou reorganizar>"
---

# Arquitetura colocalizada (Dune)

O caminho mais curto para a IA editar o código deve ser também a melhor prática do projeto.

## Estrutura de uma feature

```
frontend/src/features/<feature>/
  <Feature>.tsx            componente principal
  <Feature>.module.css     estilos
  <Feature>.types.ts       tipos TypeScript
  <feature>.store.ts       estado local
  use<Feature>.ts          hooks
  <Feature>.test.tsx       testes unitários
  <feature>.skill.md       regras e armadilhas só desta feature
  index.ts                 única API pública
```

## Passos

1. Tudo da funcionalidade nasce na pasta dela: componentes, estado, tipos, hooks, testes, estilos e `<feature>.skill.md`.
2. Outras features importam só por `@/features/<feature>` (o `index.ts`). Nunca por caminho interno.
3. Código usado por duas ou mais features vai para `src/shared/` (só depende de `shared`). `shared` nunca importa de `features`.
4. Ao dividir arquivos globais (`utils.ts`, `types.ts`, `store.ts`, `constants.ts`), mova cada pedaço para a feature dona; o que for de todas vai para `shared/<tema>/`.
5. Dependência circular: rode `npm run depcheck` (dependency-cruiser). Quebre o ciclo movendo o código comum para `shared` ou invertendo a dependência.
6. Atualize `.ai-agent/feature_map.md` com os novos caminhos e rode `/verification-loop`.

## Regras

- Proibido arquivo global monolítico e pasta `components/` ou `hooks/` genérica na raiz de `src/`.
- Mover arquivos exige plano e aprovação antes (regra do kit).
- O exemplo de referência está em `frontend/src/features/example-feature/`.
