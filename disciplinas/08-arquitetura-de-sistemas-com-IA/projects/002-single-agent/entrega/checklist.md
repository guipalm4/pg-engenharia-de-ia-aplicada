# Checklist — Missão #02

> Extraída de `material/Atividade 2 - Módulo 2.pdf`. Não há níveis de rubrica nesta disciplina.

## Entrega (texto do enunciado)

> Um único arquivo (ou um repositório com esses itens em arquivos separados) contendo: o diagrama do
> protótipo com os quatro componentes calibrados e justificados, o schema completo da ferramenta
> escolhida, o critério de parada documentado (ou a justificativa de por que o loop não é
> necessário), e o código funcional em JavaScript do Passo 4.

## Itens verificáveis

| # | Passo | Item | Dono |
|---|---|---|---|
| 1 | Passo 1 | tarefa real, hoje manual ou já com IA generativa | você |
| 2 | Passo 1 | Memória: nenhuma / curto / longo prazo, com justificativa | você |
| 3 | Passo 1 | Loop (ReAct): múltiplas voltas ou uma chamada, com justificativa | você |
| 4 | Passo 1 | Reflexão: checagem de superfície ou comparação com fonte externa, com justificativa | você |
| 5 | Passo 1 | Ferramentas externas que o agente chama | você |
| 6 | Passo 2 | schema da ferramenta mais crítica: nome | você |
| 7 | Passo 2 | descrição específica (domínio, quando chamar) | você |
| 8 | Passo 2 | parâmetros tipados, com `enum` onde o valor é de conjunto fixo | você |
| 9 | Passo 2 | formato do retorno | você |
| 10 | Passo 2 | leitura ou escrita? Se escrita, passa pelo Approval Gate? | você |
| 11 | Passo 3 | limite máximo de iterações (ou por que o loop não é necessário) | você |
| 12 | Passo 3 | o que acontece ao atingir o limite sem convergir | você |
| 13 | Passo 4 | código JavaScript com ≥1 chamada real a uma API de IA generativa | código |
| 14 | Passo 4 | loop implementado conforme o critério de parada do Passo 3 | código |
| 15 | Passo 4 | a ferramenta do Passo 2 chamada com o schema definido | código |
| 16 | Passo 4 | execução gravada mostrando o funcionamento | execução |

## Proibições do enunciado

- Contexto hipotético: escolher a tarefa mais recente ou mais relevante do trabalho atual (aqui, do
  projeto em `CASO.md`).
- Copiar `react-agent-prototype.js`: ele é referência de estrutura; *"escreva sua própria versão
  para o seu caso"*.
- Válido: concluir que a tarefa não precisa de agente e uma regra determinística resolve.
