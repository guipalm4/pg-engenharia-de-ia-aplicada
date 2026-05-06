import { HumanMessage } from 'langchain';
import { buildGraph } from './graph/factory.ts';

import Fastify from 'fastify';

const graph = buildGraph();

export const createServer = () => {
    const app = Fastify();

    app.post('/chat', {
        schema: {
            body: {
                type: 'object',
                required: ['question'],
                properties: {
                    question: { type: 'string', minLength: 10 },
                },
            }
        }
    }, async function (request, reply) {
        try {
            const { question } = request.body as {
                question: string;
            };

            const response = await graph.invoke({
                messages: [new HumanMessage(question)],
            });

            return response

        } catch (error) {
            console.error('❌ Error processing request:', error);
            return reply.status(500).send({
                error: 'An error occurred while processing your request.',
            });
        }
    });

    return app;
};
