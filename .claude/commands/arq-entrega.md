# Skill: arq-entrega

Completa e confere `entrega/README.md` do módulo **$ARGUMENTS** (disciplina 08): preenche os blocos
`<!-- /arq-entrega -->` com o que saiu da execução, verifica a entrega contra `entrega/checklist.md`,
conserta o que é mecânico e registra no `CASO.md` o que o módulo decidiu. **Idempotente**: rode de
novo sempre que editar a entrega à mão.

`$ARGUMENTS` é o número do módulo.

## A régua, e só ela

| Arquivo | O que define |
|---|---|
| `material/Atividade N - Módulo N.pdf` | o que a missão pede, literalmente |
| `entrega/checklist.md` | os itens verificáveis, extraídos dele |
| `material/Exemplo - Módulo N.pdf` | forma e **teto de tamanho** (2 a 3 páginas) |

Problema que não viola o enunciado, não falta na checklist e não destoa do exemplo **não é
problema**. Não reporte.

**O exemplo é o teto, não o piso.** Entrega mais longa ou mais densa que o exemplo precisa de corte,
não de conteúdo. Nunca sugira aprofundar além do que o exemplo faz.

**O caso é do usuário.** Número do projeto dele (volume, custo, orçamento) é dado do caso: não
peça fonte e não rotule como "premissa". A única exceção é o que o enunciado proíbe explicitamente:
limiar copiado do TrialForge.

## Passos

### 1. Reunir

```bash
DISC="disciplinas/08-arquitetura-de-sistemas-com-IA"
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
P=$(find "$DISC/projects" -maxdepth 1 -type d -name "$(printf %03d $((10#$NUM)))-*" | head -1)
echo "PROJECT=$P"
find "$P" -type f ! -path "*/node_modules/*" ! -path "*/material/*" ! -name ".DS_Store" | sort
echo "=== blocos pendentes ==="
grep -n "<!-- VOCÊ\|<!-- /arq-entrega\|PREENCHER" "$P/entrega/README.md" || echo "(nenhum)"
echo "=== números proibidos (TrialForge / nomic-embed-text) ==="
grep -nE "0[,.]825|0[,.]667|0[,.]643|0[,.]75\b" "$P/entrega/README.md" "$P"/src/*.js 2>/dev/null || echo "(nenhum)"
uvx --with pypdf --quiet python .claude/scripts/extrai-pdf.py \
  "$P/material/Atividade $((10#$NUM)) - Módulo $((10#$NUM)).pdf" \
  "$P/material/Exemplo - Módulo $((10#$NUM)).pdf"
```

Leia também a checklist, a entrega inteira, os `outputs/*.md` que ela cita (ou deveria citar), o
`src/` e o `CASO.md`.

### 2. Preencher os blocos `/arq-entrega`

- **Log de um caso**: cole só as linhas que mostram o caso (entrada → decisão → saída), em bloco
  `text`, e linke o arquivo inteiro: `[outputs/gateway-02.md](../outputs/gateway-02.md)`. O log
  completo mora em `outputs/`. **Linke, não duplique.**
- **Trecho de código**: só as linhas que provam o item da checklist (a função de checagem de
  orçamento, o schema), com `src/arquivo.js:linha` acima. Nunca o arquivo inteiro.
- **Número medido** (similaridade, custo, contagem de escalações): transcreva do output, com o link.
- **Diagrama**: se o usuário descreveu os componentes em texto, converta em Mermaid **sem
  acrescentar** caixa, seta ou componente que ele não citou. Mantenha a descrição dele abaixo.
- Use sempre a execução **mais recente** de cada script, a menos que a entrega já cite outra.

Se o output que um bloco precisa não existe, deixe o bloco e diga qual `/arq-roda` falta.

### 3. Checagem mecânica

Objetiva, e vale sempre:

- **Cobertura**: cada item da checklist tem lugar identificável na entrega. Liste os que faltam,
  nominalmente ("falta timeout do agente Revisor").
- **Transcrição**: cada número e cada linha de log na entrega bate com o output que ela cita. Texto
  de uma execução antiga sob o link de uma nova é o erro mais comum.
- **Coerência entre Passos**: o limite de iterações do Passo 3 é o que está no código; o limiar
  declarado no Passo 2 é o que o `src/` usa; os tiers do Passo 1 são as constantes `MODELO_*`.
- **Aritmética**: custos somados, gasto acumulado contra o limite do tenant, médias.
- **Proibições do enunciado**: limiar do TrialForge (grep do passo 1), exemplo do TrialForge ou da
  central de atendimento do vídeo repetido como caso. Um desses números só é legítimo se aparece
  no output de calibração do próprio módulo: aí é coincidência medida, não cópia.
- **Formatação**: tabela com cabeçalho e corpo de larguras diferentes, crase solta, Mermaid que
  não renderiza.
- **Português**: acentuação, crase, grafia. É convenção inviolável do repo.
- **Tamanho**: visivelmente mais longa que o exemplo → corte o que não corresponde a item da
  checklist.

### 4. Corrigir

**Você conserta, sem perguntar:** formatação, ortografia, transcrição errada, aritmética,
Mermaid quebrado, seção fora da ordem dos Passos, excesso que nenhum item da checklist pede.

**Você não escreve** bloco `<!-- VOCÊ -->`: classificação, justificativa de calibragem, escolha
de padrão, limiar, reflexão. Se estiver vazio, fica vazio e entra no relatório.

### 5. Registrar o estado herdável

Na seção 5 do `CASO.md`, substitua o `—` do módulo por **uma linha** com o que o módulo seguinte
herda, transcrito das decisões do usuário. Exemplos:

- 001: *"componentes: Gateway (regra) · Orquestrador (agente) · Revisor (agente + gate)"*
- 004: *"embedding `<id>`, cache em 0,NN, gate de confiança em 0,NN, intenções A/B/C"*

Só o que foi decidido e está escrito na entrega. Se a decisão ainda é `VOCÊ` vazio, não registre.

### 6. Relatório

Curto, nesta ordem:

1. **O que preenchi e consertei**: uma linha cada.
2. **O que falta para a entrega fechar**: blocos `VOCÊ` vazios e itens da checklist sem lugar,
   nominalmente, e o `/arq-roda` que falta, se faltar.
3. Nada mais. Sem "pontos de atenção" e sem sugestão de aprofundamento.

Se a entrega cobre a checklist inteira, diga isso em uma linha e aponte `/finaliza-projeto NNN`.

## O que esta skill deliberadamente NÃO faz

**Não toma decisão de arquitetura.** Fechar a entrega é diferente de fazê-la.

**Não escala o rigor.** É exercício de aula, e o enunciado é o teto.

**Não commita nem escreve o README do projeto.** Isso é `/finaliza-projeto`, que lê `entrega/` como
fonte e não copia nada de lá.
