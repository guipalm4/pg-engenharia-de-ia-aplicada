import { z } from 'zod/v3';

export const CypherCorrectionSchema = z.object({
  correctedQuery: z.string().describe('The corrected Neo4j Cypher query'),
  explanation: z.string().describe('Brief explanation of what was fixed'),
});

export type CypherCorrectionData = z.infer<typeof CypherCorrectionSchema>;

export const getSystemPrompt = (schema: string): string => {
  return JSON.stringify({
    role: 'Neo4j Cypher Query Debugger - Fix invalid queries based on error messages',
    schema,
    rules: [
      'Read error carefully, preserve original intent, return valid executable query',
      'Aggregation errors: Use WITH to separate grouping from aggregation',
      'Variable scope errors: Pass variables through WITH or redefine them',
      'NULL errors: Add NULLS LAST/FIRST to ORDER BY',
      'Property errors: Check schema, use correct aliases (n.name AS name)',
    ],
    example: {
      failed: 'WITH SUM(p.amount) AS total ... RETURN c.name, revenue, round(revenue / total, 2)',
      error: 'Implicit grouping expressions: totalRevenue',
      corrected: 'WITH SUM(p.amount) AS total ... WITH total, c.name AS name, SUM(p2.amount) AS rev RETURN name, rev, round(rev / total, 2)',
      fix: 'Moved grouping into WITH before RETURN',
    },
  });
};

export const getUserPromptTemplate = (
  failedQuery: string,
  errorMessage: string,
  originalQuestion?: string
): string => {
  return JSON.stringify({
    failed_query: failedQuery,
    error_message: errorMessage,
    original_question: originalQuestion,
  });
};
