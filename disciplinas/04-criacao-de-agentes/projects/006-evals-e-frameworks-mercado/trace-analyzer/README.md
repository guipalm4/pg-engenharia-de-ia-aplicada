# trace-analyzer

Agente que analisa o trace de execucao de qualquer agente e gera diagnostico estruturado.

---

## Estrutura

```
trace-analyzer/
├── agent.md            ← identidade, tipo e contrato de saida
├── rules.md            ← limites, politicas e acoes sensiveis
├── skills.md           ← contrato das ferramentas (entrada/saida)
├── hooks.md            ← interceptacao (antes/depois etapa e acao, erro)
├── memory.md           ← memoria curta e resumo final
├── commands.md         ← comandos CLI disponiveis
└── contracts/
    ├── loop.md         ← ciclo do agente e condicoes de parada
    ├── planner.md      ← contrato de decisao da LLM
    ├── executor.md     ← validacao de resultado
    └── toolbox.md      ← capacidades do agente
```

## O que faz

Le o `trace.json` gerado pelo runtime e executa 5 analises em sequencia:

1. **analisar_saude** — taxa de sucesso, circuit breaker, payload invalido, qualidade
2. **analisar_performance** — tempo, tokens, tendencia de latencia, gargalos
3. **analisar_conformidade** — ferramentas obrigatorias, pipeline completo, guardrails
4. **detectar_anomalias** — padroes anormais, etapas improdutivas, finalizacao prematura
5. **gerar_veredito** — diagnostico final com recomendacoes acionaveis

## Pipeline

```
analisar_saude → analisar_performance → analisar_conformidade → detectar_anomalias → gerar_veredito → FINALIZAR
```

Ferramenta obrigatoria: `gerar_veredito` (deve ser chamada antes de FINALIZAR).

## Como rodar

```bash
cd ../runtime

# primeiro rode qualquer agente para gerar o trace
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia"

# depois analise o trace gerado
python main.py analisar --agente ../trace-analyzer

# ou analise um trace especifico
python main.py analisar --agente ../trace-analyzer --trace caminho/para/trace.json
```

## Arquivos gerados

| Arquivo | Conteudo |
|---------|----------|
| `trace.json` | Trace original do agente (preservado, nao sobrescrito) |
| `analise.json` | Trace do analyzer (dados estruturados) |
| `analise-agente.md` | Relatorio legivel com tabelas, metricas e recomendacoes |

## Saida do `analise-agente.md`

O relatorio contem:
- Dados do agente analisado (trace ID, tipo, tempo, tokens)
- Tabela do pipeline executado (etapa, acao, ferramenta, sucesso, qualidade)
- Saude (taxa sucesso, circuit breaker, payload, qualidade)
- Performance (tempo, tokens, latencia, gargalos, detalhamento por fase)
- Conformidade (ferramentas obrigatorias, pipeline completo, guardrails)
- Anomalias detectadas com severidade
- Veredito final e recomendacoes acionaveis

## Diagnostico

Se a analise estourar tokens → o trace analisado pode ser muito grande (muitas etapas).
Se o veredito nao for gerado → verificar `gerar_veredito` em `ferramentas_obrigatorias`.
Se os dados parecem inventados → verificar politica "nunca inventar dados que nao estejam no trace".
