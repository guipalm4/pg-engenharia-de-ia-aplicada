# Workflow — Disciplina 09 (Processamento de Dados e Fine-Tuning de Modelos)

Guia de retomada. Se você voltou depois de um tempo, leia daqui.

## Estado atual

> **Início em 14/10/2026.** Nenhum módulo começou e nenhuma pasta de projeto existe ainda.
>
> **Próximo passo: escolher o caso.** O M1 já exige um caso real, e o mesmo caso atravessa os seis
> módulos. Sem ele, nada anda. Branch: `main`.
> _Atualize estas linhas ao terminar cada módulo._

## A lição da 08

A 08 terminou sem nenhuma Missão feita. O conteúdo não era o problema principal; o formato era: um
caso próprio encadeado em cinco módulos, protótipo escrito do zero e toda a infraestrutura (pastas,
checklists, commands) montada antes da primeira prática. Na 09 valem três regras:

1. **Um módulo por vez.** A pasta de um módulo nasce quando a Missão dele começa, não antes.
2. **O código é a ferramenta do professor adaptada, mais testes.** Os enunciados mandam adaptar
   (`decision-framework-tool.js`, `dataset-cleaning-balancing-tool.js`, `local-lora-training-tool.js`,
   `veredito-escala-tool.js`). Nada de reescrever do zero.
3. **Commands só depois de dois módulos feitos à mão.** Se o ciclo se repetir, aí se generalizam os
   `/arq-*` da 08, que têm a mesma mecânica (Missão, Passos, seção *Entrega*, sem rubrica).

## A trilha mínima válida

Cada enunciado traz uma saída de custo baixo e diz que ela vale como entrega completa. É o piso;
subir dele é escolha de cada módulo.

| Módulo | O que a entrega exige | Saída autorizada pelo enunciado |
|---|---|---|
| **M1** Decision framework | 4 perguntas, pesos (AHP ou score direto), NPV simples, ferramenta rodando com o caso | Editar `amplitude-seguros-casos.json` e rodar `decision-framework-tool.js` |
| **M2** Preparação de datasets | gate em 4 fontes (1 rejeitada), schema canônico, 15 exemplos de 3 fontes, dedup + balanceamento, 1 teste | "Simule de forma realista" o dataset e adapte `dataset-cleaning-balancing-tool.js` |
| **M3** Fine-tuning via API | conversão de formato, validação de hiperparâmetro, backoff testado sem rede, ficha com hash SHA-256 | Job simulado, ou Passo 4 por análise do par v1/v2 do Dolly. Sem GCP |
| **M4** LoRA e PEFT | NPV GPU alugada × local, 2 ranks, exemplo difícil, decisão LoRA × full | Treino "real ou simulado e documentado" |
| **M5** Avaliação | teste retido, A/B contra genérico, 3 estresses à mão, checklist de graduação | "Simulem os resultados [...] documentando que são simulados" |
| **M6** Projeto final | arco M1–M6 no caso, 3 decisões no formato Escolha/Alternativa/Por quê/Resultado | Se o caso reprovar no Passo 1, a entrega para ali e está completa |

Os dois pontos onde gastar algo rende mais aprendizado: um job real na Vertex AI (M3 ou M6, poucos
reais por job) e o LoRA local via MLX (M4, sem custo). A máquina é Apple Silicon com 16 GB; o
professor usou 24 GB. LoRA em modelo quantizado deve caber, full fine-tuning provavelmente não. A
decisão é do módulo, não de agora.

## O caso

Os seis enunciados pedem um caso real, não hipotético. Para não repetir a 08, ele precisa de:

- uma tarefa **estreita, com saída estruturada (JSON)**, porque as ferramentas medem schema e
  precisão por campo;
- dado que se junte ou se gere em 15 a 200 exemplos;
- **nada de PII nem de dado do empregador**, porque o repositório é público.

## Decisões travadas

|                       |                                                                              |
| --------------------- | ---------------------------------------------------------------------------- |
| Estrutura             | `projects/NNN-slug`, um por módulo; `001` → `modulo-01-decision-framework` → `001-decision-framework` |
| Linguagem             | JavaScript, a entrega oficial da ementa. O Python do professor é material de apoio |
| Entrega               | `entrega/README.md`, um arquivo; README do projeto permanece canônico        |
| Material do professor | Copiado para `material/` do módulo, sem os `*.safetensors` (já no `.gitignore`) |

## Armadilhas conhecidas

**1. Pesos do M4.** `modulo-04-lora-e-peft/` tem 92 MB, quase tudo `adapters.safetensors`. O
`.gitignore` raiz já os exclui; confira com `git status` depois de copiar.

**2. Nomes com acento e espaço.** Os PDFs são `Atividade N - Módulo N.pdf`. Use glob ou `find`, nunca
`$(ls ...)`: o `ls` deste shell devolve o nome entre aspas, e o comando seguinte não acha o arquivo.

**3. Slug completo nos commands.** `/commit-projeto` e `/finaliza-projeto` acham o projeto com
`find -name "*$ARGUMENTS*" | head -1`. `001` sozinho casa com o `001` de várias disciplinas; passe
`001-decision-framework`.

**4. Não abra o `Exemplo - Módulo N.pdf` antes de decidir.** Ele resolve a Missão para a Amplitude
Seguros.

## Onde mais olhar

- `CLAUDE.md` — convenções do repositório inteiro
- Gabarito do professor:
  `~/Dev/Projects/Personal/unipds/unipds-gabarito/modulo09-processamento-de-dados-e-fine-tuning-de-modelos/`
  (o `README.md` dele explica custos, variáveis de ambiente e o caminho 100% local)
