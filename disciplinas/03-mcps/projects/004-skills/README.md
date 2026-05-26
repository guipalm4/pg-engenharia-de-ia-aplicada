# Exemplo 004 — Skills: Conhecimento Modular para Agentes de IA

> Instalação e uso de skills via `npx skills` — pacotes de conhecimento que estendem capacidades de agentes LLM com guias, comandos e boas práticas especializadas

## Contexto

- **Disciplina:** 03 — Model Context Protocol (MCPs)
- **Autor:** guipalm4

## Descrição

Este projeto demonstra o ecossistema de **agent skills** — pacotes de conhecimento modular que estendem agentes de IA com instruções especializadas, guias de referência e boas práticas de domínio. Enquanto servidores MCP fornecem *ferramentas* (funções que o agente pode chamar), skills fornecem *conhecimento estruturado* que guia como o agente deve pensar, gerar código ou usar essas ferramentas em contextos específicos.

O projeto instala três skills de repositórios GitHub usando a CLI `npx skills` e as disponibiliza em `.agents/skills/`. O arquivo `skills-lock.json` registra a origem e o hash de cada skill instalada, funcionando como um `package-lock.json` para conhecimento de agentes — garantindo reprodutibilidade e rastreabilidade da fonte.

Cada skill é um arquivo markdown com frontmatter YAML que declara `name`, `description` (usado pelo orquestrador para decidir quando ativá-la) e opcionalmente ferramentas e modelo. O corpo do arquivo contém guias, exemplos e padrões que o agente usa diretamente como contexto ao gerar respostas.

A relação com MCPs aparece diretamente na skill `neo4j-cypher-guide`: ela foi desenhada para orientar LLMs que usam servidores MCP de text2cypher, garantindo que queries geradas usem sintaxe moderna do Neo4j e evitem APIs removidas.

## Tecnologias e Ferramentas

- [x] **Skills CLI (`npx skills`)** — gerenciador de pacotes de conhecimento para agentes; pesquisa, instalação e atualização de skills via `npx skills find`, `npx skills add`
- [x] **`skills-lock.json`** — lockfile que rastreia source, tipo e hash de cada skill instalada
- [x] **skill `ffmpeg`** (fonte: `digitalsamba/claude-code-video-toolkit`) — referência de comandos FFmpeg para conversão, compressão, resize e extração de áudio; voltada para workflows de produção de vídeo com Remotion
- [x] **skill `find-skills`** (fonte: `vercel-labs/skills`) — meta-skill que ensina o agente a buscar e instalar outras skills quando o usuário pede ajuda com uma tarefa que pode ter skill disponível
- [x] **skill `neo4j-cypher-guide`** (fonte: `tomasonjo/blogs`) — guia de sintaxe moderna do Neo4j Cypher com padrões QPP, subqueries CALL, regras de sorting e lista de APIs removidas; essencial para agentes que geram queries via text2cypher

## Pré-requisitos

- Node.js ≥ 18 (para `npx skills`)
- Acesso à internet para buscar skills em https://skills.sh/

## Como executar

```bash
cd disciplinas/03-mcps/projects/004-skills

# Buscar skills disponíveis
npx skills find ffmpeg
npx skills find neo4j

# Instalar uma skill (projeto)
npx skills add digitalsamba/claude-code-video-toolkit@ffmpeg

# Instalar globalmente (disponível em todos os projetos)
npx skills add vercel-labs/skills@find-skills -g -y

# Verificar skills instaladas e atualizações
npx skills check

# Atualizar todas as skills
npx skills update
```

As skills ficam em `.agents/skills/<nome>/SKILL.md` e são lidas pelo agente automaticamente no contexto.

## Estrutura do Projeto

```
.agents/
└── skills/
    ├── ffmpeg/
    │   ├── SKILL.md                     # Guia de comandos FFmpeg (conversão, resize, compressão)
    │   └── reference.md                 # Referência expandida de flags e casos de uso
    ├── find-skills/
    │   └── SKILL.md                     # Meta-skill: como buscar e instalar outras skills
    └── neo4j-cypher-guide/
        ├── SKILL.md                     # Guia principal: sintaxe moderna, QPP, sorting
        └── references/
            ├── deprecated-syntax.md     # APIs removidas e seus substitutos modernos
            ├── qpp.md                   # Quantified Path Patterns — travessias eficientes
            └── subqueries.md           # CALL subqueries para leituras complexas
skills-lock.json                         # Lockfile: source + hash de cada skill instalada
refs.txt                                 # Referências ao ecossistema skills.sh
video.mp4                                # Vídeo de demonstração
video_bw.mp4                             # Versão em preto e branco
```

## Como funciona

### Instalação de uma skill

```
npx skills add <owner/repo@skill-name>
        │
        ▼
  Busca SKILL.md no repositório GitHub correspondente
        │
        ▼
  Copia para .agents/skills/<skill-name>/
        │
        ▼
  Registra em skills-lock.json com hash SHA-256 do conteúdo
```

### Ativação pelo agente

```
Usuário faz pergunta ou pede tarefa
        │
        ▼
  Orquestrador lê campo `description` de cada SKILL.md instalada
        │
        ├── skill relevante? → carrega SKILL.md no contexto do agente
        │
        └── skill não relevante? → ignora
        │
        ▼
  Agente responde usando o conhecimento da skill ativa
```

### Exemplo: skill `neo4j-cypher-guide` + MCP text2cypher

```
Usuário: "quais estudantes completaram o módulo 3?"
        │
        ▼
  skill neo4j-cypher-guide ativa (description menciona text2cypher)
        │
        ▼
  Agente gera Cypher com elementId() em vez de id() (deprecated)
  Agente adiciona IS NOT NULL antes de ORDER BY
  Agente usa CALL subquery para agregações complexas
        │
        ▼
  MCP text2cypher executa a query no Neo4j
```

## Conceitos trabalhados

- [x] **Skills como conhecimento modular** — SKILL.md com frontmatter YAML (`name`, `description`, `tools`) define quando e como a skill é ativada pelo orquestrador
- [x] **`skills-lock.json`** — rastreabilidade de origem e integridade via hash; permite reproduzir o mesmo estado de conhecimento em qualquer ambiente
- [x] **`find-skills` como meta-skill** — skill que ensina o agente a descobrir e instalar outras skills dinamicamente, tornando o agente auto-extensível
- [x] **Skills complementam MCPs** — MCPs adicionam ferramentas (funções chamáveis); skills adicionam conhecimento (guias, padrões, boas práticas) para usar essas ferramentas corretamente
- [x] **`description` como seletor de roteamento** — o campo description determina quando a skill é injetada no contexto; uma description precisa é tão importante quanto o conteúdo da skill
- [x] **Skills de referência técnica** — `neo4j-cypher-guide` demonstra o padrão de skill com documentação dividida em arquivos de referência dentro de `references/`

## Aprendizados

- [x] Skills resolvem o problema de contexto repetitivo — em vez de colar documentação no chat a cada sessão, o agente carrega automaticamente o guia correto para a tarefa
- [x] O modelo mental correto: MCP = *o que o agente pode fazer*; skill = *como o agente deve fazer* — os dois são complementares, não substitutos
- [x] O campo `description` da skill funciona como um classificador de intenção — quanto mais específico, menor a chance de falsos positivos na ativação
- [x] `skills-lock.json` com hash permite detectar se uma skill foi modificada upstream e decidir conscientemente se quer atualizar — prevenindo mudanças silenciosas de comportamento do agente
- [x] Skills de domínio técnico (como `neo4j-cypher-guide`) são especialmente valiosas para guiar LLMs em sintaxes com deprecações frequentes onde o conhecimento de treinamento pode estar desatualizado

## Referências

- [Skills CLI — skills.sh](https://skills.sh)
- [vercel-labs/skills — repositório oficial](https://github.com/vercel-labs/skills)
- [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit)
- [tomasonjo/blogs — neo4j-cypher-guide](https://github.com/tomasonjo/blogs)
- [Supabase — Postgres best practices for AI agents](https://supabase.com/blog/postgres-best-practices-for-ai-agents)
