import type { GraphState } from '../graph.ts';

export const routeAfterChat = (state: GraphState): string =>
  state.extractedPreferences ? 'savePreferences' :
  state.needsSummarization ? 'summarize' : 'end';

export const routeAfterSavePreferences = (state: GraphState): string =>
  state.needsSummarization ? 'summarize' : 'end';
