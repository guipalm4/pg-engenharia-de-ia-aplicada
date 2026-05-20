import { OpenRouterService } from '../../services/openrouterService.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import type { GraphState } from '../graph.ts';
import { CypherCorrectionSchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/cypherCorrection.ts';

export function createCypherCorrectionNode(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService,
) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {

    try {
      console.log('🔧 Auto-correcting Cypher query...');
      const schema = await neo4jService.getSchema()
      const systemPrompt = getSystemPrompt(schema)
      const userPrompt = getUserPromptTemplate(
        state.query!,
        state.validationError!,
        state.question,
      )

      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        CypherCorrectionSchema,
      )
      if(error) {
        return {
          ...state,
          error: `Query correction failed: ${error ?? 'Unknown error'}`,
        };
      }

      console.log(`✅ Query corrected: ${data?.explanation}`);

      return {
        ...state,
        query: data?.correctedQuery,
        originalQuery: state.originalQuery ?? state.query,
        correctionAttempts: (state.correctionAttempts ?? 0) + 1,
        validationError: undefined,
        needsCorrection: false,
      };
    } catch (error: any) {
      console.error('Error correcting query:', error.message);
      return {
        ...state,
        error: `Query correction failed: ${error.message}`,
      };
    }
  };
}
