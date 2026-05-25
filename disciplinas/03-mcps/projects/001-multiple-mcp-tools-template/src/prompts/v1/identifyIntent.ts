import { z } from 'zod/v3';

export const IntentSchema = z.object({
    intent: z.string().describe('A clean, concise natural-language description of what the user wants to accomplish. Do NOT include any CSV or JSON data in this field.'),
    fileContent: z.string().nullable().describe('The raw CSV or JSON block embedded in the message, exactly as provided. If there is no file content, set this to null.'),
    fileName: z.string().nullable().describe('An inferred filename or type for the data (e.g. "sales", "report"). Derive it from the question.'),
    fileType: z.enum(['csv', 'json', 'unknown']).describe('The inferred file type based on the content or filename. If it looks like CSV, set to "csv". If it looks like JSON, set to "json". Otherwise, set to "unknown".'),
});

export type IntentData = z.infer<typeof IntentSchema>;

export const getSystemPrompt = () =>
    `
You are an intent extraction assistant.
Analyze the user message and extract the requested fields as structured output.
The user message may contain a natural-language instruction mixed with raw file content (CSV or JSON).
Separate them cleanly: the intent is the goal, fileContent is the raw data block, fileName is the inferred file name.
If no file data is present, set fileContent and fileName to null.
`.trim();



