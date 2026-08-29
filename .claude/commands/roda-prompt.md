# Skill: roda-prompt

Executa o system prompt de uma versão do módulo **em subagente de contexto limpo** e grava o output
em `outputs/`, com procedência no cabeçalho.

Os arquivos têm nome declarativo, não `vN.md`: `prompts/requirements-copilot-v1.md`,
`outputs/backlog-estruturado-v1.md`. O sufixo `-v1`/`-v2` é o que a resolução usa.

`$ARGUMENTS` é `NNN v1` ou `NNN v2` (ex.: `001 v1`).

## Por que subagente, e não esta sessão

A entrega da disciplina é a análise das falhas do output. Se o output for produzido por uma sessão
que já leu o `output-*` de referência do professor, ou que já discutiu o que o prompt deveria ter
feito, ele carrega essa informação — e a análise de falhas vira circular. O subagente começa frio:
recebe o system prompt e o input, e nada mais.

Isso vale também entre versões. **O V2 roda em subagente novo**, sem o V1 no contexto: senão ele
tende a "corrigir" o que viu, e a comparação deixa de medir o prompt.

## Passos

### 1. Resolver prompt e inputs

```bash
BASE="disciplinas/07-ferramentas-de-IA-para-gestão-de-projetos/projects"
# `cut`, nunca `awk '{print $1}'`: este command recebe DOIS argumentos, e o
# harness substitui $1/$2 no texto do arquivo antes do shell ver.
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
VER=$(echo "$ARGUMENTS" | cut -d' ' -f2)
PROJECT=$(find "$BASE" -maxdepth 1 -type d -name "$(printf %03d $((10#$NUM)))-*" | head -1)
# Nome declarativo: prompts/<ferramenta>-vN.md. Glob, porque o nome muda por módulo.
PROMPT_FILE=$(find "$PROJECT/prompts" -maxdepth 1 -name "*-$VER.md" | head -1)

echo "PROJECT=$PROJECT  VER=$VER"
[ -n "$PROMPT_FILE" ] || { echo "PARE: não achei prompts/*-$VER.md em $PROJECT"; exit 1; }
echo "PROMPT_FILE=$PROMPT_FILE"
echo "=== inputs ==="; find "$PROJECT/inputs" -maxdepth 1 -type f | sort
echo "=== outputs já existentes (se houver, este é um re-run) ==="
find "$PROJECT/outputs" -maxdepth 1 -type f | sort
```

### 2. Rodar em subagente

Dispare **um** subagente (`Agent`, `subagent_type: "general-purpose"`) com um prompt montado assim:

- O conteúdo integral de `$PROMPT_FILE` como as instruções que ele deve seguir.
- O conteúdo integral dos inputs resolvidos no passo 1 como a mensagem do usuário.
- Estas três restrições, literalmente:
  1. *Não leia nenhum outro arquivo do repositório ou do gabarito.* Em especial, nada que comece
     com `output-` ou `Exemplo -`, e nenhum `ENTREGA.md`.
  2. *Produza o output exatamente no formato que o system prompt define.* Não comente o prompt, não
     avalie a própria resposta, não acrescente conclusões suas.
  3. *Devolva só o output*, sem preâmbulo nem fechamento.

O subagente **grava o corpo** no arquivo de output e devolve só uma confirmação curta. O cabeçalho de
procedência é montado no passo 3, com dados que ele não tem.

### 3. Gravar com procedência

Peça ao subagente que **escreva o corpo direto no arquivo de output** e devolva só uma confirmação
de uma linha. Depois prenda o cabeçalho no topo:

```bash
OUT="$PROJECT/outputs/<artefato>-$VER.md"   # nome do artefato, não "vN"
{ cat <<EOF
---
versao: $VER
prompt: $(basename "$PROMPT_FILE")
input: $(find "$PROJECT/inputs" -maxdepth 1 -type f -exec basename {} \; | paste -sd, -)
modelo: <o modelo em que o subagente rodou>
gerado_em: <data de currentDate>
execucao: subagente de contexto limpo
---

EOF
  cat "$OUT"; } > "$OUT.tmp" && mv "$OUT.tmp" "$OUT"
```

Fazer o subagente gravar é deliberado: estes outputs passam de 10 mil tokens, e trazê-los inteiros
para esta sessão só para reescrevê-los em arquivo é desperdício puro — além de colocar o output no
contexto de quem não deveria julgá-lo.

`temperatura` **não entra no cabeçalho**: o parâmetro foi removido dos modelos Claude atuais
(400 em Opus 5, Sonnet 5, Opus 4.8/4.7, Fable 5). As instruções de `temperatura 0.2/0.3` do material
da disciplina são do AI Studio e não têm equivalente aqui — registrar um valor que não foi aplicado
seria procedência falsa.

### 4. Relatório

Uma tela, no máximo:

- Onde gravou e qual prompt foi usado.
- **Se este é um re-run de uma versão que já existia**, o que mudou em relação ao arquivo anterior.
  Esse é o teste que dá rigor à entrega: sem controle de temperatura, uma diferença entre V1 e V2 só
  conta como efeito do prompt **se ela reproduzir**. Diferença que aparece entre dois runs do *mesmo*
  prompt é ruído de amostragem, e precisa ser tratada como tal no `ENTREGA.md`.
- Nada de análise das falhas. Ela é sua, e é o miolo da entrega.

## O que esta skill deliberadamente NÃO faz

**Não julga o output.** Apontar aqui o que o modelo errou entregaria pronto justamente o exercício
que a atividade pede — e treinaria você a ler o meu veredito em vez do output.

**Não roda V1 e V2 na mesma invocação.** Entre um e outro existe uma etapa humana: identificar a
falha e decidir a alteração. Encadear os dois pularia a etapa que é a disciplina inteira.
