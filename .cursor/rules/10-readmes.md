---
description: Padrão para criação/atualização de READMEs em todos os projetos.
---

## Objetivo
Padronizar `README.md` em **todos os projetos** da pós, com previsibilidade suficiente para automação.

## Regras
- Todo projeto (pasta de projeto) deve conter um `README.md` na **raiz do projeto**.
- O `README.md` deve ser gerado a partir de `.cursor/templates/README_TEMPLATE.md`.
- Preencher **todos** os campos do template (não deixar seções vazias).
- Manter a seção **Como executar** executável (comandos reais ou um “TODO” explícito).
- Manter a seção **Estrutura do Projeto** coerente com a árvore atual (atualizar quando a estrutura mudar).
- A seção **Conceitos trabalhados** deve listar conceitos de IA/ML/Engenharia realmente usados (extraídos do código e da disciplina).

## Quando atualizar
- Ao criar um projeto novo.
- Ao adicionar dependências, mudar o entrypoint, ou alterar significativamente a estrutura.
- Ao final de uma etapa (aula/módulo), atualizar **Aprendizados** e **Referências**.

