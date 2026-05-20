import { AIMessage } from 'langchain';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';
import { AnalyticalResponseSchema, getErrorResponsePrompt, getMultiStepSynthesisPrompt, getNoResultsPrompt, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/analyticalResponse.ts';


async function handleErrorResponse(state: GraphState, llmClient: OpenRouterService): Promise<Partial<GraphState>> {
  const systemPrompt = getSystemPrompt()
  const userUserPrompt = getErrorResponsePrompt(state.error!, state.question)
  const { data, error } = await llmClient.generateStructured(
    systemPrompt,
    userUserPrompt,
    AnalyticalResponseSchema,
  )

  if (error) {
    return {
      messages: [new AIMessage(`An error ocurred: ${error}`)],
      error,
      answer: `An error ocurred: ${error}`,
      followUpQuestions: [],
    }
  }

  return {
    messages: [new AIMessage(data?.answer!)],
    answer: data?.answer,
    followUpQuestions: data?.followUpQuestions,
  }

}
async function handleSuccessResponse(state: GraphState, llmClient: OpenRouterService): Promise<Partial<GraphState>> {
  const systemPrompt = getSystemPrompt()
  let _userPrompt: string
  if (
    Boolean(
      state.isMultiStep &&
      state.subResults?.length &&
      state.subQuestions?.length &&
      state.subQueries?.length
    )
  ) {
    console.log(`📊 Synthesizing ${state.subResults!.length} step results...`);
    const stepsData = state.subResults!.map((results, index) => ({
      stepNumber: index + 1,
      question: state.subQuestions![index],
      query: state.subQueries![index],
      results: JSON.stringify(results)
    }))

    _userPrompt = getMultiStepSynthesisPrompt(state.question!, stepsData)
  } else {
    _userPrompt = getUserPromptTemplate(
      state.question!,
      state.query!,
      JSON.stringify(state.dbResults)
    )
  }

  const { data, error } = await llmClient.generateStructured(
    systemPrompt,
    _userPrompt,
    AnalyticalResponseSchema,
  )

  if (error) {
    console.error('Failed to generate analytical response');
    return {
      error: `Reponse generation faild: ${error ?? 'Unknown error'}`
    }
  }

  console.log('✅ Generated analytical response');
  return {
    messages: [new AIMessage(data?.answer!)],
    answer: data?.answer,
    followUpQuestions: data?.followUpQuestions,
  }
}

async function handleNoResultsResponse(
  state: GraphState,
  llmClient: OpenRouterService,
): Promise<GraphState> {
  console.log('💬 Generating no-results response...');

  const systemPrompt = getSystemPrompt();
  const userPrompt = getNoResultsPrompt(
    state.question ?? 'your query',
    state.query ?? 'N/A'
  );

  const { data, error } = await llmClient.generateStructured(
    userPrompt,
    systemPrompt,
    AnalyticalResponseSchema,
  );

  if (data) {
    return {
      ...state,
      messages: [...state.messages, new AIMessage(data.answer)],
      answer: data.answer,
      followUpQuestions: data.followUpQuestions,
    };
  }

  const noResultsMessage = "No data found matching your query.";
  return {
    ...state,
    messages: [...state.messages, new AIMessage(noResultsMessage)],
    error,
    answer: noResultsMessage,
    followUpQuestions: [],
  };
}

export function createAnalyticalResponseNode(llmClient: OpenRouterService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {

      if (state.error) {
        return await handleErrorResponse(state, llmClient)
      }

      if (!state.dbResults?.length) {
        return await handleNoResultsResponse(state, llmClient);
      }

      return await handleSuccessResponse(state, llmClient)

    } catch (error: any) {
      console.error('Error generating analytical response:', error.message);
      return {
        ...state,
        error: `Response generation failed: ${error.message}`,
      };
    }
  };
}
