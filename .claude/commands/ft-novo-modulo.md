# Skill: ft-novo-modulo

Prepara a pasta do módulo **$ARGUMENTS** da disciplina 09 a partir do gabarito: estrutura, cópia do
material, checklist extraída do enunciado e esqueleto de `entrega/README.md` com o dono de cada
bloco marcado. Termina **antes** de qualquer decisão sobre o caso ou linha de código.

`$ARGUMENTS` é o número do módulo (`1`, `01` ou `001`). O slug vem do nome da pasta no gabarito:
`001` → `modulo-01-decision-framework` → `projects/001-decision-framework`.

Contexto do fluxo: `disciplinas/09-processamento-de-dados-e-fine-tuning-de-modelos/WORKFLOW.md`.
O caso: `CASO.md`, na mesma pasta.

**Um módulo por vez.** Rode este command quando a Missão daquele módulo for começar, não antes. Numa
pasta que já existe, ele completa o que falta e não sobrescreve nada: cada passo checa se o
artefato existe antes de criá-lo.

## Passos

### 1. Descoberta (script único — leia só o output)

```bash
DISC="disciplinas/09-processamento-de-dados-e-fine-tuning-de-modelos"
BASE="$DISC/projects"
GAB=~/Dev/Projects/Personal/unipds/unipds-gabarito/modulo09-processamento-de-dados-e-fine-tuning-de-modelos
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
MOD=$(find "$GAB" -maxdepth 1 -type d -name "modulo-$(printf %02d $((10#$NUM)))-*" | head -1)
[ -z "$MOD" ] && { echo "PARE: módulo $NUM não encontrado em $GAB"; exit 1; }
SLUG=$(basename "$MOD" | sed -E 's/^modulo-[0-9]+-//')
P="$BASE/$(printf %03d $((10#$NUM)))-$SLUG"
echo "MOD=$MOD"
echo "PROJECT=$P"
[ -d "$P" ] && echo "AVISO: a pasta já existe — não sobrescreva nada sem conferir"
[ -f "$DISC/CASO.md" ] && echo "CASO.md: existe" || echo "PARE: CASO.md ausente — o caso não se inventa"
echo "=== Módulos anteriores já feitos ==="
find "$BASE" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sort

# find, nunca `ls <glob>`: no zsh um glob sem match aborta o script, e o `ls` deste shell
# devolve nomes com acento e espaço entre aspas.
find "$MOD" -mindepth 1 -maxdepth 1 ! -name ".DS_Store" | sort | while read -r f; do
  n=$(basename "$f")
  case "$n" in
    Exemplo*)                  tipo="GABARITO  (NÃO ler antes de decidir)" ;;
    Atividade*)                tipo="ATIVIDADE" ;;
    *-tool.js|*.js)            tipo="REF-CODIGO (JS, base a adaptar)" ;;
    *.py)                      tipo="APOIO-PY  (par em Python, só referência)" ;;
    *.ipynb)                   tipo="COLAB     (caminho sem Mac Apple Silicon)" ;;
    *.jsonl|*.json|*.yaml)     tipo="DADO-REF  (Amplitude Seguros, não é o caso)" ;;
    *-companion.md|*.md)       tipo="COMPANION" ;;
    *.html|*.png)              tipo="VISUAL" ;;
    *)                         [ -d "$f" ] && tipo="DIRETÓRIO" || tipo="OUTRO" ;;
  esac
  printf "  %-42s %s\n" "$tipo" "$n"
done
echo "=== Pesos que NÃO entram no git ==="
find "$MOD" -name "*.safetensors" -exec du -h {} \;
```

Sem `CASO.md`, **pare**: as seis Missões pedem caso real, e ele não se inventa.

### 2. Estrutura e cópia do material

```bash
mkdir -p "$P"/{entrega,outputs,material,src}

# Tudo do módulo, inclusive subpastas (mlx-data/, documentos-brutos/), menos os pesos LoRA:
# adapters.safetensors passa de 50 MB num só arquivo. O .gitignore raiz já os ignora; o --exclude
# evita copiar ~90 MB que ninguém vai versionar.
rsync -a --exclude "*.safetensors" --exclude ".DS_Store" "$MOD/" "$P/material/"

git check-ignore -q "$P/material/x.safetensors" && echo "OK: *.safetensors ignorado" \
  || echo "PARE: *.safetensors não está no .gitignore"
du -sh "$P/material"
find "$P" -type f ! -path "*/material/*" | sort
```

**`material/` é referência, não é executável no lugar.** Várias ferramentas do professor importam
a de um módulo anterior por caminho relativo (`../modulo-02-preparacao-datasets/...`), que não
existe dentro de `projects/`. Para rodar a ferramenta original, rode-a do gabarito. Para o caso,
a versão adaptada vive em `src/`, e os imports apontam para o `src/` do projeto anterior.

### 3. Ler a atividade

```bash
for f in "$P"/material/Atividade*.pdf; do pdftotext "$f" - ; done
```

Se `pdftotext` falhar: `uvx --with pypdf --quiet python .claude/scripts/extrai-pdf.py "<pdf>"`.

**Leia só a Atividade.** O `Exemplo` resolve a Missão para a Amplitude Seguros, e o enunciado pede
*"confira com o Exemplo"* depois de fazer, não antes.

### 4. `entrega/checklist.md`: a régua

A 09 não tem rubrica de níveis. A régua é a seção **Entrega** do enunciado mais os requisitos
verificáveis de cada Passo. Transcreva sem parafrasear:

```markdown
# Checklist — Missão #NN

> Extraída de `material/Atividade N - Módulo N.pdf`. Não há níveis de rubrica nesta disciplina.

## Entrega (texto do enunciado)
> <citação literal da seção Entrega>

## Itens verificáveis
| # | Passo | Item | Dono | Saída de custo baixo |
|---|---|---|---|---|
| 1 | Passo 1 | ... | você | — |
| 2 | Passo 4 | código JavaScript rodando contra o caso | código | — |
| 3 | Passo 4 | ao menos um teste automatizado | código | — |
| 4 | Passo 2 | treino LoRA com dois postos | execução | "real ou simulado e documentado" |

## Herança
- <o que o enunciado manda reaproveitar de módulo anterior, com a citação: "Peguem o dataset da
  Missão Prática número dois">

## Proibições do enunciado
- <ex.: "Não use um contexto hipotético">
```

- `Dono` é `você` (decisão sobre o caso), `código` (o que vai para `src/`, incluindo os testes) ou
  `execução` (o que sai de uma rodada e vai para `outputs/`).
- **Saída de custo baixo** só se preenche com citação do enunciado: simular, usar o dataset Dolly,
  entregar por análise, parar na reprovação. Sem citação, `—`. Ela diz o que é aceito, não o que
  será feito: a escolha é sua, no módulo.
- Quebre os Passos em itens pequenos: "parâmetros treináveis, val loss, pico de memória e tamanho do
  checkpoint para cada posto" são quatro itens, não um.

### 5. Esqueleto de `entrega/README.md`

Seções com os **nomes e a ordem dos Passos do enunciado**. Cada bloco leva o marcador do dono:

```markdown
# Missão #NN — <título do enunciado>

> Caso: extrator de despesas do Anotaí (`CASO.md`). <o que esta entrega contém, em uma linha>

## Passo 1 — <nome do enunciado>

<!-- VOCÊ: <o que decidir, citando o enunciado> -->

## Passo 4 — <nome do enunciado>

<!-- CÓDIGO: trecho de src/<arquivo>.js que mostra <item> -->
<!-- EXECUÇÃO: output de outputs/<script>-NN.md, <o que precisa aparecer> -->

## Recomendação final

<!-- VOCÊ: <o que o enunciado pede> -->
```

- Onde o enunciado pede tabela, ponha o cabeçalho (colunas do enunciado) com uma linha vazia. É
  forma, não decisão.
- **Resultado simulado se declara no próprio bloco:** quando a saída de custo baixo for usada, o
  marcador ganha o aviso, por exemplo `<!-- EXECUÇÃO (SIMULADO — declarar na entrega): ... -->`. O
  enunciado exige que o simulado seja documentado como simulado.
- Não pré-preencha nenhum bloco `VOCÊ`, nem com número da Amplitude Seguros, nem com "sugestão".

### 6. Relatório

Uma tela, no máximo:

- **O que a Missão pede**: os Passos e a Entrega, resumidos.
- **Seus blocos**: os `<!-- VOCÊ -->`, na ordem em que precisam ser decididos.
- **O que o caso precisa ter** para este módulo, e se o `CASO.md` cobre. Se não cobrir, uma linha.
  Não invente o que falta.
- **Saídas de custo baixo** que o enunciado autoriza, com a citação.
- **Base de código**: qual ferramenta do professor o enunciado manda adaptar, e o que ela importa de
  módulos anteriores.
- **Herança**: o que vem do módulo anterior e se a pasta dele existe.
- **Pré-requisito técnico**, se houver: conta GCP e `GCP_PROJECT_ID` (M3 real, M6 real), MLX-LM e
  um venv próprio criado com `uv` (M4 local), Colab (M4 sem Apple Silicon). Cheque variável com
  `[ -n "$VAR" ]`, **nunca imprima o valor**.

Depois pare.

## O que este command deliberadamente NÃO faz

**Não decide nada sobre o caso.** As quatro perguntas, os pesos, o schema, os postos, os limiares do
checklist de graduação: é o que a Missão exercita.

**Não copia a ferramenta do professor para `src/`.** Ao contrário da 08, aqui o enunciado manda
adaptá-la, mas a adaptação começa quando os blocos `VOCÊ` que ela consome estiverem decididos.

**Não prepara módulos à frente.** A pasta do `NNN+1` nasce quando a Missão dele começar.
