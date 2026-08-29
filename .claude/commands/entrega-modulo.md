# Skill: entrega-modulo

Escreve o `ENTREGA.md` do módulo **$ARGUMENTS** — o relato da iteração de prompt que a atividade
pede. Não escreve o README (isso é `/finaliza-projeto`).

`$ARGUMENTS` é `NNN` ou o nome completo da pasta.

## Por que existe um arquivo separado do README

A atividade de todos os dez módulos pede a mesma coisa: *"Não quero ver o output da IA, quero ver o
que você aprendeu com ele."* A entrega é output V1 → falhas identificadas → alteração no prompt →
comparação V1×V2.

Isso é exatamente o que `shared/templates/README_TEMPLATE.md` proíbe: relato de execução, crítica ao
material da aula, comparação entre rodadas, números medidos. Os dois documentos não são
redundantes — são opostos, e cada um está certo no seu lugar:

| | `README.md` | `ENTREGA.md` |
|---|---|---|
| Para quem | você daqui a um ano | o professor, agora |
| Voz | expositiva, apresenta | analítica, julga |
| Prazo de validade | longo | o ciclo da disciplina |
| Rodar o prompt entra? | não | é o assunto |

Se algo não couber em nenhum dos dois, o lugar é o chat.

## Passos

### 1. Reunir o material

```bash
BASE="disciplinas/07-ferramentas-de-IA-para-gestão-de-projetos/projects"
PROJECT=$(find "$BASE" -maxdepth 1 -type d -name "*$ARGUMENTS*" | head -1)
echo "PROJECT=$PROJECT"
find "$PROJECT" -type f ! -name ".DS_Store" | sort
echo "=== diff dos prompts (o que você mudou) ==="
diff "$PROJECT/prompts/v1.md" "$PROJECT/prompts/v2.md"
```

Leia `outputs/v1.md` e `outputs/v2.md` inteiros. Leia a atividade em PDF (recipe em
`/novo-modulo`, passo 3) para não escrever contra uma lembrança do enunciado.

**Só agora** o `Exemplo - Módulo N.pdf` e os `output-*` do gabarito podem ser abertos, e apenas se
você quiser usá-los como termo de comparação. Eles não são a régua: a atividade pede a *sua*
análise, não convergência com o gabarito.

### 2. Escrever o `ENTREGA.md`

Alvo de rubrica: **Intermediário**. A diferença para o Básico é que a análise é *causal* — qual dado
específico causou a mudança e o que isso implica — não descritiva ("o ranking mudou").

Estrutura:

```
# Missão #NN — <título do módulo>

> Uma linha: o que foi exercitado e sobre qual insumo.

## Configuração
Modelo, execução em subagente isolado, prompt e insumo, data. Uma tabela curta.

## Execução V1
Link para `outputs/v1.md`. Não cole o output inteiro aqui.

## Falhas identificadas
Pelo menos duas, cada uma com: o que o modelo produziu, por que está errado, e a
**causa provável no prompt** (instrução ausente, ambígua, ou que induziu o erro).

## Alteração no prompt
O diff entre `prompts/v1.md` e `prompts/v2.md`, e o raciocínio que levou à mudança.

## Comparação V1 × V2
O que mudou no output, e **atribuição**: cada diferença é efeito do prompt ou ruído de
amostragem? Diferença que não reproduz entre dois runs do mesmo prompt é ruído — diga
isso explicitamente quando for o caso, em vez de creditar ao prompt.

## <Seção específica da atividade>
Cada módulo pede algo próprio: plano de resolução por Flag (M2), decisão de prazo (M4),
frequência de monitoramento (M5), comparação de tempo manual vs. IA (M6). Leia a
*Entrega Esperada* do PDF e use os nomes de lá.

## Anti-padrão observado
O nível Intermediário quase sempre pede identificar uma armadilha da própria execução.
Uma, concreta, da sua rodada — não da lista teórica do slide.
```

Regras de escrita:

- **Não invente falha.** Se o V1 saiu bom em algum eixo, diga. Uma entrega que fabrica dois
  problemas para bater a rubrica é pior que uma que relata um problema real e um eixo em que o
  modelo acertou.
- **Sem elogio ao modelo nem ao material.** É relato técnico.
- **Números com procedência.** Se citar tempo, contagem ou percentual, diga de onde veio. Estimativa
  declarada como estimativa vale; número sem origem, não.
- **Português correto, com acentuação.**

### 3. Parar

Não escreva o README, não commite, não atualize o índice. `/finaliza-projeto $ARGUMENTS` faz os
três, e ele lê o `ENTREGA.md` como uma das fontes — mas **não copia nada dele** para o README.

## O que esta skill deliberadamente NÃO faz

**Não gera as falhas identificadas.** Elas nascem de você ler o output e reparar em algo — uma
especificação que o stakeholder não deu, uma ambiguidade sinalizada onde estava claro, um risco que
um dev sênior veria e o modelo não. É o item que a rubrica avalia; produzi-lo por script entregaria
texto genérico no lugar do que tem valor.

**Não decide a alteração do prompt.** A V2 é a sua hipótese sobre a causa da falha. Se eu a
escrevesse, a comparação V1×V2 mediria a minha hipótese, não a sua.
