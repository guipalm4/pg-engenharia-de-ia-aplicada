import { AIMessage } from 'langchain';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';
import { getSystemPrompt, getUserPrompt } from '../../prompts/v1/agentNode.ts';

export function agentNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🤖 Agent node processing...');
        try {
            const userMessage = getUserPrompt({
                intent: state.intent!,
                fileName: state.fileName!,
                fileContent: state.fileContent!
            })
            const result = await openRouterService.generateStructured(
                getSystemPrompt(),
                userMessage,
            )

            return {
                error: undefined,
                messages: [new AIMessage(result.data as string)]
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
