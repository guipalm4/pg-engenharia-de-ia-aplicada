import {
  StateGraph,
  START,
  END,
  MessagesZodMeta,
} from '@langchain/langgraph';
import { withLangGraph } from "@langchain/langgraph/zod";

import { z } from 'zod/v3';
import type { BaseMessage } from '@langchain/core/messages';

import { OpenRouterService } from '../services/openrouterService.ts';
import { createAnswerGenerationNode } from './nodes/answerGenerationNode.ts';

const DocumentQAStateAnnotation = z.object({
  // Input
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),

  // Document processing (stored as base64 for multimodal)
  documentBase64: z.string().optional(),

  // Error handling
  error: z.string().optional(),
});

export type GraphState = z.infer<typeof DocumentQAStateAnnotation>;

export function buildDocumentQAGraph(
  llmClient: OpenRouterService) {
  const workflow = new StateGraph({
    stateSchema: DocumentQAStateAnnotation,
  })
    .addNode('answerGeneration', createAnswerGenerationNode(llmClient))
    .addEdge(START, 'answerGeneration')
    .addEdge('answerGeneration', END);

  return workflow.compile();
}
