# Módulo 002 — Priorização de Backlog com IA

> Prompt que pontua um backlog de User Stories em RICE e WSJF simultaneamente, com justificativa obrigatória para cada Impact e Confidence e um Flag automático para todo item cuja base de estimativa não sustenta a posição no ranking.

## Contexto

- Disciplina: Ferramentas de IA para Gestão de Projetos
- Período: Setembro/2026
- Autor: guipalm4

## Descrição

O **Backlog Scorer** é um prompt de priorização. Ele recebe um bloco de contexto de negócio e um backlog de User Stories — aqui, seis histórias do **RouteWise**, a plataforma de gestão de frota da Conecta Cargas — e devolve cinco seções fixas: tabela RICE, tabela WSJF, ranking combinado, justificativas de Impact e Confidence item a item, e Flags.

Os dois frameworks rodam sobre o mesmo backlog de propósito, porque medem coisas diferentes. O RICE (`Reach × Impact × Confidence / Effort`) pergunta quanta gente é alcançada e com que grau de evidência; o WSJF (`Cost of Delay / Job Size`), da escola SAFe, pergunta quanto custa adiar — e decompõe esse custo em valor de negócio, criticidade de tempo e redução de risco. Um item de alcance pequeno com prazo regulatório se comporta de forma oposta nas duas contas, e é o ranking combinado, com desempate por Cost of Delay, que precisa reconciliar isso.

O que sustenta o artefato é o bloco de restrições de comportamento: o prompt proíbe inventar benchmark de mercado (na ausência de referência, Confidence fica em 50% e a falta é declarada), proíbe omitir item do input, exige razão específica em cada justificativa e obriga o modelo a declarar quando uma dependência entre histórias invalida a ordem que ele mesmo produziu.

O módulo consome o backlog estruturado no módulo anterior e guarda três versões do prompt, que diferem **apenas** no bloco `CONTEXTO DE NEGÓCIO`: a V1 com o contexto original do case, a V2 com os dados financeiros e regulatórios do stakeholder acrescentados em prosa, e a V3 com os mesmos dados reorganizados em tabelas nomeadas — *Fatos medidos*, *OKRs*, *Restrições e exposições* — mais um bloco de regras dizendo em qual dimensão cada tipo de dado entra. Protocolo de cálculo, formato de output e restrições são idênticos nas três.

## Tecnologias e Ferramentas

- [x] **Claude** (`claude-opus-5`) — engine de execução do prompt, em subagente de contexto limpo por rodada
- [x] **Markdown** — formato do prompt, do insumo e dos outputs
- [x] **RICE** — framework de scoring do Intercom: `(Reach × Impact × Confidence) / Effort`, com Impact numa escala fechada de 0,25 a 3
- [x] **WSJF** — framework do SAFe: `Cost of Delay / Job Size`, com o CoD decomposto em Business Value, Time Criticality e Risk Reduction
- [x] **Google AI Studio** — destino declarado no template da disciplina, que traz um bloco alternativo para System Instructions; a execução deste módulo não passa por ele
- [x] **Jira** — apenas a nomenclatura dos itens (`US01`…`US09`), herdada dos cards do módulo anterior; nenhuma instância é usada

## Pré-requisitos

- Acesso ao Claude com capacidade de executar o prompt em sessão isolada
- O bloco `CONTEXTO DE NEGÓCIO` preenchido antes da execução: OKR com métrica, baseline e prazo; perfil da operação; restrições de hardware, integração, compliance e capacidade do time

## Como executar

O prompt já traz o contexto e o backlog embutidos — é um arquivo único, enviado como mensagem. No repositório, os commands abaixo fazem isso em subagente de contexto limpo:

```bash
/roda-prompt 002 v1     # → outputs/backlog-priorizado-v1.md
/roda-prompt 002 v2     # → outputs/backlog-priorizado-v2.md
/roda-prompt 002 v3     # → outputs/backlog-priorizado-v3.md
```

Manualmente: cole `prompts/backlog-scorer-v1.md` inteiro numa sessão nova.

Funcionou quando o output traz as cinco seções na ordem definida, os seis itens do input presentes nas duas tabelas, um par Impact/Confidence justificado por item e a seção de Flags preenchida ou com a frase de ausência.

## Estrutura do Projeto

```
002-priorizacao-de-backlog/
├── prompts/
│   ├── backlog-scorer-template.md   # template da disciplina, com os campos [PREENCHER]
│   ├── backlog-scorer-v1.md         # contexto original do case
│   ├── backlog-scorer-v2.md         # OKRs e exposições do stakeholder, em prosa
│   └── backlog-scorer-v3.md         # mesmos dados tabulados + regras de uso
├── inputs/
│   └── backlog-routewise-input.md   # 6 User Stories, idêntico nas três rodadas
├── outputs/
│   ├── backlog-priorizado-v1.md
│   ├── backlog-priorizado-v2.md
│   └── backlog-priorizado-v3.md
├── entrega/
│   ├── rubrica.md                   # os três níveis, extraídos do enunciado
│   ├── basico/README.md
│   └── intermediario/               # pasta autocontida do nível atacado
└── material/                        # enunciado e outputs de referência da disciplina
```

## Como funciona

```
CONTEXTO DE NEGÓCIO      BACKLOG DE INPUT
(OKR, baseline, prazo,   (6 User Stories com
 restrições, capacidade)  critérios de aceite e notas)
        │                        │
        └────────────┬───────────┘
                     ▼
        [ protocolo de estimativa ]  escalas fechadas:
                     │               Impact ∈ {0.25, 0.5, 1, 2, 3}
                     │               Confidence ∈ {50%, 80%, 100%}
                     │               BV/TC/RR/Job Size ∈ 1..10
        ┌────────────┴───────────┐
        ▼                        ▼
  1. TABELA RICE           2. TABELA WSJF
  R × I × C / Effort       CoD = BV + TC + RR
        │                  WSJF = CoD / Job Size
        └────────────┬───────────┘
                     ▼
        3. RANKING COMBINADO   ◀── desempate: maior Cost of Delay
                     │
                     ▼
        4. JUSTIFICATIVAS      Impact e Confidence, um motivo específico cada
                     │
                     ▼
        5. FLAGS ⚠️            gatilhos: Confidence < 70%
                                        │ dependência técnica não resolvida
                                        │ Effort potencialmente subestimado
                                        └ dependência que inverte o ranking
```

O ponto de articulação é a Seção 5. As quatro primeiras seções produzem uma ordem; a quinta declara em que condições essa ordem não é acionável — um item pode estar em segundo lugar e ainda assim não ser sprintável, porque o que o bloqueia é um lead time de hardware que não aparece nem em Effort nem em Job Size. Sem esse passo, o ranking sai com aparência de plano.

A V3 acrescenta um bloco *Como usar estes dados* que amarra cada tipo de dado a uma dimensão: fato medido é base de Reach e Impact e não deve ser re-estimado; item que não move nenhum OKR tem teto de Impact 1; exposição financeira com data entra em Cost of Delay; e número que não está nas tabelas precisa ser declarado como suposição, com Confidence mantida em 50%.

## Conceitos trabalhados

- [x] **RICE Score** — as quatro dimensões com definição fechada no prompt, para que a nota não dependa da leitura de cada avaliador
- [x] **WSJF e Cost of Delay** — custo de adiar decomposto em três parcelas somadas e dividido pelo tamanho do trabalho, o que faz item pequeno com prazo externo subir
- [x] **Ranking combinado com regra de desempate** — dois frameworks discordantes reconciliados por uma regra declarada (maior CoD), em vez de por julgamento ad hoc
- [x] **Confidence como registro de evidência** — a única dimensão em que a escala é definida pela qualidade da fonte (evidência sólida / indicador razoável / intuição), não pelo tamanho do efeito
- [x] **Flags de incerteza** — três gatilhos objetivos que convertem estimativa frágil em item de ação antes do sprint planning
- [x] **Dependência que invalida o ranking** — o prompt exige declarar quando um item depende de outro rankeado abaixo, ou de um trabalho que não existe no backlog
- [x] **HiPPO** — o backlog inclui de propósito um item pedido verbalmente pelo executivo e sem evidência de uso, para exercitar o scoring contra a opinião mais bem paga da sala
- [x] **Calibração de contexto** — a mesma tarefa executada com três blocos de contexto diferentes, mantendo protocolo, formato e input constantes

## Aprendizados

- [x] RICE e WSJF discordam por construção: `Reach` premia alcance sobre a base instalada e `Time Criticality` premia prazo externo, então um item que atinge uma fatia pequena da frota mas tem data regulatória cai num ranking e sobe no outro.
- [x] Uma exposição financeira com data — multa por veículo a partir de um prazo — pertence a Cost of Delay, não a Impact: sem essa regra explícita o mesmo valor é contado duas vezes, uma em cada framework.
- [x] Definir Confidence pela qualidade da fonte é o que dá ao dado do stakeholder um lugar no cálculo; sem essa escala, acrescentar um número ao contexto não tem onde se refletir na conta.
- [x] Lead time de hardware não cabe em Effort nem em Job Size, que medem trabalho do time — ele corre em paralelo à capacidade e por isso só aparece como Flag, ainda que seja o caminho crítico do item.
- [x] Colocar o contexto em tabela nomeada, em vez de prosa, cria o referente que permite exigir do modelo a distinção entre número medido e número suposto na mesma justificativa.

## Referências

- [RICE: Simple prioritization for product managers — Intercom](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)
- [WSJF — Scaled Agile Framework](https://framework.scaledagile.com/wsjf)
- [The Principles of Product Development Flow — Donald Reinertsen](https://www.amazon.com/dp/1935401009)
- [Cost of Delay — Black Swan Farming](https://blackswanfarming.com/cost-of-delay/)
