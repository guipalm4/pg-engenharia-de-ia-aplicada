---
versao: v1
prompt: probability-forecast-v1.md
input: histórias e paralelismo embutidos no prompt
modelo: claude-opus-5
gerado_em: 15/09/2026
execucao: subagente de contexto limpo
---

### Tabela PERT

| História | O | M | P | PERT (sem) | Variância | Desvio Padrão | Status |
|---|---|---|---|---|---|---|---|
| US-01 — Alertas de Velocidade em Tempo Real | 3 | 4 | 8 | 4,50 | 0,69 | 0,83 | Dentro do limite (DP = 18,5% do PERT) |
| US-03 — Score de Comportamento do Motorista (MVP parcial) | 1 | 2 | 4 | 2,17 | 0,25 | 0,50 | Dentro do limite (DP = 23,1% do PERT) |
| US-04 — Sensor de Abertura de Baú | 1 | 2 | 4 | 2,17 | 0,25 | 0,50 | Dentro do limite (DP = 23,1% do PERT) — bloqueada até a semana 9 |
| US-09 — Sensor de Baú — Controle de Temperatura | 3 | 4 | 8 | 4,50 | 0,69 | 0,83 | Dentro do limite (DP = 18,5% do PERT) — bloqueada até a semana 9 |
| **Total** | | | | **13,33** | **1,89** | **1,37** (agregado) | |

**Raciocínio do cálculo por história**

- **US-01 e US-09** (O=3, M=4, P=8): PERT = (3 + 4×4 + 8) / 6 = 27 / 6 = 4,50 semanas. Variância = ((8 − 3) / 6)² = (0,833)² = 0,694. Desvio padrão = √0,694 = 0,83 semana. 0,83 / 4,50 = 18,5%, abaixo do limiar de 30%.
- **US-03 e US-04** (O=1, M=2, P=4): PERT = (1 + 4×2 + 4) / 6 = 13 / 6 = 2,17 semanas. Variância = ((4 − 1) / 6)² = (0,5)² = 0,25. Desvio padrão = √0,25 = 0,50 semana. 0,50 / 2,17 = 23,1%, abaixo do limiar de 30%.
- **Viés de otimismo:** nas quatro histórias P = 2,0 × M (8/4 e 4/2), acima do mínimo de 1,5×. Pela regra, nenhum pessimista é sinalizado como subestimado. Ressalva: o P de US-04 e US-09 cobre falhas de integração (firmware, calibração), mas **não** cobre atraso na chegada do hardware — esse risco não está em nenhuma das estimativas.
- **Alta Incerteza:** nenhuma história ultrapassa 30% de desvio padrão sobre o PERT; nenhuma recebe a classificação.

**Totais do projeto**

- **Esforço sequencial total** = 4,50 + 2,17 + 2,17 + 4,50 = **13,33 semanas**.
- **Elapsed time com paralelismo** = 13,33 / 1,5 = **8,89 semanas**.
- **Desvio padrão agregado** = √(0,694 + 0,25 + 0,25 + 0,694) = √1,889 = **1,37 semana** (em esforço sequencial). Convertido para calendário pelo mesmo fator: 1,37 / 1,5 = **0,92 semana**.
- Pela fórmula, o forecast seria 8,89 semanas (≈ 50% de confiança), 9,81 semanas com +1 DP (≈ 84%) e 10,40 semanas com +1,645 DP (≈ 95%).

**Restrição de calendário que a fórmula não captura**

A divisão por 1,5 distribui o esforço como se todas as histórias pudessem começar no início do projeto. Não podem: US-04 e US-09 só começam na semana 9. Considerando a semana 9 como início após 8 semanas decorridas, o calendário real fica em duas trilhas:

- **Trilha de software (US-01 → US-03):** 4,50 + 2,17 = 6,67 semanas; DP = √(0,694 + 0,25) = 0,97. Mesmo com +1,645 DP (≈ 95%), termina em 8,27 semanas — antes da chegada do hardware. Não é o caminho crítico.
- **Trilha de hardware (US-04 e US-09 em paralelo, a partir da semana 9):** o fim é determinado por US-09, a mais longa: 8 + 4,50 = **12,50 semanas**; DP = 0,83. US-04 termina em 8 + 2,17 = 10,17 semanas e só alcançaria US-09 em um cenário extremo.

Forecast pelo caminho crítico:

| Confiança | Cálculo | Prazo |
|---|---|---|
| ≈ 50% | 12,50 | 12,5 semanas |
| ≈ 84% | 12,50 + 1 × 0,83 | 13,3 semanas |
| ≈ 95% | 12,50 + 1,645 × 0,83 | 13,9 semanas |

Duas premissas tornam esse intervalo otimista: (1) a soma de variâncias pressupõe riscos independentes, mas US-04 e US-09 compartilham o gateway do baú e US-03 depende do esquema de dados de US-01 — riscos correlacionados fazem os atrasos se somarem em vez de se compensarem; (2) a data do hardware entra como certa, sem variância. Cada semana de atraso na chegada do hardware desloca o prazo final em uma semana.

### Top 3 histórias com maior incerteza

1. **US-09 — Sensor de Baú — Controle de Temperatura** (DP = 0,83 semana; amplitude O–P de 5 semanas). É a de maior impacto porque está no caminho crítico: qualquer desvio aqui move a data final do projeto um para um. **Ação:** antes da semana 9, montar um PoC de calibração com uma unidade de amostra do sensor (ou um sensor equivalente em bancada) e definir o procedimento e os critérios de aceite de calibração. Negociar com o fornecedor a entrega antecipada de 1 ou 2 unidades para isso.
2. **US-01 — Alertas de Velocidade em Tempo Real** (DP = 0,83 semana; amplitude de 5 semanas). O risco é o hardening do rollout nos 140 veículos. **Ação:** spike de carga e resiliência antes do desenvolvimento pleno — simular a telemetria dos 140 veículos (volume, perda de conexão, mensagens fora de ordem) e fazer rollout piloto em um subconjunto pequeno da frota para descobrir cedo o trabalho de hardening. Congelar o esquema de dados do pipeline ao fim desse spike, o que também protege US-03.
3. **US-04 — Sensor de Abertura de Baú** (DP = 0,50 semana, empatada com US-03). Escolhida para o Top 3 porque, além de estar bloqueada pelo hardware, compartilha com US-09 o risco de defeito de firmware no gateway do baú — um único problema atinge as duas histórias ao mesmo tempo. **Ação:** pesquisa técnica com o fornecedor do gateway (versão de firmware, bugs conhecidos, processo de atualização remota) e, se houver unidade de amostra, teste de comunicação ponta a ponta antes da semana 9.

*US-03 (DP = 0,50 semana, empate):* a ação é definir um contrato de dados versionado entre o pipeline de US-01 e a ingestão do score, de modo que uma mudança de esquema não obrigue a refazer a ingestão.

### Comunicação por audiência

**Para o time técnico:** as maiores variâncias estão em US-01 e US-09 (0,69 cada, DP de 0,83 semana), contra 0,25 em US-03 e US-04. Nenhuma passa do limiar de Alta Incerteza, mas o número isolado engana: US-09 está no caminho crítico, e os riscos não são independentes — o gateway do baú é compartilhado por US-04 e US-09, e a ingestão de US-03 depende do esquema de US-01. Isso significa que o desvio agregado real é maior que o 1,37 calculado. As oito semanas de espera pelo hardware são a janela para reduzir incerteza: PoC de calibração do sensor de temperatura e teste de firmware do gateway com unidades de amostra, spike de carga simulando os 140 veículos, piloto de rollout em parte da frota e um contrato de dados versionado entre US-01 e US-03. A trilha de software (US-01 → US-03) cabe folgada antes da semana 9 (8,3 semanas a 95%); se sobrar capacidade, ela deve ir para a preparação da integração de hardware, não para puxar escopo novo.

**Para o gestor de produto:** a fórmula de paralelismo indica 8,9 semanas, mas esse número não é executável, porque US-04 e US-09 só começam na semana 9. O prazo realista é definido pela integração do sensor de temperatura: 12,5 semanas no cenário esperado (≈ 50% de chance), 13,3 semanas com ≈ 84% e 13,9 semanas com ≈ 95%. A recomendação é comunicar **14 semanas** ao cliente, com confiança de aproximadamente 95%, **condicionada à chegada do hardware na semana 9**. Os principais drivers de risco são: (1) atraso na entrega do hardware, que desloca o prazo semana a semana e não está nas estimativas; (2) calibração do sensor de temperatura falhar na primeira integração; (3) defeito de firmware no gateway, que atinge US-04 e US-09 juntas; (4) hardening do rollout de US-01 nos 140 veículos, que por ora tem folga no calendário. Vale acompanhar com o fornecedor a data do hardware como marco do projeto.

**Para o executivo:** o projeto tem previsão de entrega em 14 semanas, com cerca de 95% de chance de cumprimento, desde que o fornecedor entregue o hardware dos sensores de baú na semana 9. As funcionalidades de software — alertas de velocidade e score de motorista — ficam prontas antes disso, por volta da semana 7 a 8. O risco de não cumprir as 14 semanas está concentrado em um ponto: a integração dos sensores do baú, que depende de terceiros. Se o hardware atrasar, o prazo final atrasa na mesma proporção. A mitigação proposta é antecipar testes com unidades de amostra durante as semanas de espera, o que tem custo baixo e reduz a chance de surpresa na reta final.

**Para o cliente:** a previsão de entrega completa é de 14 semanas. Os alertas de velocidade e a avaliação de comportamento dos motoristas devem ficar prontos primeiro, antes da metade final do projeto. O monitoramento do baú — abertura e controle de temperatura — vem por último, porque depende da chegada dos novos sensores, prevista para a semana 9. O que pode afetar o prazo: atraso na entrega desses sensores pelo fornecedor, ajustes necessários para que o sensor de temperatura meça com precisão e eventuais ajustes durante a ativação dos alertas em toda a frota de 140 veículos. Vamos usar as semanas de espera pelos sensores para testar o que for possível com antecedência e avisaremos imediatamente se a data dos sensores mudar.
