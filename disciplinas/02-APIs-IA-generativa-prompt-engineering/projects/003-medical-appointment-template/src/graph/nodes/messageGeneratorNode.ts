import type { GraphState } from '../graph.ts';
import { AIMessage } from 'langchain';

export function createMessageGeneratorNode() {
    return async (state: GraphState): Promise<GraphState> => {
        console.log(`💬 Generating response message...`);

        try {

            return {
                ...state,
                messages: [
                    ...state.messages,
                ],
            };
        } catch (error) {
            console.error('❌ Error in messageGenerator node:', error);
            return {
                ...state,
                messages: [
                    ...state.messages,
                    new AIMessage('An error occurred while processing your request.')
                ],
            };
        }
    };
}
