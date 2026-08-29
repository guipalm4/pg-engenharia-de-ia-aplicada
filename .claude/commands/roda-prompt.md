# Skill: roda-prompt

Executa o system prompt de uma versão do módulo **em subagente de contexto limpo** e grava o output
em `outputs/vN.md`, com procedência no cabeçalho.

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
GAB_ROOT=$(find ~/Dev/Projects/Personal -maxdepth 4 -type d -name "unipds-gabarito" 2>/dev/null | head -1)/modulo07-ferramentas-de-ia-para-gestao-de-projetos
NUM=$(echo "$ARGUMENTS" | awk '{print $1}' | grep -oE '^[0-9]+')
VER=$(echo "$ARGUMENTS" | awk '{print $2}')
PROJECT=$(find "$BASE" -maxdepth 1 -type d -name "$(printf %03d $((10#$NUM)))-*" | head -1)

echo "PROJECT=$PROJECT  VER=$VER"

# Resolve a fonte do prompt: .ref aponta para o gabarito, .md é seu.
resolver() {  # resolver <base-sem-extensao> -> imprime o caminho real
  if   [ -f "$1.md" ];  then echo "$1.md"
  elif [ -f "$1.ref" ]; then echo "$GAB_ROOT/$(grep '^path:' "$1.ref" | cut -d' ' -f2-)"
  fi
}
PROMPT_FILE=$(resolver "$PROJECT/prompts/$VER")
[ -z "$PROMPT_FILE" ] && echo "PARE: não achei prompts/$VER.md nem prompts/$VER.ref" && exit 1
echo "PROMPT_FILE=$PROMPT_FILE"

# Confere o sha256 quando a fonte é referenciada — o gabarito recebe atualizações.
if [ -f "$PROJECT/prompts/$VER.ref" ]; then
  ESPERADO=$(grep '^sha256:' "$PROJECT/prompts/$VER.ref" | cut -d' ' -f2)
  ATUAL=$(shasum -a 256 "$PROMPT_FILE" | cut -d' ' -f1)
  [ "$ESPERADO" = "$ATUAL" ] && echo "sha256 confere" \
    || echo "AVISO: o prompt no gabarito MUDOU desde que a .ref foi criada ($ESPERADO -> $ATUAL)"
fi

echo "=== inputs deste módulo ==="
find "$PROJECT/inputs" -maxdepth 1 -type f 2>/dev/null | sort
```

Se o `sha256` divergir, **pare e me diga** antes de rodar: um V1 gerado sobre um prompt diferente
do registrado invalida a comparação com o V2.

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

O subagente **não deve escrever o arquivo** — ele devolve o texto e você grava. Assim o cabeçalho de
procedência é montado aqui, com dados que o subagente não tem.

### 3. Gravar com procedência

```bash
cat > "$PROJECT/outputs/$VER.md" <<EOF
---
versao: $VER
prompt: $(basename "$PROMPT_FILE")
prompt_sha256: $(shasum -a 256 "$PROMPT_FILE" | cut -d' ' -f1 | cut -c1-12)
modelo: <o modelo em que o subagente rodou>
gerado_em: <data de currentDate>
execucao: subagente de contexto limpo
---

<output integral do subagente>
EOF
```

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
