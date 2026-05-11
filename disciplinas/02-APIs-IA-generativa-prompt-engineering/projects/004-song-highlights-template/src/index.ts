import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { HumanMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';

function parseArgs(): { userId?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');

  if (userIndex !== -1 && args[userIndex + 1]) {
    return { userId: args[userIndex + 1] };
  }

  return {};
}

async function main(): Promise<void> {
  const readline = createInterface({ input: stdin, output: stdout });

  try {
    console.log('═'.repeat(60));
    console.log('  🎵 Recomendador de Músicas com Memória (LangGraph)');
    console.log('═'.repeat(60));
    console.log('\nDigite suas mensagens abaixo. Digite "exit" para sair.\n');

    const { graph, memoryService } = await buildGraph();

    const { userId } = parseArgs();
    const threadId = userId ? `user-${userId}` : `user-${Date.now()}`;
    const config = {
      configurable: { thread_id: threadId },
      context: { userId: threadId }
    };

    if (userId) {
      console.log(`👤 Usuário: ${userId}`);
    }
    console.log(`📝 ID da Sessão: ${threadId}\n`);

    const namespace = ['memories', threadId];
    let userContext: string | undefined;

    if (memoryService.store) {
      const existingMemories = await memoryService.store.search(namespace, { limit: 10 });
      if (existingMemories?.length > 0) {
        userContext = existingMemories.map((m: any) => m.value.data).join('\n');
        console.log(`📚 Informações do usuário carregadas:\n${userContext}\n`);
      }
    }

    try {
      const initialMessage = userContext
        ? 'Inicie a conversa de forma casual mencionando o que você sabe sobre mim e recomende uma música!'
        : 'Olá! Me apresente de forma amigável e pergunte sobre meu nome e preferências musicais.';

      const result = await graph.invoke(
        {
          messages: [new HumanMessage(initialMessage)],
          userContext,
          userId: threadId,
        },
        config
      );

      const greeting = result.messages[result.messages.length - 1];
      console.log(`AI: ${greeting.content}\n`);
    } catch (error) {
      console.error('❌ Erro ao iniciar conversa:', (error as Error).message);
    }

    while (true) {
      const userInput = await readline.question('Você: ');

      if (!userInput.trim()) continue;
      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 Até mais!\n');
        break;
      }

      try {
        const result = await graph.invoke(
          {
            messages: [new HumanMessage(userInput)],
            userId: threadId,
          },
          config
        );

        const lastMessage = result.messages[result.messages.length - 1];
        console.log(`\nAI: ${lastMessage.content}\n`);

      } catch (error) {
        console.error('\n❌ Erro ao gerar resposta:', error instanceof Error ? error.message : 'Erro desconhecido');
        console.log('AI: Desculpe, encontrei um erro. Pode tentar novamente?\n');
      }
    }

    readline.close();

  } catch (error) {
    console.error('\n❌ Erro fatal:', (error as Error).message);
    console.error('\nStack trace:', (error as Error).stack);
    process.exit(1);
  }
}

main();
