import { AIMessage } from 'langchain';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';
import { getSystemPrompt, type IntentData, IntentSchema } from '../../prompts/v1/identifyIntent.ts';

export function intentNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🧠 Intent node processing...');
        try {
            const rawQuestion = state.messages.at(-1)!.text as string;
            const result = await openRouterService.generateStructured(
                getSystemPrompt(),
                rawQuestion,
                IntentSchema
            )

            const parsed = result.data as IntentData
            if (!parsed.intent || !parsed.fileType) {
                console.log('⚠️ Missing intent or fileType in parsed data:', parsed);
                throw new Error('Invalid intent data');
            }

            parsed.fileName ??= `data.${parsed.fileType}`

            console.log('📋 Extracted intent:', parsed.intent);
            console.log('📄 File Type:', parsed.fileType);
            console.log('📄 File name:', parsed.fileName);


            return {
                intent: parsed.intent,
                fileContent: parsed.fileContent ?? "",
                fileName: parsed.fileName,
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
