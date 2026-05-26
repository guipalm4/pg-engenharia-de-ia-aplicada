import { AIMessage } from 'langchain';
import type { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createAnswerGenerationNode(
    llmClient: OpenRouterService
) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {

            if(!state.documentBase64) {
                return {
                    messages: [new AIMessage('No document found in state')]
                }
            }


            console.log('🤖 Sending document to multimodal model for analysis...');

            const systemPrompt = 'You are a helpful AI assistant that can analyze documents and answer questions about them.'
            const userPrompt = state.messages.at(-1)?.text;

            const response = await llmClient.generateWithDocument(
                systemPrompt,
                userPrompt!,
                state.documentBase64!,
            );

            console.log(`✅ Model: ${response.model}`);

            return {
                messages: [new AIMessage(response.content)]
            };
        } catch (error) {
            console.error('Error in answerGenerationNode:', error);
            return {
                messages: [new AIMessage(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`)]
            };
        }
    };
}
