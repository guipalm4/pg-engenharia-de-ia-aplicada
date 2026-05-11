import {
  StateGraph,
  START,
  END,
  MessagesZodMeta,
} from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { z } from "zod/v3";

import type { BaseMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../services/openrouterService.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { createSummarizationNode } from './nodes/summarizationNode.ts';
import { createSavePreferencesNode } from './nodes/savePreferencesNode.ts';
import { routeAfterChat, routeAfterSavePreferences } from './nodes/edgeConditions.ts';

const ChatStateAnnotation = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),
  userContext: z.string().optional(),
  extractedPreferences: z.any().optional(),
  needsSummarization: z.boolean().optional(),
  conversationSummary: z.any().optional(),
  userId: z.string().optional(),
});

export type GraphState = z.infer<typeof ChatStateAnnotation>;

export function buildChatGraph(
  llmClient: OpenRouterService,
) {
  const graph = new StateGraph(ChatStateAnnotation)
    .addNode('chat', createChatNode(llmClient))
    .addNode('savePreferences', createSavePreferencesNode())
    .addNode('summarize', createSummarizationNode(llmClient))

    .addEdge(START, 'chat')

    .addConditionalEdges(
      'chat',
      routeAfterChat,
      {
        savePreferences: 'savePreferences',
        summarize: 'summarize',
        end: END,
      }
    )

    .addConditionalEdges(
      'savePreferences',
      routeAfterSavePreferences,
      {
        summarize: 'summarize',
        end: END,
      }
    )

    .addEdge('summarize', END);

  return graph.compile();
}
