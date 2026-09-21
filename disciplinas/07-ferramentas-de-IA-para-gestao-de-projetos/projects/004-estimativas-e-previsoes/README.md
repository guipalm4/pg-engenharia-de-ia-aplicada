# Módulo 004 — Estimativas e Previsões Probabilísticas com IA

> Prompt que calcula PERT, variância e desvio padrão sobre estimativas de três pontos e traduz o resultado para quatro audiências, combinado a um script Monte Carlo em Python que gera o intervalo P50/P85/P95 do MVP com a restrição de hardware modelada como segunda trilha.

## Contexto

- Disciplina: Ferramentas de IA para Gestão de Projetos
- Período: Setembro/2026
- Autor: guipalm4

## Descrição

O módulo troca a data única por um intervalo de confiança. Cada história do MVP do **RouteWise** — as quatro que ficaram dentro do escopo no cronograma do módulo 003 — recebe três pontos de estimativa em semanas: Otimista, Mais Provável e Pessimista. O Pessimista segue o critério do *pessimista técnico*: ele precisa estar ancorado num risco concreto que faria a história levar o dobro do tempo, e não num "pode complicar" genérico.

O **Probability Forecast Prompt** recebe esses três pontos e o fator de paralelismo do time e devolve três blocos fixos: a tabela PERT com variância, desvio padrão e status por história; o Top 3 de histórias com maior incerteza, cada uma com uma ação para reduzir a incerteza antes do desenvolvimento (spike, PoC, pesquisa); e a mesma previsão escrita para quatro audiências — time técnico, gestor de produto, executivo e cliente. O bloco de restrições manda questionar o Pessimista quando ele fica abaixo de 1,5× o Mais Provável (viés de otimismo) e marcar como *Alta Incerteza* a história com desvio padrão acima de 30% do PERT.

O prompt proíbe o modelo de calcular Monte Carlo. Os percentis vêm de um **script** que sorteia cada história de uma distribuição triangular e modela o projeto em duas trilhas: a de software começa na semana 1, e a de hardware (sensores do baú) só começa quando o equipamento chega, na semana 9. O prazo de cada simulação é o fim da trilha mais longa. O P85 resultante é comparado com a data comprometida no cronograma do módulo 003.

## Tecnologias e Ferramentas

- [x] **Claude** (`claude-opus-5`) — engine de execução do prompt, em subagente de contexto limpo
- [x] **Python 3** — script Monte Carlo, só com a biblioteca padrão (`random`, `math`)
- [x] **PERT** — estimativa `(O + 4M + P) / 6`, variância `((P − O) / 6)²` e desvio padrão agregado pela soma das variâncias
- [x] **Distribuição triangular** — a distribuição de cada história no Monte Carlo, parametrizada pelos mesmos O, M e P
- [x] **Markdown** — formato do prompt e dos outputs
- [x] **Google AI Studio** — destino declarado no template da disciplina; a execução deste módulo não passa por ele
- [x] **JavaScript** — versão do script para o console do navegador, mantida em `material/`; a execução usa a versão Python

## Como executar

O prompt já traz as histórias, os três pontos e o paralelismo embutidos. No repositório:

```bash
/roda-prompt 004 v1     # → outputs/forecast-pert-v1.md
```

O Monte Carlo roda localmente:

```bash
python3 scripts/monte-carlo-routewise.py
```

Funcionou quando o output do prompt traz a tabela PERT com o raciocínio do cálculo, o Top 3 com uma ação por história e os quatro parágrafos de audiência, e o script imprime P50, P85, P95 e a média em semanas.

## Estrutura do Projeto

```
004-estimativas-e-previsoes/
├── prompts/
│   ├── probability-forecast-template.md   # template da disciplina, com prompt e scripts
│   └── probability-forecast-v1.md         # preenchido com as histórias do MVP do RouteWise
├── scripts/
│   └── monte-carlo-routewise.py           # script do material com os três pontos do MVP
├── outputs/
│   ├── forecast-pert-v1.md                # PERT, Top 3 e comunicação por audiência
│   └── monte-carlo-v1.md                  # P50/P85/P95 do script
├── entrega/
│   ├── rubrica.md                         # os três níveis, extraídos do enunciado
│   ├── basico/README.md
│   └── intermediario/README.md
└── material/                              # enunciado, exemplo, scripts originais e output de referência
```

## Como funciona

```
TRÊS PONTOS POR HISTÓRIA              PARALELISMO
(O, M, P em semanas + risco do P)     (6 devs, fator efetivo 1,5)
        │                                   │
        ├───────────────┬───────────────────┘
        ▼               ▼
   PROMPT (LLM)                         SCRIPT (Python)
   PERT = (O + 4M + P) / 6              10.000 sorteios triangulares
   σ = (P − O) / 6                      │
   σ agregado = √Σ variâncias           ├── trilha software: (US-01 + US-03) / 1,3
        │                               ├── trilha hardware: 9 + (US-04 + US-09) / 1,5
        ▼                               └── prazo = max(trilhas)
   Tabela PERT + status                          │
   Top 3 de maior incerteza + ação               ▼
   4 audiências                         P50 · P85 · P95 · média
        │                                        │
        └──────────────────┬─────────────────────┘
                           ▼
          P85 comparado com a data do cronograma do módulo 003
          → decisão: escopo, capacidade, prazo ou restrição externa
```

O modelo cuida do que é interpretação: explicar o cálculo, apontar onde está a incerteza e escrever para cada audiência. O script cuida do que é estatística. A trilha de hardware com início fixo na semana 9 é o que faz o prazo depender da integração dos sensores do baú, e não da soma do esforço do time.

## Conceitos trabalhados

- [x] **Estimativa de três pontos** — Otimista, Mais Provável e Pessimista por história, com o Pessimista ancorado num risco técnico nomeado
- [x] **PERT** — média ponderada que dá peso 4 ao Mais Provável, com variância derivada da amplitude entre Otimista e Pessimista
- [x] **Variância como critério de risco** — o Top 3 de histórias vem do desvio padrão, e cada uma recebe uma ação para reduzir a incerteza antes do desenvolvimento
- [x] **Viés de otimismo** — Pessimista abaixo de 1,5× o Mais Provável é tratado como sinal de estimativa subestimada
- [x] **Monte Carlo** — distribuição de prazos obtida por sorteio, em vez de um número calculado pelo modelo de linguagem
- [x] **Percentis de confiança** — P50 como cenário provável, P85 como compromisso externo, P95 como leitura conservadora
- [x] **Restrição externa como trilha** — a espera pelo hardware entra no modelo como início tardio de uma trilha paralela, não como esforço
- [x] **Comunicação por audiência** — a mesma previsão escrita para time, gestor, executivo e cliente, com o nível de confiança explícito

## Aprendizados

- [x] Uma data sem intervalo de confiança é um palpite; o P85 é o número que se defende perante o stakeholder, porque o P50 atrasa em metade dos cenários.
- [x] O PERT assume riscos independentes, e histórias que compartilham componente, como um gateway ou um esquema de dados, fazem o desvio real ser maior que o calculado pela soma das variâncias.
- [x] Quando uma trilha só começa após uma restrição externa, o prazo é definido por ela, e aumentar a capacidade do time não o encurta.
- [x] LLM não sorteia números: pedir ao modelo para "simular" percentis produz um número plausível sem distribuição por trás, por isso o Monte Carlo fica num script.
- [x] O critério do pessimista técnico transforma o Pessimista de margem arbitrária em risco nomeado, e é esse risco que vira a ação de redução de incerteza.

## Referências

- [Three-point estimation — Wikipedia](https://en.wikipedia.org/wiki/Three-point_estimation)
- [Program evaluation and review technique — Wikipedia](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique)
- [Monte Carlo method — Wikipedia](https://en.wikipedia.org/wiki/Monte_Carlo_method)
- [Software Estimation: Demystifying the Black Art — Steve McConnell](https://www.amazon.com/dp/0735605351)
- [Agile Estimating and Planning — Mike Cohn](https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning)
