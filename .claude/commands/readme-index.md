# Skill: readme-index

Reconstrói o `README.md` raiz lendo todos os projetos, agrupa por tema e faz commit + push.

Use esta skill quando quiser reconstruir o índice completo do zero. Para adicionar um projeto novo, prefira `/readme-projeto` — ele já atualiza o índice.

## Passos

1. **Lista projetos** com Glob: `disciplinas/*/projects/*/README.md` (ordem numérica).
   - Só a disciplina 01 usa o prefixo `exemplo-`; da 02 em diante a convenção é `NNN-slug`. Um glob restrito a `exemplo-*` enxerga um quarto do repositório e apaga o resto do índice.
   - Ignore os projetos `*-template` (scaffold do professor, sem `## Contexto`) — eles não entram no índice.
2. **Lê o README de cada projeto** — extrai: título, frase do `>`, tecnologias, disciplina.
3. **Agrupa por tema** (inferir pelas tecnologias). Os temas vigentes são os cabeçalhos `###` já presentes no README raiz — leia-os de lá, a lista abaixo é só amostra da disciplina 01:
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

- Título e descrição na tabela vêm do README do projeto (frase do `>`). Não trunque no meio de uma frase: reescreva a linha se não couber.
- **A linha descreve o que o projeto é e o que ele demonstra** — mesma voz do resumo do `>`. Não é lugar de veredito sobre o exemplo, de resultado medido, nem de configuração de runtime (nome de modelo, env var), a menos que o modelo seja o assunto do projeto.
- Links relativos: `disciplinas/<disciplina>/projects/<pasta-do-projeto>/README.md`.
- Commit inclui apenas o README raiz.
- Padrão de commit: `docs: atualiza índice principal do repositório (N projetos)`
- Sempre fazer push ao final.
