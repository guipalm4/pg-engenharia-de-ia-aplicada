# Skill: novo-modulo

Prepara a pasta do módulo **$ARGUMENTS** da disciplina 07 a partir do módulo correspondente no
gabarito: cria a estrutura, registra as referências ao material do professor e lê a atividade.

Termina **antes** de executar qualquer prompt — quem roda é `/roda-prompt`.

`$ARGUMENTS` é o nome completo da pasta, no formato `NNN-slug` (ex.: `001-planejamento-e-escopo`).
O número do projeto é o número do módulo: `NNN` → `modulo-NN-*` no gabarito, 1:1 nos dez módulos.

## Contexto: por que este comando é diferente do `/nova-aula-aiops`

Na disciplina 06 cada aula herdava o código da anterior, e o command fazia `cp -R`. **Aqui não há
herança de arquivo.** Cada módulo tem system prompt e input próprios; o que se acumula entre eles é
o *estado do case RouteWise* (o backlog do M1 vira entrada do M2, que vira entrada do M3…). Nunca
copie a pasta anterior.

O material do módulo é **copiado** para dentro da pasta: `prompts/v1.md` é o system prompt do
professor sem alteração, e `inputs/` traz os dados que a atividade manda usar. É conteúdo didático
num repositório de estudos — a pasta fica autocontida e reproduzível, que é o que importa aqui.

## Passos

### 1. Descoberta (script único — leia só o output)

```bash
BASE="disciplinas/07-ferramentas-de-IA-para-gestão-de-projetos/projects"
GAB=$(find ~/Dev/Projects/Personal -maxdepth 4 -type d -name "unipds-gabarito" 2>/dev/null | head -1)/modulo07-ferramentas-de-ia-para-gestao-de-projetos
NUM=$(echo "$ARGUMENTS" | grep -oE '^[0-9]+')
MOD=$(find "$GAB" -maxdepth 1 -type d -name "modulo-$(printf %02d $((10#$NUM)))-*" | head -1)

echo "PROJECT=$BASE/$ARGUMENTS"
echo "MOD=$MOD"
[ -z "$MOD" ] && echo "PARE: módulo $NUM não encontrado no gabarito" && exit 1
[ -d "$BASE/$ARGUMENTS" ] && echo "AVISO: a pasta já existe — não sobrescreva nada sem conferir"

# find, nunca `ls <glob>`: no zsh um glob sem match aborta o script inteiro.
find "$MOD" -maxdepth 1 -type f | sort | while read -r f; do
  n=$(basename "$f")
  case "$n" in
    *-prompt.md|*-system-prompt.md) tipo="PROMPT    (base do V1)" ;;
    output-*)                       tipo="REF       (NAO ler antes do V1)" ;;
    Exemplo*)                       tipo="GABARITO  (NAO ler antes do V1)" ;;
    Atividade*)                     tipo="ATIVIDADE" ;;
    transcricao-*|*-input.md|*.csv|*.wav) tipo="INPUT" ;;
    jira-estado-board.md)           tipo="BOARD" ;;
    *.js|*.py|*.json)               tipo="CODIGO" ;;
    *)                              tipo="GUIA" ;;
  esac
  printf "  %-32s %s\n" "$tipo" "$n"
done
```

### 2. Estrutura e cópia do material

```bash
P="$BASE/$ARGUMENTS"
mkdir -p "$P"/{prompts,inputs,outputs}

# V1 é o prompt do professor sem alteração — copie-o como prompts/v1.md.
# Cópia byte a byte, sem cabeçalho injetado: este arquivo é executado como está,
# e qualquer linha acrescentada vira instrução para o modelo.
cp "$MOD/<nome>-prompt.md" "$P/prompts/v1.md"

# Os inputs que a atividade manda usar, com o nome original.
cp "$MOD/<input>" "$P/inputs/"

find "$P" -type f | sort
```

Os nomes saem do passo 1 — não invente. **Copie só o que a atividade consome**: o system prompt e os
inputs que ela cita. Fora disso, use o julgamento — um `.wav` de 3 MB que só existe como fonte da
transcrição não precisa entrar, e um CSV que só vira import de Jira num módulo posterior entra
quando aquele módulo chegar.

**Não copie o `Exemplo - Módulo N.pdf` nem os `output-*`.** Não é questão de redistribuição: é que
tê-los na pasta convida a olhar antes da hora, e a análise de falhas do V1 é o núcleo da entrega.

### 3. Ler a atividade (é ela que define a entrega)

O `poppler` não está instalado nesta máquina, então `pdftotext` e o `Read` de PDF não funcionam.
Extraia com `pypdf` via `uvx`:

```bash
cat > /tmp/extract-pdf.py <<'PY'
import sys
from pypdf import PdfReader
for i, p in enumerate(PdfReader(sys.argv[1]).pages, 1):
    print(f"\n----- pág {i} -----\n{p.extract_text()}")
PY
uvx --with pypdf --quiet python /tmp/extract-pdf.py "$MOD/Atividade - Módulo $((10#$NUM)).pdf"
```

**Não abra o `Exemplo - Módulo N.pdf` nem os `output-*`.** São o gabarito resolvido; lê-los agora
contamina a sua análise de falhas do V1, que é o núcleo da entrega. Eles entram depois, no
`/entrega-modulo`, como termo de comparação — e só se você quiser.

### 4. Relatório e entrega

Reporte, em no máximo uma tela:

- **O que a atividade pede** — as partes numeradas e a *Entrega Esperada*, resumidas.
- **O que o nível Intermediário exige além do Básico** (é o alvo padrão da trilha).
- **Que ferramenta externa o módulo toca**, se alguma — e o estado em que o board do Jira precisa
  estar, lendo `jira-estado-board.md`. Se não tocar nenhuma, diga isso em uma linha.
- **O que ficou faltando**, se algum artefato esperado não existir no gabarito.

Depois pare. A ordem a partir daqui é: `/roda-prompt NNN v1` → você analisa as falhas →
`/entrega-modulo NNN` → `/finaliza-projeto NNN`.

## O que esta skill deliberadamente NÃO faz

**Não executa o prompt.** Executar aqui seria rodar no mesmo contexto que acabou de listar (e
talvez ler) os outputs de referência do professor. O `/roda-prompt` existe para isolar isso num subagente
de contexto limpo.

**Não escreve o `prompts/v2.md`.** A V2 é consequência das falhas que *você* identificou no V1.
Um script que a gerasse estaria inventando o achado que dá valor à entrega.

**Não prepara vários módulos de uma vez.** O case RouteWise é encadeado: o artefato que você
curou no M2 é a entrada do M3. Preparar o M5 hoje congelaria uma entrada que ainda não existe.
