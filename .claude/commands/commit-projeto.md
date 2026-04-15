# Skill: commit-projeto

Commita os arquivos-fonte do projeto **$ARGUMENTS** com o padrão do repositório e faz push.

## Passos

1. **Localiza o projeto** — use Glob com `**/exemplo-*$ARGUMENTS*/` se receber só o nome; se for path completo, use diretamente.

2. **Lê o README.md do projeto** — extrai o título da linha `# Exemplo NNN — <Título>` para usar na mensagem de commit.

3. **Staged os arquivos do projeto**:
   ```bash
   git add <caminho-do-projeto>
   ```
   Em seguida, remove do stage os artefatos que não devem ser commitados:
   ```bash
   git reset HEAD <caminho-do-projeto>/node_modules
   git reset HEAD <caminho-do-projeto>/**/node_modules
   git reset HEAD <caminho-do-projeto>/**/*.lock
   git reset HEAD <caminho-do-projeto>/**/package-lock.json
   git reset HEAD <caminho-do-projeto>/**/.DS_Store
   git reset HEAD <caminho-do-projeto>/**/storage
   git reset HEAD <caminho-do-projeto>/**/*.sqlite
   ```
   Ou use `git status` para confirmar o que está staged antes de commitar.

4. **Confirma o stage** — exibe `git status` e `git diff --staged --stat` para verificar o que será commitado. Se algo indesejado estiver incluso, remova do stage antes de prosseguir.

5. **Commit** com o padrão:
   ```
   feat: adiciona <nome-do-exemplo> (<título extraído do README>) Finalizado em: DD/MM/AAAA
   ```
   Use a data atual do `currentDate` do contexto de sessão.

6. **Push** ao final.

## Regras

- **Nunca incluir** `node_modules/`, arquivos `*.lock`, `package-lock.json`, `.DS_Store`, diretórios `storage/`, arquivos `*.sqlite`.
- **Não commitar o README.md** do projeto — esse é responsabilidade do `/readme-projeto`.
- O título no commit vem do README existente. Se o README ainda não existir, use o nome do diretório como título.
- Sempre fazer push ao final.
