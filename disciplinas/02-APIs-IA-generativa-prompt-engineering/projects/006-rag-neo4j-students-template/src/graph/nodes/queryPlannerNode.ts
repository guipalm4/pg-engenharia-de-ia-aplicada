import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createQueryPlannerNode(llmClient: OpenRouterService) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {

    try {

      return {
        ...state,
      };
    } catch (error: any) {
      console.error('❌ Error analyzing query:', error.message);
      return {
        ...state,
        isMultiStep: false,
      };
    }
  }
}
