# Avaliação do exercício — Missões da 08 com o caso Anotaí

Exercício feito na branch `exercicio/08-anotai`, com as cinco Missões resolvidas pela skill local de
delegação e pelos commands `/arq-*`, sobre o caso definido em [`CASO.md`](./CASO.md). Serve para
comparar com a solução própria, julgar a aderência do caso e testar os commands.

## 1. Aderência do caso, por módulo

| Módulo | O que a Missão exige do caso | O Anotaí tem? | Evidência no PRD | Como foi contornado |
|---|---|---|---|---|
| 001 | Processo real com parte repetitiva e parte ambígua; uma tarefa híbrida; ao menos um erro caro e irreversível (P2) | sim | §7, §10 (fronteira IA × código), RN-23 | P2 = Sim só nas operações (pagar fatura etc.), apoiado no fato de o PRD não descrever como desfazê-las. É inferência, não regra escrita |
| 002 | Tarefa real que um agente único com ferramentas resolve | sim | §10 Agente de consulta, RN-32 (6 chamadas, só leitura) | Base de despesas **sintética**: o Anotaí não tem dado real e só o spike F-0 existe, sem rodada real. O PRD §14 admite base sintética na eval |
| 003 | Várias pessoas ou sistemas concordando sobre o mesmo estado; ≥2 agentes | parcial | RN-14, RN-23; §5 e §9 proíbem agente que grava | Os "agentes" são componentes do pipeline (Recepção, Extrator, Orquestrador, agente de consulta) mais o dono. Três deles são código, há uma pessoa só, e o Extrator foi simulado sem LLM, o que o enunciado permite |
| 004 | Perguntas repetidas com palavras diferentes; padrão de RAG; roteamento por intenção para modelos baratos e caros; gate por confiança | parcial | §7 Consultar pelo bot; §9 (≈20 perguntas abertas/mês); §10 contrato; RN-2, RN-30 | Cache só da **interpretação** da consulta fixa (a resposta muda a cada lançamento); a intenção sai da mesma chamada do extrator, então o Model Router é por tipo de entrada; o RAG agêntico é o agente do M2, não exercitado no Gateway; a confiança é categórica (união modelo ∪ código), sem score. Os pares de calibração foram escritos por mim, não tirados de perguntas registradas |
| 005 | Dois tiers com custo; tenant em toda requisição; orçamento por tenant; regra fixa para erro caro | parcial | §9 (teto R$ 20, fatias 70/15/15); §3 e §5 (usuário único); RN-23 | Tenant = `user_id`, que só tem um valor na v1; o tenant `convidado` vem do cenário de assinatura do PRD §1, não da v1. Cotação US$/R$ arbitrada (o PRD a deixa como configuração). O PRD não prevê cascata por requisição: o plano B troca a configuração inteira pela eval. Escalar não resolveu a ambiguidade, que só o dono resolve |

Veredito: o Anotaí sustenta M1 e M2 de verdade. M3 a M5 são resolvidos sem inventar dado, mas forçam
o caso para formatos que ele não tem (multiagente, perguntas repetidas em volume, multi-tenant). O
que esses módulos produziram de mais útil foram as conclusões negativas: cache que só acerta
paráfrase quase literal, Model Router que não pode usar a intenção, Tier 2 que não resolve
ambiguidade.

## 2. Problemas nos commands e na skill

| Arquivo:linha (ou passo) | O que aconteceu de fato | Correção sugerida |
|---|---|---|
| Skill local de delegação, passo "O caso não se inventa" (`grep -n "PREENCHER" CASO.md`) | Com as seções 1 a 3 preenchidas, o grep ainda casa com `CASO.md:10`, o próprio aviso ("Enquanto houver `<!-- PREENCHER -->`..."). Seguida à letra, a skill nunca passa dessa checagem | Procurar `<!-- PREENCHER` só entre `## 1.` e `## 4.` (`sed -n '/^## 1\./,/^## 4\./p' \| grep -c '<!-- PREENCHER'`), ou tirar a palavra do aviso |
| `.claude/commands/arq-novo-modulo.md:34` | `grep -c "PREENCHER"` conta 1 depois do caso preenchido, pelo mesmo motivo | Mesma correção |
| `.claude/commands/arq-entrega.md:41` | `grep ... "$P"/src/*.js 2>/dev/null \|\| echo` aborta o bloco inteiro no zsh quando não há `src/` (M1): "no matches found", e a extração dos PDFs da linha 42 não roda. O `2>/dev/null` não evita, e o próprio `arq-novo-modulo.md:36` alerta para isso | `find "$P" -path '*/src/*.js' -exec grep -nE ... {} +`, ou checar `[ -d "$P/src" ]` antes |
| `.claude/commands/arq-entrega.md:41` (números proibidos) | Acusou 0,667 no M5, que é 2 de 3 checagens medido pela calibração do próprio módulo. Qualquer pontuação em frações de 3 cai nesse grep | Manter o grep, mas cruzar cada achado com `outputs/calibra-*.md` e só reportar o que não aparece lá, que é a exceção que o `arq-entrega.md:76` já admite |
| Skill local de delegação, passo 2 × `WORKFLOW.md:89` | A skill manda ler o Exemplo "só para forma" **antes** de decidir; o WORKFLOW e o enunciado mandam abrir só **depois**. Segui a skill, e o Exemplo foi lido antes das decisões | Ler o Exemplo só no passo 4 (corte de tamanho), ou extrair só os títulos e a contagem de palavras dele |
| Skill local de delegação, passo 4 ("Tamanho") e `arq-entrega.md:81` | "Visivelmente mais longa" não tem medida. As cinco entregas ficaram com 1,3 a 1,8 vez as palavras do Exemplo (863/489, 780/536, 1064/723, 1097/591, 988/781), em parte por Mermaid e trechos de log que o Exemplo não tem | Medir: `pdftotext Exemplo \| wc -w` contra `wc -w entrega/README.md`, com um teto explícito (ex.: 1,2×) |
| `.claude/commands/arq-roda.md:34` | Exige `OPENROUTER_API_KEY` também no M3, cujo código não chama modelo nenhum | Exigir a chave só se `src/` tiver `const MODELO_` |
| `.claude/commands/arq-roda.md:55` e `:71-72` | A procedência lista **todas** as constantes `MODELO_*` de `src/*.js`, não as que o script usou (`calibra-escalacao-01.md` lista o modelo de foto e o de embedding, que ele não chama), e grava `engine: OpenRouter` mesmo sem chamada (M3, corrigido à mão em `fila-01.md`) | O script imprimir os modelos que usa numa linha `[Config]`, e o cabeçalho ler essa linha; sem ela, `engine: —` |
| `.claude/commands/arq-roda.md:71` e `:77` | O heredoc do passo 2 tem `<constantes MODELO_*...>` e `<data de currentDate>` literais: não roda como está, e quem executa precisa substituir à mão | Calcular no shell: `MODELOS=$(...)` e `$(date +%F)` |
| `.claude/commands/arq-roda.md:108-109` e skill local de delegação, passo 3 ("ajuste a pergunta de teste") | No M4, o gate por confiança baixa não apareceu com duas frases ambíguas porque o **sinal** escolhido (autoavaliação do modelo) não funcionava, não por causa da frase. As regras só permitem trocar a frase, o que vira pescaria num modelo não determinístico: a mesma frase deu `null` numa execução e `"total"` na outra | Depois de duas frases sem o caso, voltar à decisão do sinal (bloco VOCÊ) e registrar a mudança na entrega, como foi feito |
| `.claude/commands/arq-implementa.md:95` × enunciado do M4 × `CLAUDE.md:89` | A tabela exige "RAG no padrão escolhido" no código do M4. O enunciado só pede os 4 casos no log, e meu RAG é o agente do M2, cujo código o `CLAUDE.md` não deixa herdar. Resultado: rota sem implementação | Exigir RAG no código só se ele estiver no caminho de algum dos 4 casos |
| `.claude/commands/arq-implementa.md:59-64` × `CLAUDE.md:89` | A convenção pede `src/openrouter.js` igual em todo módulo, o que obriga a copiar o cliente do 002 para o 004, contra "herança só 004 → 005" | Declarar o cliente como boilerplate permitido, ou mantê-lo num diretório compartilhado |
| Esqueleto original de `005/entrega/README.md:25` e `arq-implementa.md:83` | Supõem um `calibra-limiar.js` por módulo, mas o 005 herda o do 004 (cache) e precisa de uma segunda calibração (escalação). Criei `calibra-escalacao.js`, e o esqueleto apontava para o arquivo errado | No 005, nomear `calibra-escalacao` no esqueleto e na convenção |
| `.claude/scripts/extrai-pdf.py:3` e `arq-novo-modulo.md:79` | Afirmam que o poppler não está instalado; `pdftotext` existe em `/opt/homebrew/bin`. O script funciona, então é só texto desatualizado | Atualizar o texto ou trocar por `pdftotext` |
| Modelo original de `CASO.md:44` (seção 3) | Pede o orçamento em US$, mas o caso real está em R$ e o PRD não fixa cotação. No M5 isso obrigou a arbitrar a cotação | Aceitar a moeda do caso e pedir a cotação junto, se o código precisar |

## 3. Decisões tomadas no lugar do usuário (revisar primeiro)

- **CASO.md §2**: o processo escolhido é "lançar e consultar despesas pelo bot", com três das cinco exigências marcadas como parciais.
- **M1**: a tarefa híbrida é pagar fatura por voz, e o P2 = Sim se apoia na falta de um fluxo de desfazer no PRD.
- **M2**: agente de consulta com uma só ferramenta (`total_gasto`), memória só dentro da pergunta (o PRD não declara memória) e `google/gemini-3.5-flash-lite`.
- **M3**: os timeouts arbitrados (Recepção 1 s, Orquestrador 5 s). A idempotência do Confirmar depende de a pendência fechar na mesma transação, e o PRD não dá chave única ao PagamentoFatura.
- **M4**: cache só da interpretação de consulta fixa, com limiar 0,93 (medido, com grupos sobrepostos); Model Router por tipo de entrada; confiança baixa como união do modelo com uma regex dos padrões da RN-2, que é regra minha e pode marcar como ambíguas falas que o dono considera claras.
- **M5**: o sinal de escalação é a fração das checagens da RN-30 calculada pelo código, com limiar 0,85; Tier 2 `google/gemini-3.8-flash`; cotação de R$ 5,50; tenant `convidado` hipotético; limite de 85% do teto; operação fora da cascata, sem passar pelo Tier 2.
- **M2, M4 e M5**: a base de despesas e os valores de fatura são sintéticos.

## 4. Custo das execuções

Soma das linhas `[Custo]` de todos os `outputs/*.md`: **US$ 0,013566**, em 9 execuções.

| Módulo | Execuções | Custo (US$) |
|---|---|---|
| 001 | 0 (sem código) | 0 |
| 002 | 1 (`agente-consulta-01`) | 0,000353 |
| 003 | 1 (`fila-01`, sem chamada de modelo) | 0 |
| 004 | 4 (`calibra-limiar-01`; `gateway-01` a `-03`, porque o gate por confiança não apareceu nas duas primeiras) | 0,002452 |
| 005 | 3 (`calibra-escalacao-01`; `gateway-01` e `-02`, porque a primeira mostrou o custo do Tier 2 4× acima da estimativa da checagem de orçamento) | 0,010761 |
