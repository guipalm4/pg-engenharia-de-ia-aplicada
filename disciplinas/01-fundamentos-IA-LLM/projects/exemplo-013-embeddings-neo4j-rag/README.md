# Exemplo 013 — RAG Completo com Embeddings, Neo4j e OpenRouter

> Pipeline RAG end-to-end: indexação de PDF com embeddings locais no Neo4j Vector Store e geração de respostas via LLM (OpenRouter) orquestrado pelo LangChain.

## Contexto

- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

Este exemplo implementa um pipeline **RAG (Retrieval-Augmented Generation)** completo em TypeScript. Partindo de um PDF sobre TensorFlow.js e tensores, o sistema fragmenta o documento em chunks, gera embeddings locais via HuggingFace Transformers e os armazena no Neo4j como vetores. Na etapa de geração, cada pergunta dispara uma busca por similaridade no grafo, recupera os trechos mais relevantes e alimenta um LLM (via OpenRouter) que produz uma resposta contextualizada em português.

O projeto evolui diretamente do exemplo-012, que parava na busca semântica. Aqui o "G" do RAG é implementado: o contexto recuperado é injetado em um prompt estruturado e o LLM responde com base exclusivamente no documento indexado. Respostas são filtradas por score de similaridade (> 0.5) e persistidas em arquivos Markdown.

A separação entre `DocumentProcessor`, `AI` e `config` demonstra como organizar um pipeline RAG de forma testável e configurável — com o prompt como artefato externo (JSON + template), não hardcoded no código.

## Tecnologias e Ferramentas

- [x] **Node.js 22** — `--experimental-strip-types` para TypeScript nativo sem build step
- [x] **LangChain** (`@langchain/core`, `@langchain/community`, `@langchain/openai`) — orquestração do pipeline RAG com `RunnableSequence`
- [x] **Neo4j 5** — banco de grafos com suporte a índices vetoriais via `Neo4jVectorStore`
- [x] **HuggingFace Transformers** (`@huggingface/transformers`) — geração de embeddings localmente, sem API
- [x] **OpenRouter** — gateway OpenAI-compatível para acesso ao LLM via API
- [x] **pdf-parse / PDFLoader** — carregamento e extração de texto de PDF
- [x] **Docker Compose** — Neo4j com plugin APOC para a infraestrutura de grafos

## Pré-requisitos

Variáveis de ambiente necessárias em `.env`:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

OPENROUTER_API_KEY=<sua chave>
OPENROUTER_SITE_URL=<url do seu site>
OPENROUTER_SITE_NAME=<nome do site>

NLP_MODEL=<modelo via OpenRouter, ex: google/gemma-3-27b-it:free>
EMBEDDING_MODEL=<modelo HuggingFace, ex: Xenova/all-MiniLM-L6-v2>
```

## Como executar

```bash
# 1. Subir o Neo4j via Docker
npm run infra:up

# 2. Instalar dependências
npm install

# 3. Executar o pipeline (indexação + RAG)
npm start
```

As respostas geradas são salvas automaticamente em `respostas/resposta-<índice>-<timestamp>.md`.

Para encerrar a infraestrutura:

```bash
npm run infra:down
```

## Estrutura do Projeto

```
exemplo-013-embeddings-neo4j-rag/
├── src/
│   ├── index.ts            # Orquestração: carrega PDF, popula Neo4j e executa RAG
│   ├── ai.ts               # Classe AI — busca vetorial + geração com RunnableSequence
│   ├── documentProcessor.ts# Carrega PDF e divide em chunks com RecursiveCharacterTextSplitter
│   ├── config.ts           # Configuração centralizada (Neo4j, embedding, LLM, paths)
│   └── util.ts             # Helpers de formatação e exibição de resultados
├── prompts/
│   ├── answerPrompt.json   # Configuração estruturada do prompt (role, task, constraints)
│   └── template.txt        # Template LangChain com variáveis {role}, {context}, {question}
├── respostas/              # Respostas geradas em Markdown (gerado em runtime)
├── tensores.pdf            # Documento base para indexação
├── docker-compose.yml      # Neo4j 5.14 com plugin APOC
└── package.json
```

## Como funciona

```
tensores.pdf
    │
    ▼
PDFLoader → RecursiveCharacterTextSplitter (chunks: 1000 chars, overlap: 200)
    │
    ▼
HuggingFaceTransformersEmbeddings (modelo local, dtype: fp32)
    │
    ▼
Neo4jVectorStore (índice: tensors_index, nó: Chunk)
    │
    ├─── Para cada pergunta:
    │         │
    │         ▼
    │    similaritySearchWithScore(question, topK=3)
    │         │
    │         ▼
    │    filtra score > 0.5 → concatena contextos
    │         │
    │         ▼
    │    ChatPromptTemplate + ChatOpenAI (via OpenRouter)
    │         │
    │         ▼
    │    StringOutputParser → resposta em pt-BR
    │         │
    │         ▼
    │    salva em respostas/resposta-N-timestamp.md
    │
    └─── RunnableSequence: retrieveVectorSearchResults → generateNLPResponse
```

## Conceitos trabalhados

- [x] **RAG (Retrieval-Augmented Generation)** — pipeline completo de recuperação e geração contextualizada
- [x] **Vector Store com Neo4j** — armazenamento e busca semântica em banco de grafos
- [x] **Embeddings locais com HuggingFace** — geração sem dependência de API externa
- [x] **RunnableSequence (LangChain)** — composição de etapas de processamento em cadeia
- [x] **Prompt como artefato externo** — configuração JSON + template desacoplados do código
- [x] **Chunking de documentos** — `RecursiveCharacterTextSplitter` com tamanho e overlap configuráveis
- [x] **Filtragem por score de similaridade** — descarte de resultados com baixa relevância (score ≤ 0.5)
- [x] **OpenRouter como gateway LLM** — acesso OpenAI-compatível a múltiplos modelos via API unificada

## Aprendizados

- [x] O RAG só funciona bem se o chunking for adequado ao documento: chunks muito grandes diluem a semântica; muito pequenos perdem contexto — o overlap de 200 chars mitiga a fragmentação de raciocínio entre chunks
- [x] Filtrar por score antes de enviar ao LLM é crítico: contextos irrelevantes degradam a resposta mesmo com o prompt instruindo o modelo a ignorá-los
- [x] Separar o prompt em JSON (metadados, instruções, constraints) e template (estrutura) facilita ajustes sem tocar no código — e permite versionamento independente
- [x] `--experimental-strip-types` no Node.js 22 elimina o build step completamente para TypeScript, tornando o ciclo de desenvolvimento muito mais ágil em projetos de estudo

## Referências

- [LangChain Neo4j Vector Store](https://js.langchain.com/docs/integrations/vectorstores/neo4jvector)
- [HuggingFace Transformers.js](https://huggingface.co/docs/transformers.js)
- [OpenRouter — LLM Gateway](https://openrouter.ai/docs)
- [RAG — Lewis et al., 2020](https://arxiv.org/abs/2005.11401)
- [Neo4j Vector Index](https://neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes/)
