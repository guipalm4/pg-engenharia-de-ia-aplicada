import type { GraphState } from '../state.ts';
import { AIMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../../services/openrouterService.ts';

export const createChatNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {
            return {
                ...state,
            };
        } catch (error) {
            console.error('Chat node error:', error);
            return {
                messages: [new AIMessage('I apologize, but I encountered an error processing your request. Please try again later.')],
            };
        }
    }
}
