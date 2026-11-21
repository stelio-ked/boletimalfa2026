# <NOME DO PROJETO>

<O que a aplicação faz, para quem, em 2 a 3 linhas.>

## Como rodar localmente

1. Copie `.env.example` para `.env` e preencha as credenciais.
2. Siga `/env-setup` no Claude Code ou os passos abaixo:
   - <preencher>

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `frontend/`, `backend/` ou `apps/` | Código da aplicação; documentação em `docs/` de cada parte |
| `.ai-agent/` | Skills, agentes, hooks e políticas de IA (Padrão Ked) |
| `.claude/` | Gerado a partir de `.ai-agent/`; não editar |
| `.github/workflows/` | Verificações automáticas do padrão (sincronia, markdown, segredos) |

## Documentos

- `PRODUCT_FEATURES.md`: o que o usuário pode fazer na aplicação
- `TECH_ASSESSMENT.md`: decisões de tecnologia
