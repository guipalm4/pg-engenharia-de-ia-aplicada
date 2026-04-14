# Playwright MCP — Navegação Agentiva e Preenchimento de Formulário

> Demonstra como um agente de IA usa o Playwright MCP para navegar em múltiplas páginas, extrair dados de um perfil público e preencher um formulário real com as informações coletadas, sem intervenção humana.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
Este exemplo explora um caso de uso concreto de automação agentiva com Playwright MCP: o agente recebe um único prompt em linguagem natural e executa uma tarefa de múltiplos passos que envolve navegação cruzada entre páginas, extração de informação e preenchimento de formulário.

O fluxo começa com o agente acessando um Google Form para identificar quais campos são obrigatórios. Em seguida, navega até o perfil do palestrante Erick Wendel no Sessionize, extrai os dados do perfil que correspondem aos campos do formulário (nome, bio, foto, redes sociais, etc.) e seleciona uma palestra em português cujo título contenha "JavaScript". Com esses dados, preenche o formulário sem apertar submit — permitindo validação humana antes do envio.

O ponto central do exemplo não é o código, mas a capacidade do agente de correlacionar informações entre duas fontes distintas (formulário e perfil) usando apenas observação do DOM via ferramentas do MCP, sem acesso ao código-fonte das páginas.

## Tecnologias e Ferramentas
- [x] **Playwright MCP** (`@playwright/mcp`): servidor MCP que expõe ferramentas de navegação e interação com browser para agentes de IA
- [x] **`example.mcp.json`**: configuração do servidor MCP com token de extensão Playwright
- [x] **`prompt.md`**: prompt em linguagem natural que descreve a tarefa completa para o agente

## Pré-requisitos

O Playwright MCP com `--extension` requer autenticação via token para acessar o browser real do usuário:

1. Obtenha seu `PLAYWRIGHT_MCP_EXTENSION_TOKEN` na extensão Playwright para VS Code
2. Substitua `YOUR_TOKEN_HERE` em `example.mcp.json`:
   ```json
   {
     "servers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--extension"],
         "env": {
           "PLAYWRIGHT_MCP_EXTENSION_TOKEN": "SEU_TOKEN_AQUI"
         }
       }
     }
   }
   ```
3. Configure o MCP server no editor apontando para este `example.mcp.json`

## Como executar

```bash
# 1. Configurar o MCP server no editor com example.mcp.json

# 2. Abrir o Copilot Chat ou Claude e colar o conteúdo de prompt.md

# 3. O agente executa os passos automaticamente:
#    - Acessa o Google Form e identifica os campos
#    - Navega até o perfil no Sessionize
#    - Extrai os dados e seleciona a palestra adequada
#    - Preenche o formulário (sem submeter)
```

## Como funciona

```
agente recebe prompt.md

Passo 1 — reconhecimento do formulário
  mcp.navigate("https://forms.gle/5mGHXVKDLMFtjwBz7")
  mcp.snapshot()                        → lê accessibility tree do form
  identifica campos obrigatórios        → nome, bio, foto, palestra, etc.

Passo 2 — extração de dados do perfil
  mcp.navigate("https://sessionize.com/erickwendel")
  mcp.snapshot()                        → lê perfil completo do palestrante
  extrai dados do perfil               → nome, bio, links, foto, palestras
  filtra palestras                      → seleciona título com "javascript" em pt-BR

Passo 3 — preenchimento cruzado
  mcp.navigate(url_do_form)
  para cada campo obrigatório:
    mcp.fill(campo, valor_extraído)     → correlaciona campo → dado do perfil
  mcp.snapshot()                        → valida estado final do formulário preenchido
  (não executa submit — aguarda validação humana)
```

## Conceitos trabalhados
- [x] **Navegação multi-página agentiva** — o agente mantém contexto entre duas sessões de navegação distintas (form → perfil → form) sem estado explícito além do histórico de mensagens
- [x] **Extração de dados por observação** — o agente usa o snapshot da accessibility tree para identificar e extrair informações estruturadas de uma página não-estruturada, sem scraping de HTML
- [x] **Correlação cruzada de dados** — mapeia campos de um formulário para atributos de um perfil em outra URL, inferindo a correspondência semanticamente
- [x] **Prompt como especificação de tarefa** — um único arquivo `prompt.md` em linguagem natural é suficiente para descrever uma automação de múltiplos passos; o agente infere a sequência de ações
- [x] **Controle humano no loop** — o prompt instrui explicitamente o agente a não submeter o formulário, demonstrando o padrão "human-in-the-loop" para validação antes de ações irreversíveis

## Aprendizados
- [x] A instrução de não apertar submit deve ser explícita no prompt — o agente tende a completar tarefas até o fim quando não há restrição explícita, e ações em formulários externos são irreversíveis
- [x] Especificar o idioma no critério de seleção ("palestra em português") é necessário porque o Sessionize exibe conteúdo em múltiplos idiomas para o mesmo palestrante; sem isso o agente pode selecionar a versão em inglês
- [x] O MCP com `--extension` acessa o browser real do usuário (com cookies e sessão ativa), o que permite navegar em páginas que exigem login — mas também significa que ações acidentais têm impacto real
- [x] A separação entre o arquivo de configuração (`example.mcp.json`) e o prompt da tarefa (`prompt.md`) permite reutilizar o mesmo servidor MCP para diferentes cenários de automação sem reconfiguração

## Referências
- [Playwright MCP — npm](https://www.npmjs.com/package/@playwright/mcp)
- [Model Context Protocol (MCP) — spec](https://modelcontextprotocol.io/)
- [Formulário-alvo — Google Forms](https://forms.gle/5mGHXVKDLMFtjwBz7)
- [Perfil do palestrante — Sessionize: Erick Wendel](https://sessionize.com/erickwendel)

---
