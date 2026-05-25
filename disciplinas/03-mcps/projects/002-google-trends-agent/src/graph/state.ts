import { MessagesZodMeta } from '@langchain/langgraph';
import { withLangGraph } from '@langchain/langgraph/zod';
import type { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod/v3';

export const GraphAnnotation =  z.object({
    messages: withLangGraph(
        z.custom<BaseMessage[]>(),
        MessagesZodMeta),
    trendsData: z.string().optional(),
    question: z.string().optional(),
    keywords: z.array(z.string()).optional(),
});

export type GraphState = z.infer<typeof GraphAnnotation>;
