# Checklist — Missão #05

> Extraída de `material/Atividade 5 - Módulo 5.pdf`. Não há níveis de rubrica nesta disciplina.
> Estende o Gateway do Módulo 4: o `src/` parte do `004`.

## Entrega (texto do enunciado)

> Um único arquivo contendo: a cascata calibrada com a evidência que justifica o limiar escolhido
> (Passo 1-2), o orçamento por tenant implementado (Passo 3), o log da execução mostrando os três
> comportamentos (Passo 4), e a reflexão final (Passo 5).

## Itens verificáveis

| # | Passo | Item | Dono |
|---|---|---|---|
| 1 | Passo 1 | Tier 1 (barato, tentado sempre primeiro), com custo estimado | você |
| 2 | Passo 1 | Tier 2 (caro, só se o Tier 1 não convencer), com custo estimado | você |
| 3 | Passo 1 | Tier 3 (frontier), opcional | você |
| 4 | Passo 2 | sinal de confiança que decide a escalação (método FrugalGPT) | você |
| 5 | Passo 2 | pares do domínio: pergunta simples com resposta claramente certa | você |
| 6 | Passo 2 | pares do domínio: pergunta ambígua com resposta duvidosa | você |
| 7 | Passo 2 | pares do domínio: pergunta fora do domínio conhecido | você |
| 8 | Passo 2 | valores medidos (evidência) | execução |
| 9 | Passo 2 | limiar que separa "bastou" de "duvidoso" **com folga**, não no ponto exato de corte | você |
| 10 | Passo 3 | identificador de tenant em toda requisição | código |
| 11 | Passo 3 | orçamento verificado **antes** da chamada ao modelo | código |
| 12 | Passo 3 | regra fixa, fora da cascata, para tarefa de erro caro e irreversível | você + código |
| 13 | Passo 3 | trilha registra tier usado, se escalou, gasto acumulado, limite do tenant | código |
| 14 | Passo 4 | log: caso que o Tier 1 resolve sozinho | execução |
| 15 | Passo 4 | log: caso que a cascata escala para o Tier 2 (ou além) | execução |
| 16 | Passo 4 | log: caso bloqueado por orçamento antes de qualquer chamada de modelo | execução |
| 17 | Passo 5 | uma frase: que sinal indicaria que a cascata de dois tiers precisa virar três | você |

## Proibições do enunciado

- Copiar o limiar do TrialForge (`0,75`, específico do `nomic-embed-text` em português).
- Repetir o TrialForge como caso.
