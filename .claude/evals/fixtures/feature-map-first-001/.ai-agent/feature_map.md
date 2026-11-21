# Feature Map

Convenção: todo elemento interativo tem `data-testid` em kebab-case (`btn-<ação>`).

| Módulo | O que a pessoa faz | Rota | Seletores DOM (`data-testid`) | Componente principal | Verificação |
| --- | --- | --- | --- | --- | --- |
| Projetos | Vê e cria projetos | `/dashboard/projects` | `project-card`, `btn-create-project` | `src/features/projects/ProjectList.tsx` | playwright |
