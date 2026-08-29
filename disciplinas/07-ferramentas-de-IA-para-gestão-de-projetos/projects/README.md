# 🧭 Ferramentas de IA para Gestão de Projetos

Projetos da disciplina **Ferramentas de IA para Gestão de Projetos** — Pós-Graduação em Engenharia
de IA Aplicada, UniPDS.

Cada pasta `NNN-*` é um módulo da disciplina. Ao contrário das trilhas anteriores, **estes projetos
não são código**: o artefato central de cada módulo é um *system prompt* executado sobre um insumo
fixo, e o que se documenta é a **iteração sobre esse prompt** — o output da primeira execução, as
falhas encontradas, a alteração feita e a comparação entre as duas versões.

Os dez módulos percorrem um caso único, o **RouteWise** (sistema de gestão de frota com 140
veículos), da transcrição de uma reunião de discovery até um portfólio com OKRs validados. A
herança entre os módulos é **documental**: o backlog construído no M1 é a entrada do scoring do M2,
que alimenta o cronograma do M3, confrontado com o forecast do M4, e assim por diante.

## 📂 Anatomia de um módulo

```bash
NNN-slug/
├── README.md          # material de consulta — conceitos e como reproduzir
├── ENTREGA.md         # o relato da iteração de prompt (V1 → falhas → V2 → comparação)
├── prompts/
│   ├── v1.ref         # ponteiro para o prompt original (caminho + sha256)
│   └── v2.md          # sua versão, com a alteração
└── outputs/
    ├── v1.md          # output da primeira execução, com procedência no cabeçalho
    └── v2.md          # output após a alteração
```

**`README.md` e `ENTREGA.md` têm vozes opostas, de propósito.** O README apresenta o módulo a quem
chega daqui a um ano e segue o template canônico do repositório; o ENTREGA.md é a análise crítica da
execução, que é justamente o que o template proíbe. Separá-los é o que evita que um degrade o outro.

**O material autoral do professor não é redistribuído aqui.** System prompts, transcrições, CSVs e
PDFs ficam no repositório gabarito e são referenciados por caminho + `sha256` nos arquivos `.ref`.

## 🔁 Fluxo por módulo

```bash
/novo-modulo NNN-slug     # estrutura + referências + leitura da atividade
/roda-prompt NNN v1       # executa em subagente de contexto limpo
#   ← você analisa as falhas e decide a alteração
/roda-prompt NNN v2       # executa a versão revisada, em subagente novo
/entrega-modulo NNN       # escreve o ENTREGA.md
/finaliza-projeto NNN     # README + índice raiz + commits
```

O subagente de contexto limpo existe por um motivo específico: se o output fosse produzido por uma
sessão que já leu o gabarito resolvido, a análise das falhas seria circular.

## 🛠️ Stack

- **Engine:** Claude — a adaptação está autorizada no material da disciplina, que documenta o uso em
  plataformas além do AI Studio.
- **Boards:** Jira Cloud (plano gratuito), com Automation Rules nativas
- **Comunicação:** Slack (plano gratuito)
- **Códigos:** Node.js e Python — Monte Carlo (M4), Danger (M8), bot de ecossistema (M9)
- **CI:** GitHub Actions

> **Sobre temperatura:** o material da disciplina especifica temperatura 0.2–0.3 em vários módulos.
> Essa instrução é do AI Studio e **não tem equivalente nos modelos Claude atuais**, onde o
> parâmetro foi removido. Consequência prática registrada em cada `ENTREGA.md`: uma diferença entre
> V1 e V2 só conta como efeito do prompt **se ela reproduzir** — diferença que não reproduz é ruído
> de amostragem, e é tratada como tal.

---

*UNIPDS — Pós-graduação em Engenharia de Software com IA Aplicada*
