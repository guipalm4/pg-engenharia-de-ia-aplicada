# Skill: arq-implementa

Escreve o protótipo JavaScript do módulo **$ARGUMENTS** (disciplina 08) em `src/`, **a partir das
decisões que já estão em `entrega/README.md`**. Não roda o protótipo: quem roda é o `/arq-roda`.

`$ARGUMENTS` é o número do módulo (`2`…`5`). O M1 não tem código.

## A regra: o código materializa decisões, não as toma

Calibragem dos componentes, schema da ferramenta, limite de iterações, padrão por dependência,
contrato de eventos, intenções e rotas, tiers, regra fixa de erro caro: tudo isso é bloco
`<!-- VOCÊ -->` da entrega. Se um bloco que o código precisa está vazio, **pare e liste quais**.
Não escolha um valor "razoável" para destravar: um protótipo com a decisão inventada faz a entrega
mostrar a minha arquitetura com a assinatura do usuário.

O que **é** seu decidir: nomes de variáveis, estrutura de arquivos, tratamento de erro de rede,
formato do log.

## Passos

### 1. Reunir

```bash
BASE="disciplinas/08-arquitetura-de-sistemas-com-IA/projects"
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
P=$(find "$BASE" -maxdepth 1 -type d -name "$(printf %03d $((10#$NUM)))-*" | head -1)
[ -n "$P" ] || { echo "PARE: rode /arq-novo-modulo $NUM antes"; exit 1; }
echo "PROJECT=$P"
echo "=== blocos VOCÊ ainda vazios ==="
grep -n "<!-- VOCÊ" "$P/entrega/README.md" || echo "(nenhum)"
echo "=== src atual ==="; find "$P/src" -type f ! -path "*/node_modules/*" | sort
echo "=== referência do professor ==="; find "$P/material" -name "*.js" | sort
[ -n "$OPENROUTER_API_KEY" ] && echo "OPENROUTER_API_KEY: definida" || echo "OPENROUTER_API_KEY: AUSENTE"
```

**Herança 004 → 005.** O enunciado do M5 diz *"estender o Gateway do Módulo 4"*. Na primeira vez
que este command roda no 005, com `src/` ainda vazio, copie o código do 004:

```bash
if [ $((10#$NUM)) -eq 5 ] && [ ! -f "$P/src/package.json" ]; then
  PREV=$(find "$BASE" -maxdepth 1 -type d -name "004-*" | head -1)
  [ -f "$PREV/src/package.json" ] || { echo "PARE: o 005 estende o src/ do 004, que ainda não existe"; exit 1; }
  rsync -a --exclude node_modules "$PREV/src/" "$P/src/"
  echo "src/ herdado de $PREV"
fi
```

Leia `entrega/checklist.md` (itens com dono `código`), `entrega/README.md` inteiro e
`disciplinas/08-arquitetura-de-sistemas-com-IA/CASO.md`. Leia o protótipo `.js` de referência em
`material/` **para estrutura**: como ele separa as etapas, loga e grava a trilha. Não é para copiar.

Os blocos `VOCÊ` que o código não consome (reflexão final, orçamento de trade-off do M1) podem
estar vazios. Os que ele consome, não.

### 2. Convenções do código

- **Node 24, CommonJS, `'use strict'`**, como os protótipos do professor. `package.json` com
  `"type": "commonjs"`, um script `start` e **nenhuma dependência**.
- **OpenRouter via `fetch` nativo**, isolado em `src/openrouter.js` com duas funções:
  - `chat({ modelo, mensagens, tools })` → `POST https://openrouter.ai/api/v1/chat/completions`
  - `embed({ modelo, textos })` → `POST https://openrouter.ai/api/v1/embeddings`

  As duas devolvem `{ ..., usage }`, e `usage.cost` (US$) vem em toda resposta. Timeout com
  `AbortSignal.timeout()`, e retry só em erro de rede ou 429/5xx.
- **Chave**: `process.env.OPENROUTER_API_KEY`. Se faltar, aborte com uma mensagem clara. Nunca
  logue a chave, nem em debug.
- **Modelos em constantes no topo** (`const MODELO_BARATO = '...'`), com os IDs do OpenRouter que a
  entrega decidiu. O `/arq-roda` lê essas constantes para o cabeçalho de procedência.
- **Log legível no stdout**, prefixado por componente (`[Gateway]`, `[Router]`, `[Cache]`,
  `[Approval Gate]`, `[Agente:<nome>]`), no registro dos protótipos do professor.
- **Custo**: acumule `usage.cost` e termine a execução com a linha exata
  `[Custo] total: US$ <valor>`. O `/arq-roda` extrai essa linha.
- **Trilha de auditoria** (M4, M5): JSONL em `process.env.AUDIT_TRAIL ||
  path.join(__dirname, '..', 'outputs', 'audit-trail.jsonl')`. Campos que o enunciado exige (M5:
  tier usado, se escalou, gasto acumulado, limite do tenant).
- **Aprovação humana pelo stdin** (Approval Gate): sem TTY, leia o stdin inteiro com
  `fs.readFileSync(0, 'utf-8')` **antes do primeiro `await`** e consuma as respostas em ordem. Com
  TTY, um único `readline.Interface`. É o bug que o professor documentou no protótipo do M4: um
  `readline` recriado a cada pergunta perde respostas vindas de pipe.
- **Casos de demonstração**: o `main` roda em sequência os casos que a entrega pede (M4: miss, hit,
  gate por síntese, gate por confiança; M5: tier 1 resolve, escala, bloqueio por orçamento), com as
  perguntas **do caso do usuário**, que vêm da entrega.
- **Calibração** (M4, M5) é um script separado, `src/calibra-limiar.js`: embeda os pares que a
  entrega lista, imprime a similaridade (ou o sinal de confiança) de cada par numa tabela e não
  escolhe o limiar. Quem escolhe é o usuário, olhando o número.
- Comentários em PT-BR, na densidade dos protótipos do professor: explicam o *porquê* arquitetural
  ("orçamento verificado antes da chamada: depois, o dinheiro já foi gasto").

### 3. Especificidades por módulo

| M | Exigência do enunciado que o código precisa provar |
|---|---|
| 2 | chamada real ao modelo · loop com o critério de parada declarado (limite + o que acontece ao atingir) · a ferramenta chamada com o schema declarado, com `enum` onde a entrega pôs enum |
| 3 | fila com `EventEmitter` entre ≥2 agentes · cada evento com o contrato declarado (nome, dado, emissor, ouvinte) · timeout, tentativas e compensação como a tabela da entrega diz |
| 4 | RAG no padrão escolhido · roteamento por intenção · model router · cache semântico com o limiar calibrado · Approval Gate por síntese obrigatória **e** por confiança baixa |
| 5 | cascata de tiers com o limiar de escalação calibrado · `tenant` em toda requisição · orçamento checado **antes** da chamada · regra fixa, fora da cascata, para erro caro e irreversível |

No M3, o enunciado não exige LLM. Se a entrega não pede que os agentes chamem modelo, **não
chame**: é custo sem motivo, e o que se avalia é a comunicação assíncrona.

No M5, o `src/` veio do M4. Estenda, não reescreva: o diff 004 → 005 precisa mostrar só a cascata e
o orçamento.

### 4. Verificar sem gastar crédito

```bash
cd "$P/src" && node --check *.js && echo "sintaxe ok"
```

Não execute contra a API aqui. A primeira execução de verdade é o `/arq-roda`, que grava a
procedência.

### 5. Relatório

- Arquivos criados ou alterados em `src/`.
- **Mapa decisão → código**: uma linha por bloco `VOCÊ` consumido, com `arquivo:linha`.
- Scripts disponíveis para o `/arq-roda` (ex.: `gateway`, `calibra-limiar`) e o `stdin=` que cada
  um espera, se tiver Approval Gate.
- Se a chave está ausente: o que falta, sem o valor.

## O que esta skill deliberadamente NÃO faz

**Não decide arquitetura para destravar o código.** Bloco vazio para a skill.

**Não escolhe o limiar.** O script de calibração mede, e o usuário escolhe olhando a tabela. O
enunciado pede *"o valor efetivamente encontrado"*, e um limiar escolhido por mim seria um número
sem evidência.

**Não escreve a versão Python.** A entrega oficial é JavaScript. O Python do professor é referência.
