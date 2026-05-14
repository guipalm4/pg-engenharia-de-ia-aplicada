import { PromptTemplate } from '@langchain/core/prompts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';
import { prompts } from '../../config.ts';

export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {

            const userPrompt = state.messages.at(-1)?.text!
            const template = PromptTemplate.fromTemplate(prompts.system)
            // exemplo abaixo é mais inseguro!!
            // const systemPrompt = prompts.system
            //  .replace('{USER_ROLE}', state.user.role);
            //  .replace('{USER_NAME}', state.user.displayName);

            const systemPrompt = await template.format({
                USER_ROLE: state.user.role,
                USER_NAME: state.user.displayName
            })

            const msg = systemPrompt.concat('\n', userPrompt)

            const result = await openRouterService.checkGuardRails(
                msg,
                state.guardrailsEnabled,
            )

            return {
                guardrailCheck: result
            };
        } catch (error) {
            console.error('Guardrails check failed:', error);

            return {
                guardrailCheck: {
                    reason: 'Guardrails service unavailable - request blocked for safety',
                    safe: false,
                }
            };
        }
    }
}
