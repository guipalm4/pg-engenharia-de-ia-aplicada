# Plan: Break ai.js into Sales Q&A Graph (Final)

This plan refactors the monolithic [ai.js](src/graph/ai.js) into a modular LangGraph workflow. The system will answer sales questions about EW Academy courses by querying Neo4j, using **Vercel AI SDK with OpenRouter provider** for all LLM calls (with skills.sh tool for Cypher generation), vector search caching, and ported prompts.

**Key decisions (updated):**
- **Use Vercel AI SDK with `@openrouter/ai-sdk-provider`** - unified provider, consistent with existing stack
- Use skills.sh tool (`tomasonjo/blogs/neo4j-cypher-guide`) for Cypher generation via tool calling
- Keep vector search caching for performance
- Port existing prompts from [nlpToCypher.md](src/graph/prompts/nlpToCypher.md) and [responseTemplateFromJson.md](src/graph/prompts/responseTemplateFromJson.md)
- Neo4j only with schema from [seed.js](data/seed.js)
- Follow existing node factory patterns

**Steps**

1. **Install Vercel AI SDK Dependencies**
   - Run: `npm install ai @openrouter/ai-sdk-provider @agentic/skills`
   - Run: `npx @agentic/skills add tomasonjo/blogs/neo4j-cypher-guide`
   - This creates a skill file for Neo4j Cypher generation as a callable tool

2. **Create Neo4j Service** at [src/services/neo4jService.ts](src/services/neo4jService.ts)
   - Class with `driver` and `session` management using `neo4j-driver`
   - Methods: `getSchema()`, `query(cypherQuery)`, `validateQuery(query)`, `close()`
   - Load credentials from env vars (`NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`)
   - `getSchema()` returns formatted schema string for skill context

3. **Create Vector Search Service** at [src/services/vectorSearchService.ts](src/services/vectorSearchService.ts)
   - Wrap `Neo4jVectorStore` from `@langchain/community/vectorstores/neo4j_vector`
   - Methods: `searchSimilar(question)`, `store(question, answerTemplate, query)`, `close()`
   - Initialize with `OllamaEmbeddings` (as in [ai.js](src/graph/ai.js))
   - Config from env: `indexName: "agent_index"`, `nodeLabel: "Chunk"`, `textNodeProperties: ["question"]`
   - Return: `{ cached: boolean, score: number, answerTemplate?, query? }`

4. **Create AI SDK Service** at [src/services/aiSdkService.ts](src/services/aiSdkService.ts)
   - Import: `import { generateText, generateObject } from 'ai'`
   - Import: `import { createOpenRouter } from '@openrouter/ai-sdk-provider'`
   - Import Neo4j skill: `import { neo4jCypherSkill } from '@skills/neo4j-cypher-guide'`
   - Initialize provider: `const openrouter = createOpenRouter({ apiKey: config.apiKey })`
   - Methods:
     - `generateCypherWithTool(question, schema, context)` - uses `generateText` + tool calling
     - `generateStructuredResponse<T>(prompt, schema: z.ZodSchema<T>)` - uses `generateObject`
   - Return types: `{ query, toolCalls }` and `{ data, error }`

5. **Port nlpToCypher Prompt** at [src/prompts/v1/cypherGenerator.ts](src/prompts/v1/cypherGenerator.ts)
   - Port from [nlpToCypher.md](src/graph/prompts/nlpToCypher.md)
   - Export `getSystemPrompt(schema, context)` - includes rules: use aliases, flat returns, executable only
   - Export `getUserPromptTemplate(question)` - formats user question
   - Used to provide context to the Neo4j skill

6. **Port responseTemplateFromJson Prompt** at [src/prompts/v1/nlpResponse.ts](src/prompts/v1/nlpResponse.ts)
   - Port from [responseTemplateFromJson.md](src/graph/prompts/responseTemplateFromJson.md)
   - Define `NlpResponseSchema`: `z.object({ answerTemplate: z.string() })`
   - `getSystemPrompt()` - rules: no JSON/SQL, use placeholders `{key}`, group dynamically
   - `getUserPromptTemplate(question, dbResults)` - includes stringified results
   - Pattern: JSON-stringified objects like existing prompts

7. **Copy Context Prompt** at [src/prompts/v1/salesContext.ts](src/prompts/v1/salesContext.ts)
   - Port from [context.md](src/graph/prompts/context.md)
   - Export: `export const SALES_CONTEXT = "..."`
   - Describes Neo4j schema, business rules, example queries
   - Used by Cypher generator for domain knowledge

8. **Create Vector Search Node** at [src/graph/nodes/vectorSearchNode.ts](src/graph/nodes/vectorSearchNode.ts)
   - Factory: `createVectorSearchNode(vectorSearchService: VectorSearchService, threshold: number)`
   - Input: `state.question`
   - Logic: `vectorSearchService.searchSimilar()`, compare `score > threshold`
   - Output: `{ cached, vectorScore, answerTemplate?, query? }`
   - Logging: "🔍 Searching vector cache..." / "✅ Cache hit!" / "⚠️ Cache miss"

9. **Create Cypher Generator Node** at [src/graph/nodes/cypherGeneratorNode.ts](src/graph/nodes/cypherGeneratorNode.ts)
   - Factory: `createCypherGeneratorNode(aiSdkService: AiSdkService, neo4jService: Neo4jService)`
   - Skip if: `state.cached === true`
   - Logic:
     - Get schema: `neo4jService.getSchema()`
     - Import `SALES_CONTEXT`
     - Build prompt with system/user templates from [cypherGenerator.ts](src/prompts/v1/cypherGenerator.ts)
     - Call: `aiSdkService.generateCypherWithTool()` - skill invoked as tool
   - Output: `{ query, toolCalls }`
   - Logging: "🤖 Generating Cypher with Neo4j skill..." / "✅ Tool: [name]"

10. **Create Cypher Executor Node** at [src/graph/nodes/cypherExecutorNode.ts](src/graph/nodes/cypherExecutorNode.ts)
    - Factory: `createCypherExecutorNode(neo4jService: Neo4jService)`
    - Logic:
      - Validate: `neo4jService.validateQuery(state.query)` with `EXPLAIN`
      - Execute: `neo4jService.query(state.query)`
      - Handle empty vs error differently
    - Output: `{ dbResults: any[], error? }`
    - Logging: "⚡ Executing Cypher..." / "✅ X results" / "❌ Failed"

11. **Create NLP Response Node** at [src/graph/nodes/nlpResponseNode.ts](src/graph/nodes/nlpResponseNode.ts)
    - Factory: `createNlpResponseNode(aiSdkService: AiSdkService)`
    - Skip if: `state.cached === true` or `state.error`
    - Logic:
      - Import prompts from [nlpResponse.ts](src/prompts/v1/nlpResponse.ts)
      - Build system/user prompts with `state.question` and `state.dbResults[0]`
      - Call: `aiSdkService.generateStructuredResponse(prompt, NlpResponseSchema)`
    - Output: `{ answerTemplate }`
    - Logging: "💬 Generating natural language template..."

12. **Create Format Response Node** at [src/graph/nodes/formatResponseNode.ts](src/graph/nodes/formatResponseNode.ts)
    - Factory: `createFormatResponseNode()` (no dependencies)
    - Logic:
      - Parse placeholders: `/{(.*?)}/g`
      - Loop `state.dbResults`, replace placeholders with values
      - Handle nested objects: convert to `"key: value"`
      - Join entries with `\n\n`
    - Output: `{ answer: string }`
    - Logging: "📝 Formatting final answer..."
    - Based on `parseTemplateToData` in [ai.js](src/graph/ai.js) lines 171-201

13. **Create Cache Storage Node** at [src/graph/nodes/cacheStorageNode.ts](src/graph/nodes/cacheStorageNode.ts)
    - Factory: `createCacheStorageNode(vectorSearchService: VectorSearchService)`
    - Skip if: `state.cached || state.error`
    - Logic: `vectorSearchService.store(state.question, state.answerTemplate, state.query)`
    - Side effect only
    - Logging: "💾 Storing in vector cache..."

14. **Create Sales Graph State Schema** at [src/graph/salesGraph.ts](src/graph/salesGraph.ts)
    - Define `SalesStateAnnotation`:
      ```typescript
      question: z.string()
      cached: z.boolean().optional()
      vectorScore: z.number().optional()
      query: z.string().optional()
      toolCalls: z.array(z.any()).optional()
      dbResults: z.array(z.any()).optional()
      answerTemplate: z.string().optional()
      answer: z.string().optional()
      error: z.string().optional()
      ```
    - Export: `type GraphState = z.infer<typeof SalesStateAnnotation>`

15. **Build Sales Graph** in [src/graph/salesGraph.ts](src/graph/salesGraph.ts)
    - Function: `buildSalesGraph(neo4jService, vectorSearchService, aiSdkService, config)`
    - Create all nodes with dependencies
    - Build `StateGraph` with conditional edges:
      - `START → vectorSearch`
      - `vectorSearch → (state.cached ? cypherExecutor : cypherGenerator)`
      - `cypherGenerator → cypherExecutor`
      - `cypherExecutor → (state.error ? END : state.cached ? formatResponse : nlpResponse)`
      - `nlpResponse → formatResponse`
      - `formatResponse → cacheStorage`
      - `cacheStorage → END`
    - Return compiled graph

16. **Update Config** at [src/config.ts](src/config.ts)
    - Add Neo4j:
      ```typescript
      neo4jUri: env.NEO4J_URI
      neo4jUser: env.NEO4J_USER
      neo4jPassword: env.NEO4J_PASSWORD
      vectorIndexName: "agent_index"
      vectorThreshold: 0.8
      ```
    - Add embeddings:
      ```typescript
      embeddingModel: "nomic-embed-text"
      ollamaBaseUrl: env.OLLAMA_BASE_URL
      ```
    - OpenRouter already configured

17. **Update Factory** at [src/graph/factory.ts](src/graph/factory.ts)
    - Import: `Neo4jService`, `VectorSearchService`, `AiSdkService`, `buildSalesGraph`
    - Instantiate services:
      ```typescript
      const neo4jService = new Neo4jService(config);
      const vectorSearchService = new VectorSearchService(config);
      const aiSdkService = new AiSdkService(config);
      ```
    - Export: `export const salesGraph = buildSalesGraph(neo4jService, vectorSearchService, aiSdkService, config)`
    - Keep existing `buildGraph()` for appointments

18. **Add Sales Endpoint** in [src/server.ts](src/server.ts)
    - Import `salesGraph`
    - Add route:
      ```typescript
      app.post('/sales', async (request, reply) => {
        const { question } = request.body;
        const response = await salesGraph.invoke({ question });
        return {
          answer: response.answer,
          cached: response.cached,
          query: response.query,
          error: response.error,
        };
      });
      ```

19. **Create E2E Tests** at [tests/sales.e2e.test.ts](tests/sales.e2e.test.ts)
    - Pattern: Same as [router.e2e.test.ts](tests/router.e2e.test.ts)
    - Test cases:
      - "List all courses" → 10 course names
      - "Who bought Formação JavaScript Expert?" → student names
      - "Total revenue from credit cards?" → aggregated sum
      - "Students with 100% progress?" → filtered results
      - "Students with progress but no purchase?" → edge case
      - Cached query → same question twice, check `cached: true`
      - Invalid question → graceful error
    - Assert: status, answer exists, cached boolean, keywords present

20. **Update Existing Tests** at [tests/router.e2e.test.ts](tests/router.e2e.test.ts)
    - Ensure medical appointment tests pass (no regression)

21. **Remove Legacy Files**
    - Delete [src/graph/ai.js](src/graph/ai.js)
    - Delete [src/graph/prompts/nlpToCypher.md](src/graph/prompts/nlpToCypher.md)
    - Delete [src/graph/prompts/responseTemplateFromJson.md](src/graph/prompts/responseTemplateFromJson.md)
    - Keep [src/graph/prompts/context.md](src/graph/prompts/context.md) as documentation

22. **Update Documentation**
    - Update [README.md](README.md) - add `/sales` endpoint
    - Add curl examples
    - Document AI SDK + OpenRouter + skills.sh stack

**Verification**

1. `npm run docker:infra:up`
2. `npm run seed`
3. `npm run dev`
4. Test: `curl -X POST http://localhost:4000/sales -H "Content-Type: application/json" -d '{"question":"List all courses"}'`
5. `npm run test:e2e` - all tests pass
6. Verify cache: ask twice, second has `cached: true`
7. Check logs for tool calling
8. Grafana traces: spans per node, tool invocation visible

**Decisions**

- **Why @openrouter/ai-sdk-provider?** Already using OpenRouter, unified provider, simpler config
- **Why unified AI SDK?** Consistent API across nodes, better tool calling support, no hybrid complexity
- **Why skills.sh?** Battle-tested Neo4j Cypher generation, saves prompt engineering time
- **Why keep caching?** Cost/latency reduction for repeated queries
- **Why port prompts to TS?** Type safety, co-location, project consistency
