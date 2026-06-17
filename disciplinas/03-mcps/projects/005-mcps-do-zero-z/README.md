# Exemplo 005 — MCP do Zero: Servidor de Criptografia (ciphersuite-mcp)

> Construção de um servidor MCP completo a partir do zero, expondo criptografia AES-256-CBC como Tools, Resource e Prompt nativos via TypeScript Stdio.

## Contexto

- Disciplina: Model Context Protocol (MCPs)
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Este projeto implementa um servidor MCP do zero — sem wrappers ou frameworks de alto nível — usando o `@modelcontextprotocol/sdk` oficial. O servidor `ciphersuite-mcp` transforma operações de criptografia simétrica em primitivas que qualquer agente LLM pode consumir nativamente.

O serviço criptográfico é puro Node.js (`node:crypto`): cifra mensagens com **AES-256-CBC**, derivando uma chave forte de 32 bytes a partir de qualquer passphrase do usuário via **scrypt**. Cada cifragem gera um IV aleatório, então a mesma mensagem produz saídas diferentes a cada chamada — o formato de saída é `iv:ciphertext` (ambos em hexadecimal).

O servidor demonstra três tipos de primitivas do protocolo MCP em um único exemplo coeso:

- **Tools** — `encrypt_message` e `decrypt_message`, com schemas de entrada e saída tipados via Zod e tratamento de erro estruturado (`isError`).
- **Resource** — `encryption://info`, que documenta o algoritmo, a derivação de chave e o formato de saída para o agente consultar.
- **Prompt** — `encrypt_message_prompt`, um template parametrizado que instrui o LLM a usar a tool de cifragem.

O transporte é **Stdio**, o padrão para servidores MCP locais acoplados a um cliente (IDE, inspector ou agente). A suíte de testes sobe o próprio servidor como subprocesso e exercita todas as primitivas via um `Client` MCP real — round-trip de cifragem/decifragem, listagem do resource e validação do prompt.

## Tecnologias e Ferramentas

- [x] TypeScript (execução nativa via `--experimental-strip-types` do Node.js)
- [x] Node.js v24 (`node:crypto`, `node:test`)
- [x] `@modelcontextprotocol/sdk` — `McpServer`, `Client`, `StdioServerTransport`
- [x] Zod — schemas de entrada/saída das tools e do prompt
- [x] AES-256-CBC + scrypt (criptografia simétrica com derivação de chave)
- [x] MCP Inspector (debugging interativo do servidor)

## Pré-requisitos

- Node.js v24+ (o projeto usa `--experimental-strip-types` para rodar TypeScript sem build).
- Nenhuma API key necessária — toda a criptografia roda localmente.

## Como executar

```bash
# instalar dependências
npm install

# subir o servidor MCP (transporte stdio)
npm start

# rodar os testes (sobe o servidor como subprocesso e exercita as primitivas)
npm test

# inspecionar interativamente as tools/resources/prompts
npm run mcp:inspect
```

Para usar dentro do VS Code, o arquivo [.vscode/mcp.json](.vscode/mcp.json) já declara o servidor `ciphersuite-mcp` apontando para `src/index.ts`.

## Estrutura do Projeto

```
005-mcps-do-zero-z/
├── src/
│   ├── index.ts      # entrypoint: conecta o server ao StdioServerTransport
│   ├── mcp.ts        # registra Tools, Resource e Prompt no McpServer
│   └── service.ts    # lógica pura de cifragem/decifragem (AES-256-CBC + scrypt)
├── tests/
│   ├── helpers.ts    # cria um Client MCP de teste conectado ao server real
│   └── mcp.test.ts   # testes round-trip de tools, resource e prompt
├── .vscode/mcp.json  # declaração do servidor para o VS Code
├── package.json
└── tsconfig.json
```

## Como funciona

```
Cliente/Agente LLM ──stdio──> ciphersuite-mcp (McpServer)
                                  │
   encrypt_message(message, key) ─┤─> service.encrypt()  ──> "iv:ciphertext"
                                  │      scrypt(key) → AES-256-CBC + IV aleatório
   decrypt_message(enc, key) ─────┤─> service.decrypt()  ──> plaintext
                                  │      scrypt(key) → AES-256-CBC com IV extraído
   resource: encryption://info ───┤─> descreve algoritmo/formato
   prompt:  encrypt_message_prompt┘─> template "use a tool encrypt_message…"
```

Fluxo de cifragem ([src/service.ts](src/service.ts)):

1. `deriveKey(passphrase)` → `scryptSync(passphrase, SALT, 32)` produz a chave de 32 bytes.
2. Gera IV aleatório de 16 bytes (`randomBytes`).
3. Cifra com `createCipheriv('aes-256-cbc', key, iv)`.
4. Retorna `iv.hex + ':' + ciphertext.hex`.

A decifragem separa o IV do ciphertext pelo `:`, re-deriva a mesma chave da passphrase e reverte com `createDecipheriv`.

## Conceitos trabalhados

- [x] **Servidor MCP do zero** — uso direto de `McpServer` e `StdioServerTransport` sem abstrações ([src/index.ts](src/index.ts), [src/mcp.ts](src/mcp.ts))
- [x] **Primitivas MCP** — Tool, Resource e Prompt registrados no mesmo servidor
- [x] **Schemas tipados com Zod** — `inputSchema`/`outputSchema` validam e documentam as tools, com `structuredContent` no retorno
- [x] **Tratamento de erro estruturado** — retorno com `isError: true` e mensagem acionável em vez de exceção crua
- [x] **Derivação de chave com scrypt** — transforma qualquer passphrase em chave forte de 32 bytes ([src/service.ts](src/service.ts))
- [x] **IV aleatório por cifragem** — mesma mensagem gera saídas distintas, com o IV embutido na saída para a decifragem
- [x] **Testes de integração MCP** — `Client` real conecta ao servidor via stdio e valida o contrato ([tests/mcp.test.ts](tests/mcp.test.ts))

## Aprendizados

- [x] Um servidor MCP útil cabe em poucas linhas: o SDK cuida do protocolo, restando apenas registrar primitivas e plugar um transporte.
- [x] Separar o `McpServer` (em `mcp.ts`) do entrypoint (`index.ts`) permite testar o servidor sem depender do processo de produção e reaproveitá-lo com transportes diferentes.
- [x] `outputSchema` + `structuredContent` dão ao agente uma resposta tipada e previsível, não só texto livre — fundamental para encadear tools.
- [x] Retornar erros com `isError` e mensagem descritiva (passphrase errada, formato inválido) é melhor para o agente do que lançar exceção: ele consegue se autocorrigir.
- [x] Testar um servidor MCP é testá-lo como cliente real via stdio — o round-trip cifrar→decifrar valida o contrato de ponta a ponta.

## Referências

- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [Model Context Protocol — Documentação oficial](https://modelcontextprotocol.io)
- [`@modelcontextprotocol/sdk` (TypeScript SDK)](https://github.com/modelcontextprotocol/typescript-sdk)
- [Node.js Crypto — `scrypt` / `createCipheriv`](https://nodejs.org/api/crypto.html)
