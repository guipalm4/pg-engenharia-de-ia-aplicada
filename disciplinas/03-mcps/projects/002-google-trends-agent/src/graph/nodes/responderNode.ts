import { AIMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../../services/openRouterService.ts';
import { getResponderSystemPrompt, getResponderUserPrompt } from '../../prompts/v1/videoTrends.ts';
import type { GraphState } from '../state.ts';

export function createResponderNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('💬 Responder processing...');
        try {
            const userQuestion = state.question!;

            const { data } = await openRouterService.generateStructured(
                getResponderSystemPrompt(),
                getResponderUserPrompt(userQuestion, state.trendsData ?? ''),
            );

            const content = data as string;

            return { messages: [new AIMessage(content)] };

        } catch (error) {
            console.error('Responder error:', error);
            return { messages: [new AIMessage('Sorry, something went wrong while generating the response.')] };
        }

    };
}
