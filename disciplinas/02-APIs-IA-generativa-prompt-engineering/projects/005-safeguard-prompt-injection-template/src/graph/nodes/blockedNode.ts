import type { GraphState } from '../state.ts';

export async function blockedNode(state: GraphState): Promise<Partial<GraphState>> {


  return {
    ...state,
  };
}
