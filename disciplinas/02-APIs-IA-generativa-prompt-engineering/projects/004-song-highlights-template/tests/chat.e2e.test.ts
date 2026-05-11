import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from '../src/graph/factory.ts';
import { unlinkSync, existsSync } from 'node:fs';

describe('Chat de Recomendação Musical - Testes E2E', () => {
  let graph: any;
  let memoryService: any;
  const testDbPath = './test-memory.db';

  before(async () => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    const built = await buildGraph();
    graph = built.graph;
    memoryService = built.memoryService;
  });

  after(async () => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  it('Deve extrair e salvar preferências do usuário', async () => {
    const testThreadId = `test-user-${Date.now()}`;
    const config = {
      configurable: { thread_id: testThreadId },
      context: { userId: testThreadId }
    };

    const response = await graph.invoke(
      {
        messages: [new HumanMessage('Oi! Meu nome é Alex e eu amo rock e metal')],
        userId: testThreadId,
      },
      config
    );

    assert.ok(response.messages.length > 0, 'Deve ter mensagens de resposta');

    const lastMessage = response.messages.at(-1);
    assert.equal(lastMessage._getType(), 'ai', 'Última mensagem deve ser da IA');

    const content = lastMessage.content.toLowerCase();
    assert.ok(
      content.includes('alex') || content.includes('rock') || content.includes('metal'),
      'Resposta deve reconhecer as preferências'
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    const namespace = ['memories', testThreadId];
    const savedMemories = await memoryService.store.search(namespace, { limit: 10 });

    assert.ok(savedMemories.length > 0, 'Preferências devem estar salvas');

    const memoriesText = savedMemories.map((m: any) => m.value.data).join(' ');
    assert.ok(memoriesText.includes('Alex'), 'Nome deve estar salvo');
  });

  it('Deve manter múltiplas trocas e fazer sumarização', async () => {
    const testThreadId = `test-user-${Date.now()}`;
    const config = {
      configurable: { thread_id: testThreadId },
      context: { userId: testThreadId }
    };

    await graph.invoke(
      {
        messages: [new HumanMessage('Oi! Sou a Sarah e adoro indie e eletrônica')],
        userId: testThreadId,
      },
      config
    );

    const response2 = await graph.invoke(
      {
        messages: [new HumanMessage('Gosto especialmente de Tame Impala e Daft Punk')],
        userId: testThreadId,
      },
      config
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    const namespace = ['memories', testThreadId];
    const savedMemories = await memoryService.store.search(namespace, { limit: 10 });

    assert.ok(savedMemories.length > 0, 'Memórias devem existir');

    const memoriesText = savedMemories.map((m: any) => m.value.data.toLowerCase()).join(' ');
    assert.ok(memoriesText.includes('sarah'), 'Nome deve estar salvo');
    assert.ok(
      memoriesText.includes('indie') || memoriesText.includes('eletrônica') || memoriesText.includes('electronic'),
      'Gêneros devem estar salvos'
    );
  });

  it('Deve recuperar contexto em nova sessão', async () => {
    const testThreadId = `test-user-${Date.now()}`;
    const config = {
      configurable: { thread_id: testThreadId },
      context: { userId: testThreadId }
    };

    await graph.invoke(
      {
        messages: [new HumanMessage('Meu nome é Marcus, tenho 28 anos e adoro jazz e blues')],
        userId: testThreadId,
      },
      config
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    const namespace = ['memories', testThreadId];
    const savedMemories = await memoryService.store.search(namespace, { limit: 10 });

    assert.ok(savedMemories.length > 0, 'Deve recuperar informações básicas');

    const memoriesText = savedMemories.map((m: any) => m.value.data).join(' ');
    assert.ok(memoriesText.includes('Marcus'), 'Deve incluir nome');
    assert.ok(memoriesText.includes('28'), 'Deve incluir idade');
    assert.ok(
      memoriesText.toLowerCase().includes('jazz') ||
      memoriesText.toLowerCase().includes('blues'),
      'Deve incluir gêneros'
    );
  });

  it('Deve responder perguntas simples sem extrair preferências', async () => {
    const testThreadId = `test-user-${Date.now()}`;
    const config = {
      configurable: { thread_id: testThreadId },
      context: { userId: testThreadId }
    };

    const response = await graph.invoke(
      {
        messages: [new HumanMessage('Qual é sua música favorita?')],
        userId: testThreadId,
      },
      config
    );

    assert.ok(response.messages.length > 0, 'Deve ter resposta');
  });

  it('Deve manter histórico da conversa', async () => {
    const testThreadId = `test-user-${Date.now()}`;
    const config = {
      configurable: { thread_id: testThreadId },
      context: { userId: testThreadId }
    };

    await graph.invoke(
      {
        messages: [new HumanMessage('Oi, sou Taylor e adoro música pop')],
        userId: testThreadId,
      },
      config
    );

    const response2 = await graph.invoke(
      {
        messages: [new HumanMessage('Pode recomendar algo animado?')],
        userId: testThreadId,
      },
      config
    );

    assert.ok(response2.messages.length >= 2, 'Deve ter múltiplas mensagens no histórico');

    const hasUserMessage = response2.messages.some((msg: any) =>
      msg._getType() === 'human' && msg.content.includes('animado')
    );

    assert.ok(hasUserMessage, 'Deve manter histórico da conversa');
  });
});
