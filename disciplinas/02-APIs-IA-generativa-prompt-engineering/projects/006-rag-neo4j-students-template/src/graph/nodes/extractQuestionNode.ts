import type { GraphState } from '../graph.ts';

export function createExtractQuestionNode() {

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      if (!state.messages?.length) {
        console.error('No messages in state');
        return {
          ...state,
          error: 'No messages provided',
        };
      }

      const question = state.messages.at(-1)?.text ?? '';

      if (!question.trim()) {
        console.error('Extracted question is empty');
        return {
          ...state,
          error: 'No valid question found in messages',
        };
      }

      console.log(`📝 Extracted question: "${question}"`);

      return {
        ...state,
        question,
      };
    } catch (error: any) {
      console.error('Error extracting question:', error.message);
      return {
        ...state,
        error: `Failed to extract question: ${error.message}`,
      };
    }
  };
}
