# Feature: example-feature

Exemplo de referência da Arquitetura Dune. Copie esta pasta para criar uma feature nova e apague o que não precisar.

## O que a pessoa faz aqui

Adiciona tarefas, marca como concluídas e filtra por todas, abertas ou concluídas.

## Mapa rápido

| Arquivo | Papel |
| --- | --- |
| `ExampleFeature.tsx` | Tela; seletores `example-add`, `example-filter-*`, `example-item` |
| `useExampleFeature.ts` | Hook que liga a tela ao estado |
| `example-feature.store.ts` | Estado local puro (reducer e seletores) |
| `ExampleFeature.types.ts` | Tipos públicos e internos |
| `ExampleFeature.test.tsx` | Testes da feature |
| `index.ts` | Única porta de entrada para outras features |

## Regras desta feature

- Lista visível é estado derivado (`selectVisible`); não use `useEffect` para sincronizar.
- Outras features importam só `@/features/example-feature`.
