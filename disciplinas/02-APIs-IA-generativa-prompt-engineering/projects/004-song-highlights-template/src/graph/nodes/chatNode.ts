import type { Runtime } from '@langchain/langgraph';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createChatNode(llmClient: OpenRouterService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {

    return {
      ...state,
    };
  };
}
