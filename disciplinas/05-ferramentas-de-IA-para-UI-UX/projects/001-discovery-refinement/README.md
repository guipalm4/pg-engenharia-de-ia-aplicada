# Exemplo 001 — Discovery & Refinement: Requisitos, Dados e UX Writing com IA

> Pipeline de três estágios via System Instructions do Google AI Studio: refina um requisito ambíguo de Pix Agendado em análise de risco e fluxo Mermaid, sanitiza/prioriza feedbacks brutos de usuários em backlog, e gera mensagens de UX writing padronizadas em JSON.

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
Este projeto demonstra o uso de IA (Google Gemini via Google AI Studio) como camada de **refinamento técnico** antes de qualquer implementação de código, aplicado a uma feature de Pix Agendado de um app bancário fictício.

Três pipelines independentes, cada um definido por um prompt de sistema com papel, objetivo, regras e formato de saída explícitos:

1. **Refinamento de requisitos** — um briefing vago (`docs/refinement/briefing-bruto.md`) é "estressado" pela IA atuando como Arquiteto de Software/UX, que aponta *unhappy paths*, estados de UI faltantes (loading/empty/error) e regras de negócio conflitantes, depois converte a análise num fluxograma Mermaid.js.
2. **Data discovery** — feedbacks brutos de usuários (`data/raw-feedbacks.json`, com PII e ruído misturados) passam por um sanitizador que remove dados pessoais (LGPD) e registros irrelevantes (`data/sanitized-feedbacks.json`), depois por um destilador que classifica cada feedback em categoria/severidade/ação num backlog priorizado (`data/backlog.json`).
3. **UX writing sistemático** — a partir da análise de risco, um prompt de UX Writer gera mensagens de erro/sucesso em JSON (`report/pt-BR.json`), seguindo um style guide próprio (sem culpa, sempre resolutivo, terminologia consistente).

O objetivo pedagógico é tratar prompts como artefatos de engenharia versionáveis — não texto solto — e demonstrar que saída estruturada (JSON estrito) permite encadear a saída de um prompt como entrada do próximo.

## Tecnologias e Ferramentas
- [x] Google Gemini via Google AI Studio (System Instructions)
- [x] Engenharia de Prompt (papel + objetivo + regras + formato de saída)
- [x] Structured Output / JSON Schema
- [x] Mermaid.js (diagramas de fluxo)
- [x] Anonimização de dados (LGPD)

## Como executar
```bash
# 1. Refinamento de requisitos
# No Google AI Studio, cole prompts/system-instructions-refinement.md em System Instructions
# Input: docs/refinement/briefing-bruto.md
# Output: análise de risco + mermaid (ver report/refinamento-pix-aula-1.md e report/mermaid-detalhado-aula-2.md)

# 2. Sanitização de dados
# System Instructions: prompts/data-sanitizer.md
# Input: data/raw-feedbacks.json  →  Output: data/sanitized-feedbacks.json

# 3. Destilação de backlog
# System Instructions: prompts/insights-distiller.md
# Input: data/sanitized-feedbacks.json  →  Output: data/backlog.json

# 4. UX Writing
# System Instructions: prompts/ux-writing-system.md + prompts/ux-writer-aula-3 (ver report/ux-writer-aula-3.md)
# Output: report/pt-BR.json
```

## Estrutura do Projeto
```
001-discovery-refinement/
├── docs/refinement/
│   └── briefing-bruto.md          # Requisito original, ambíguo (input do estágio 1)
├── prompts/
│   ├── system-instructions-refinement.md  # Papel: Arquiteto de Software/UX (estágio 1)
│   ├── data-sanitizer.md                  # Papel: Engenheiro de Dados/LGPD (estágio 2a)
│   ├── insights-distiller.md              # Papel: Tech Lead/PM (estágio 2b)
│   ├── ux-writing-system.md               # Papel: UX Writer técnico (estágio 3)
│   └── readme-generator.md                # Meta-prompt: gera o README do próprio projeto
├── data/
│   ├── raw-feedbacks.json         # Dataset bruto com PII e ruído
│   ├── sanitized-feedbacks.json   # Saída do estágio 2a
│   └── backlog.json               # Saída do estágio 2b
└── report/
    ├── refinamento-pix-aula-1.md      # Saída do estágio 1 (análise de risco + estados)
    ├── mermaid-detalhado-aula-2.md    # Saída do estágio 1 (fluxograma Mermaid)
    ├── ux-writer-aula-3.md            # Prompt de extração usado no estágio 3
    └── pt-BR.json                     # Saída do estágio 3 (mensagens i18n)
```

## Como funciona
```
briefing-bruto.md ──(system-instructions-refinement.md)──> análise de risco + mapeamento de estados
                                                              │
                                                              v
                                          (comando de fluxo) mermaid-detalhado-aula-2.md

raw-feedbacks.json ──(data-sanitizer.md)──> sanitized-feedbacks.json ──(insights-distiller.md)──> backlog.json

análise de risco + edge cases ──(ux-writing-system.md)──> pt-BR.json (mensagens por ERROR_KEY)
```
Cada prompt força formato de saída estrito (JSON ou Markdown estruturado), permitindo que a saída de um estágio alimente o próximo sem reformatação manual.

## Conceitos trabalhados
- [x] **System Instructions como contrato** — cada prompt define papel, objetivo, regras e formato de saída, tornando a resposta da IA determinística e parseável (`prompts/*.md`).
- [x] **Rubber ducking estruturado** — usar a IA para encontrar *unhappy paths* e estados de UI que o requisito original não cobria (`report/refinamento-pix-aula-1.md`).
- [x] **Anonimização como etapa de pipeline** — LGPD tratada como regra de prompt (remoção de CPF/e-mail/telefone), não como pós-processamento manual (`prompts/data-sanitizer.md`).
- [x] **UX writing como dado estruturado** — mensagens de erro/sucesso como JSON por chave (`ERROR_KEY_OR_CODE`), prontas para consumo direto em código de i18n (`report/pt-BR.json`).
- [x] **Meta-prompt** — um prompt dedicado a gerar a documentação do próprio projeto a partir da árvore de arquivos do repositório (`prompts/readme-generator.md`).

## Aprendizados
- [x] Exigir explicitamente "formato de saída" no prompt (JSON estrito, sem markdown ao redor) é o que torna viável encadear várias chamadas de LLM num pipeline sem parsing frágil.
- [x] Sanitização de PII delegada à IA precisa de regras explícitas de exclusão (bots, testes, ruído) além da anonimização — senão o dataset sanitizado ainda carrega registros sem valor de produto.
- [x] Um style guide de UX writing (tom, vocabulário, estrutura) rende resultados consistentes quando formalizado como regras no prompt, em vez de deixado para "bom senso" do modelo.

## Documento Original
> Conteúdo original do README (material do professor, com o enunciado completo do módulo) preservado em [`README.original.md`](./README.original.md).

## Referências
- [Google AI Studio](https://aistudio.google.com/)
- [Mermaid.js](https://mermaid.js.org/)
