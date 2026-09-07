# Diff dos prompts — Missão #02

Só o bloco CONTEXTO DE NEGÓCIO mudou entre as três versões. O protocolo de cálculo,
o formato de output e as restrições de comportamento são idênticos nas três.

## V1 → V2 — injeção de dados de OKR (prosa)

```diff
@@ -8,7 +8,12 @@
 
 Empresa: Conecta Cargas — empresa de logística com 140 veículos. Projeto/sistema: RouteWise (plataforma de gestão de frota), fase de MVP.
 Stakeholder: Carlos (Diretor de Operações).
-OKR do Carlos: reduzir sinistros por excesso de velocidade de 7 para 5 até setembro de 2026 (~28% de redução).
+OKRs do Carlos:
+
+- reduzir sinistros por excesso de velocidade de 7 para 5 até setembro de 2026 (~28% de redução). Media hoje de 2 sinistros por mes: Custo de R$ 40.000,00
+- 20 % da frota é de caminhoes refrigerados
+- Estar apto a comprovar, em fiscalização, a cadeia de temperatura de toda viagem refrigerada — antes de 01/01/2027. Sob pena de multa de 10.000,00 para cada caminhão sem o sensor.
+
 Restrição conhecida: lead time de 60 dias para sensores IoT (hardware externo).
 Time: 6 devs, sprint de 2 semanas, capacidade ~35 SP por sprint.
 
```

## V2 → V3 — reestruturação do contexto (tabelas + regras de uso)

```diff
@@ -6,17 +6,38 @@
 
 ## CONTEXTO DE NEGÓCIO
 
-Empresa: Conecta Cargas — empresa de logística com 140 veículos. Projeto/sistema: RouteWise (plataforma de gestão de frota), fase de MVP.
+Empresa: Conecta Cargas — empresa de logística. Projeto/sistema: RouteWise (plataforma de gestão de frota), fase de MVP.
 Stakeholder: Carlos (Diretor de Operações).
-OKRs do Carlos:
 
-- reduzir sinistros por excesso de velocidade de 7 para 5 até setembro de 2026 (~28% de redução). Media hoje de 2 sinistros por mes: Custo de R$ 40.000,00
-- 20 % da frota é de caminhoes refrigerados
-- Estar apto a comprovar, em fiscalização, a cadeia de temperatura de toda viagem refrigerada — antes de 01/01/2027. Sob pena de multa de 10.000,00 para cada caminhão sem o sensor.
+### Fatos medidos da operação
 
-Restrição conhecida: lead time de 60 dias para sensores IoT (hardware externo).
-Time: 6 devs, sprint de 2 semanas, capacidade ~35 SP por sprint.
+| Dado | Valor | Unidade |
+| --- | --- | --- |
+| Frota total | 140 | veículos |
+| Frota refrigerada | 28 (20% da frota) | veículos |
+| Sinistros por excesso de velocidade | 7 | ocorrências nos últimos 12 meses |
+| Custo médio do sinistro | R$ 40.000 | por ocorrência |
 
+### OKRs do Carlos
+
+1. **Reduzir sinistros por excesso de velocidade de 7 para 5 até setembro de 2026** (~28% de redução).
+2. **Estar apto a comprovar, em fiscalização, a cadeia de temperatura de toda viagem refrigerada, antes de 01/01/2027.**
+
+### Restrições e exposições
+
+| Item | Valor |
+| --- | --- |
+| Lead time de sensores IoT (hardware externo) | 60 dias |
+| Multa por veículo refrigerado sem sensor a partir de 01/01/2027 | R$ 10.000 por veículo, por autuação |
+| Capacidade do time | 6 devs, sprint de 2 semanas, ~35 SP por sprint |
+
+### Como usar estes dados
+
+- Os **fatos medidos** são a base de Reach e de Impact. Use-os como estão; não os re-estime nem os arredonde.
+- Os **OKRs** definem o que conta como valor de negócio. Item que não move nenhum dos dois não pode receber Impact acima de 1.
+- As **exposições** entram em Cost of Delay, não em Impact. Prazo com data definida eleva Time Criticality; valor financeiro eleva Business Value.
+- Se um item exigir um número que não está nas tabelas acima, **declare a suposição explicitamente na justificativa e mantenha Confidence em 50%** — não trate estimativa própria como dado do contexto.
+
 ---
 
 ## BACKLOG DE INPUT
```
