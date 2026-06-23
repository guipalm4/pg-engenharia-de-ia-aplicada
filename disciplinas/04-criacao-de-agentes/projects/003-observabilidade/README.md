# Exemplo 003 — Observabilidade: um Agente que Analisa Outro

> Introduz o `trace-analyzer`, um segundo agente declarativo que consome o `trace.json` produzido pelo `monitor-agent` e emite um diagnóstico de saúde, performance, conformidade e anomalias — provando que o mesmo runtime serve a qualquer domínio só trocando os contratos.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Os projetos [001-contratos](../001-contratos/README.md) e [002-runtime](../002-runtime/README.md) construíram e dissecaram um agente (`monitor-agent`) que roda um loop e grava telemetria em `trace.json`. Este projeto fecha o ciclo de observabilidade: cria um **segundo agente, o `trace-analyzer`**, cuja única função é ler o trace de uma execução e produzir um diagnóstico estruturado. É o "meta-agente" prometido nas aulas anteriores — agora implementado.

O ponto pedagógico é forte: o `trace-analyzer` **não tem código próprio**. Ele é definido pelos mesmos nove contratos Markdown/YAML do `monitor-agent` (identidade, ciclo, decisão, skills, limites, ganchos, memória) e roda no **mesmo runtime, sem nenhuma alteração funcional**. Trocar `monitor-agent` (que diagnostica incidentes) por `trace-analyzer` (que diagnostica execuções) é só apontar o runtime para outra pasta de contratos. Isso evidencia que o runtime é genuinamente agnóstico ao domínio.

O `trace-analyzer` define cinco habilidades encadeadas — `analisar_saude` → `analisar_performance` → `analisar_conformidade` → `detectar_anomalias` → `gerar_veredito` — todas obrigatórias e com ordem imposta por políticas no `rules.md` ("sempre analisar saúde antes de performance", "não gerar veredito sem as 4 análises anteriores"). O comando `analisar` do runtime resume o `trace.json` da última execução, alimenta o analyzer e gera dois artefatos: `analise.json` (estruturado) e `analise-agente.md` (relatório legível com tabelas de pipeline, saúde, performance, conformidade, anomalias e veredito).

O runtime em si é idêntico ao de 002 a menos de detalhes cosméticos (correção de caractere de moldura no painel de KPIs, reordenação de import); a novidade desta aula está **inteiramente nos contratos do novo agente**.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente (stdlib: `argparse`, `pathlib`, `json`, `uuid`)
- [x] **PyYAML** — parse dos blocos YAML embutidos nos contratos `.md`
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador e geração de dados das ferramentas
- [x] **python-dotenv** — carga da `OPENAI_API_KEY`
- [x] **Contratos Markdown/YAML** — definição declarativa de ambos os agentes

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela ambos os agentes rodam com planejador e ferramentas mock

## Como executar
```bash
cd disciplinas/04-criacao-de-agentes/projects/003-observabilidade/runtime
pip install -r requirements.txt
cp .env.example .env   # opcional: preencher OPENAI_API_KEY

# 1. rodar o agente observado (gera runtime/trace.json)
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia no checkout"

# 2. analisar o trace com o trace-analyzer
#    gera runtime/analise.json + runtime/analise-agente.md
python main.py analisar --agente ../trace-analyzer

# variações
python main.py analisar --agente ../trace-analyzer --trace ./trace.json
python main.py rastreamento        # rastreamento da última execução
python main.py validar --agente ../trace-analyzer   # valida os contratos do analyzer
```

## Estrutura do Projeto
```
003-observabilidade/
├── monitor-agent/          # agente observado (idêntico a 001/002)
│   └── …9 contratos
│
├── trace-analyzer/         # ★ NOVO: agente que analisa traces
│   ├── agent.md            # objetivo: diagnosticar_execucao; saída: saude/performance/conformidade/anomalias/veredito
│   ├── skills.md           # 5 habilidades de análise encadeadas
│   ├── rules.md            # 5 ferramentas obrigatórias + políticas de ordem e honestidade
│   ├── hooks.md  memory.md  commands.md
│   └── contracts/  loop.md  planner.md  toolbox.md  executor.md
│
└── runtime/                # mesmo runtime (mudanças só cosméticas vs 002)
    ├── main.py             # comando `analisar`: resume trace → roda analyzer → gera relatório .md
    ├── ciclo.py  contratos.py  planejador.py  ferramentas.py  executor.py
    ├── telemetria.py  validador.py  requirements.txt
```

## Como funciona
```
monitor-agent ──roda──▶ runtime ──▶ trace.json
                                        │
                          main.py: _resumir_trace(trace.json)
                                        ▼
trace-analyzer ──roda no MESMO runtime──▶ pipeline de 5 análises
                                        ▼
                          analise.json  +  analise-agente.md (relatório)
```

Pipeline obrigatório do `trace-analyzer` (ordem imposta por `rules.md`):

1. **`analisar_saude`** — taxa de sucesso, ativações de circuit breaker, payload inválido, qualidade das avaliações.
2. **`analisar_performance`** — tempo e tokens usados vs. limite, tendência de latência por fase, gargalos.
3. **`analisar_conformidade`** — ferramentas obrigatórias chamadas? pipeline completo? guardrails ativados? violações.
4. **`detectar_anomalias`** — padrões anômalos (latência crescente, etapas improdutivas, finalização prematura) + severidade.
5. **`gerar_veredito`** — consolida as 4 análises num veredito objetivo e acionável com recomendações (indicando se a correção é no runtime ou nos contratos).

O comando `analisar` (em `main.py`) faz a ponte: `_resumir_trace` condensa o `trace.json` numa string (trace_id, etapas, health metrics, performance), passa como entrada ao analyzer, e `_gerar_relatorio_md` cruza o trace original com a análise para emitir `analise-agente.md`. Como qualquer agente, o analyzer roda sob os mesmos guardrails: 5 chamadas no total, `max_etapas: 8`, `limite_tempo: 180s`, circuit breaker validando cada decisão da LLM.

## Conceitos trabalhados
- [x] **Agente sobre agente** — `trace-analyzer` audita a execução do `monitor-agent` a partir do `trace.json`
- [x] **Runtime agnóstico ao domínio** — provado: dois agentes de propósitos opostos rodam no mesmo motor só trocando contratos
- [x] **Pipeline de análise encadeado** — 5 habilidades obrigatórias com ordem imposta por `politicas` no `rules.md`
- [x] **Observabilidade acionável** — saúde, performance, conformidade, anomalias e veredito com recomendações (runtime vs. contrato)
- [x] **Honestidade do diagnóstico** — políticas proíbem inventar dados; sem evidência no trace, registrar "dados insuficientes"
- [x] **Relatório legível** — `main.py` gera `analise-agente.md` cruzando trace original com a análise
- [x] **Guardrails no analyzer** — `max_etapas: 8`, limite de 5 chamadas, `gerar_veredito` só após as 4 análises

## Aprendizados
- [x] A melhor prova de que o runtime é genérico não é um discurso, e sim **um segundo agente radicalmente diferente rodando sem tocar no código** — só novos contratos.
- [x] Observabilidade vira produto quando um agente transforma telemetria bruta (`trace.json`) em veredito acionável, distinguindo se o problema está no runtime ou nos contratos.
- [x] Forçar ordem e obrigatoriedade das análises via `politicas` (não via código) mantém o pipeline de diagnóstico governado pelo contrato, igual a qualquer outro agente.
- [x] Políticas anti-alucinação ("nunca inventar dados", "dados insuficientes" em vez de inferir) são essenciais quando o agente analisa evidências — um diagnóstico inventado é pior que nenhum.

## Referências
- [001-contratos](../001-contratos/README.md) — definição declarativa do agente
- [002-runtime](../002-runtime/README.md) — internos do runtime
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation)
