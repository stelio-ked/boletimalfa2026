# Feature Map

> Mapa da aplicação do ponto de vista de quem usa. É a primeira coisa que o agente lê antes de mexer em qualquer tela.
> Edite aqui (`.ai-agent/feature_map.md`); `.claude/feature_map.md` é gerado por `sync_adapters.py`.
> Gere ou atualize com `/feature-map`. As linhas abaixo marcadas como EXEMPLO devem ser substituídas.

## 1. Módulos, rotas e componentes

| Módulo | O que a pessoa faz | Rota | Seletores DOM (`data-testid`) | Componente principal | Verificação |
| --- | --- | --- | --- | --- | --- |
| Cabeçalho / banco | Vê o estado do banco, exporta e restaura backup `.sqlite` | `file://` (página única, sem rotas) | `status-banco`, `btn-exportar-banco`, `input-restaurar-backup` | `boletim_acad_mico_unificado_2026.html` (`initDatabase`, `exportSQLiteFile`, `handleSQLiteRestore`) | playwright: banco carrega, sem erro no console (`e2e/boletim.spec.js`) |
| Seletor de alunos | Troca o aluno ativo; abre importação ou exclusão | idem | `seletor-alunos`, `btn-aluno-<matricula>`, `btn-importar-boletim`, `btn-excluir-aluno` | `boletim_acad_mico_unificado_2026.html` (`renderStudentSelector`) | playwright: pills renderizadas |
| Identificação do aluno | Lê nome, turma, matrícula, frequência e média geral do aluno ativo | idem | `active-student-name`, `active-student-turma`, `active-student-matricula`, `active-student-freq`, `active-student-media-geral`, `selo-media-geral` (`data-faixa`: `aprovado` ≥ 6,0 verde / `abaixo` vermelho) | `boletim_acad_mico_unificado_2026.html` (`renderAll`, `renderOverallAverage`) | playwright: nome preenchido |
| Simulação e relatório | Simula notas, limpa simulações, imprime ou baixa PDF | idem | `btn-simular-minimo`, `btn-simular-realista`, `btn-limpar-simulacoes`, `btn-previa-impressao`, `btn-baixar-pdf` | `boletim_acad_mico_unificado_2026.html` (`applyMinimumToPass`, `applyRealisticScenario`, `openPrintPreview`) | manual / a cobrir |
| Tabela de notas | Edita notas simuladas por ciclo e expande disciplinas | idem | `input-simulacao-<campo>`, `btn-detalhe-disciplina`, `btn-alternar-ciclos` | `boletim_acad_mico_unificado_2026.html` (`handleSimInput`, `toggleRowDetail`, `toggleAllPreviousCycles`) | manual / a cobrir |
| Modal Importar Boletim | Envia PDF/imagem (OCR), confere e grava os dados | modal `#importModal` | `input-arquivo-boletim`, `select-aluno-destino`, `input-nome-importacao`, `input-matricula-importacao`, `input-turma-importacao`, `input-frequencia-importacao`, `input-segmento-importacao`, `btn-adicionar-disciplina`, `btn-remover-linha-importacao`, `btn-confirmar-importacao`, `btn-cancelar-importacao`, `btn-fechar-importacao` | `boletim_acad_mico_unificado_2026.html` (`openImportModal`, `confirmImportUpsert`) | manual / a cobrir |
| Modal Excluir Aluno | Confirma ou cancela a exclusão do aluno ativo | modal `#deleteStudentModal` | `btn-confirmar-exclusao`, `btn-cancelar-exclusao` | `boletim_acad_mico_unificado_2026.html` (`confirmDeleteActiveStudent`) | manual / a cobrir |
| Modal Pré-visualização A4 | Imprime ou baixa PDF/HTML do boletim simulado | modal `#printPreviewModal` | `btn-imprimir`, `btn-baixar-pdf-previa`, `btn-baixar-html`, `btn-fechar-previa` | `boletim_acad_mico_unificado_2026.html` (`downloadPrintableHTML`, `closePrintPreview`) | manual / a cobrir |

Regra: cada tela tem uma linha; cada elemento interativo tem `data-testid` em `kebab-case` (`<ação-ou-campo>-<contexto>`).

## 2. Atalhos de teclado

| Atalho | Onde vale | Efeito | Arquivo |
| --- | --- | --- | --- |
| `Esc` | Qualquer modal aberto | Fecha importação, exclusão e pré-visualização | `boletim_acad_mico_unificado_2026.html` (listener `keydown`) |

## 3. Fluxos de estado

| Fluxo | Estados | Eventos que mudam o estado | Arquivo do estado |
| --- | --- | --- | --- |
| Importar boletim | `fechado` → `aberto` → `conferindo` → `gravado` / fechado | `btn-importar-boletim`, `input-arquivo-boletim`, `btn-confirmar-importacao`, `btn-cancelar-importacao` | `boletim_acad_mico_unificado_2026.html` (`importedDraft`) |

## 4. Como manter

1. Mudou rota, tela, seletor ou atalho? Atualize este arquivo na mesma tarefa.
2. Nunca invente linha: confirme o caminho do arquivo e o `data-testid` no código.
3. A verificação em runtime (MCP `playwright`) usa estes seletores.
