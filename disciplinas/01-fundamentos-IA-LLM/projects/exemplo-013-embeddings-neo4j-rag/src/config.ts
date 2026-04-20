import type { DataType, PretrainedModelOptions } from "@huggingface/transformers";
import { readFileSync } from 'node:fs'

const promptsFolder = './prompts';
const promptsFiles = {
    answerPrompt: `${promptsFolder}/answerPrompt.json`,
    template: `${promptsFolder}/template.txt`,
};

export interface TextSplitterConfig {
    chunkSize: number;
    chunkOverlap: number;
}

export const CONFIG = Object.freeze({
    promptConfig: JSON.parse(readFileSync(promptsFiles.answerPrompt, 'utf-8')),
    templateText: readFileSync(promptsFiles.template, 'utf-8'),
    output: {
        answersFolder: './respostas',
        fileName: 'resposta',
    },
    neo4j: {
        url: process.env.NEO4J_URI!,
        username: process.env.NEO4J_USER!,
        password: process.env.NEO4J_PASSWORD!,
        indexName: "tensors_index",
        searchType: "vector" as const,
        textNodeProperties: ["text"],
        nodeLabel: "Chunk",
    },
    openRouter: {
        nlpModel: process.env.NLP_MODEL,
        url: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.3,
        maxRetries: 2,
        defaultHeaders: {
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL,
            "X-Title": process.env.OPENROUTER_SITE_NAME,
        }
    },
    pdf: {
        path: "./tensores.pdf",
    },
    textSplitter: {
        chunkSize: 1000,
        chunkOverlap: 200,
    },
    embedding: {
        modelName: process.env.EMBEDDING_MODEL!,
        pretrainedOptions: {
            dtype: "fp32" as DataType, // Options: 'fp32' (best quality), 'fp16' (faster), 'q8', 'q4', 'q4f16' (quantized)
        } satisfies PretrainedModelOptions,
    },
    similarity: {
        topK: 3,
    },
});
