---
name: readme-padronizado
description: |
  Gerar e manter READMEs padronizados para todos os projetos do repositório,
  seguindo o template oficial e mantendo seções úteis e executáveis.
author: repo
version: 1.0.0
date: 2026-03-30
---

# Skill: README padronizado

## Fonte oficial
- Template: `.cursor/templates/README_TEMPLATE.md`
- Regras: `.cursor/rules/10-readmes.md`

## Entrada esperada (mínima)
- Caminho do projeto (pasta-alvo) onde o `README.md` deve existir.

## Procedimento (sempre igual)
1. Identificar a raiz do projeto-alvo (onde fica o código/artefatos do projeto).
2. Ler `.cursor/templates/README_TEMPLATE.md`.
3. Coletar evidências mínimas do projeto (para reduzir tokens):
   - Nome do projeto (pelo nome da pasta).
   - Estrutura atual (lista de arquivos/pastas principais).
   - Tecnologias (ex.: presença de `package.json`, `requirements.txt`, notebooks, etc.).
4. Preencher o template:
   - **Contexto**: disciplina + período (inferir pela pasta `disciplinas/` quando possível).
   - **Como executar**: comandos reais; se não houver, inserir TODO explícito com próximos passos.
   - **Estrutura do Projeto**: refletir a estrutura atual do projeto.
   - **Conceitos trabalhados**: listar conceitos alinhados ao que existe no código (não inventar).
5. Gravar/atualizar o `README.md` na raiz do projeto-alvo.
6. Validar rapidamente:
   - Não há seções vazias.
   - Checklists fazem sentido (não deixar “Python / Node.js / Outro” marcado de forma errada).

## Saída
- `README.md` padronizado e atualizado no projeto-alvo.

