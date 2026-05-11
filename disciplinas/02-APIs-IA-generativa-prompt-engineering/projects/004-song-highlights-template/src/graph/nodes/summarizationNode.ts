import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createSummarizationNode(llmClient: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {

        return {
          ...state,
        };
    };
}
