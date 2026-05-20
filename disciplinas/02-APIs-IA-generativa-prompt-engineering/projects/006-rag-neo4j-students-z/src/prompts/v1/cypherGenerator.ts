import { z } from 'zod/v3';

export const CypherQuerySchema = z.object({
  query: z.string().describe('The Neo4j Cypher query'),
});

export type CypherQueryData = z.infer<typeof CypherQuerySchema>;

export const getSystemPrompt = async (schema: string, context: string): Promise<string> => {
  return JSON.stringify({
    role: 'Neo4j Cypher Query Generator - Translate questions into optimized queries for sales analytics',
    schema,
    context,
    rules: [
      'Use elementId() not id()',
      'For conditional counts, use CASE or filter in WITH: COUNT(c) works, but for conditions use: WITH s, COUNT(CASE WHEN pr.progress = 100 THEN 1 END) AS completed',
      'Avoid COUNT{} syntax - use simple COUNT() with CASE statements for conditional counting',
      'Use EXISTS{} for checking existence: WHERE EXISTS { MATCH (s)-[:PURCHASED]->(c) }',
      'Always use AS aliases for all return fields (e.g., s.name AS studentName)',
      'Return flat values (no nested objects), use NULLS LAST when sorting',
      'Filter early in patterns, keep max 3 relationship hops',
      'Return ONLY plain text query (no markdown, no "cypher" wrapper)',
    ],
    examples: [
      { question: 'List all courses', query: 'MATCH (c:Course) RETURN c.name AS courseName, c.url AS url ORDER BY c.name' },
      { question: 'Revenue distribution with percentages', query: 'MATCH (s:Student)-[p:PURCHASED]->(c:Course) WHERE p.status = "paid" WITH SUM(p.amount) AS grandTotal MATCH (s2:Student)-[p2:PURCHASED]->(c2:Course) WHERE p2.status = "paid" WITH c2, grandTotal, SUM(p2.amount) AS revenue RETURN c2.name AS courseName, revenue, round(100.0 * revenue / grandTotal, 2) AS percentage ORDER BY revenue DESC' },
      { question: 'Which students completed multiple courses?', query: 'MATCH (s:Student)-[pr:PROGRESS]->(c:Course) WHERE pr.progress = 100 WITH s, COUNT(c) AS completedCount WHERE completedCount > 1 MATCH (s)-[pr2:PROGRESS {progress: 100}]->(c2:Course) RETURN s.name AS studentName, s.email AS email, completedCount, COLLECT(c2.name) AS completedCourses ORDER BY completedCount DESC' },
      { question: 'Students who completed all enrolled courses', query: 'MATCH (s:Student)-[pr:PROGRESS]->(c:Course) WITH s, COUNT(c) AS totalEnrolled, SUM(CASE WHEN pr.progress = 100 THEN 1 ELSE 0 END) AS completed WHERE totalEnrolled = completed AND totalEnrolled > 0 RETURN s.name AS studentName, s.email AS email, totalEnrolled AS coursesCompleted ORDER BY totalEnrolled DESC' },
      { question: 'What courses are frequently bought together?', query: 'MATCH (s:Student)-[:PURCHASED]->(c1:Course), (s)-[:PURCHASED]->(c2:Course) WHERE elementId(c1) < elementId(c2) WITH c1.name AS course1, c2.name AS course2, COUNT(s) AS coEnrollments WHERE coEnrollments > 2 RETURN course1, course2, coEnrollments ORDER BY coEnrollments DESC LIMIT 10' },
    ],
  });
};

export const getUserPromptTemplate = (question: string): string => {
  return question;
};
