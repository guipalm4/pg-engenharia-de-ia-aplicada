import { AIMessage } from 'langchain';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';

export function intentNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🧠 Intent node processing...');
        try {
            const rawQuestion = state.messages.at(-1)!.text as string;


            return {
                intent: '',
                fileContent: '{}',
                fileName: 'report.json',
            };

        } catch (error) {
            console.error('Intent node error:', error);
            return {
                messages: [new AIMessage('Sorry, I had trouble understanding the intent. Please rephrase your question or provide more details.')],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };
}
