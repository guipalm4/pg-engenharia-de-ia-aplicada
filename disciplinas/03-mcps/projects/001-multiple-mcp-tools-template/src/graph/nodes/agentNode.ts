import { AIMessage } from 'langchain';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';

export function agentNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🤖 Agent node processing...');
        try {


            return {
                messages: [new AIMessage('Nothing yet!')]
            };

        } catch (error) {
            console.error('Agent error:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                messages: [new AIMessage('Sorry, I had trouble processing the request.')],
            };
        }
    };
}
