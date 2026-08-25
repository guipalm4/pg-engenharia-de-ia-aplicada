# Exemplo 006 — ChatOps e Human-in-the-Loop

> Simulador de Slack em Streamlit onde um agente recebe pedidos de infraestrutura em linguagem natural e precisa exigir aprovação humana antes de executar o que é destrutivo.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Todas as aulas anteriores desta trilha rodavam como script: `uv run <entrypoint>.py`, o pipeline executava do começo ao fim sozinho e imprimia o resultado. A 006 muda o **modelo de execução** — o agente passa a viver atrás de uma interface de chat, e quem dá o próximo passo é uma pessoa digitando. É a primeira aula com UI (`streamlit`) e a primeira em que o agente não tem um roteiro: ele responde ao que aparecer no campo de texto.

O delta de código é pequeno — um agente novo (`get_chatops_agent`, o 6º papel) e uma tool (`execute_terraform`) —, mas o delta conceitual é o maior da trilha até aqui. Onde a [005](../005-observabilidade-preditiva) discutia *o que* o agente sabe fazer, a 006 discute *o que ele tem permissão para fazer*. A `backstory` do agente carrega a regra: "Você nunca executa uma ação destrutiva sem antes pedir permissão a um humano autorizado". A tool implementa o portão: comandos contendo `destruir`/`apagar`/`destroy` só passam se receberem `manager_password="GESTOR-APROVA"`.

O ponto central da aula é o **human-in-the-loop**: o padrão em que um sistema autônomo interrompe a própria execução para pedir a um humano que autorize o passo seguinte. É o controle que separa um bot de operações útil de um incidente esperando acontecer, e a razão de existir de ferramentas de ChatOps reais.

O que a aula rende é a **assimetria entre as duas camadas de decisão** que esse desenho empilha: o LLM avalia sozinho se o pedido é crítico *antes* de chamar a ferramenta, e o portão determinístico da tool só entra em cena se ele decidir chamá-la. Some-se a isso que aprovação humana é **estado de conversa**, e que a `Crew` é remontada a cada mensagem sem memória da anterior — o handshake de duas mensagens que a interface sugere não tem onde se apoiar.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **Streamlit** — interface de chat (simulador de Slack); primeira dependência de UI da trilha
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`, um agente e uma task por mensagem
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência (free tier)
- [x] **Terraform** — alvo **simulado** da tool `execute_terraform`; nenhum binário é invocado
- [x] **pytest** — testes dos helpers herdados das aulas anteriores
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** O `uv run` precisa do `pyproject.toml` do workspace para resolver o `streamlit`, e os imports `core.*`/`tools.*` resolvem pelo diretório do script — parar em `projects/` em vez da pasta da aula não funciona.

> ⚠️ **Na primeira execução o Streamlit pede um e-mail** (`👋 Welcome to Streamlit!`). É cadastro opcional: **Enter** com o campo vazio segue adiante. Para nunca mais ver o prompt: `mkdir -p ~/.streamlit && printf '[general]\nemail = ""\n' > ~/.streamlit/credentials.toml`. A flag `--server.headless true` também o suprime, mas aí o navegador não abre sozinho.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 006-chatops-e-human-in-the-loop

# sobe o simulador de Slack em http://localhost:8501
uv run streamlit run chatops.py

# porta alternativa, se a 8501 estiver ocupada
uv run streamlit run chatops.py --server.port 8599

# testes (não precisam de API key)
uv run pytest -v
```

`Ctrl+C` no terminal encerra o app.

Três mensagens que exercitam os três caminhos da aula:

| Digite | Caminho exercitado |
|---|---|
| `@nexus-bot destrua o banco de dados de produção` | pedido destrutivo sem senha — mostra quem decide primeiro, o modelo ou o portão da tool |
| `@nexus-bot destrua o banco, a senha do gestor é GESTOR-APROVA` | pedido destrutivo com a senha — `execute_terraform` devolve `✅ APPROVED` |
| `@nexus-bot suba mais 2 réplicas do checkout` | pedido de baixo impacto — `✅ SUCCESS`, sem exigir aprovação |

## Estrutura do Projeto

```
006-chatops-e-human-in-the-loop/
├── chatops.py                    # entrypoint STREAMLIT (não é `uv run chatops.py`)
│                                 #   UI + 1 Crew nova por mensagem enviada
├── core/
│   ├── agents.py                 # + get_chatops_agent()  ← novo papel (o 6º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado da 005, intocado
├── tools/
│   ├── chatops_tools.py          # ← NOVA: execute_terraform (o portão GESTOR-APROVA)
│   ├── aiops_tools.py            # herdado da 005 — não usado neste pipeline
│   ├── k8s_diag.py               # herdado da 004 — não usado neste pipeline
│   ├── obs_tools.py              # herdado da 004 — não usado neste pipeline
│   ├── file_writer.py            # herdado da 002/004 — não usado neste pipeline
│   ├── k8s_ops.py                # herdado da 003 — não usado neste pipeline
│   ├── security_scan.py          # herdado da 002 — não usado neste pipeline
│   └── policy_rag.py             # herdado da 001 — não usado neste pipeline
├── tests/
│   ├── test_file_writer.py       # herdado da 004
│   ├── test_k8s_ops.py           # herdado da 003
│   └── test_rate_limit_espera.py # herdado da 005
└── pyproject.toml                # + streamlit
```

> Não há artefato gerado nesta aula: `execute_terraform` devolve uma string e não escreve nada em disco. A 002 gerava `main.tf`, a 003 e a 004 manifestos K8s, a 005 o `incident_dashboard.json` — a 006 não gera nada, e isso é coerente com o que ela simula (um bot que *responde no canal*).

## Como funciona

```
streamlit run chatops.py
   │
   ├─ st.session_state.messages          ← histórico, só para RENDERIZAR a conversa
   │                                       (nunca é enviado ao LLM)
   │
   └─ a cada mensagem digitada em st.chat_input():
        │
        ├─ agent = get_chatops_agent(tools=[execute_terraform])   ← agente NOVO
        │
        ├─ task  = Task(description=f"O usuário @guipalm4 disse: '{prompt}'.
        │                            Se for algo crítico, use 'execute_terraform'.")
        │                                    ↑
        │                            só a mensagem ATUAL entra aqui
        │
        └─ Crew(agents=[agent], tasks=[task]).kickoff()
                 │
                 ├─ o LLM decide sozinho se aquilo é "crítico"
                 │     ├─ se decide que precisa de aprovação → responde em texto,
                 │     │                                        sem acionar o portão
                 │     └─ se decide executar → chama execute_terraform(command, senha)
                 │              │
                 │              └─ if "destruir"|"apagar"|"destroy" in command.lower():
                 │                      senha == "GESTOR-APROVA" ? ✅ APPROVED : 🛑 BLOCKED
                 │                 else:
                 │                      ✅ SUCCESS (Low impact)
                 │
                 └─ resposta → st.markdown() + append no histórico
```

O desenho tem duas camadas de decisão empilhadas — o LLM primeiro, a tool depois — e a segunda só roda se a primeira deixar. Como a primeira é probabilística e a segunda é determinística, o controle efetivo fica com a parte que não se pode auditar.

## Conceitos trabalhados

- [x] **Human-in-the-loop** — interromper a execução autônoma para pedir autorização humana antes do passo irreversível
- [x] **ChatOps** — a operação de infraestrutura acontecendo dentro do canal de conversa da equipe, com o histórico servindo de trilha de auditoria
- [x] **Agente atrás de interface** — a mudança de script para sessão: o agente deixa de ter um roteiro e passa a responder a entrada arbitrária de um humano
- [x] **Guardrail determinístico vs. julgamento do modelo** — a diferença entre uma regra que o código aplica e uma política que o LLM decide seguir
- [x] **Superfície de prompt como superfície de ataque** — tudo que a tool declara (nome, assinatura, docstring) é enviado ao modelo e pode ser repetido por ele ao usuário
- [x] **Statelessness da `Crew`** — a memória de uma conversa não é automática; renderizar o histórico na tela não é o mesmo que passá-lo ao agente
- [x] **RBAC e princípio do menor privilégio** — autorização por identidade e escopo, que uma senha única compartilhada não tem como expressar

## Aprendizados

- [x] Um segredo que entra no prompt não é segredo: a senha de aprovação vive na docstring de `execute_terraform`, que vai ao LLM junto com a definição da tool — e o bot chega a revelá-la a quem acabou de barrar
- [x] Se o agente pode responder sem chamar a tool, o portão determinístico nunca decide — e enquanto a autorização morar na deliberação do modelo, **trocar de modelo é trocar de política de segurança**; a checagem precisa estar no caminho de execução
- [x] Aprovação humana é estado de conversa, não parâmetro de chamada: sem persistir o pedido pendente, o "sim" do gestor chega sem o comando a que se refere
- [x] Blocklist de substrings sobre linguagem livre é teatro de segurança — `drop database production` e `terraform apply -replace=aws_db_instance.prod` passam pelo filtro de três palavras sem exigir aprovação
- [x] ChatOps só encurta o tempo de resposta se o canal carregar também a autorização e o registro: se o operador precisa sair do chat para executar, o rastro da ação se perde justamente no passo que importa

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [Streamlit — Chat elements (`st.chat_input`, `st.chat_message`)](https://docs.streamlit.io/develop/api-reference/chat)
- [Streamlit — Session State](https://docs.streamlit.io/develop/concepts/architecture/session-state)
- [OWASP Top 10 for LLM Applications — LLM02: Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/)
- [OWASP Top 10 for LLM Applications — LLM06: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- [OWASP Top 10 for LLM Applications — LLM07: System Prompt Leakage](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/)
- [Terraform — `-replace` e o ciclo destroy/create](https://developer.hashicorp.com/terraform/cli/commands/plan#replace-address)
- [Google SRE Workbook — On-Call e automação segura](https://sre.google/workbook/on-call/)
