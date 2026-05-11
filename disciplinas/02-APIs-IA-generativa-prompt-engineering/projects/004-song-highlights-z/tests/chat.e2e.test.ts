import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from '../src/graph/factory.ts';
import { unlinkSync, existsSync } from 'node:fs';

describe('Chat de Recomendação Musical - Testes E2E', () => {
  let graph: any;
  let preferencesService: any;
  const testDbPath = './test-preferences.db';

  before(async () => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    const built = await buildGraph(testDbPath);
    graph = built.graph;
    preferencesService = built.preferencesService;
  });

  after(async () => {
    await preferencesService.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  // it('Deve extrair e salvar preferências do usuário', async () => {
  //   const userId = 'test-alex';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   const response = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Oi! Meu nome é Alex e eu amo rock e metal')],
  //       userId,
  //     },
  //     config
  //   );

  //   assert.ok(response.messages.length > 0, 'Deve ter mensagens de resposta');

  //   const lastMessage = response.messages.at(-1);
  //   assert.equal(lastMessage._getType(), 'ai', 'Última mensagem deve ser da IA');

  //   const content = lastMessage.content.toLowerCase();
  //   assert.ok(
  //     content.includes('alex') || content.includes('rock') || content.includes('metal'),
  //     'Resposta deve reconhecer as preferências'
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Preferências devem estar salvas');
  //   assert.ok(savedPreferences.name?.toLowerCase().includes('alex'), 'Nome deve estar salvo');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) => g.toLowerCase().includes('rock') || g.toLowerCase().includes('metal')),
  //     'Gêneros devem estar salvos'
  //   );
  // });

  // it('Deve manter múltiplas trocas e fazer sumarização', async () => {
  //   const userId = 'test-sarah';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Oi! Sou a Sarah e adoro indie e eletrônica')],
  //       userId,
  //     },
  //     config
  //   );

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Gosto especialmente de Tame Impala e Daft Punk')],
  //       userId,
  //     },
  //     config
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Memórias devem existir');
  //   assert.ok(savedPreferences.name?.toLowerCase().includes('sarah'), 'Nome deve estar salvo');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('indie') || g.toLowerCase().includes('eletrônica') || g.toLowerCase().includes('electronic')
  //     ),
  //     'Gêneros devem estar salvos'
  //   );
  // });

  // it('Deve recuperar contexto em nova sessão', async () => {
  //   const userId = 'test-marcus';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Meu nome é Marcus, tenho 28 anos e adoro jazz e blues')],
  //       userId,
  //     },
  //     config
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Deve recuperar informações básicas');
  //   assert.ok(savedPreferences.name?.includes('Marcus'), 'Deve incluir nome');
  //   assert.ok(savedPreferences.age === 28, 'Deve incluir idade');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('jazz') || g.toLowerCase().includes('blues')
  //     ),
  //     'Deve incluir gêneros'
  //   );
  // });

  // it('Deve responder perguntas simples sem extrair preferências', async () => {
  //   const userId = 'test-anonymous';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   const response = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Qual é sua música favorita?')],
  //       userId,
  //     },
  //     config
  //   );

  //   assert.ok(response.messages.length > 0, 'Deve ter resposta');
  // });

  // it('Deve manter histórico da conversa', async () => {
  //   const userId = 'test-taylor';
  //   const threadId = `${userId}-${Date.now()}`;
  //   const config = {
  //     configurable: { thread_id: threadId },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Oi, sou Taylor e adoro música pop')],
  //       userId,
  //     },
  //     config
  //   );

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Pode recomendar algo animado?')],
  //       userId,
  //     },
  //     config
  //   );

  //   assert.ok(response2.messages.length >= 2, 'Deve ter múltiplas mensagens no histórico');

  //   const hasUserMessage = response2.messages.some((msg: any) =>
  //     msg._getType() === 'human' && msg.content.includes('animado')
  //   );

  //   assert.ok(hasUserMessage, 'Deve manter histórico da conversa');
  // });

  // it('Deve compartilhar preferências entre múltiplas threads do mesmo usuário', async () => {
  //   const userId = 'test-multi-thread-user';

  //   // Primeira thread - usuário fornece preferências
  //   const thread1Id = `${userId}-thread1-${Date.now()}`;
  //   const config1 = {
  //     configurable: { thread_id: thread1Id },
  //     context: { userId }
  //   };

  //   await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Oi! Meu nome é Jordan e adoro reggae e ska')],
  //       userId,
  //     },
  //     config1
  //   );

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   // Segunda thread - mesmo usuário, nova conversa
  //   const thread2Id = `${userId}-thread2-${Date.now() + 1}`;
  //   const config2 = {
  //     configurable: { thread_id: thread2Id },
  //     context: { userId }
  //   };

  //   const response2 = await graph.invoke(
  //     {
  //       messages: [new HumanMessage('Me recomende algo para relaxar')],
  //       userId,
  //     },
  //     config2
  //   );

  //   // Verificar que as preferências foram compartilhadas
  //   const savedPreferences = await preferencesService.getSummary(userId);

  //   assert.ok(savedPreferences, 'Preferências devem existir');
  //   assert.ok(savedPreferences.name?.toLowerCase().includes('jordan'), 'Nome deve estar salvo');
  //   assert.ok(
  //     savedPreferences.favoriteGenres?.some((g: string) =>
  //       g.toLowerCase().includes('reggae') || g.toLowerCase().includes('ska')
  //     ),
  //     'Gêneros devem estar salvos e compartilhados entre threads'
  //   );

  //   // Verificar que a thread 2 tem acesso ao contexto da thread 1
  //   const lastMessage = response2.messages.at(-1);
  //   const content = String(lastMessage?.content || '').toLowerCase();

  //   // A IA deve saber o nome do usuário mesmo em uma thread diferente
  //   assert.ok(
  //     content.includes('jordan') || content.includes('reggae') || content.includes('ska'),
  //     'A segunda thread deve ter acesso às preferências da primeira'
  //   );
  // });



  it('Deve manter histórico da conversa', async () => {
    const userId = 'test-taylor';
    const threadId = `${userId}-${Date.now()}`;
    const config = {
      configurable: { thread_id: threadId },
      context: { userId }
    };

    await graph.invoke(
      {
        messages: [
          new HumanMessage('Oi, sou Taylor e adoro música pop'),
          new HumanMessage('Sou o Erick!'),
          new HumanMessage('30 anos'),
          new HumanMessage('Gosto de Guitarra'),
          new HumanMessage('Pode recomendar algo animado?'),
          new HumanMessage('Pode recomendar algo animado?'),
          new HumanMessage('Pode recomendar algo animado?'),
        ],
        userId,
      },
      config
    );

  });

});
