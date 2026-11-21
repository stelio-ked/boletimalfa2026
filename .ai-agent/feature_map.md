# Feature Map

> Mapa da aplicação do ponto de vista de quem usa. É a primeira coisa que o agente lê antes de mexer em qualquer tela.
> Edite aqui (`.ai-agent/feature_map.md`); `.claude/feature_map.md` é gerado por `sync_adapters.py`.
> Gere ou atualize com `/feature-map`. As linhas abaixo marcadas como EXEMPLO devem ser substituídas.

## 1. Módulos, rotas e componentes

| Módulo | O que a pessoa faz | Rota | Seletores DOM (`data-testid`) | Componente principal | Verificação |
| --- | --- | --- | --- | --- | --- |
| EXEMPLO Autenticação | Entra na conta | `/login` | `input-email`, `input-password`, `btn-submit` | `src/features/auth/LoginForm.tsx` | playwright: fluxo de login |
| EXEMPLO Projetos | Vê e cria projetos | `/dashboard/projects` | `project-card`, `btn-create-project` | `src/features/projects/ProjectList.tsx` | playwright: lista e criação |

Regra: cada tela tem uma linha; cada elemento interativo tem `data-testid` em `kebab-case` (`<ação-ou-campo>-<contexto>`).

## 2. Atalhos de teclado

| Atalho | Onde vale | Efeito | Arquivo |
| --- | --- | --- | --- |
| EXEMPLO `Ctrl+K` | Qualquer tela | Abre a busca | `src/features/search/useSearchShortcut.ts` |

## 3. Fluxos de estado

| Fluxo | Estados | Eventos que mudam o estado | Arquivo do estado |
| --- | --- | --- | --- |
| EXEMPLO Criar projeto | `ocioso` → `salvando` → `salvo` / `erro` | clique em `btn-create-project` | `src/features/projects/projects.store.ts` |

## 4. Como manter

1. Mudou rota, tela, seletor ou atalho? Atualize este arquivo na mesma tarefa.
2. Nunca invente linha: confirme o caminho do arquivo e o `data-testid` no código.
3. A verificação em runtime (MCP `playwright`) usa estes seletores.
