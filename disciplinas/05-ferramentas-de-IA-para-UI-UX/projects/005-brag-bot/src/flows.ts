import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { v4 as uuidv4 } from 'uuid';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.5-flash'),
});

export const BragInputSchema = z.object({
  definition: z.string().describe('O rascunho informal do usuário descrevendo a realização no trabalho.'),
});

export const BragSchema = z.object({
  title: z.string().describe('Ação principal + Resultado de alto nível.'),
  context: z.string().describe('Situação ou Problema original. O que estava quebrado, lento, o desafio, etc.'),
  actionTaken: z.string().describe('Ação técnica ou estratégica passo a passo tomada para resolver o problema.'),
  businessImpact: z.string().describe('Qual o impacto de negócio. Tempo ganho, redução de falhas, etc.'),
  metrics: z.array(z.string()).describe('Apenas dados estritamente quantificáveis. Ex: "50% reduction", "10ms latency".'),
  technologiesUsed: z.array(z.string()).describe('Ferramentas, linguagens, bibliotecas e plataformas mencionadas ou inferidas.'),
});

export const bragGeneratorFlow = ai.defineFlow(
  {
    name: 'bragGeneratorFlow',
    inputSchema: BragInputSchema,
    outputSchema: BragSchema,
  },
  async (input) => {
    const prompt = `
Persona: Você deve atuar como um "Senior Career Consultant" focado em Planos de Desenvolvimento Individual (IDP) para Engenheiros de Software.
Objetivo: Transformar o rascunho informal do usuário em um "Brag Document" executivo.

Regra 1: Usar tom profissional, objetivo e focado em impacto, sem adjetivos emocionais.
Regra 2: Se não existirem métricas exatas, infira a natureza da métrica baseada na ação tomada de forma plausível (ex: "tempo de execução não especificado mas otimizado").
Regra 3: Siga ESTRITAMENTE o formato do schema JSON fornecido.
Regra 4: O output deve respeitar o idioma original do input.

Aqui está o rascunho informal do usuário:
${input.definition}
    `;

    const { output } = await ai.generate({
      prompt,
      config: {
        temperature: 0.8,
      },
      output: {
        format: 'json',
        schema: BragSchema,
      },
    });

    if (!output) {
      throw new Error('Falha ao gerar o conteúdo: Nenhum output válido foi retornado pela IA.');
    }

    return {
      ...output,
      id: uuidv4(),
    };
  }
);
