import { describe, it, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { seedDatabase } from '../data/seedHelpers.ts';
import { type FastifyInstance } from 'fastify';

describe('Sales Analytics Reporter - E2E Tests', async () => {
    let _app: FastifyInstance;

    async function makeASalesRequest(question: string) {
        return _app.inject({
            method: 'POST',
            url: '/sales',
            payload: {
                question,
            },
        });
    }
    before(async () => {
        await seedDatabase();
        _app = createServer();
        await _app.ready();
    });


    after(async () => {
        await _app?.close()
    });

    it('List all courses - Should return analytical response', async () => {
        const response = await makeASalesRequest(
            'List all available courses'
        );

        console.log('List courses response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

        // Should mention some course names from courses.json
        assert.ok(
            body.answer.includes('JavaScript') || body.answer.includes('Node.js'),
            'Answer should contain course names'
        );
    });

    it('Query students who bought specific course - Should provide details', async () => {
        const response = await makeASalesRequest(
            'Who bought Formação JavaScript Expert?'
        );

        console.log('Students query response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
    });

    it('Query total revenue from credit cards - Should include analytics', async () => {
        const response = await makeASalesRequest(
            'What is the total revenue from credit card payments?'
        );

        console.log('Revenue query response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
    });

    it('Revenue distribution analysis - Should show percentages and comparisons', async () => {
        const response = await makeASalesRequest(
            'Show me the revenue distribution across all courses'
        );

        console.log('Distribution analysis response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

        // Analytical response should include numbers or percentages
        assert.ok(
            body.answer.match(/\d+%|\$\d+|revenue/i),
            'Answer should contain analytical metrics'
        );
    });

    it('Query students with 100% progress - Should provide insights', async () => {
        const response = await makeASalesRequest(
            'Which students have 100% progress in their courses?'
        );

        console.log('Progress query response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
    });

    it('Payment method analysis - Should compare different methods', async () => {
        const response = await makeASalesRequest(
            'What are the most popular payment methods?'
        );

        console.log('Payment method analysis response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
    });

    it('Edge case: Students with progress but no purchase - Should handle gracefully', async () => {
        const response = await makeASalesRequest(
            'Are there students with progress in a course they never bought?'
        );

        console.log('Edge case query response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
    });

    it('Invalid/unclear question - Should handle gracefully with suggestions', async () => {
        const response = await makeASalesRequest(
            'What is the weather today?'
        );

        console.log('Invalid question response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        // Should either have an error or a message saying no results found
        assert.ok(
            body.error || body.answer,
            'Should have either error or answer'
        );
    });

    it('Query students who never started a course - Should show engagement gaps', async () => {
        const response = await makeASalesRequest(
            'Which students bought a course but never started it?'
        );

        console.log('Students without progress response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
    });

    it('Follow-up questions - Should provide relevant suggestions', async () => {
        const response = await makeASalesRequest(
            'Show me the top performing courses'
        );

        console.log('Follow-up questions test response:', response.body);

        const body = JSON.parse(response.body);
        assert.equal(response.statusCode, 200);
        assert.ok(body.answer, 'Answer should exist');
        assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

        // Should suggest at least 2 follow-up questions
        assert.ok(
            body.followUpQuestions.length >= 2,
            'Should provide at least 2 follow-up questions'
        );
    });
});
