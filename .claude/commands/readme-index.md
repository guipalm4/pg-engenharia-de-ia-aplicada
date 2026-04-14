# Skill: readme-index

Reconstrói o `README.md` raiz do repositório lendo todos os projetos existentes, agrupa por tema e faz commit + push.

## O que esta skill faz (passo a passo)

1. **Lista todos os projetos** em `disciplinas/*/projects/exemplo-*/` (ordenados numericamente).
2. **Lê o `README.md` de cada projeto** para extrair: título, descrição resumida (linha `>`), tecnologias principais e disciplina.
3. **Agrupa os projetos por tema**, inferindo o grupo a partir das tecnologias e conceitos de cada projeto. Temas atuais como referência:
   - Machine Learning com TensorFlow.js
   - IA em Jogos
   - LLM Local no Navegador — Chrome Built-in AI
   - IA Agentiva com Playwright MCP
   - MCP como Ferramenta de Desenvolvimento
   - Novos temas podem ser criados se o projeto não se encaixar nos existentes.
4. **Lê o `README.md` raiz atual** para preservar: cabeçalho, descrição geral, tabela de disciplinas, seção de estrutura do repositório e seção "Como usar".
5. **Reescreve apenas o miolo** — as seções de disciplinas com as tabelas de projetos — mantendo o restante intacto.
6. **Atualiza a contagem** de projetos na tabela de disciplinas.
7. **Faz commit e push**.

---

## Estrutura esperada do README raiz

```markdown
# Engenharia de IA Aplicada — Pós-Graduação UniPDS

> ...

**Autor:** guipalm4 · **Instituição:** UniPDS · **Início:** 2026

---

## Disciplinas

| # | Disciplina | Projetos |
|---|-----------|---------|
| 01 | [Fundamentos de IA e LLMs](#01--fundamentos-de-ia-e-llms) | N exemplos |

---

## 01 · Fundamentos de IA e LLMs

<descrição da disciplina>

### <Tema A>

| # | Projeto | O que demonstra |
|---|---------|----------------|
| NNN | [Título](caminho/README.md) | frase extraída do `>` do README do projeto |

### <Tema B>
...

---

## Estrutura do Repositório
...

## Como usar este repositório
...
```

---

## Regras importantes

- **Não inventar**: título, descrição e tecnologias vêm exclusivamente dos READMEs lidos.
- **Ordem numérica**: projetos dentro de cada tema aparecem em ordem crescente de número (`exemplo-000`, `exemplo-001`, ...).
- **Um projeto por linha**: cada projeto é uma linha na tabela do seu tema.
- **Descrição na tabela**: usar a frase do `>` (blockquote) do README do projeto — truncar em ~120 chars se necessário.
- **Link relativo**: o link do projeto aponta para `disciplinas/.../projects/exemplo-NNN/README.md`.
- **Seções fixas preservadas**: "Estrutura do Repositório" e "Como usar este repositório" não são alteradas.
- **Commit inclui apenas o README raiz**.
- **Sempre fazer push** ao final.

## Padrão de commit

```
docs: atualiza índice principal do repositório (<N> projetos)
```
