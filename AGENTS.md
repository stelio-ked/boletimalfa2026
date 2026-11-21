# AGENTS.md — <NOME DO PROJETO>

> Regras para qualquer agente de IA neste repositório (Claude, Cursor, Copilot ou outro).
> Padrão Ked de Setup de IA — versão em `.ai-agent/VERSION`.

## Sobre o projeto

- **Produto:** <2 linhas na visão do usuário final: quem usa e para quê>
- **Stack:** <ex.: Next.js + API .NET 8 + SQL Server>
- **Features do produto:** `PRODUCT_FEATURES.md` (fonte da verdade do produto)
- **Decisões técnicas:** `TECH_ASSESSMENT.md`
- **Design:** skill `/design-system`

## Regras obrigatórias

1. Tudo que é de IA fica em `.ai-agent/`. Nunca crie arquivos de IA soltos no código.
2. Skills ficam só em `.ai-agent/skills/<nome>/SKILL.md`; subagentes só em `.ai-agent/agents/<nome>.md`.
3. Nunca edite `.claude/` à mão. Depois de mudar `.ai-agent/`, rode `python .ai-agent/scripts/sync_adapters.py`.
4. Markdown tem lugar certo:
   - documentação de código → `frontend/docs/` ou `backend/docs/`;
   - rascunhos, planos e notas de trabalho do agente → `.ai-agent/work/`;
   - na raiz, só `README.md`, `AGENTS.md`, `CLAUDE.md`, `PRODUCT_FEATURES.md`, `TECH_ASSESSMENT.md`, `CHANGELOG.md`.
5. Existe um único `README.md`, na raiz, para a aplicação inteira.
6. Segredos: nunca leia, escreva, copie ou exiba `.env`, chaves ou certificados. Documente variáveis em `.env.example` (sem valores). Credenciais de produção ficam nos Secrets do GitHub Actions ou do provedor de hospedagem.
7. Antes de codar: `PRODUCT_FEATURES.md` revisado com o público-alvo, `TECH_ASSESSMENT.md` aprovado e ambiente local pronto (`/env-setup`).
8. Toda tela nova segue a skill `/design-system`.
9. Antes de abrir PR: `/security-check` e `/docs-tidy`.
10. Textos para o usuário final usam linguagem de negócio ("Seus pedidos foram salvos"), nunca jargão técnico ("data cached").
11. Funcionalidade com LLM ou agente: desenhe com `/agent-design` e valide com `/llm-eval` antes do PR. Chaves de modelo só em variáveis de ambiente; nenhum dado pessoal real em prompts, logs ou fixtures.
12. Confidencialidade: nunca cite nomes, dados, código ou arquitetura de clientes ou empregadores em arquivos do projeto. A lista de termos fica em `.ai-agent/policy/client-terms.local.txt` (fora do Git; modelo em `client-terms.example.txt`).
13. **Alça de verificação (inegociável):** NENHUMA tarefa é considerada concluída sem que a alça de verificação (testes estáticos, compilação e teste E2E/runtime via MCP) seja executada e validada autonomamente. Use `node .ai-agent/helpers/verify.js` (ou a ferramenta MCP `shell-verifier`: `run_verification`) e o MCP `playwright` para o runtime. Reporte o resultado real; nunca declare "pronto" sem ele.
14. Antes de qualquer alteração visual ou de UI, leia `.ai-agent/feature_map.md` (rotas, `data-testid`, atalhos e arquivo do componente) e atualize-o quando a UI mudar. Skill: `/feature-map`.
15. TypeScript estrito: proibido `any`, `@ts-ignore`, `@ts-expect-error` sem justificativa e qualquer bypass do compilador ou do linter. Corrija o tipo na origem. Skills: `/strict-refactor` e `/ui-bugfix`.
16. Arquitetura colocalizada (Dune): cada feature vive em `frontend/src/features/<feature>/` com componentes, estado, tipos, hooks, testes, estilos e `<feature>.skill.md`; outras features só importam pelo `index.ts`. Skill: `/feature-architecture`.

## Fluxo padrão

`/ked-bootstrap` → `/product-features` → revisão com o público-alvo → `/tech-assessment` → `/env-setup` → `/design-system-extract` → codar com `/design-system` → `/security-check` → PR

Prompts-modelo de cada etapa: `.ai-agent/prompts/`.
Funcionalidade com IA: `/agent-design` (arquitetura, ferramentas, contexto, guardrails) e `/llm-eval` (qualidade e regressão).

## Comandos do projeto

- Instalar dependências: <preencher>
- Rodar em desenvolvimento: <preencher>
- Testes: <preencher>
- Lint e build: <preencher>
- Verificação completa: `node .ai-agent/helpers/verify.js` (estática: `--static`)
