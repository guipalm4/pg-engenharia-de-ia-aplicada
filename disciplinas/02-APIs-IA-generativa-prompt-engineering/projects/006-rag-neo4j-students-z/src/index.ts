import { createServer } from './server.ts';

const app = createServer();

await app.listen({ port: 4000, host: '0.0.0.0' });
console.log(`Server is running on http://0.0.0.0:4000`);

//  curl \
//  -X POST \
//  -H 'Content-type: application/json' \
//  --data '{"question": "upper"}' \
//  localhost:4000/chat

app.inject({
    method: 'POST',
    url: '/sales',
    payload: {
        question: 'Which courses are commonly bought together?', // complex
        // question: "Find courses that students typically purchase after 'Machine Learning em Navegadores'", // complex
        // question: 'Show me the revenue distribution across all courses',
        // question: 'Which users have progressed over 80%?',
        // question: 'Quantos cursos tem na academia?', // simple
    },
}).then(response => {
    console.log(JSON.parse(response.body)?.answer);
}).catch(error => {
    console.error('Error making test request:', error);
})