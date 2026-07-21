# 🔍 Módulo 01: Estratégia e Design de Produtos AI-First

Este módulo foca na utilização da Inteligência Artificial como uma ferramenta estratégica de engenharia para o desenvolvimento de software. O objetivo não é "gerar texto", mas sim transformar requisitos ambíguos em especificações técnicas sólidas e processar dados de utilizadores para uma tomada de decisão baseada em evidências.

Aqui, a IA atua como uma camada de **Refinamento Técnico** e **Redução de Variabilidade** antes de qualquer implementação de código.

## 🎯 Objetivos de Engenharia

* **Rubber Ducking Estruturado:** Utilizar o Google AI Studio para "estressar" requisitos, identificando falhas na lógica de negócio e *edge cases* (casos de borda) esquecidos.
* **Diagramação Automatizada:** Converter especificações funcionais em fluxos lógicos visuais utilizando **Mermaid.js**.
* **Data Discovery:** Criar **Structured Prompts (JSON)** para sanitizar e analisar grandes volumes de feedback de utilizadores.
* **Engenharia de Prompt:** Dominar o controlo de *Temperature* e *Safety Settings* para garantir saídas determinísticas.

---

## 🛠️ Stack Tecnológica

* **Engine:** Google Gemini (1.5 Pro / Flash) via [Google AI Studio](https://aistudio.google.com/)
* **Notação:** [Mermaid.js](https://mermaid.js.org/) para diagramas de fluxo.
* **Padrão de Prompt:** JSON Prompts (Foco em *System Instructions* e *Few-Shot*).

---

## 📂 Estrutura de Arquivos do Módulo

Os entregáveis deste módulo devem seguir estritamente a seguinte organização de pastas para garantir o versionamento da "inteligência" do projeto:

```bash
modulo-01-discovery-refinement/
├── prompts/
│   ├── system-instructions-refinement.json  # Prompt de Arquiteto de Software (Aula 1)
│   └── insight-distiller.json               # Configuração do Structured Prompt (Aula 5)
├── docs/
│   └── refinement/
│       ├── briefing-bruto.md                # O problema original (Input)
│       ├── edge-cases.md                    # Lista de falhas identificadas pela IA
│       └── fluxo-logico.mmd                 # Código Mermaid.js do fluxo refinado
├── data/
│   └── raw-feedbacks.json                   # Dataset bruto (logs/comentários)
└── reports/
    └── backlog-priorizado.json              # Saída estruturada da análise de dados
```

---

## 🚀 Guia de Execução dos Projetos

### Projeto 1: Refinamento de Requisitos e Edge Cases

Foco: Antecipação de falhas e mapeamento de estados de erro.

Configuração: No Google AI Studio, copie o conteúdo de prompts/system-instructions-refinement.json para o campo System Instructions.

Input: Insira o conteúdo de docs/refinement/briefing-bruto.md (Cenário: Pix Agendado).

Execução: Solicite à IA a análise de "Caminhos Infelizes" (Unhappy Paths) e a geração do código Mermaid.

Validação: Renderize o diagrama Mermaid num editor compatível (ex: Plugin do VS Code ou Mermaid Live Editor) e valide a lógica.

### Projeto 2: Destilador de Insights (Data Discovery)

Foco: Transformação de dados não estruturados em backlog técnico.

Preparação: Utilize o arquivo data/raw-feedbacks.json.

Configuração: No Google AI Studio, selecione o modo Structured Prompt.

Schema: Defina os parâmetros de saída conforme prompts/insight-distiller.json (ex: category, sentiment_score, technical_priority).

Parâmetros: Ajuste a Temperature para 0 para garantir que a análise seja factual e livre de alucinações.

Output: Exporte o resultado JSON para a pasta reports/.

## 📦 Entregável Final (Critérios de Aceitação)

Para considerar este módulo concluído com nível Sénior, o repositório deve demonstrar:

Versionamento de Prompts: Os arquivos JSON em /prompts devem conter as instruções de sistema claras e reutilizáveis.

Rastreabilidade: Deve ser possível ler o briefing-bruto.md e ver como ele evoluiu para o fluxo-logico.mmd através da intervenção da IA.

Determinismo: O relatório de dados (backlog-priorizado.json) deve ser consistente e acionável, pronto para ser importado para um Jira ou Trello.

Nota: Embora utilizemos o ecossistema Google para demonstração, os fundamentos de Structured Prompting e System Instructions aplicam-se a qualquer LLM (Claude, GPT-4, Llama). O foco é a metodologia de engenharia, não a ferramenta.