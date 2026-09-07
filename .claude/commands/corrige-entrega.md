# Skill: corrige-entrega

Corrige a entrega de um módulo da disciplina 07 contra **o enunciado e a rubrica** — nada além
disso. Conserta o que é mecânico e aponta o que falta para o nível pedido.

`$ARGUMENTS` é `NNN` opcionalmente seguido do nível (`002 basico`). Sem nível, corrige contra o
nível da pasta que existir em `entrega/`; se houver mais de uma, corrige a mais recente.

---

## A régua, e só ela

Três arquivos definem o que é "certo". Leia os três **antes** de olhar a entrega:

| Arquivo | O que define |
|---|---|
| `material/Atividade - Módulo N.pdf` | o enunciado — o que a atividade pede, literalmente |
| `entrega/rubrica.md` | os critérios do nível |
| `material/Exemplo - Módulo N.pdf` | a **profundidade** esperada, resolvida pelo professor |

Fora daí não existe critério. Se um problema que você identificou não viola o enunciado, não viola
a rubrica do nível pedido e não destoa do exemplo, **ele não é um problema** — não reporte.

### O exemplo do professor é o teto, não o piso

O `Exemplo - Módulo N.pdf` é uma execução completa do case, assinada pelo professor, com o nível de
rubrica declarado no rodapé. Ele é curto: no M2, duas páginas, três user stories "para brevidade",
duas flags com plano de três linhas, um parágrafo de reflexão.

Entrega mais longa ou mais densa que o exemplo **não precisa de mais conteúdo**. Se precisa de algo,
é de corte. Nunca sugira aprofundar além do que o exemplo faz.

### O case é fictício, e o dado inventado é o método

RouteWise e Conecta Cargas não existem. Não há analytics, não há stakeholder para entrevistar, não
há relatório interno. O próprio exemplo do professor resolve a Parte 3 assim:

> *"Dado histórico encontrado no relatório interno: no último ano, 5 dos 7 sinistros registrados
> tiveram excesso de velocidade como fator causal. Custo médio por sinistro: R$ 28.000."*

Sem fonte, sem norma, sem citação. **Arbitrar o número dentro do case é o exercício.**

Portanto, é **proibido** nesta correção:

- exigir fonte pública, benchmark de mercado, norma citável ou procedência auditável;
- rotular dado do case como "premissa não verificada", "risco de avaliação" ou equivalente;
- levantar que o repositório é público, que alguém pode ler o número como fato, ou qualquer
  consideração sobre publicação;
- propor busca na web para ancorar valor do case.

Se o usuário arbitrou um número, ele cumpriu o enunciado. Declare o tipo de fonte que o número
representaria dentro do case (*dado financeiro da operação*, *exigência regulatória*) e siga.

### Corrija contra o nível pedido, e só ele

Critério do nível acima **não é pendência**. Numa entrega Básica, "falta a análise causal" é ruído:
isso é Intermediário. Mencione o nível seguinte no máximo em uma linha, ao final, e só se o usuário
já tiver a matéria-prima para subir.

---

## Passos

### 1. Reunir

```bash
BASE="disciplinas/07-ferramentas-de-IA-para-gestao-de-projetos/projects"
PROJECT=$(find "$BASE" -maxdepth 1 -type d -name "*$ARGUMENTS*" | head -1)
echo "PROJECT=$PROJECT"
find "$PROJECT/entrega" -type f | sort
find "$PROJECT/outputs" "$PROJECT/prompts" "$PROJECT/material" -type f ! -name ".DS_Store" | sort
```

Leia: os dois PDFs de `material/`, `entrega/rubrica.md`, a entrega escrita, e os outputs de
`outputs/` que a entrega cita.

### 2. Checagem mecânica

Isto é objetivo e vale sempre:

- **Aritmética.** Recalcule RICE (`Reach × Impact × Confidence / Effort`) e WSJF (`CoD / Job Size`)
  de cada linha das tabelas coladas na entrega.
- **Transcrição entre rodadas.** Compare o que a entrega colou com o output que ela declara estar
  citando. Texto da V1 dentro de uma seção rotulada V2 é o erro mais comum e o mais caro — foi o
  que aconteceu no M2, com uma flag da V1 contradizendo o Effort da tabela da V2 logo acima.
- **Cobertura.** Se a rubrica pede "um parágrafo por Flag", conte as flags do output e as da
  entrega. Reporte quais faltam, nominalmente.
- **Contagens declaradas.** "5 User Stories" com seis linhas na tabela, "Missão #01" no módulo 02.
- **Formatação.** Tabela com header e corpo de larguras diferentes não renderiza; crase solta abre
  code span que corrompe a linha; seção numerada sem cabeçalho. O Ctrl+S do editor reformata
  tabelas e costuma quebrar exatamente isso.
- **Português.** Acentuação, crase, grafia. Convenção inviolável do repo.

### 3. Corrigir

**Você conserta, sem perguntar:** formatação, ortografia, títulos e contagens erradas, aritmética,
trechos transcritos da rodada errada, seções faltando na estrutura.

**Você não escreve:** plano de resolução de flag, falha identificada, causa provável no prompt,
análise causal, reflexão. É julgamento do usuário e é o que a rubrica avalia. Deixe
`**Plano:** <!-- PREENCHER -->` no lugar e diga quantos ficaram.

### 4. Relatar

Curto. Nesta ordem:

1. **O que consertei** — lista, uma linha cada.
2. **O que falta para o nível pedido** — só o que a rubrica daquele nível exige e não está lá,
   nominalmente ("faltam os planos de US02, US04 e US05").
3. Nada mais. Sem "pontos de atenção", sem risco de nota, sem sugestão de aprofundamento.

Se a entrega cumpre a rubrica do nível, diga isso em uma linha e encerre.

---

## O que esta skill deliberadamente NÃO faz

**Não escala o rigor.** É exercício de aula. O enunciado é o teto — não paper, não auditoria, não
produção. Achado que não viola enunciado, rubrica ou exemplo não entra no relatório.

**Não escreve a análise.** Corrigir a entrega é diferente de fazê-la. O que a rubrica avalia
continua sendo do usuário.

**Não usa o exemplo do professor como gabarito de conteúdo.** Ele calibra formato e profundidade.
Divergir dos números dele é esperado — o próprio PDF diz: *"não copie os números"*.
