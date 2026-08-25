# Nome do Projeto

> Breve descrição do projeto e seu objetivo principal.

> A frase diz **o que o projeto é e com que tecnologia** — não o que ele deixa de
> fazer, nem a conclusão de quem o executou.

## Contexto

- Disciplina: [Nome da disciplina]
- Período: [Mês/Ano]
- Autor: [Seu nome]

## Descrição

O que o projeto faz, que problema resolve e quais conceitos aborda — escrito para
quem abriu **esta** pasta sem ter lido as outras.

Em trilhas incrementais (`NNN` parte do código de `NNN-1`), diga em **uma linha** o
que esta aula acrescenta. A narrativa da evolução entre as aulas fica no índice da
disciplina, onde é contada uma vez em vez de uma por pasta.

> Voz: expositiva. A seção apresenta o projeto a quem chegou agora. Não argumenta
> com o leitor sobre o que o exemplo deixou de fazer, não relata a execução de quem
> escreveu o README e não narra correções feitas no caminho.
>
> O que é simulado (mock, stub, fixture, binário que não roda) se declara em
> `Tecnologias e Ferramentas`, no próprio item — *"**Trivy** — apenas o formato do
> relatório; o binário não é instalado nem executado"*.

## Tecnologias e Ferramentas

- [ ] Python / Node.js / Outro
- [ ] Bibliotecas principais: [listar]
- [ ] Outras ferramentas: [listar]

## Pré-requisitos

> Opcional — só se houver setup além do padrão: chave de API, cluster, binário
> externo, flag de navegador, versão específica de runtime.

## Como executar

```bash
# Passos para rodar o projeto
```

Uma linha sobre o que aparece quando funciona, para quem precisa decidir se o run
deu certo.

> Não entram aqui: tokens consumidos, tempo de parede, contagem de testes que
> passaram, variação entre execuções nem limites de cota do provedor. Isso é
> resultado de execução, não instrução de uso — e envelhece em semanas.

## Estrutura do Projeto

> Opcional — só se houver mais de 2–3 arquivos.

```
# Exemplo de estrutura de pastas/arquivos
```

## Como funciona

> Opcional — mas escreva sempre que a lógica não for evidente lendo o entrypoint.
> É a seção mais consultada quando você voltar aqui em um ano.

Pseudocódigo ou diagrama textual do caminho de execução.

> O diagrama descreve o mecanismo. Comentário editorial sobre o desenho do exemplo
> não entra na figura nem no parágrafo que a segue.

## Conceitos trabalhados

- [ ] **Conceito** — como aparece concretamente no código

> Nomeia e define o conceito. Não é lugar de "o que o exercício não realiza".

## Aprendizados

- [ ] Insight concreto sobre a tecnologia central do projeto

> Bullets de **uma frase**, entre dois e cinco, sobre o assunto do projeto. A seção
> explica o que o exemplo ensina — fato técnico, afirmativo.
>
> Não entram: crítica ao material da aula, achados de code review, contagem de
> execuções, valores medidos, nem incidentes encontrados ao rodar (cota de tokens,
> rate limit, troca de modelo, `sys.path`, truncamento de painel, exit code).
>
> Teste antes de salvar: **um bullet que faria igual sentido no README de outra aula
> qualquer não é aprendizado desta aula.**

## Documento Original

> Opcional — só se existir `README.original.md`.

> Conteúdo original do README (scaffold ou material do professor) preservado em
> [`README.original.md`](./README.original.md).

## Referências

- [ ] Links, artigos, papers, vídeos

> Só o que sustenta o conteúdo da aula. Link que só existe para embasar um problema
> de execução sai junto com o problema.

---

## Ordem canônica

As seções aparecem **nesta ordem**, sem exceção:

```
# Título  →  > resumo de uma linha  →  Contexto  →  Descrição  →
Tecnologias e Ferramentas  →  [Pré-requisitos]  →  Como executar  →
[Estrutura do Projeto]  →  [Como funciona]  →  Conceitos trabalhados  →
Aprendizados  →  [Documento Original]  →  Referências
```

Obrigatórias: `Contexto`, `Descrição`, `Tecnologias e Ferramentas`, `Como executar`,
`Conceitos trabalhados`, `Aprendizados`, `Referências`. As entre colchetes entram
quando têm o que dizer.

**Não invente seções.** Se algo não couber em nenhuma delas, o lugar é o chat — não
o README.
