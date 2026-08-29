# Skill: entrega-modulo

Escreve a entrega do módulo **$ARGUMENTS** em `entrega/<nível>/` — o relato da iteração de prompt
que a atividade pede, mais os artefatos próprios do módulo. Não escreve o README do projeto
(isso é `/finaliza-projeto`).

`$ARGUMENTS` é `NNN`, opcionalmente seguido do nível (`001 avancado`). Sem nível, usa
**intermediário**, o alvo padrão da trilha.

## Uma pasta por nível, autocontida

Cada nível de rubrica é um pacote submetível independente: `entrega/basico/`, `entrega/intermediario/`,
`entrega/avancado/`. **Só existe a pasta do nível que você realmente atacou** — não scaffoldar vazias.

Subir de nível depois **não edita a pasta anterior**: cria a nova, completa. Uma entrega Avançada
refeita meses depois com um interlocutor real reescreve a análise, não a complementa, e ver as duas
lado a lado é o ponto. É a mesma convenção das pastas `NNN` da disciplina 06.

`entrega/rubrica.md` fica fora dos níveis — é a mesma para os três.

## Por que existe um arquivo separado do README

A atividade de todos os dez módulos pede a mesma coisa: *"Não quero ver o output da IA, quero ver o
que você aprendeu com ele."* A entrega é output V1 → falhas identificadas → alteração no prompt →
comparação V1×V2.

Isso é exatamente o que `shared/templates/README_TEMPLATE.md` proíbe: relato de execução, crítica ao
material da aula, comparação entre rodadas, números medidos. Os dois documentos não são
redundantes — são opostos, e cada um está certo no seu lugar:

| | `README.md` do projeto | `entrega/<nível>/README.md` |
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
diff "$(find "$PROJECT/prompts" -name "*-v1.md")" "$(find "$PROJECT/prompts" -name "*-v2.md")"
```

Leia os dois arquivos de `outputs/` inteiros. Leia a atividade em PDF (recipe em
`/novo-modulo`, passo 3) para não escrever contra uma lembrança do enunciado.

**Só agora** o `Exemplo - Módulo N.pdf` e os `output-*` em `material/` podem ser abertos, e apenas
se você quiser usá-los como termo de comparação. Eles não são a régua: a atividade pede a *sua*
análise, não convergência com o gabarito.

### 2. Escrever a entrega

Leia `entrega/rubrica.md` e escreva **para o nível pedido**. No Intermediário, a diferença para o
Básico é que a análise é *causal* — qual dado específico causou a mudança e o que isso implica — não
descritiva ("o ranking mudou").

`entrega/<nível>/README.md` é a porta de entrada. Os demais artefatos que a *Entrega Esperada* do
módulo pedir ficam ao lado, como arquivos próprios — três relatórios no M7, `dangerfile.js` no M8,
o print e a tabela no M9, o inventário das dez ferramentas no M10. Não embuta código nem tabela longa
dentro do README quando ela pode ser um arquivo.

Estrutura do `README.md`:

```
# Missão #NN — <título do módulo>  ·  nível <básico|intermediário|avançado>

> Uma linha: o que foi exercitado e sobre qual insumo.

## Configuração
Modelo, execução em subagente isolado, prompt e insumo, data. Uma tabela curta.

## Artefatos desta entrega
Uma linha por arquivo da pasta, dizendo o que é. Só se houver mais de um.

## Execução V1
Link para o arquivo em `outputs/`. Não cole o output inteiro aqui.

## Falhas identificadas
Pelo menos duas, cada uma com: o que o modelo produziu, por que está errado, e a
**causa provável no prompt** (instrução ausente, ambígua, ou que induziu o erro).

## Alteração no prompt
O diff entre os dois prompts, e o raciocínio que levou à mudança.

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

Não escreva o README do projeto, não commite, não atualize o índice. `/finaliza-projeto $ARGUMENTS`
faz os três, e ele lê `entrega/` como uma das fontes — mas **não copia nada de lá** para o README.

## O que esta skill deliberadamente NÃO faz

**Não gera as falhas identificadas.** Elas nascem de você ler o output e reparar em algo — uma
especificação que o stakeholder não deu, uma ambiguidade sinalizada onde estava claro, um risco que
um dev sênior veria e o modelo não. É o item que a rubrica avalia; produzi-lo por script entregaria
texto genérico no lugar do que tem valor.

**Não decide a alteração do prompt.** A V2 é a sua hipótese sobre a causa da falha. Se eu a
escrevesse, a comparação V1×V2 mediria a minha hipótese, não a sua.
