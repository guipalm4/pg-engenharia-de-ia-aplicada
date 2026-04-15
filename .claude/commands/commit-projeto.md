# Skill: commit-projeto

Commita os arquivos-fonte do projeto **$ARGUMENTS** com o padrão do repositório e faz push.

## Passos

1. **Localiza o projeto** — use Glob com `**/exemplo-*$ARGUMENTS*/` se receber só o nome; se for path completo, use diretamente.

2. **Lê o README.md do projeto** — extrai o título da linha `# Exemplo NNN — <Título>` para usar na mensagem de commit. Se o README ainda não existir, usa o nome do diretório.

3. **Verifica o que será commitado**:
   ```bash
   git status
   git diff --staged --stat
   ```
   Artefatos indesejados (`node_modules/`, `storage/`, `*.sqlite`, lock files, `.DS_Store`) já são ignorados pelo `.gitignore` raiz.

4. **Staged e commit**:
   ```bash
   git add <caminho-do-projeto>
   ```
   Não commitar o `README.md` do projeto — responsabilidade do `/readme-projeto`.

5. **Commit** com o padrão:
   ```
   feat: adiciona <nome-do-exemplo> (<título>) Finalizado em: DD/MM/AAAA
   ```
   Use a data atual do `currentDate` do contexto de sessão.

6. **Push** ao final.
