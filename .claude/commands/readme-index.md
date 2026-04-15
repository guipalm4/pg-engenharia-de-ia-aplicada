# Skill: readme-index

Reconstrói o `README.md` raiz lendo todos os projetos, agrupa por tema e faz commit + push.

Use esta skill quando quiser reconstruir o índice completo do zero. Para adicionar um projeto novo, prefira `/readme-projeto` — ele já atualiza o índice.

## Passos

1. **Lista projetos** com Glob: `disciplinas/*/projects/exemplo-*/README.md` (ordem numérica).
2. **Lê o README de cada projeto** — extrai: título, frase do `>`, tecnologias, disciplina.
3. **Agrupa por tema** (inferir pelas tecnologias). Temas atuais:
   - Machine Learning com TensorFlow.js
   - IA em Jogos
   - LLM Local no Navegador — Chrome Built-in AI
   - IA Agentiva com Playwright MCP
   - MCP como Ferramenta de Desenvolvimento
   - Criar novo tema se nenhum se encaixar.
4. **Lê o README raiz atual** — preserva cabeçalho, tabela de disciplinas, "Estrutura do Repositório" e "Como usar".
5. **Reescreve apenas o miolo** (seções de disciplinas + tabelas de projetos) e atualiza a contagem.
6. **Commit + push**.

## Regras

- Título e descrição na tabela vêm do README do projeto (frase do `>`), truncados em ~120 chars.
- Links relativos: `disciplinas/.../projects/exemplo-NNN/README.md`.
- Commit inclui apenas o README raiz.
- Padrão de commit: `docs: atualiza índice principal do repositório (N projetos)`
- Sempre fazer push ao final.
