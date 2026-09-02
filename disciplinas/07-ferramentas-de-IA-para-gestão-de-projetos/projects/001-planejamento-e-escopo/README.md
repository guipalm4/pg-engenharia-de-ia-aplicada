# Módulo 001 — Planejamento e Escopo com IA

> System prompt que converte a transcrição bruta de uma reunião de discovery em backlog estruturado — épicos, User Stories validadas por INVEST, critérios de aceite em Gherkin e cards prontos para o Jira — marcando explicitamente cada lacuna em vez de preenchê-la.

## Contexto

- Disciplina: Ferramentas de IA para Gestão de Projetos
- Período: Setembro/2026
- Autor: guipalm4

## Descrição

O **Requirements Copilot** é um system prompt de engenharia de requisitos. Ele recebe um insumo não estruturado — aqui, a transcrição de 35 minutos da reunião de discovery do **RouteWise**, um sistema de gestão de frota com 140 veículos — e produz nove seções encadeadas: mapa de domínios com nível de confiança, mapa de stakeholders com conflitos sinalizados, estrutura de épicos, User Stories com validação INVEST critério a critério, perguntas em aberto, flags de risco, cards de Jira, dependências não declaradas e um diagrama Mermaid do fluxo.

O que caracteriza o artefato não é a geração das histórias, e sim o que ele faz com o que **não** foi dito. O prompt proíbe inventar valores numéricos: onde o stakeholder disse "em tempo real" sem dar um número, o critério de aceite recebe `[A CONFIRMAR COM STAKEHOLDER]` e a lacuna vira uma pergunta numerada, não um SLA plausível. Um catálogo de anti-padrões de requisito — voz passiva sem sujeito, resultado não verificável, escopo implicitamente infinito, requisito duplo, dependência circular — é varrido sobre o input antes de qualquer história ser escrita. E quatro categorias de flag (`[ESPECIFICAÇÃO INVENTADA]`, `[DEPENDÊNCIA NÃO MAPEADA]`, `[VIABILIDADE TÉCNICA SILENCIOSA]`, `[GOLD PLATING]`) obrigam o modelo a declarar onde ele próprio extrapolou.

O módulo é a primeira etapa de uma trilha encadeada: o backlog produzido aqui é o insumo do scoring de priorização do módulo seguinte. A pasta guarda duas versões do prompt — a original da disciplina e uma iteração derivada da leitura do primeiro output — e o resultado de cada uma sobre o mesmo insumo.

## Tecnologias e Ferramentas

- [x] **Claude** (`claude-opus-5`) — engine de execução do system prompt, em sessão de contexto limpo
- [x] **Markdown** — formato do prompt, do insumo e dos outputs
- [x] **Gherkin** (`Dado / Quando / Então`) — linguagem dos critérios de aceite
- [x] **INVEST** — heurística de validação de User Story, aplicada critério a critério
- [x] **Mermaid** (`flowchart TD`) — diagrama do fluxo de negócio na Seção 9 do output
- [x] **Jira** — apenas o formato do card (épico, feature, story points, labels, Definition of Ready); nenhuma instância é usada neste módulo

## Pré-requisitos

- Acesso ao Claude com capacidade de executar o prompt em sessão isolada
- O bloco `CONTEXTO DE PROJETO` do prompt preenchido com o glossário e as restrições do cliente antes da execução

## Como executar

O prompt vai no campo de instruções de sistema; o conteúdo de `inputs/` vai como mensagem. No repositório, os dois commands abaixo fazem isso em subagente de contexto limpo:

```bash
# 1ª execução — prompt original da disciplina
/roda-prompt 001 v1     # → outputs/backlog-estruturado-v1.md

# execução da versão iterada
/roda-prompt 001 v2     # → outputs/backlog-estruturado-v2.md
```

Manualmente, sem os commands: cole `prompts/requirements-copilot-v1.md` como system prompt e `inputs/transcricao-discovery-routewise.md` como input.

Funcionou quando o output traz as nove seções na ordem definida, nenhum valor numérico de latência, volume ou limiar que não esteja na transcrição, e o aviso de rascunho analítico no rodapé.

## Estrutura do Projeto

```
001-planejamento-e-escopo/
├── prompts/
│   ├── requirements-copilot-v1.md    # v1.2 da disciplina, sem alteração
│   └── requirements-copilot-v2.md    # iteração, com as alterações declaradas no cabeçalho
├── inputs/
│   └── transcricao-discovery-routewise.md   # reunião de discovery, 3 participantes, 35 min
├── outputs/
│   ├── backlog-estruturado-v1.md     # 1ª execução, procedência no frontmatter
│   └── backlog-estruturado-v2.md     # após a alteração
├── entrega/
│   ├── rubrica.md                    # os três níveis, extraídos do enunciado
│   ├── básico/README.md
│   └── intermediário/                # pasta autocontida do nível atacado
└── material/                         # enunciado e material de apoio da disciplina
```

## Como funciona

```
transcricao-discovery-routewise.md
        │
        ▼
  [ varredura de anti-padrões ]  ── marca [ANTI-PADRÃO: tipo] inline
        │                            e alimenta a Seção 5
        ▼
  1. MAPA DE DOMÍNIOS        confiança Alta/Média/Baixa por domínio
  2. MAPA DE STAKEHOLDERS    tipo, requisitos defendidos, [CONFLITO]
  3. ESTRUTURA DE ÉPICOS     complexidade P/M/G/GG justificada
        │
        ▼
  4. USER STORIES ──┬── a. card "Como/quero/para que"
                    ├── b. INVEST por critério → PASS ou [INVEST-FAIL: X]
                    ├── c. Gherkin: happy path + edge case
                    ├── d. dependências
                    └── e. notas técnicas
        │
        ▼
  5. PERGUNTAS EM ABERTO     cada lacuna → pergunta + impacto se não clarificado
  6. FLAGS DE RISCO          4 categorias, o modelo declara onde extrapolou
        │
        ▼
  7. CARDS PARA JIRA   ◀── portão: história com [INVEST-FAIL] não gera card,
        │                  aparece como [BLOQUEADA: motivo]
        ▼
  8. DEPENDÊNCIAS NÃO DECLARADAS   [dep] → [US bloqueada] → [ação]
  9. DIAGRAMA MERMAID
```

O ponto de articulação é a Seção 7. Ela não é gerada para todas as histórias: a validação INVEST da Seção 4b funciona como portão, e uma história reprovada em qualquer critério aparece bloqueada em vez de virar card. É o que impede que uma história com lacuna conhecida entre em sprint planning por descuido de importação.

Há ainda um **modo rápido**, que entrega apenas as Seções 4, 5 e 7 — útil para validar escopo dentro da própria reunião, ao custo de perder as seções analíticas.

## Conceitos trabalhados

- [x] **System prompt como especificação de processo** — o prompt não pede um texto, define nove artefatos, a ordem entre eles e as regras de transição
- [x] **Protocolo de ambiguidade** — termos de desempenho, escala, segurança, integração e aprovação recebem marcação obrigatória; o valor nunca é inferido
- [x] **INVEST critério a critério** — cada história é avaliada nos seis eixos separadamente, com o motivo da reprovação nomeado
- [x] **Gherkin sem termo subjetivo** — "corretamente", "adequadamente" e "de forma rápida" são proibidos no `Então`, o que força número, estado ou condição verificável
- [x] **Anti-padrões de requisito** — cinco padrões varridos antes da escrita, cada ocorrência virando pergunta em aberto
- [x] **Decomposição WBS** — Épico → Feature → User Story → Task, com teto de 8 story points por história
- [x] **Flags de risco autodeclaradas** — o modelo classifica as próprias extrapolações em quatro categorias
- [x] **Iteração de prompt** — duas versões do mesmo system prompt executadas sobre o insumo idêntico, em sessões isoladas

## Aprendizados

- [x] Proibir o modelo de inventar números transforma a lacuna em artefato rastreável: `[A CONFIRMAR COM STAKEHOLDER]` no critério de aceite sobrevive à leitura, enquanto um SLA plausível se dissolve no texto e é aceito sem discussão.
- [x] Registrar **quem responde** cada pergunta em aberto converte a lista de dúvidas em plano de ação — pergunta sem destinatário nomeado não tem quem a destrave, e quem já respondeu "não sei" na reunião não é o destinatário certo.
- [x] Uma regra de filtragem só é executável no momento da escrita: o modelo emite as seções na ordem definida e não reescreve o que já emitiu, então marcar um problema numa seção posterior à do artefato não o remove de lá.
- [x] Validação INVEST vira portão automático apenas se o domínio de valores for fechado — um terceiro valor em circulação deixa a regra de bloqueio sem semântica e a decisão volta a ser caso a caso.
- [x] Exigir que cada cenário Gherkin cite um trecho literal do insumo é o que separa requisito de boa prática de engenharia, e torna a origem de cada critério auditável contra a transcrição.

## Referências

- [INVEST in Good Stories, and SMART Tasks — Bill Wake](https://xp123.com/invest-in-good-stories-and-smart-tasks/)
- [Gherkin Reference — Cucumber](https://cucumber.io/docs/gherkin/reference/)
- [Mermaid — Flowchart Syntax](https://mermaid.js.org/syntax/flowchart.html)
- [User Stories Applied — Mike Cohn](https://www.mountaingoatsoftware.com/books/user-stories-applied)
