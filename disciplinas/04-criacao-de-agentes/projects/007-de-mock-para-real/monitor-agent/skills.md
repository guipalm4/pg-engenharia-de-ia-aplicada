# habilidades.md

> Define as ferramentas.
> Nao implementa.
> So define interface.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `habilidades` | lista | Lista de ferramentas que o agente sabe usar. Cada habilidade e uma interface — o runtime gera a implementacao mock automaticamente. |
| `habilidades[].nome` | string | Identificador unico da ferramenta. Deve ser o mesmo nome usado em `toolbox.md` e `rules.md`. |
| `habilidades[].descricao` | string | Texto descritivo injetado no prompt da LLM para que ela saiba quando e por que usar esta ferramenta. |
| `habilidades[].entrada` | objeto | Parametros que a ferramenta recebe. Cada chave e o nome do parametro e o valor e o tipo (`string`, `int`, `float`, `bool`, `list`, `object`). |
| `habilidades[].saida` | objeto | Campos retornados pela ferramenta. Mesma estrutura de chave/tipo. O runtime usa isso para gerar valores mock realistas. |

> **Tipos suportados:**
> - `string` — texto livre
> - `int` — numero inteiro
> - `float` — numero decimal
> - `bool` — verdadeiro ou falso
> - `list` — lista de objetos
> - `object` — objeto livre (usado para dados compostos como evidencias)

---

```yaml
habilidades:
  - nome: consultar_metricas
    descricao: consulta metricas de latencia, throughput e taxa de erro do servico
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_minutos: int
    saida:
      latencia_p99_ms: float
      vazao_rps: int
      taxa_erro: float
      status: string
    conexao:
      endpoint: /api/v1/metrics
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 30

  - nome: buscar_logs
    descricao: busca logs estruturados do servico em uma janela de tempo
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_minutos: int
      nivel_minimo: string
    saida:
      eventos: list
      contagem_total: int
    conexao:
      endpoint: /api/v1/logs
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 30

  - nome: historico_deploys
    descricao: consulta historico de deploys recentes do servico
    tipo_implementacao: rest
    entrada:
      nome_servico: string
      janela_tempo_horas: int
    saida:
      deploys: list
      contagem_total: int
    conexao:
      endpoint: /api/v1/deploys
      metodo: GET
      timeout_segundos: 10
      retries: 2
      autenticacao: header_api_key
    limites:
      chamadas_por_minuto: 20

  - nome: relatorio_incidente
    descricao: abre incidente formal com evidencias e recomendacao de acao
    tipo_implementacao: mock
    entrada:
      nome_servico: string
      severidade: string
      evidencia: object
      recomendacao: object
    saida:
      id_incidente: string
      status: string
```
