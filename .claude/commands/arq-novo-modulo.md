# Skill: arq-novo-modulo

Prepara a pasta do módulo **$ARGUMENTS** da disciplina 08 a partir do gabarito: estrutura, cópia do
material, checklist extraída do enunciado e esqueleto de `entrega/README.md` com o dono de cada
bloco marcado. Termina **antes** de qualquer decisão de arquitetura ou linha de código.

`$ARGUMENTS` é o número do módulo (`1`, `01` ou `001`). O slug vem do nome da pasta no gabarito:
`001` → `modulo-01-fundamentos-ai-first` → `projects/001-fundamentos-ai-first`.

Contexto do fluxo: `disciplinas/08-arquitetura-de-sistemas-com-IA/WORKFLOW.md`.

**As cinco pastas já foram criadas em 05/10/2026**, com material, `entrega/checklist.md` e o esqueleto
de `entrega/README.md`. Numa pasta que já existe, este command **completa o que falta e não
sobrescreve nada**. Cada passo abaixo checa se o artefato existe antes de criá-lo. Na prática, ele
serve para reler a Atividade e fazer o relatório do passo 6 quando você começar o módulo.

## Passos

### 1. Descoberta (script único — leia só o output)

```bash
DISC="disciplinas/08-arquitetura-de-sistemas-com-IA"
BASE="$DISC/projects"
GAB=~/Dev/Projects/Personal/unipds/unipds-gabarito/modulo08-arquitetura-de-sistemas-com-ia
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
MOD=$(find "$GAB" -maxdepth 1 -type d -name "modulo-$(printf %02d $((10#$NUM)))-*" | head -1)
[ -z "$MOD" ] && { echo "PARE: módulo $NUM não encontrado em $GAB"; exit 1; }
SLUG=$(basename "$MOD" | sed -E 's/^modulo-[0-9]+-//')
P="$BASE/$(printf %03d $((10#$NUM)))-$SLUG"
echo "MOD=$MOD"
echo "PROJECT=$P"
[ -d "$P" ] && echo "AVISO: a pasta já existe — não sobrescreva nada sem conferir"
echo "=== CASO.md: blocos PREENCHER restantes ==="
grep -c "PREENCHER" "$DISC/CASO.md"

# find, nunca `ls <glob>`: no zsh um glob sem match aborta o script inteiro.
find "$MOD" -maxdepth 1 -type f ! -name ".DS_Store" | sort | while read -r f; do
  n=$(basename "$f")
  case "$n" in
    Exemplo*)                     tipo="GABARITO  (NÃO ler antes de decidir)" ;;
    Atividade*)                   tipo="ATIVIDADE" ;;
    *-canvas.md|*-selector*.md|*-checklist.md) tipo="CANVAS" ;;
    *Preenchido*)                 tipo="GABARITO  (canvas preenchido)" ;;
    *.js|*.py)                    tipo="REF-CODIGO" ;;
    audit-trail*)                 tipo="REF-LOG" ;;
    package*.json)                tipo="IGNORAR   (deps do Ollama)" ;;
    cheat-sheet-*)                tipo="IGNORAR   (apoio visual, volumoso)" ;;
    *)                            tipo="OUTRO" ;;
  esac
  printf "  %-38s %s\n" "$tipo" "$n"
done
```

Se o `CASO.md` ainda tiver `PREENCHER` nas seções 1 a 3, **siga mesmo assim**. A pasta não depende
do caso, mas avise no relatório: nenhum Passo pode ser decidido sem ele.

### 2. Estrutura e cópia do material

```bash
mkdir -p "$P"/{entrega,outputs,material}
# src/ só a partir do M2 — o M1 não tem código.
[ $((10#$NUM)) -ge 2 ] && mkdir -p "$P/src"

# Enunciado, exemplo, canvases, protótipos e log de referência do professor.
# Fora: package*.json (dependência do Ollama, que não usamos) e cheat-sheets (1,5 MB de apoio visual).
find "$MOD" -maxdepth 1 -type f ! -name ".DS_Store" ! -name "package*.json" ! -name "cheat-sheet-*" \
  -exec cp {} "$P/material/" \;
find "$P" -type f | sort
```

**A herança 004 → 005 não acontece aqui.** Ela acontece no `/arq-implementa 005`, porque as cinco
pastas foram criadas juntas no início da disciplina, antes de o `004` ter código.

Nenhum outro módulo herda arquivo. O M2 não parte do M1, o M3 não parte do M2: o que atravessa
os módulos é o estado em `CASO.md`, seção 5.

### 3. Ler a atividade

O `Read` de PDF não funciona nesta máquina (sem poppler):

```bash
uvx --with pypdf --quiet python .claude/scripts/extrai-pdf.py \
  "$P/material/Atividade $((10#$NUM)) - Módulo $((10#$NUM)).pdf"
```

**Leia só a Atividade.** O `Exemplo` e o `*Preenchido*` resolvem a missão para o TrialForge, e o
enunciado pede para compará-los *"depois de terminar, não antes"*.

### 4. `entrega/checklist.md`: a régua

A 08 não tem rubrica de níveis. A régua é a seção **Entrega** do enunciado mais os requisitos
verificáveis de cada Passo. Transcreva sem parafrasear:

```markdown
# Checklist — Missão #NN

> Extraída de `material/Atividade N - Módulo N.pdf`. Não há níveis de rubrica nesta disciplina.

## Entrega (texto do enunciado)
> <citação literal da seção Entrega>

## Itens verificáveis
| # | Passo | Item | Dono |
|---|---|---|---|
| 1 | Passo 1 | ... | você |
| 2 | Passo 4 | chamada real a uma API de IA generativa | código |
| 3 | Passo 3 | log mostrando o caso "cache hit" | execução |

## Proibições do enunciado
- <ex.: não copiar os limiares do TrialForge (0,825 / 0,667 / 0,643 / 0,75)>
- <ex.: não repetir o exemplo da central de atendimento do vídeo>
```

`Dono` é `você` (decisão de arquitetura), `código` (o que `/arq-implementa` escreve) ou `execução`
(o que `/arq-roda` produz e `/arq-entrega` transcreve). Quebre os Passos em itens pequenos: "para
cada agente: timeout, tentativas, idempotência" são três itens, não um.

### 5. Esqueleto de `entrega/README.md`

Seções com os **nomes e a ordem dos Passos do enunciado**. Cada bloco leva o marcador do dono:

```markdown
# Missão #NN — <título do enunciado>

> Caso: <nome do projeto, de CASO.md>. <o que esta entrega contém, em uma linha>

## Passo 1 — <nome do enunciado>

<!-- VOCÊ: <o que decidir, citando o enunciado> -->

## Passo 4 — <nome do enunciado>

<!-- /arq-entrega: trecho de src/<arquivo>.js que mostra <item> -->
<!-- /arq-entrega: log de outputs/<script>-NN.md, caso "<caso>" -->

## Reflexão final — um sinal de mudança

<!-- VOCÊ: uma frase. <o que o enunciado pede> -->
```

- Onde o enunciado pede tabela, ponha o cabeçalho da tabela (colunas do enunciado) com uma linha
  vazia. É forma, não decisão.
- Onde pede diagrama, deixe `<!-- VOCÊ: ... -->`. O `/arq-entrega` converte a sua descrição em
  Mermaid depois.
- Não pré-preencha nenhum bloco `VOCÊ`, nem com exemplo do TrialForge, nem com "sugestão".

### 6. Relatório

Uma tela, no máximo:

- **O que a missão pede**: os Passos e a Entrega, resumidos.
- **Seus blocos**: lista dos `<!-- VOCÊ -->`, na ordem em que precisam ser decididos (e quais
  bloqueiam o `/arq-implementa`).
- **O que o caso precisa ter** para este módulo (ex.: M3 exige *"múltiplas pessoas ou sistemas
  que precisam concordar sobre o mesmo estado"*), e se o `CASO.md` atual cobre isso. Se não cobrir,
  diga em uma linha. Não invente o que falta.
- **Pré-requisito técnico**: `OPENROUTER_API_KEY` definida (cheque com `[ -n "$OPENROUTER_API_KEY" ]`,
  **nunca imprima o valor**) nos módulos com código.

Depois pare. Próximo: você preenche os blocos `VOCÊ` → `/arq-implementa NNN`.

## O que esta skill deliberadamente NÃO faz

**Não decide nada de arquitetura.** Classificar P1/P2/P3, escolher padrão de orquestração, definir
tiers: é o que a missão exercita.

**Não copia o protótipo do professor para `src/`.** Ele chama Ollama e resolve o TrialForge. O
enunciado do M2 manda *"escrever sua própria versão para o seu caso"*.

**Não decide nada antes da hora.** A estrutura dos cinco módulos pode existir de antemão, mas as
decisões de cada um dependem do anterior via `CASO.md`. Por isso a ordem dos blocos `VOCÊ` continua
sendo 001 → 005.
