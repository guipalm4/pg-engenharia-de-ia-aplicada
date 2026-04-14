# Exemplo 008 — Context7 MCP + Better Auth + Next.js

> Demonstra como usar o **Context7 MCP** para consultar documentação atualizada de bibliotecas durante a geração de código, aplicado à construção de um demo de autenticação OAuth com Next.js, Better Auth e SQLite.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

Este exemplo explora o uso do **Context7 MCP** como ferramenta de acesso a documentação em tempo real durante a geração de código por um agente de IA. Em vez de depender do conhecimento de treinamento do modelo (que pode estar desatualizado), o agente é instruído a consultar a documentação oficial das bibliotecas via MCP antes de gerar qualquer código.

O projeto gerado é um demo funcional de autenticação com **Better Auth**, integrando GitHub OAuth e persistência local em **SQLite**. O frontend é construído com **Next.js 16 App Router** e **Tailwind CSS**, expondo duas rotas: uma página de login e uma home que exibe o estado da sessão.

O `prompt.md` na raiz documenta exatamente como o agente foi instruído: com regra explícita de que o processo deve ser interrompido caso o Context7 MCP não esteja disponível, tornando a consulta à doc um pré-requisito — não uma sugestão.

## Tecnologias e Ferramentas
- [x] Next.js 16 (App Router, TypeScript)
- [x] Better Auth 1.4 — biblioteca de autenticação
- [x] better-sqlite3 — banco SQLite local para sessões/usuários
- [x] Tailwind CSS 4 — estilização
- [x] Context7 MCP — consulta de documentação atualizada durante a geração
- [x] GitHub OAuth — provedor social de autenticação

## Pré-requisitos

É necessário criar um **GitHub OAuth App** para obter as credenciais:

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em **New OAuth App** e preencha:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copie o **Client ID** e gere um **Client Secret**
4. Preencha o arquivo `nextjs-better-auth-demo/.env.local`:

```env
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
BETTER_AUTH_URL=http://localhost:3000
```

## Como executar

```bash
cd nextjs-better-auth-demo

# Instalar dependências
npm install

# Gerar tabelas do banco de dados SQLite
npx @better-auth/cli migrate

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

```
exemplo-008-context7/
├── prompt.md                          # Prompt usado para gerar o projeto via agente
└── nextjs-better-auth-demo/
    ├── lib/
    │   ├── auth.ts                    # Config do Better Auth (servidor): GitHub + SQLite
    │   └── auth-client.ts             # Cliente Better Auth para o browser (React hook)
    ├── app/
    │   ├── api/auth/[...all]/route.ts # Route handler que delega tudo ao Better Auth
    │   ├── login/page.tsx             # Página de login com botão "Entrar com GitHub"
    │   └── page.tsx                   # Home: exibe sessão ativa ou redireciona para login
    ├── .env.example                   # Template de variáveis de ambiente
    └── better-auth.sqlite             # Banco gerado após o migrate (não versionado)
```

## Como funciona

```
Usuário acessa /login
  → clica "Entrar com GitHub"
  → authClient.signIn.social({ provider: "github", callbackURL: "/" })
  → Better Auth inicia OAuth flow → redireciona para GitHub
  → GitHub autentica e devolve para /api/auth/callback/github
  → toNextJsHandler(auth) processa o callback
  → sessão gravada no better-auth.sqlite
  → usuário redirecionado para /
  → authClient.useSession() retorna session.user com email/nome
  → exibe "Logado como <email>"
  → botão "Sair" chama authClient.signOut() e limpa a sessão
```

## Conceitos trabalhados
- [x] **Context7 MCP como fonte de verdade** — o agente consulta a doc atual antes de gerar código, evitando alucinações sobre APIs recentes
- [x] **Better Auth route handler** — `toNextJsHandler(auth)` adapta o core da lib para o App Router com um catch-all `[...all]`
- [x] **Separação servidor/cliente** — `lib/auth.ts` roda no Node.js com `better-sqlite3`; `lib/auth-client.ts` roda no browser via React hook
- [x] **OAuth social provider** — fluxo completo de redirect → callback → sessão persistida
- [x] **Prompts com pré-condição de ferramenta** — o prompt impõe parada total se o MCP não estiver disponível, tornando a integração obrigatória

## Aprendizados
- [x] O Context7 MCP elimina incerteza sobre versões de API — especialmente útil para libs que evoluem rápido como Better Auth
- [x] Tornar a consulta ao MCP uma **condição de parada** (não opcional) garante que o agente não improvisa com conhecimento stale
- [x] Better Auth usa `new Database("./better-auth.sqlite")` diretamente — sem abstração de URL — o que exige atenção ao diretório de trabalho do processo Node
- [x] O `npx @better-auth/cli migrate` é obrigatório antes do primeiro uso; sem ele, as tabelas não existem e o login falha silenciosamente

## Referências
- [Better Auth — Documentação oficial](https://www.better-auth.com/docs)
- [Better Auth — Integração Next.js](https://www.better-auth.com/docs/integrations/next-js)
- [Better Auth — GitHub OAuth Provider](https://www.better-auth.com/docs/authentication/github)
- [Context7 MCP](https://context7.com)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

---
