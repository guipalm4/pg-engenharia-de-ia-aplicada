import { z } from 'zod/v3';

export const KeywordsSchema = z.object({
    keywords: z.array(z.string()).describe('The 2 most relevant search keywords extracted from the user question to query Google Trends.'),
});

export type KeywordsData = z.infer<typeof KeywordsSchema>;

export const getKeywordsSystemPrompt = () =>
    `
You are a research assistant for video content creators.
Given a user question about video topics, extract exactly 2 keywords and call google_trends ONCE with both keywords in a single array. Do not call the tool more than once.
Do not answer without calling the tool first.
`.trim();


// This enables the AI to do multiple calls to the tool if needed (reasoning -> tool call -> reasoning -> tool call, etc.),
// but we want to limit it to just one call with both keywords together

// export const getKeywordsSystemPrompt = () =>
//     `
// You are a research assistant for video content creators.
// Given a user question about video topics, extract the 2 most relevant search keywords and IMMEDIATELY call the google_trends tool with those keywords.
// Do not answer without calling the tool first.
// `.trim();