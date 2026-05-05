import type { GraphState } from '../graph.ts';

export function createCancellerNode() {
  return async (state: GraphState): Promise<GraphState> => {
    console.log(`❌ Cancelling appointment...`);

    try {

      return {
        ...state,
        actionSuccess: true,
      };
    } catch (error) {
      console.log(`❌ Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  };
}
