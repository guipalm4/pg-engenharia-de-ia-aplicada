# Exemplo 011 — Guardrails e Governança

> Pipeline de remediação de Kubernetes em que o agente propõe o `kubectl set image` acompanhado de `--dry-run=client`, e a execução só acontece depois da aprovação explícita do engenheiro no terminal.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Depois de dez aulas ampliando o que os agentes conseguem fazer sozinhos, esta trata do inverso: **onde a autonomia precisa parar**. O padrão é o *Human-in-the-Loop* (HITL) — a IA diagnostica e propõe, o humano valida e autoriza. Nenhuma ação de escrita (`kubectl apply`, `terraform apply`) sai sem aprovação explícita.

O cenário é um pod `checkout-api` com erro de imagem. Um agente `Safety_SRE`, cuja *backstory* o descreve como um engenheiro sênior cauteloso que sempre usa dry-run, recebe a task de propor o comando de correção para a versão estável `v2.0` e apresentá-lo com a flag `--dry-run=client`, para que o engenheiro possa validar o efeito antes de qualquer mudança real no cluster.

A trava fica **fora** da Crew: `kickoff()` devolve a proposta, o terminal pergunta `sim/não` e só então o caminho de execução é seguido — ou abortado, com registro no log de auditoria. É a separação entre *propor* e *executar*, escrita como estrutura de código e não como instrução de prompt.

Esta aula acrescenta o entrypoint `guardrails.py`, o primeiro da trilha em que o agente é declarado no próprio arquivo e o pipeline roda sem nenhuma tool; `core/`, `tools/` e `tests/` vêm das aulas anteriores sem alteração.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime do agente
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`; aqui, uma Crew de um agente e uma task
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **`input()` do terminal** — o portão de aprovação humana, entre a proposta e a execução
- [x] **`kubectl set image --dry-run=client`** — apenas o texto do comando e do seu resultado; nada é executado contra um cluster
- [x] **pytest** — testes herdados das aulas 003–005
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** Parar em `projects/` em vez da pasta da aula dá `ModuleNotFoundError: core`, porque os imports `core.*` resolvem pelo diretório do script.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 011-guardrails-e-governanca

# pipeline interativo: o terminal vai pedir a aprovação
uv run guardrails.py

# testes (não precisam de API key)
uv run pytest -v
```

Funcionando, o terminal mostra o painel `✅ Agent Final Answer` com o comando proposto, imprime `⚠️ PROPOSTA DA IA` e para na pergunta `✅ Você aprova a execução deste comando em PRODUÇÃO? (sim/não)`. Responder `sim` segue para a execução simulada; qualquer outra resposta aborta e registra a decisão no log de auditoria.

## Estrutura do Projeto

```
011-guardrails-e-governanca/
├── guardrails.py                 # entrypoint: o agente Safety_SRE, a task de
│                                 #   remediação e o portão de aprovação no terminal
├── core/
│   ├── agents.py                 # fábricas de agentes das aulas 001–010 (não usadas aqui)
│   └── llm_config.py             # Groq + RateLimitAwareLLM (herdado)
├── tools/                        # tools das aulas 001–006 (não usadas neste pipeline)
├── tests/                        # testes herdados das aulas 003–005
└── pyproject.toml                # membro virtual do workspace uv; pythonpath = ["."]
```

## Como funciona

```
incidente ("pod checkout-api com erro de imagem")
   │
   ▼
Agente Safety_SRE  (backstory: engenheiro cauteloso, SEMPRE usa dry-run)
   │  monta o comando de correção para a tag v2.0
   ▼
PROPOSTA: kubectl set image ... --dry-run=client  +  resultado previsto
   │
   ▼
┌──────────────── portão humano (fora da Crew) ────────────────┐
│  "Você aprova a execução deste comando em PRODUÇÃO?"         │
└──────────────────────────────────────────────────────────────┘
   │                                        │
   ├── "sim" ──▶ execução (simulada)        └── qualquer outra ──▶ ABORTA
                 pod atualizado                                    registra no
                                                                   log de auditoria
```

1. **Diagnóstico e proposta** — a `Task` descreve a falha e pede duas coisas: o comando `kubectl set image` para a versão estável e a versão com `--dry-run=client` para validação.
2. **Fim da autonomia** — `kickoff()` retorna texto. O agente não tem tool, então nada do que ele escreve toca um cluster: a Crew produz uma *recomendação*, não um efeito.
3. **Decisão humana** — o `input()` bloqueia o fluxo; a comparação é estrita (`sim`), de modo que o silêncio ou a ambiguidade caem no caminho seguro.
4. **Registro** — os dois desfechos são anunciados no terminal; o de recusa cita explicitamente o log de auditoria, que é onde ficam pareados o que a IA propôs e o que o humano decidiu.

## Conceitos trabalhados

- [x] **Human-in-the-Loop (HITL)** — a IA diagnostica e propõe; a autorização de escrita é do engenheiro
- [x] **Guardrail como estrutura, não como instrução** — a trava é o `if` do orquestrador, fora do alcance do que o modelo gera
- [x] **Dry-run como estratégia de defesa** — prever o impacto e validar a sintaxe antes da execução real
- [x] **Separação entre propor e executar** — a Crew termina na recomendação; o efeito colateral mora depois do portão
- [x] **Log de auditoria** — registrar o que a IA tentou fazer e o que o humano aprovou ou recusou
- [x] **Persona de segurança na *backstory*** — descrever o agente como cauteloso molda o formato da proposta que chega à revisão
- [x] **Fail-safe por default** — só a resposta afirmativa exata libera; qualquer outra entrada aborta

## Aprendizados

- [x] Um agente sem tool não é um agente sem risco — o risco muda de lugar: passa a ser o comando que um humano vai copiar e colar, e por isso a proposta precisa vir com recurso, tag e flag explícitos, nunca resumida
- [x] O `--dry-run=client` valida sintaxe e monta o objeto localmente, mas não consulta o cluster: quem precisa de checagem contra o *API server* usa `--dry-run=server`
- [x] Colocar o portão de aprovação depois do `kickoff()` mantém o guardrail imune ao que o modelo escreve — instrução de prompt pedindo confirmação seria só mais texto gerado, não uma trava
- [x] Comparar a resposta com `sim` exato faz o caminho perigoso exigir uma ação positiva do engenheiro, enquanto engano, distração e `Ctrl+C` convergem para o aborto
- [x] O par proposta/decisão é a unidade que vale auditar: guardar só o comando executado perde a informação de quantas vezes a automação sugeriu algo que o plantão recusou

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — `kubectl set image`](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_set/kubectl_set_image/)
- [Kubernetes — Dry-run (`--dry-run=client|server`)](https://kubernetes.io/docs/reference/using-api/api-concepts/#dry-run)
- [Google SRE Book — The Evolution of Automation at Google](https://sre.google/sre-book/automation-at-google/)
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
