# Material da disciplina 08

Mapa do conteúdo didático e do material do professor (Ahirton Lopes). Não inclui o que é trabalho
do aluno: Atividades, `entrega/`, `src/` e `outputs/`.

## Conteúdo didático (`docs/`)

| Caminho | O que é |
|---|---|
| `docs/material-autoral.pdf` | Todas as aulas reunidas num PDF de 113 páginas, com a transcrição reorganizada (objetivos, diagramas, checkpoints). Apresenta o case Vitalis Pharma / TrialForge |
| `docs/Slides/Módulo N/*.pdf` | Slides de cada aula, organizados em uma pasta por módulo |
| `docs/indicacao-leitura` | Bibliografia, num PDF de 20 páginas (o arquivo não tem extensão) |

`docs/` está no `.gitignore`: o material existe só localmente.

## Por módulo (`projects/NNN-slug/material/`)

| Módulo | Canvas de decisão | Exemplos do professor (TrialForge) |
|---|---|---|
| **001** Fundamentos AI-First | `ai-first-architecture-canvas.md` · `reference-architecture-canvas.md` · `decision-framework-checklist.md` · `AI-Architecture-Decision-Canvas.pdf` | `Exemplo - Módulo 1.pdf` · `AI-Architecture-Decision-Canvas-Preenchido-TrialForge.pdf` · `decision-framework-tool.js` |
| **002** Single-Agent | `agent-anatomy-canvas.md` · `react-loop-canvas.md` · `reflection-prompt-canvas.md` · `tool-schema-canvas.md` · `prototype-blueprint-canvas.md` | `Exemplo - Módulo 2.pdf` · `agent-components-demo.js` · `react-agent-prototype.js` · `provedores-pagos.js` |
| **003** Multi-Agent | `multi-agent-boundary-canvas.md` · `orchestration-pattern-selector.md` · `orchestration-pattern-selector-v2.md` · `distributed-failure-canvas.md` · `message-queue-canvas.md` | `Exemplo - Módulo 3.pdf` · `trialforge-message-queue-prototype.js` |
| **004** Padrões AI-Específicos | `rag-pattern-selector-canvas.md` · `routing-decision-canvas.md` · `cache-streaming-decision-canvas.md` · `hitl-formalization-canvas.md` · `gateway-blueprint-canvas.md` | `Exemplo - Módulo 4.pdf` · `trialforge-gateway-prototype.js` · `audit-trail.jsonl` |
| **005** Arquitetura Enterprise | `enterprise-stack-canvas.md` · `observability-signals-canvas.md` · `deployment-decision-canvas.md` · `model-tiering-cascade-canvas.md` | `Exemplo - Módulo 5.pdf` · `model-eval-gate-prototype.js` · `manipulation-guardrail-prototype.js` · `trialforge-model-tiering-prototype.js` · `audit-trail-tiering.jsonl` |

## Como ler

- **Canvas de decisão:** framework, árvore ou checklist para decidir antes de escrever código. Em
  cada módulo, o último canvas junta os anteriores num blueprint.
- **`Exemplo - Módulo N.pdf`:** a missão do módulo resolvida para o TrialForge.
- **`.js`:** protótipo executável, que roda com Ollama. Cada um tem uma versão `.py` com o mesmo
  nome em snake_case, omitida da tabela.
- **`.jsonl`:** trilha de auditoria gravada numa execução real do protótipo.
