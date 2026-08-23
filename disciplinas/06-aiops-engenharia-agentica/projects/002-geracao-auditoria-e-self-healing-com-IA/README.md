# Exemplo 002 — Geração, Auditoria e Self-Healing com IA

> Pipeline de dois agentes CrewAI que gera código Terraform, audita com Checkov e OPA, e devolve as falhas para o arquiteto corrigir — governança de IaC como loop fechado.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Este projeto evolui o [001 — Da Automação à Inteligência Agêntica](../001-da-automacao-a-inteligencia-agentica), que tinha **um** agente consultando políticas via tool de compliance e devolvendo um plano em texto. O delta da aula é triplo: o agente passa a **escrever artefato real em disco** (`main.tf`), entra um **segundo agente auditor** com ferramentas de scan, e a saída do auditor realimenta o arquiteto — o embrião do *self-healing*.

O runtime herdado do 001 continua idêntico: `core/llm_config.py` (Groq via LiteLLM, com o workaround do `cache_breakpoint`), a fábrica de agentes em `core/agents.py` e a tool de RAG de políticas em `tools/policy_rag.py`. Sobre essa base, `core/agents.py` ganha `get_auditor()` — o Engenheiro de DevSecOps — e o entrypoint muda de `foundation.py` para `iac_copilot.py`, que monta uma `Crew` sequencial de duas tasks: gerar e auditar.

A auditoria acontece em duas camadas complementares. **Checkov** (`run_checkov_scan`) é um scanner estático real, instalado como CLI e invocado por `subprocess` — cobre as regras genéricas de segurança de S3 (criptografia, versionamento, bloqueio de acesso público). **OPA** (`validate_opa_policies`) é uma simulação do Open Policy Agent que codifica as regras de governança *corporativa* da Nexus, que nenhum scanner genérico conhece: soberania de dados em `us-east-1`, controle de custo (proibir `t3.large`) e proibição de ingress aberto (`0.0.0.0/0`). A distinção é o ponto pedagógico — segurança genérica e política de negócio são camadas separadas do pipeline.

O `main.tf` versionado aqui é **saída do agente**, não código escrito à mão: é o artefato que `write_file` gravou em disco durante a execução do pipeline.

> ℹ️ **Runtime atualizado na aula 005.** O modelo agora vem de `GROQ_MODEL` no `.env` (default `qwen/qwen3.6-27b`, no lugar do `openai/gpt-oss-20b`), `max_tokens` deixou de ser capado (a Groq debita o consumo real, não o teto pedido — capar não economizava cota e arriscava truncar) e o retry de rate limit passou a ler os formatos de tempo compostos da Groq (`3m9.648s`), que antes caíam num fallback curto demais e matavam o pipeline. Detalhes em [005 · Aprendizados](../005-observabilidade-preditiva/README.md#aprendizados).

## Tecnologias e Ferramentas

- [x] **Python 3** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew` em processo sequencial
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência dos agentes (free tier)
- [x] **Checkov 3.3.8** — scanner estático de segurança de IaC (invocado via CLI)
- [x] **Terraform / HCL** — linguagem do artefato gerado (não é executado, apenas gerado e auditado)
- [x] **python-dotenv** — carga da `GROQ_API_KEY` a partir de `.env`

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências; não é preciso instalar Python à parte
- **Python 3.12.11** — baixado automaticamente pelo uv (pin em `projects/.python-version`; a mesma versão do material da professora, e evita o 3.13/3.14 por compatibilidade com CrewAI/Pydantic)
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`) — um único `.env` na raiz de `projects/` serve todas as aulas
- O binário do **Checkov** — vem como dependência declarada no `pyproject.toml`, disponível no `PATH` sob `uv run`

## Como executar

Os projetos da disciplina compartilham um único ambiente (workspace uv). O setup é feito uma vez na raiz de `projects/` — detalhes no [README da disciplina](../README.md).

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# 1. setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

# 2. rodar o pipeline (gera e audita o main.tf)
cd 002-geracao-auditoria-e-self-healing-com-IA
uv run iac_copilot.py
```

Para invocar o scanner manualmente, fora do pipeline:

```bash
uv run checkov -f main.tf --quiet --compact
```

> O `main.tf` do repositório é sobrescrito a cada execução — ele é a saída do agente arquiteto.

## Estrutura do Projeto

```
002-geracao-auditoria-e-self-healing-com-IA/
├── iac_copilot.py           # entrypoint: Crew sequencial (gerar → auditar)
├── main.tf                  # artefato GERADO pelo agente (sobrescrito a cada run)
├── core/
│   ├── agents.py            # get_architect() + get_auditor()  ← novo agente DevSecOps
│   └── llm_config.py        # LLM da Groq + workaround do cache_breakpoint (herdado do 001)
├── tools/
│   ├── file_writer.py       # write_file — grava o HCL em disco, limpando cercas ```hcl
│   ├── security_scan.py     # run_checkov_scan (CLI real) + validate_opa_policies (simulado)
│   └── policy_rag.py        # check_compliance_rules — RAG de políticas (herdado do 001)
└── pyproject.toml           # dependências desta aula (membro do workspace uv)
```

## Como funciona

```
iac_copilot.py
   │
   ├─ architect = get_architect(tools=[write_file])
   ├─ auditor   = get_auditor(tools=[run_checkov_scan, validate_opa_policies])
   │
   └─ Crew(process=sequential).kickoff()
            │
            ├── Task 1 — Arquiteto
            │      "Gere um main.tf para um bucket S3 seguro 'nexus-apollo-data', região us-east-1"
            │                     │
            │                     ▼
            │            write_file(content, "main.tf")  →  HCL em disco
            │
            └── Task 2 — Auditor   (recebe o contexto da Task 1)
                   │
                   ├─ run_checkov_scan("main.tf")
                   │     └─ subprocess: checkov -f main.tf --quiet --compact
                   │           └─ "❌ Security Failures Detected" | "✅ No vulnerabilities"
                   │
                   └─ validate_opa_policies("main.tf")
                         ├─ sem "us-east-1"  → ❌ SOBERANIA_DADOS
                         ├─ com "t3.large"   → ❌ COST_CONTROL
                         ├─ com "0.0.0.0/0"  → ❌ NO_PUBLIC_INGRESS
                         └─ senão            → ✅ OPA PASSED
                                     │
                                     ▼
                          relatório de conformidade final
```

1. **Geração** — o arquiteto recebe a especificação em linguagem natural e chama `write_file`, que limpa as cercas de markdown (` ```hcl `) que o LLM insere e grava o HCL puro em `main.tf`.
2. **Auditoria genérica** — `run_checkov_scan` roda o Checkov de verdade via `subprocess` e trata tanto o exit code quanto a string `FAILED` no stdout, porque o Checkov sinaliza violação pelos dois caminhos.
3. **Auditoria de governança** — `validate_opa_policies` aplica as três regras corporativas da Nexus por inspeção do conteúdo, na ordem soberania → custo → rede, retornando na primeira violação.
4. **Realimentação** — a `Task 2` declara explicitamente *"se houver erro, o arquiteto deve corrigir"*; num processo sequencial do CrewAI o relatório do auditor vira contexto da conversa, fechando o loop de self-healing.

## Conceitos trabalhados

- [x] **Pipeline multiagente com papéis separados** — arquiteto *gera*, auditor *valida*; nenhum dos dois acumula as duas responsabilidades
- [x] **Agente que produz artefato, não texto** — `write_file` transforma a saída do LLM em arquivo versionável, tornando o resultado auditável por ferramentas externas
- [x] **Duas camadas de política** — scanner genérico (Checkov) e governança corporativa (OPA) cobrem coisas diferentes e ambas são necessárias
- [x] **Tool como wrapper de CLI real** — `subprocess` dá ao agente acesso a um scanner de mercado, não a uma simulação
- [x] **Self-healing loop** — o resultado da auditoria realimenta o gerador em vez de só ser impresso
- [x] **Contrato de tool legível por LLM** — nome, assinatura e docstring são a única especificação que o agente enxerga na hora de chamar a ferramenta

## Aprendizados

- [x] **Assinaturas inconsistentes entre tools quebram o agente de forma silenciosa.** As duas tools de auditoria nasceram com contratos diferentes — `run_checkov_scan(filename)` esperava caminho, `validate_opa_policies(content)` esperava o código. O LLM, lendo só os nomes, chamava as duas do mesmo jeito e passava `"main.tf"` para ambas; a política OPA então avaliava a *string do nome do arquivo*, nunca achava `us-east-1` e rejeitava um Terraform perfeitamente conforme. A correção foi padronizar as duas em `target: str = "main.tf"`, documentar no docstring e centralizar a resolução caminho-ou-conteúdo num helper `_read_target`. Contrato de tool é interface pública para o LLM: se dois nomes parecidos aceitam coisas diferentes, o agente erra.
- [x] **Política por *substring* é frágil.** `"us-east-1" not in content` aprova um `main.tf` que só cita a região numa tag ou comentário, e reprova um que use `var.region`. Serve para a aula, mas um OPA real avalia o plano estruturado (`terraform show -json`), não o texto do HCL — a diferença entre validar *código* e validar *infraestrutura*.
- [x] **Falha de auditoria não é falha do pipeline.** O Checkov continua apontando violações no `main.tf` gerado (o LLM esquece o `aws_s3_bucket_public_access_block` com frequência) — esse relatório é justamente o *input* do loop de self-healing, não um bug a ser silenciado.
- [x] **Um agente novo custa pouco quando a fábrica já está desacoplada.** Adicionar o auditor foi só mais uma função em `core/agents.py` recebendo `tools` por injeção — o padrão `get_*(tools=...)` estabelecido no 001 pagou o investimento já no módulo seguinte.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Checkov — Policy-as-code para IaC](https://www.checkov.io/)
- [Open Policy Agent](https://www.openpolicyagent.org/)
- [Terraform — aws_s3_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket)
- [Groq API](https://console.groq.com/docs)
