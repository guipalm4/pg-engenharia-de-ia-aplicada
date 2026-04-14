# Estrutura de Prompt (demo simples: Next.js + Better Auth + GitHub + SQLite + npm)

## 1) Contexto da tarefa
Você é um(a) dev fullstack sênior. Sua missão é gerar um projeto DEMO extremamente simples em Next.js (App Router) com:
- Página de Login/Signup via GitHub (um único botão "Entrar com GitHub" com ícone do GitHub).
- Página Home ("Hello World") que mostra o estado: "Logado como <email/nome>" OU "Você não está logado".
- Banco SQLite local (arquivo .sqlite) para persistir usuários/sessões.
- Implementação usando Better Auth (oficial) e integração oficial com Next.js.
- Gerar também um README.md com instruções claras para rodar.
- UI simples e bonita com Tailwind CSS e ícone SVG do GitHub.

## 2) Contexto de tom
Direto, didático e enxuto. Explique só o essencial para rodar o demo localmente.

## 3) Dados de antecedentes, documentos e imagens
Você TEM acesso a MCPs no VS Code, e DEVE usar o Context7 MCP.
Regra crítica:
- Se o Context7 MCP não estiver disponível/funcionando, PARE o processo imediatamente e responda apenas:
  “Context7 MCP não disponível. Não posso continuar.”

Regras de consulta:
- Use o Context7 para buscar a documentação ATUAL do Better Auth sobre:
  - Integração com Next.js (App Router / route handler)
  - Configuração do provider GitHub
  - Uso de SQLite (driver recomendado / configuração com better-sqlite3)
  - Como criar auth client e iniciar sign-in social no client
  - Migração de schema do banco de dados
- Antes do código, mostre:
  - “Docs consultados:” + títulos das páginas
  - até 8–10 linhas totais de snippets (curtos) usados como base

## 4) Descrição detalhada da tarefa e regras
Gere o código e os arquivos mínimos para o demo funcionar, sem passos desnecessários.

Requisitos técnicos:
- Next.js App Router + TypeScript.
- Gerenciador: npm (obrigatório).
- Dependências: liste e instale apenas o necessário.
- Better Auth configurado com:
  - GitHub OAuth (clientId/clientSecret via env)
  - Better Auth SQLite para persistência local usando better-sqlite3.
  - IMPORTANTE: Use `new Database("./better-auth.sqlite")` diretamente, NÃO use provider/url.
  - Execute `npx @better-auth/cli migrate` após criar os arquivos para gerar as tabelas do banco.
- Inicie o projeto e valide com o Playwright MCP que o serviço está functionando na porta correta.

Comportamento esperado:
- Clicar “Entrar com GitHub” inicia OAuth e redireciona.
- Após login, Home mostra dados do usuário/sessão.
- Botão “Sair” encerra a sessão.

## 8) Pensar passo a passo / respirar fundo
Pense passo a passo internamente para evitar erros de caminhos/exports/imports.
NÃO mostre seu raciocínio. Mostre apenas o resultado final.

## 9) Formatação da saída
Responda em português e siga EXATAMENTE esta ordem:

1) Verificação do Context7 (1 linha: “Context7 OK” ou a mensagem de parada)
2) Docs consultados (títulos + snippets curtos)
3) Dependências (lista curta)
4) Estrutura de arquivos criados (lib/auth.ts, app/api/auth/[...all]/route.ts, etc)
5) Comandos npm (na ordem: instalar dependências, rodar migrate, rodar dev)
