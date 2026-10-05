# Checklist — Missão #03

> Extraída de `material/Atividade 3 - Módulo 3.pdf`. Não há níveis de rubrica nesta disciplina.

## Entrega (texto do enunciado)

> Um único repositório ou arquivo contendo: o diagrama dos padrões escolhidos e justificados (pode
> ser desenho, Mermaid, ou descrição textual da relação entre os agentes), a tabela de falha e
> compensação por agente, o código JavaScript da comunicação entre pelo menos dois agentes, e a
> resposta da reflexão final.

## Itens verificáveis

| # | Passo | Item | Dono |
|---|---|---|---|
| 1 | Passo 1 | processo real onde múltiplas pessoas ou sistemas precisam concordar sobre o mesmo estado | você |
| 2 | Passo 1 | um padrão **por dependência** entre agentes (não um único para o sistema) | você |
| 3 | Passo 1 | padrões ∈ {Sequential, Parallel, Supervisor, Hierarchical, Group Chat, Handoff}, com justificativa | você |
| 4 | Passo 2 | por agente: timeout | você |
| 5 | Passo 2 | por agente: número máximo de tentativas (CAP: espera ou segue sem?) | você |
| 6 | Passo 2 | por agente: a operação é idempotente? | você |
| 7 | Passo 2 | por etapa sequencial: ação compensatória **específica** (não recomeço genérico) | você |
| 8 | Passo 3 | contrato de cada evento declarado antes do código: nome, dado, emissor, ouvinte | você |
| 9 | Passo 3 | código JavaScript com fila de mensagens (`EventEmitter` ou equivalente) entre ≥2 agentes | código |
| 10 | Passo 3 | execução gravada mostrando a troca de eventos | execução |
| 11 | Reflexão | um padrão ou decisão de falha + uma frase com o sinal em produção de que a escolha estava errada | você |

## Proibições do enunciado

- Sistema hipotético escolhido só para caber nos seis padrões.
- Válido: concluir que dois agentes poderiam virar um só sem perda de qualidade.
- O enunciado **não exige** chamada a LLM neste módulo; o que se avalia é a comunicação assíncrona.
