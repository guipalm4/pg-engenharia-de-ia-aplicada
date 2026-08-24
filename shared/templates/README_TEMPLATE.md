# Nome do Projeto

> Uma frase: o que este projeto demonstra e com qual tecnologia principal.

<!--
PROPÓSITO DESTE TEMPLATE

Os READMEs deste repositório servem a três leitores diferentes, e só um deles
chega pela pasta do projeto:

  1. TIMELINE   — quem quer ver a evolução dos estudos. Chega pelo README raiz.
                  A narrativa "o que mudou desde a aula anterior" é DELE, e mora
                  no índice da disciplina. Não repita aqui.
  2. REPRODUÇÃO — quem clonou e quer rodar, inclusive você daqui a dois anos.
                  Precisa de comandos, pré-requisitos, saída esperada e a
                  fronteira entre o que é real e o que é simulado.
  3. CONSULTA   — quem voltou com uma dúvida específica ("como eu fiz X?").
                  Precisa do mecanismo e do achado, não do histórico.

REGRA QUE RESOLVE A MAIORIA DAS DÚVIDAS: separe o achado (durável) do número
que o produziu (perecível). O achado vai no texto; o número vai no bloco
`Medição`, datado e versionado. Este repo já perdeu três modelos de LLM do
catálogo do provedor — conteúdo perecível sem data envelhece invisivelmente.

Seções marcadas OPCIONAL podem ser omitidas quando não se aplicam. As demais
são obrigatórias. Nunca deixe uma seção com placeholder por preencher: ou
preencha, ou remova.
-->

## Contexto

- Disciplina: [Nome da disciplina]
- Período: [Mês/Ano]
- Autor: [Seu nome]

## Descrição

2–4 parágrafos, escritos **para quem abriu esta pasta sem ter lido as outras**:
o que o projeto faz, qual problema resolve e quais conceitos aborda.

Não abra comparando com o projeto anterior. Se a trilha for incremental, o que
o leitor precisa é da seção `Herança` abaixo — uma classificação, não uma
narrativa. A evolução entre as aulas é assunto do índice da disciplina, onde
ela é contada uma vez em vez de sete.

## Herança

> OPCIONAL — só em trilhas incrementais, onde `NNN` parte do código de `NNN-1`.

Duas linhas, sem narrativa:

- **Esta aula acrescenta:** `<agente/tool/arquivo novo>` · `<...>`
- **Vem de `NNN-1` sem alteração:** todo o resto, incluindo `<o que existe mas
  não é usado neste pipeline>`.

O objetivo é único: permitir que o leitor saiba quais poucos arquivos são a
aula, entre os muitos que são bagagem.

## Tecnologias e Ferramentas

- [ ] Runtime e versão
- [ ] Bibliotecas principais
- [ ] Serviços externos

Marque explicitamente o que é **usado de verdade** e o que entra apenas como
formato, mock ou alvo simulado — a distinção completa vai em `Real vs. simulado`.

## Pré-requisitos

> OPCIONAL — só se houver setup além do padrão (chave de API, cluster, binário
> externo, flag de navegador).

## Como executar

```bash
# comandos, a partir da raiz do repositório
```

## Saída esperada

O que aparece quando funciona — o suficiente para alguém decidir se o run foi
bem-sucedido sem ter que perguntar.

Diga também **o que não é determinístico**. Projetos com LLM não produzem a
mesma saída duas vezes; declare o que é estável (o pipeline conclui, os testes
passam, tal decisão é sempre tomada) e o que varia (o texto, a ordem, o
fraseado). Um exemplo "reprodutível" cuja saída muda a cada execução precisa
dizer isso em voz alta.

## Real vs. simulado

> OBRIGATÓRIO sempre que houver qualquer simulação, stub ou fixture.

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| | | |

É a seção que mais protege quem copia código daqui. Um pipeline que termina sem
erro porque a parte perigosa é fingida parece funcionar tão bem quanto um que
realmente funciona.

## Estrutura do Projeto

> OPCIONAL — só se houver mais de 2–3 arquivos.

```
# árvore comentada, comentando o que é relevante para ESTA aula
```

## Como funciona

> OBRIGATÓRIO se a lógica não for evidente pela leitura do entrypoint.

Pseudocódigo ou diagrama textual do caminho de execução.

## Conceitos trabalhados

- [ ] **Conceito** — como aparece concretamente no código

## Aprendizados

- [ ] O achado, e o que ele revela sobre a técnica.

Escreva de forma que sobreviva à troca de modelo, de versão de biblioteca e de
provedor: o número que sustenta o achado pertence a `Medição`, não a este
parágrafo. Prefira o que foi observado ao que se supõe — e diga como observou.

## O que faria diferente

> RECOMENDADO.

O que o exercício deixou na mesa e como você atacaria hoje. É o que transforma
uma crítica em proposta, e o que o "você do futuro" mais agradece.

## Medição

> OBRIGATÓRIO quando há custo de execução (tokens, tempo, chamadas a API).

**Medido em DD/MM/AAAA** · `python X.Y.Z` · `<lib> X.Y.Z` · `<modelo>`

| Métrica | Valor |
|---|---|
| | |

Datar e versionar não é burocracia: é o que permite, daqui a dois anos,
distinguir "isto mudou" de "isto nunca foi assim".

## Documento Original

> OPCIONAL — só se existir `README.original.md`.

> Conteúdo original do README (scaffold ou material do professor) preservado em
> [`README.original.md`](./README.original.md).

## Referências

- [ ] Links, artigos, papers, vídeos
