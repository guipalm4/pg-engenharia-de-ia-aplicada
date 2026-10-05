# Workflow — Disciplina 08 (Arquitetura de Sistemas com IA)

Guia de retomada. Se você voltou depois de um tempo, leia daqui.

## Estado atual

> **Fase de aulas (desde 05/10/2026).** As cinco pastas estão prontas, com material,
> `entrega/checklist.md` e o esqueleto da entrega. Nenhuma Missão começou: as aulas vêm primeiro e
> as atividades entram conforme sobrar tempo.
>
> **Para começar a primeira Missão:** preencher [`CASO.md`](./CASO.md) (seções 1 a 3), colocar
> `OPENROUTER_API_KEY` em `~/.config/zsh/secrets.zsh` (só a partir do M2) e abrir
> `projects/001-fundamentos-ai-first/entrega/README.md`. Branch: `main`.
> _Atualize estas linhas ao terminar cada módulo._

### Enquanto só acompanha as aulas

Cada pasta tem em `material/` os canvases e os protótipos que aparecem nos vídeos daquele módulo.
O nome dos canvases diz a aula: o cabeçalho traz *"Artefato de Demo - Módulo N.M"*. Os protótipos do
professor rodam com Ollama (instruções no topo de cada `.js`). Rodá-los é opcional e não faz parte
da entrega.

## O que muda em relação à 07

O professor é o mesmo (Ahirton Lopes) e o material tem a mesma forma: Atividade + Exemplo por
módulo, com um case fictício nas demos. A mecânica da entrega é outra:

| | 07 | 08 |
|---|---|---|
| Artefato | system prompt | decisões de arquitetura + protótipo JS |
| Caso | RouteWise, do gabarito | **o seu**: um projeto pessoal real ([`CASO.md`](./CASO.md)) |
| Entrega | relato V1 → falhas → V2, por nível de rubrica | **um arquivo** com os itens de cada Passo |
| Rubrica | três níveis | **não existe**. A régua é a seção *Entrega* do enunciado |
| Execução | subagente de contexto limpo | `node` local, com log e trilha de auditoria gravados |
| Herança | documental | documental em `CASO.md` + **código do 004 para o 005** |

Não há subagente isolado aqui: o que se executa é código, e código não fica contaminado por quem o
roda. O isolamento que importava na 07 era o de *julgar* o output, e na 08 ninguém julga output.
A entrega é a decisão de arquitetura.

## O ciclo de um módulo

Você decide, eu implemento:

```
1. /arq-novo-modulo NNN        → eu: releio a Atividade e listo seus blocos (a pasta já existe)
2. VOCÊ preenche os blocos <!-- VOCÊ --> de entrega/README.md  (as decisões de arquitetura)
3. /arq-implementa NNN         → eu: escrevo src/ a partir das SUAS decisões       (M2–M5)
4. /arq-roda NNN [script]      → eu: rodo e gravo outputs/<script>-NN.md           (M2–M5)
5. /arq-entrega NNN            → eu: preencho logs e trechos de código, confiro a checklist
6. /finaliza-projeto NNN       → eu: README + índice raiz + commits
```

O `/arq-entrega` é idempotente: rode-o de novo sempre que editar a entrega à mão.

### Quem escreve o quê em `entrega/README.md`

O esqueleto marca cada bloco com o dono:

- `<!-- VOCÊ: ... -->`: decisão de arquitetura. Classificação P1/P2/P3, calibragem dos componentes,
  schema da ferramenta, padrão por dependência, tiers, pares de calibração, reflexão final. É o que a
  missão exercita. O `/arq-implementa` **se recusa a rodar** com esses blocos vazios nos Passos que
  ele implementa.
- `<!-- /arq-entrega: ... -->`: o que sai da execução. Trecho do log de cada caso pedido, trecho do
  código que prova um item ("orçamento verificado ANTES da chamada"), números medidos.

## Anatomia de uma pasta de módulo

```
disciplinas/08-.../projects/NNN-slug/
├── README.md          consulta daqui a um ano · segue o template canônico
├── entrega/
│   ├── checklist.md   itens da Entrega e dos Passos, extraídos do enunciado (a régua)
│   └── README.md      a Missão resolvida: o "único arquivo" que o enunciado pede
├── src/               protótipo JS (M2–M5) · package.json sem dependências · fetch nativo
├── outputs/           <script>-NN.md (log com procedência) · <script>-NN.audit-trail.jsonl
└── material/          Atividade + Exemplo + canvases + protótipos de referência do professor
```

`NNN` é o número do módulo: `001` → `modulo-01-fundamentos-ai-first`, 1:1. O slug vem do nome da
pasta no gabarito.

**`material/` tem código do professor, que chama Ollama.** É referência de estrutura, não base
para copiar: o enunciado do M2 diz *"escreva sua própria versão para o seu caso"*. O código do
projeto vive em `src/` e chama o OpenRouter.

**Não abra `material/Exemplo - Módulo N.pdf` antes de decidir.** Ele resolve a missão para o
TrialForge. O próprio enunciado pede para comparar *"depois de terminar, não antes"*.

## Armadilhas conhecidas

**1. Limiar copiado do TrialForge.** Os enunciados do M4 e do M5 proíbem usar `0,825 / 0,667 /
0,643 / limiar 0,75`: esses números são do `nomic-embed-text` em português. Com outro modelo de
embedding a escala muda. O `/arq-entrega` acusa qualquer um desses números na entrega.

**2. Aprovação humana pelo stdin.** Os protótipos com Approval Gate perguntam `Aprovar? (s/n)`.
O `/arq-roda` passa as respostas por pipe (`stdin=s,n`), e o código segue o padrão do professor: sem
TTY, lê o stdin inteiro de uma vez antes do primeiro `await`, senão o `readline` fecha no meio.

**3. `*.log` está no `.gitignore`.** Por isso os logs de execução são `.md`, com o texto em bloco
de código. Um `.log` gerado não entra no commit, e ninguém avisa.

**4. `$1` e `$2` não funcionam dentro de um slash command.** Mesma armadilha da 07: o harness
substitui os tokens antes do shell. Use `cut -d' ' -f1`.

**5. OpenRouter cobra.** Cada execução gasta crédito, e o log registra o custo total. Calibração de
embeddings custa quase nada. Loop ReAct sem limite de iterações é o que pode sair caro, e o Passo 3
do M2 existe exatamente por isso.

## Decisões travadas (não re-decidir)

|                       |                                                                              |
| --------------------- | ---------------------------------------------------------------------------- |
| Estrutura             | 5 pastas `NNN-slug` em `projects/`, uma por módulo                           |
| Caso                  | Projeto pessoal real, único nos 5 módulos, em `CASO.md`                      |
| Engine                | OpenRouter (chat + embeddings), `fetch` nativo, chave em `OPENROUTER_API_KEY` |
| Linguagem             | JavaScript (a oficial da ementa). O Python do professor é só referência     |
| Entrega               | `entrega/README.md`, um arquivo; README do projeto permanece canônico        |
| Herança de código     | Só `004 → 005`: o enunciado do M5 estende o Gateway do M4                    |
| Material do professor | Copiado para `material/`, porque é conteúdo didático                         |

## Os cinco módulos

| #   | Módulo                    | Entrega                                                             | Código?                       |
| --- | ------------------------- | ------------------------------------------------------------------- | ----------------------------- |
| 001 | Fundamentos AI-First      | diagrama de referência · tabela P1/P2/P3 · orçamento de trade-off · sinal de mudança | —      |
| 002 | Single-Agent              | calibragem dos 4 componentes · schema de ferramenta · critério de parada · código | agente ReAct   |
| 003 | Multi-Agent               | padrão por dependência · falha e compensação · contrato de eventos · sinal de mudança | fila `EventEmitter` |
| 004 | Padrões AI-Específicos    | blueprint (RAG, rotas, router, cache, gate) · limiar calibrado · log dos 4 casos | Gateway       |
| 005 | Arquitetura Enterprise    | tiers · limiar de escalação · orçamento por tenant · log dos 3 comportamentos · reflexão | Gateway + cascata |

A trilha é encadeada pelo caso: o diagrama do M1 dá os componentes que o M2 transforma em agente, o
M3 divide, o M4 põe atrás de um Gateway e o M5 escala. **Prepare um módulo por vez.**

## Onde mais olhar

- `CASO.md` (nesta pasta) — o caso e o estado acumulado
- `CLAUDE.md` — convenções do repositório inteiro
- `shared/templates/README_TEMPLATE.md` — a fonte única do padrão de README
- Gabarito do professor: `~/Dev/Projects/Personal/unipds/unipds-gabarito/modulo08-arquitetura-de-sistemas-com-ia/`
