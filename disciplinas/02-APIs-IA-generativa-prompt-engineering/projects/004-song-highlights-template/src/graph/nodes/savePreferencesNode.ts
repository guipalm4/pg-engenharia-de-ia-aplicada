import type { Runtime } from '@langchain/langgraph';
import type { GraphState } from '../graph.ts';

export function createSavePreferencesNode() {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {

    return {
      ...state
    };
  };
}
