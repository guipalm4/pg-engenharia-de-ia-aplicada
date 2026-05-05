import type { GraphState } from '../graph.ts';

export function createIdentifyIntentNode() {
  return async (state: GraphState): Promise<GraphState> => {
    console.log(`🔍 Identifying intent...`);
   const input = state.messages.at(-1)!.text;

    try {

      return {
        ...state,
      };
    } catch (error) {
      console.error('❌ Error in identifyIntent node:', error);
      return {
        ...state,
        intent: 'unknown',
        error: error instanceof Error ? error.message : 'Intent identification failed',
      };
    }
  };
}
