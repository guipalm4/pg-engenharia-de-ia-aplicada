import { z } from 'zod/v3';

export const NlpResponseSchema = z.object({
  answerTemplate: z.string().describe('Human-readable response template with placeholders matching JSON keys'),
});

export type NlpResponseData = z.infer<typeof NlpResponseSchema>;

export const getSystemPrompt = (): string => {
  return JSON.stringify({
    role: 'Natural Language Response Generator - Create templates with placeholders for database results',
    rules: [
      'Use {fieldName} placeholders matching exact JSON keys from database',
      'Include placeholders for ALL dynamic values (no hardcoded data)',
      'Natural language that answers question directly',
      'Use bullet points for lists, no SQL/JSON/code',
      'Answer in the language of the question, keep it concise. Preferably in Brazilian Portuguese.',
    ],
    example: { data: [{ name: 'JS', url: 'https://...' }], template: 'Available:\n- {name}: {url}' },
  });
};

export const getUserPromptTemplate = (question: string, dbResults: string): string => {
  return JSON.stringify({ question, database_results: dbResults });
};
