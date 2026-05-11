import { z } from 'zod/v3';

export const SummarySchema = z.object({
  name: z.string().optional().describe('Nome do usuário'),
  age: z.number().optional().describe('Idade do usuário'),
  favoriteGenres: z.array(z.string()).optional().describe('Gêneros musicais favoritos mencionados'),
  favoriteBands: z.array(z.string()).optional().describe('Bandas ou artistas favoritos mencionados'),
  keyPreferences: z.string().describe('Sumário conciso das preferências musicais, padrões de humor e hábitos'),
  importantContext: z.string().optional().describe('Qualquer outro contexto importante sobre o usuário'),
});

export type ConversationSummary = z.infer<typeof SummarySchema>;

export const getSummarizationSystemPrompt = () => {
  return JSON.stringify({
    role: 'Sumarizador de conversação para preferências musicais',

    tarefa: 'Analisar conversa e extrair preferências musicais estruturadas',

    campos_para_extrair: {
      name: 'Nome do usuário',
      age: 'Idade do usuário',
      favoriteGenres: 'Todos os gêneros mencionados',
      favoriteBands: 'Todas as bandas/artistas mencionados',
      keyPreferences: 'Sumário de 2-4 frases sobre gostos, padrões de humor e contexto de escuta',
      importantContext: 'Outros detalhes relevantes'
    },

    regras: [
      'Combinar informações duplicadas',
      'Ser específico sobre gêneros e artistas',
      'Incluir associações de humor (ex: "gosta de rock animado ao fazer exercícios")',
      'Se atualizando sumário anterior, preservar info não discutida na nova conversa',
      'Incluir apenas informações explicitamente declaradas'
    ]
  });
};

export const getSummarizationUserPrompt = (
  conversationHistory: Array<{ role: string; content: string }>,
  previousSummary?: ConversationSummary
) => {
  return JSON.stringify({
    conversa: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
    sumario_anterior: previousSummary || 'Nenhum',
    instrucoes: [
      'Atualizar sumário com novas informações desta conversa',
      'Preservar info existente não discutida nas novas mensagens'
    ]
  });
};
