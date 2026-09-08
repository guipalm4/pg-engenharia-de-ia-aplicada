# Módulo 003 — Cronograma e Capacidade com IA

> Prompt que transforma um backlog priorizado em cronograma de sprints com capacidade real a 65%, dependências implícitas inferidas dos componentes técnicos compartilhados, caminho crítico e planos de contorno — seguido de três simulações what-if executadas em sequência sobre o cronograma gerado.

## Contexto

- Disciplina: Ferramentas de IA para Gestão de Projetos
- Período: Setembro/2026
- Autor: guipalm4

## Descrição

O **Scheduling Prompt** é um prompt de planejamento. Ele recebe a composição de um time, um backlog de User Stories já estimado, as dependências conhecidas e as restrições de calendário — aqui, cinco histórias do **RouteWise**, a plataforma de gestão de frota da Conecta Cargas, priorizadas por RICE e WSJF no módulo anterior — e devolve cinco seções fixas: cronograma sprint a sprint com responsável e capacidade utilizada, dependências mapeadas, caminho crítico, flags de risco e soluções de contorno.

O que diferencia o artefato de um simples empacotamento de histórias em sprints são três exigências do bloco de restrições de comportamento. A primeira é a **capacidade real**: o prompt manda trabalhar com 65% da capacidade nominal, o que converte 35 SP/sprint em 22 SP — e obriga a descontar feriados da sprint em que caem. A segunda é a **inferência de dependência implícita**: quando duas histórias compartilham o mesmo componente técnico, o modelo precisa sinalizá-las como dependência candidata mesmo que ninguém as tenha declarado assim. A terceira é a **declaração de escopo**: história que não cabe em nenhuma sprint sai marcada como *Fora do escopo do MVP*, com o motivo, em vez de desaparecer do plano.

Sobre o cronograma gerado rodam três prompts de **análise what-if**, na mesma sessão, cada um alterando uma variável do plano: o lead time do hardware sobe de 60 para 88 dias; o Dev Sênior Backend se ausenta por duas semanas na sprint da demo; o cliente antecipa a entrega em duas semanas e o Sprint 6 deixa de existir. Cada cenário exige impacto nas datas, ao menos duas alternativas com trade-offs explícitos e uma recomendação justificada — é o formato que transforma o cronograma de documento estático em modelo que responde a perguntas.

O caso do RouteWise foi montado para que o caminho crítico **não** coincidisse com o caminho do OKR: a história de maior impacto no indicador contratado é a única sem blocker de hardware, enquanto três das cinco histórias esperam o mesmo fornecedor, com 60 dias de lead time correndo em paralelo à capacidade do time.

## Tecnologias e Ferramentas

- [x] **Claude** (`claude-opus-5`) — engine de execução do prompt, em subagente de contexto limpo
- [x] **Markdown** — formato do prompt, do insumo e dos outputs
- [x] **Story Points** — unidade de estimativa do backlog, convertida para horas (≈ 4,5h por SP) para o cálculo de capacidade
- [x] **Caminho crítico (CPM)** — a cadeia de precedências que define a data final, aplicada informalmente sobre o cronograma de sprints
- [x] **Análise what-if** — prompts de sensibilidade executados em sequência na mesma sessão, sobre o cronograma já gerado
- [x] **Google AI Studio** — destino declarado no template da disciplina, com bloco separado para System Instructions; a execução deste módulo não passa por ele
- [x] **Jira** — apenas a nomenclatura dos itens (`US-01`…`US-09`) e o estado de board descrito em `material/jira-estado-board.md`; nenhuma instância é usada na geração

## Pré-requisitos

- Acesso ao Claude com capacidade de executar o prompt em sessão isolada
- Um backlog já priorizado e estimado em Story Points — este módulo consome o ranking produzido no módulo 002
- As dependências e restrições preenchidas antes da execução: lead times de fornecedor, marcos de negócio com data, feriados do período e a capacidade nominal por pessoa

## Como executar

O prompt já traz contexto, backlog, dependências e restrições embutidos — é um arquivo único, enviado como mensagem. No repositório:

```bash
/roda-prompt 003 v1     # → outputs/cronograma-sprints-v1.md
```

Os três cenários what-if são enviados em sequência, na mesma sessão, a partir dos blocos de [`inputs/scheduling-routewise-input.md`](inputs/scheduling-routewise-input.md) → `outputs/whatif-cenarios-v1.md`.

Manualmente: cole `prompts/scheduling-v1.md` inteiro numa sessão nova; depois, um cenário what-if por vez, sem reenviar o contexto.

Funcionou quando o output traz as cinco seções na ordem definida, toda sprint com a linha de capacidade utilizada contra o teto de 22 SP, ao menos uma dependência implícita que não estava no input, e uma solução de contorno para cada flag de risco.

## Estrutura do Projeto

```
003-cronograma-e-capacidade/
├── prompts/
│   ├── scheduling-template.md          # template da disciplina, com os campos [PREENCHER]
│   └── scheduling-v1.md                # preenchido com o contexto do RouteWise
├── inputs/
│   └── scheduling-routewise-input.md   # time, backlog, dependências, restrições e os 3 what-if
├── outputs/
│   ├── cronograma-sprints-v1.md        # cronograma, dependências, caminho crítico, riscos
│   └── whatif-cenarios-v1.md           # os três cenários com opções e recomendação
├── entrega/
│   ├── rubrica.md                      # os três níveis, extraídos do enunciado
│   ├── basico/README.md
│   └── intermediario/README.md         # pasta autocontida do nível atacado
└── material/                           # enunciado, output de referência e estado do board
```

## Como funciona

```
CONTEXTO DO TIME        BACKLOG PRIORIZADO      DEPENDÊNCIAS        RESTRIÇÕES
(6 papéis × 26h,        (5 US com SP e          (precedência,       (marco com data,
 sprint de 2 sem,        blocker declarado)      lead time IoT)      feriados, OKR)
        │                       │                     │                  │
        └───────────────┬───────┴─────────────────────┴──────────────────┘
                        ▼
          [ capacidade real ]   35 SP nominal × 0,65 = 22 SP/sprint
                        │       sprint com 2 feriados: 22,75 × 0,8 = 18 SP
                        ▼
          1. CRONOGRAMA POR SPRINT ── responsável e Effort por linha
                        │             capacidade utilizada X/22 SP
                        ▼
          2. DEPENDÊNCIAS MAPEADAS
             ├── explícitas   → as declaradas no input
             └── implícitas   → inferidas de componente compartilhado
                                (gateway, pipeline, fornecedor, pessoa)
                        ▼
          3. CAMINHO CRÍTICO ── duas cadeias, e a que define a data
                        │        final não é a do OKR
                        ▼
          4. FLAGS DE RISCO ── blocker ou dependência não resolvida
                        │       → impacto no cronograma se não resolvido
                        ▼
          5. SOLUÇÕES DE CONTORNO ── uma por flag, executável em paralelo
                        │
                        ▼
          ┌─────────────┴─────────────┐
          ▼             ▼             ▼
      WHAT-IF 1     WHAT-IF 2     WHAT-IF 3
      hardware      pessoa-chave  prazo
      +28 dias      ausente 2 sem antecipado 2 sem
          │             │             │
          └─────────────┴─────────────┘
                        ▼
            impacto → ≥2 opções com trade-off → recomendação
```

A articulação do artefato está entre as seções 3 e 5. A seção 3 separa as cadeias de precedência e mostra que a data final é definida pela espera por fornecedor, não pelo trabalho do time — 8 das 12 semanas do caminho crítico são lead time. A seção 5 responde a isso deslocando trabalho para antes do bloqueio: construir contra mock a camada de ingestão, o simulador de sensores e os testes de integração retira do caminho crítico o que é software, deixando para depois da chegada do hardware apenas integração física e calibração.

Os prompts what-if operam sobre o cronograma já produzido, sem reenviar o contexto. É isso que permite comparar as três respostas entre si: o plano base é constante, e o que varia é uma única premissa por cenário.

## Conceitos trabalhados

- [x] **Capacidade real vs. nominal** — o fator de 65% aplicado antes de qualquer alocação, com o desconto de feriados recaindo sobre a sprint específica em que eles caem
- [x] **Dependência implícita por componente compartilhado** — duas histórias que usam o mesmo gateway, o mesmo pipeline ou o mesmo fornecedor viram dependência candidata, ainda que ninguém as tenha declarado ligadas
- [x] **Caminho crítico** — a cadeia cujo atraso desloca a data final, distinguida da cadeia que sustenta o OKR contratado
- [x] **Lead time de fornecedor como trabalho zero** — espera que ocupa semanas do cronograma sem consumir capacidade, e que por isso não aparece na conta de Story Points
- [x] **Trabalho habilitador** — rollout, mocks, pipeline de dados e homologação não constam do backlog priorizado, mas consomem capacidade e precisam aparecer no cronograma
- [x] **Desenvolvimento contra mock** — construir o software do sensor antes do hardware para tirar do caminho crítico tudo o que não exige o equipamento físico
- [x] **Ponto único de falha por fornecedor** — três histórias com o mesmo fornecedor não são três riscos independentes, é um risco com três consequências
- [x] **Concentração de pessoa-chave** — dependência de pessoa, não de código: um único perfil de integração IoT em quatro sprints do caminho crítico
- [x] **Análise what-if** — simulação de sensibilidade sobre o plano gerado, com opções e trade-offs explícitos em vez de um único plano revisado
- [x] **Fora do escopo do MVP** — a saída declarada, com motivo, para a história que não cabe nas restrições dadas

## Aprendizados

- [x] A capacidade real a 65% não é um desconto cosmético: ela é o que faz uma história de 34 SP não caber em nenhuma sprint de 22 SP, e é assim que o corte de escopo aparece como consequência aritmética em vez de opinião.
- [x] O caminho crítico de um projeto com hardware raramente coincide com o caminho do OKR — a história que move o indicador pode terminar com seis semanas de folga enquanto a data final é definida por um pedido de compra emitido na semana 1.
- [x] Lead time de fornecedor não consome Story Point nenhum e por isso é invisível numa conta de capacidade, apesar de ocupar dois terços do caminho crítico.
- [x] Antecipar contra mock o software que depende de hardware encurta o caminho crítico de forma mensurável: o que sobra para a janela pós-entrega é integração física e calibração, não desenvolvimento.
- [x] Numa sprint final sem sprint seguinte para absorver retrabalho, o critério de qual história cortar é o perfil técnico — leitura binária versus calibração de sensor — e não o valor de negócio percebido.
- [x] Pedir ao modelo duas alternativas com trade-off explícito, em vez de um plano revisado, é o que mantém a decisão com quem tem o contexto de negócio; sem isso o what-if devolve uma escolha já feita e sem critério declarado.

## Referências

- [Critical Path Method — Project Management Institute](https://www.pmi.org/learning/library/critical-path-method-scheduling-6363)
- [Capacity Planning in Scrum — Scrum.org](https://www.scrum.org/resources/blog/capacity-planning-scrum)
- [The Principles of Product Development Flow — Donald Reinertsen](https://www.amazon.com/dp/1935401009)
- [Agile Estimating and Planning — Mike Cohn](https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning)
