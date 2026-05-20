import { OpenRouterService } from '../../services/openrouterService.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import type { GraphState } from '../graph.ts';
import { CypherQuerySchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/cypherGenerator.ts';
import { SALES_CONTEXT } from '../../prompts/v1/salesContext.ts';


function getCurrentStepQuestion(state: GraphState) {
  if (!state.isMultiStep || !state.subQuestions?.length || state.currentStep === undefined) {
    return null
  }

  if (state.currentStep >= state.subQuestions.length) {
    return null
  }

  return {
    question: state.subQuestions[state.currentStep],
    stepNumber: state.currentStep + 1
  }

}

export function createCypherGeneratorNode(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService,
) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {

      const stepInfo = getCurrentStepQuestion(state)
      const targetQuestion = stepInfo?.question ?? state.question!
      if (stepInfo) {
        const totalSteps = state.subQuestions?.length ?? 0;
        console.log(`🤖 Generating Cypher query for step ${stepInfo.stepNumber}/${totalSteps}: "${targetQuestion}"`);
      } else {
        console.log('🤖 Generating Cypher query...');
      }

      const schema = await neo4jService.getSchema()
      const systemPrompt = await getSystemPrompt(schema, SALES_CONTEXT)
      const userPrompt = await getUserPromptTemplate(targetQuestion)

      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        CypherQuerySchema,
      )

      if(error) {
        return {
          error: `Failed to generate query: ${error ?? 'Unknown error'}`,
        }
      }

      console.log(`✅ Generated Cypher query: ${data?.query}`);
      if(state.isMultiStep && state.subQueries?.length) {
        return {
          query: data?.query,
          subQueries: [...state.subQueries, data?.query ?? ""]
        }
      }

      return {
        query: data?.query,
      };

    } catch (error: any) {
      console.error('Error generating Cypher query:', error.message);
      return {
        ...state,
        error: `Failed to generate query: ${error.message}`,
      };
    }
  };
}
