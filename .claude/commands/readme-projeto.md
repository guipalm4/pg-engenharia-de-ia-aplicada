# Skill: readme-projeto

Cria o README.md do projeto **$ARGUMENTS**, faz o commit e o push.

> Se `$ARGUMENTS` for apenas o nome do exemplo (ex: `exemplo-005-xyz`), procure o caminho completo com `find` dentro de `disciplinas/`. Se for um caminho completo, use diretamente.

## O que esta skill faz (passo a passo)

1. **Lê todos os arquivos do projeto** (exceto `node_modules/` e `package-lock.json`) para entender o que foi construído.
2. **Lê `shared/templates/README_TEMPLATE.md`** (relativo à raiz do repositório) como referência canônica de estrutura e seções.
3. **Escreve o README.md** seguindo o padrão estabelecido (ver seção abaixo), enriquecendo o template com o conteúdo real do projeto.
4. **Faz o commit** com a mensagem no padrão do repositório.
5. **Faz o push** para o remote.

---

## Padrão de README a seguir

```markdown
# <Título do Projeto> — <Subtítulo descritivo>

> <Uma frase resumindo o que o projeto demonstra e qual tecnologia usa>

## Contexto
- Disciplina: <nome da disciplina>
- Período: <Mês/Ano>
- Autor: guipalm4

## Descrição
<2-4 parágrafos explicando o que o projeto faz, qual problema resolve,
e como se relaciona com os conceitos da disciplina. Citar tecnologias principais.>

## Tecnologias e Ferramentas
- [x] <tecnologia 1>
- [x] <tecnologia 2>
...

## Pré-requisitos  ← incluir apenas se houver setup especial (ex: flags do Chrome, chaves de API)
<instruções detalhadas de configuração>

## Como executar
<bloco de código bash com os comandos necessários>

## Estrutura do Projeto  ← incluir apenas se o projeto tiver mais de 2 arquivos
<árvore de arquivos com descrição de cada um>

## Como funciona  ← bloco de pseudocódigo ou diagrama textual do fluxo principal
<fluxo das funções/módulos principais>

## Conceitos trabalhados
- [x] **<conceito>** — <uma frase explicando como aparece no código>
...

## Aprendizados
- [x] <insight concreto derivado da implementação>
...

## Referências
- [<nome>](<url>)
...

---
```

---

## Padrão de commit

```
feat: adiciona <nome-do-exemplo> (<título resumido>) Finalizado em: <DD/MM/AAAA>
```

**Exemplo:**
```
feat: adiciona exemplo-005-xyz (descrição breve) Finalizado em: 07/04/2026
```

A data deve ser a data atual (`currentDate` do contexto de sessão).

---

## Regras importantes

- **Não inventar**: o conteúdo do README deve vir exclusivamente do código lido. Não assumir funcionalidades não implementadas.
- **Consistência**: seguir a estrutura de `shared/templates/README_TEMPLATE.md` como referência canônica; o padrão detalhado inline acima é a especificação autoritativa de formato e profundidade.
- **Seções opcionais**: "Pré-requisitos" só aparece se houver setup especial. "Estrutura do Projeto" só aparece se houver mais de 2-3 arquivos. "Como funciona" é obrigatório se houver lógica não óbvia.
- **Commit inclui todos os arquivos do projeto** (não só o README) caso sejam arquivos novos (untracked). Nunca incluir `node_modules/`.
- **Sempre fazer push** ao final.
