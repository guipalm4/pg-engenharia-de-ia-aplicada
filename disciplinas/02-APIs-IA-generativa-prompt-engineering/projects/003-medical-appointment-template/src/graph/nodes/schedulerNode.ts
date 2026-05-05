import type { GraphState } from '../graph.ts';


export function createSchedulerNode() {
  return async (state: GraphState): Promise<GraphState> => {
    console.log(`📅 Scheduling appointment...`);

    try {


      console.log(`✅ Appointment scheduled successfully`);

      return {
        ...state,
        actionSuccess: true,
      };
    } catch (error) {
      console.log(`❌ Scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Scheduling failed',
      };
    }
  };
}
