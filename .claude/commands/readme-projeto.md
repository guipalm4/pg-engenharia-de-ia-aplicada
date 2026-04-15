# Skill: readme-projeto

Cria o README.md do projeto **$ARGUMENTS**, atualiza o índice raiz, faz commit e push.

## Passos

1. **Localiza o projeto** — use `Glob` com `**/exemplo-*$ARGUMENTS*/` se receber só o nome; se for path completo, use diretamente. Nunca use `find`.

2. **Lê os arquivos do projeto** — se os arquivos já estiverem no contexto da conversa, pule esta etapa. Caso contrário, leia os arquivos relevantes (exceto `node_modules/`, `package-lock.json`, `package-lock.json`, `.DS_Store`). Priorize: `package.json`, arquivos de entrada (`index`, `app`, `main`), configs, e qualquer `prompt.md` ou doc interna.

3. **Lê o template** — `shared/templates/README_TEMPLATE.md` (relativo à raiz do repo). Use como referência de estrutura e profundidade.

4. **Escreve `README.md`** no diretório raiz do projeto seguindo a estrutura abaixo.

5. **Atualiza o índice raiz** — lê o `README.md` raiz, adiciona o novo projeto na seção e tema corretos, atualiza a contagem de exemplos.

6. **Commit único** com ambos os arquivos + push.

---

## Estrutura do README

```
# Exemplo NNN — <Título descritivo>
> <Uma frase: o que demonstra + tecnologia principal>

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
<2–4 parágrafos: o que faz, qual problema resolve, relação com a disciplina>

## Tecnologias e Ferramentas
- [x] <tecnologia>

## Pré-requisitos          ← só se houver setup especial (API keys, flags de browser, etc.)

## Como executar
```bash
<comandos>
```

## Estrutura do Projeto    ← só se houver mais de 2–3 arquivos
<árvore comentada>

## Como funciona           ← obrigatório se a lógica não for óbvia
<pseudocódigo ou diagrama textual>

## Conceitos trabalhados
- [x] **<conceito>** — <como aparece no código>

## Aprendizados
- [x] <insight concreto>

## Referências
- [nome](url)
```

---

## Regras

- **Não inventar** — conteúdo vem exclusivamente do código lido.
- **Seções opcionais** são as marcadas acima; as demais são obrigatórias.
- **Commit**: inclui apenas o README do projeto e o README raiz. Arquivos-fonte não rastreados pelo git **não** devem ser commitados por esta skill — são responsabilidade do usuário.
- **Padrão de commit**:
  ```
  feat: adiciona <nome-do-exemplo> (<título resumido>) Finalizado em: DD/MM/AAAA
  ```
  Use a data atual do `currentDate` do contexto de sessão.
- **Sempre fazer push** ao final.
