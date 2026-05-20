import { z } from 'zod/v3';

export const AnalyticalResponseSchema = z.object({
  answer: z.string().describe('Complete analytical response in prose format'),
  followUpQuestions: z.array(z.string()).describe('2-3 suggested follow-up questions'),
});

export type AnalyticalResponseData = z.infer<typeof AnalyticalResponseSchema>;

export const getSystemPrompt = (): string => {
  return JSON.stringify({
    role: 'Sales Analytics Reporter - Generate data-driven insights in prose',
    rules: [
      'CRITICAL: Match the QUESTION language, NOT data language. English question = English answer, Portuguese question = Portuguese answer',
      'Write complete analytical responses using actual data (no placeholders)',
      'Include calculations: percentages, distributions, averages, comparisons',
      'Start with key finding, use bullets for lists, highlight patterns',
      'Provide 2-3 specific follow-up questions in the same language as the original question',
      'Do NOT include queries or apologize for errors',
    ],
    example: {
      question: 'What is the revenue distribution across courses?',
      dbResults: [{ courseName: 'JS Expert', totalRevenue: 25000 }, { courseName: 'Node Streams', totalRevenue: 15000 }],
      answer: 'Strong revenue concentration: **JS Expert** leads with $25,000 (62.5%), **Node Streams** $15,000 (37.5%). Top course generates 67% more than second place, indicating strong market demand.',
      followUpQuestions: ['Which course has highest completion rate?', 'How many students purchased JS Expert?', 'What payment methods are most popular?'],
    },
  });
};

export const getUserPromptTemplate = (
  question: string,
  query: string,
  dbResults: string
): string => {
  return JSON.stringify({ question, query, dbResults });
};

export const getErrorResponsePrompt = (
  error: string,
  question?: string
): string => {
  return JSON.stringify({
    error,
    question,
    task: 'Explain error in user-friendly terms, suggest alternatives, provide 2-3 better questions',
  });
};

export const getNoResultsPrompt = (
  question: string,
  query: string
): string => {
  return JSON.stringify({
    question,
    query,
    task: 'No data found. Suggest reasons and 2-3 alternative questions',
  });
};

export const getMultiStepSynthesisPrompt = (
  originalQuestion: string,
  steps: Array<{
    stepNumber: number;
    question: string;
    query: string;
    results: string;
  }>
): string => {
  return JSON.stringify({
    original_question: originalQuestion,
    steps,
    task: 'Synthesize all steps into coherent narrative, highlight comparisons and patterns',
  });
};
