import { buildSalesQAGraph } from './graph/factory.ts';
import Fastify from 'fastify';
import { HumanMessage } from '@langchain/core/messages';

export const createServer = () => {
    const app = Fastify({
        logger: false
    });
    const { graph, neo4jService } = buildSalesQAGraph();
    app.addHook('onClose', async () => {
        try {
            await neo4jService.close();
        } catch (error) {
            console.error('Error closing Neo4j connection:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

    app.post('/sales', {
        schema: {
            body: {
                type: 'object',
                required: ['question'],
                properties: {
                    question: { type: 'string', minLength: 3 },
                },
            }
        }
    }, async function (request, reply) {
        try {
            const { question } = request.body as {
                question: string;
            };

            console.log('\n' + '═'.repeat(60));
            console.log(`📊 Sales Analytics: "${question}"`);
            console.log('═'.repeat(60));

            const startTime = Date.now();
            const response = await graph.invoke({
                messages: [new HumanMessage(question)]
            });

            const processingTimeMs = Date.now() - startTime;

            console.log('\n' + '═'.repeat(60));
            console.log(`✅ Analysis completed in ${processingTimeMs}ms`);
            console.log(`💬 Answer: ${response.answer?.substring(0, 100)}${(response?.answer?.length || 0) > 100 ? '...' : ''}`);
            console.log(`❓ Follow-ups: ${response.followUpQuestions?.length || 0} suggested`);
            console.log('═'.repeat(60) + '\n');

            return {
                answer: response.answer || 'No answer generated',
                followUpQuestions: response.followUpQuestions || [],
                query: response.query,
                error: response.error,
            };
        } catch (error) {
            console.error('Error processing sales query', error);
            return reply.status(500).send({
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });


    return app;
};
