# Exemplo 012 — Busca Semântica em PDF com Embeddings e Neo4j Vector Store

> Demonstra geração de embeddings locais com HuggingFace Transformers e armazenamento vetorial em Neo4j para busca por similaridade semântica sobre documentos PDF.

## Contexto

- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

Este exemplo implementa o pipeline completo de **indexação e busca semântica** sobre um documento PDF (`tensores.pdf`) usando embeddings vetoriais. O fluxo parte da ingestão do PDF, divide o texto em chunks com sobreposição, gera vetores numéricos para cada chunk usando um modelo local do HuggingFace, e persiste esses vetores no Neo4j com suporte a índice vetorial nativo.

Na fase de busca, perguntas em linguagem natural sobre o conteúdo do PDF são convertidas em embeddings e comparadas contra os vetores armazenados usando similaridade cosseno. Os `topK` chunks mais próximos semanticamente são retornados — sem exigir correspondência exata de palavras-chave.

Este exemplo representa a **etapa de retrieval** de um sistema RAG (Retrieval-Augmented Generation): ao invés de enviar o PDF inteiro ao LLM, apenas os trechos mais relevantes para cada pergunta são recuperados, reduzindo custo e latência.

## Tecnologias e Ferramentas

- [x] **Node.js 22** com TypeScript nativo (`--experimental-strip-types`)
- [x] **LangChain** (`@langchain/community`, `@langchain/core`) — orquestração do pipeline
- [x] **HuggingFace Transformers** (`@huggingface/transformers`, `@xenova/transformers`) — embeddings locais sem API key
- [x] **Neo4j 5.14** — banco de dados de grafos com suporte a índice vetorial
- [x] **APOC plugin** — utilitários de exportação/importação para Neo4j
- [x] **pdf-parse / PDFLoader** — extração de texto do PDF
- [x] **RecursiveCharacterTextSplitter** — chunking com sobreposição configurável
- [x] **Docker / docker-compose** — infraestrutura local do Neo4j

## Pré-requisitos

1. Docker instalado e em execução
2. Arquivo `.env` na raiz do projeto com:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
```

> O modelo de embedding é baixado automaticamente do HuggingFace na primeira execução.

## Como executar

```bash
# Instalar dependências
npm ci

# Subir o Neo4j via Docker
npm run infra:up

# Executar o pipeline (indexação + busca)
npm start

# Derrubar a infraestrutura ao final
npm run infra:down
```

## Estrutura do Projeto

```
exemplo-012-embeddings-neo4j/
├── src/
│   ├── index.ts             # Orquestra o pipeline: ingestão → indexação → busca
│   ├── config.ts            # Configurações centralizadas (Neo4j, embedding, chunking)
│   ├── documentProcessor.ts # Carrega PDF e divide em chunks
│   └── util.ts              # Exibe resultados formatados no terminal
├── tensores.pdf             # Documento-fonte: material sobre tensores e TensorFlow.js
├── docker-compose.yml       # Neo4j 5.14 com APOC
└── package.json
```

## Como funciona

```
tensores.pdf
    └─▶ PDFLoader → páginas brutas
            └─▶ RecursiveCharacterTextSplitter (chunk=1000, overlap=200) → N chunks
                    └─▶ HuggingFaceTransformersEmbeddings (modelo local)
                                └─▶ Neo4jVectorStore.addDocuments()
                                        └─▶ índice vetorial "tensors_index" no Neo4j

Pergunta em linguagem natural
    └─▶ embedQuery() → vetor da pergunta
            └─▶ similaritySearch(topK=3) → cosine similarity contra índice
                    └─▶ 3 chunks mais próximos exibidos no terminal
```

A cada execução, os nós `Chunk` existentes são removidos antes da reindexação (`MATCH (n:Chunk) DETACH DELETE n`), garantindo idempotência.

## Conceitos trabalhados

- [x] **Embeddings vetoriais** — representação semântica de texto como vetores de alta dimensão gerados por modelos de linguagem locais
- [x] **Chunking com sobreposição** — divisão de documentos longos preservando contexto entre fragmentos adjacentes
- [x] **Vector store** — banco de dados otimizado para armazenar e consultar vetores por proximidade semântica
- [x] **Similaridade cosseno** — métrica que mede o ângulo entre vetores independentemente de magnitude
- [x] **Pipeline RAG (retrieval step)** — recuperação dos trechos mais relevantes antes de chamar um LLM
- [x] **Modelos locais de embedding** — geração de vetores sem API key via HuggingFace Transformers (Xenova)
- [x] **Neo4j como vector store** — uso do banco de grafos com índice vetorial nativo via LangChain

## Aprendizados

- [x] Embeddings locais (Xenova) são uma alternativa viável a APIs pagas quando o dado é sensível ou o volume é alto — o custo computacional é maior, mas não há latência de rede nem custo por token
- [x] O tamanho do chunk e a sobreposição afetam diretamente a qualidade da busca: chunks muito pequenos perdem contexto; muito grandes diluem o sinal semântico
- [x] O Neo4j com APOC oferece operações de grafo que vão além do vector store puro — útil para combinar busca semântica com relacionamentos explícitos entre entidades
- [x] A separação entre `DocumentProcessor`, configuração central e orquestração no `index.ts` torna o pipeline fácil de adaptar para outros documentos ou modelos

## Referências

- [LangChain — Neo4j Vector Store](https://js.langchain.com/docs/integrations/vectorstores/neo4jvector)
- [HuggingFace Transformers.js (Xenova)](https://huggingface.co/docs/transformers.js)
- [Neo4j Vector Index Documentation](https://neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes/)
- [RecursiveCharacterTextSplitter](https://js.langchain.com/docs/modules/data_connection/document_transformers/recursive_text_splitter)
