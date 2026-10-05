# Skill: arq-roda

Executa um script do protótipo do módulo **$ARGUMENTS** (disciplina 08) e grava o log em
`outputs/<script>-NN.md` com cabeçalho de procedência. Se o script escreve trilha de auditoria, ela
vai para `outputs/<script>-NN.audit-trail.jsonl`, ao lado do log.

`$ARGUMENTS` é `NNN [script] [stdin=r1,r2,...]`:

- `script`: nome do arquivo em `src/`, sem `.js` (`gateway`, `calibra-limiar`). Sem ele, usa o
  `main` do `src/package.json`.
- `stdin=`: respostas do Approval Gate, em ordem, separadas por vírgula (`stdin=s,n`). Viram uma
  por linha no stdin do processo.

Exemplos: `/arq-roda 004 calibra-limiar` · `/arq-roda 004 gateway stdin=s,n`

## Por que não há subagente aqui

Na 07 o output era texto de modelo, e quem o produzia não podia ter visto o gabarito. Aqui o que
roda é `node`: o resultado não depende de quem digita o comando. O rigor está na procedência: que
script, que modelos, que stdin, que custo.

## Passos

### 1. Resolver e executar (script único)

```bash
BASE="disciplinas/08-arquitetura-de-sistemas-com-IA/projects"
# `cut`/`grep`, nunca $1/$2: o harness substitui esses tokens no texto antes do shell.
NUM=$(echo "$ARGUMENTS" | cut -d' ' -f1 | grep -oE '[0-9]+')
SCRIPT=$(echo "$ARGUMENTS" | tr ' ' '\n' | sed -n '2,$p' | grep -v '^stdin=' | head -1)
STDIN=$(echo "$ARGUMENTS" | tr ' ' '\n' | grep '^stdin=' | sed 's/^stdin=//')
P=$(find "$BASE" -maxdepth 1 -type d -name "$(printf %03d $((10#$NUM)))-*" | head -1)
[ -d "$P/src" ] || { echo "PARE: $P/src não existe — rode /arq-implementa $NUM"; exit 1; }
[ -n "$OPENROUTER_API_KEY" ] || { echo "PARE: OPENROUTER_API_KEY ausente (defina em ~/.config/zsh/secrets.zsh)"; exit 1; }
[ -z "$SCRIPT" ] && SCRIPT=$(node -p "require('./$P/src/package.json').main.replace(/\.js$/,'')")
[ -f "$P/src/$SCRIPT.js" ] || { echo "PARE: $P/src/$SCRIPT.js não existe"; exit 1; }

# NN sequencial por script: gateway-01, gateway-02... Nunca sobrescreve uma execução anterior.
N=$(find "$P/outputs" -maxdepth 1 -name "$SCRIPT-[0-9][0-9].md" | wc -l | tr -d ' ')
NN=$(printf %02d $((N + 1)))
OUT="$P/outputs/$SCRIPT-$NN.md"
RAW="$P/outputs/.$SCRIPT-$NN.raw"
AUDIT="$(pwd)/$P/outputs/$SCRIPT-$NN.audit-trail.jsonl"

cd "$P/src"
if [ -n "$STDIN" ]; then
  echo "$STDIN" | tr ',' '\n' | AUDIT_TRAIL="$AUDIT" node "$SCRIPT.js" > "../outputs/.$SCRIPT-$NN.raw" 2>&1
else
  AUDIT_TRAIL="$AUDIT" node "$SCRIPT.js" < /dev/null > "../outputs/.$SCRIPT-$NN.raw" 2>&1
fi
EXIT=$?
cd - > /dev/null

echo "OUT=$OUT  EXIT=$EXIT"
echo "MODELOS:"; grep -hoE "const MODELO_[A-Z0-9_]+ *= *['\"][^'\"]+['\"]" "$P"/src/*.js | sort -u
echo "CUSTO:"; grep -E '^\[Custo\] total' "$RAW" | tail -1
echo "AUDIT:"; [ -f "$AUDIT" ] && wc -l < "$AUDIT" || echo "(nenhuma trilha escrita)"
echo "=== primeiras e últimas linhas ==="; head -20 "$RAW"; echo "..."; tail -15 "$RAW"
```

Um `outputs/audit-trail.jsonl` sem prefixo de script significa que o script ignora `AUDIT_TRAIL`. Isso é
bug do `src/` (convenção do `/arq-implementa`): corrija antes de rodar de novo.

### 2. Gravar com procedência

```bash
{ cat <<EOF
---
script: src/$SCRIPT.js
comando: node $SCRIPT.js${STDIN:+  (stdin: $STDIN)}
modelos: <constantes MODELO_* do passo 1, uma por linha>
engine: OpenRouter
node: $(node -v)
custo_total_usd: <valor da linha [Custo], ou "não reportado">
exit_code: $EXIT
trilha: $( [ -f "$AUDIT" ] && basename "$AUDIT" || echo "—" )
gerado_em: <data de currentDate>
---

\`\`\`text
EOF
  cat "$RAW"
  echo '```'
} > "$OUT" && rm "$RAW"
```

O log vai inteiro para o `.md`. Não resuma e não corte: é a evidência que a entrega cita. Não use
extensão `.log`, porque `*.log` está no `.gitignore` e o arquivo sumiria do commit sem aviso.

### 3. Relatório

Uma tela, no máximo:

- Onde gravou, exit code e custo.
- **Cobertura da checklist**: os itens de `entrega/checklist.md` com dono `execução` que este
  log cobre ou não cobre. É leitura mecânica do log e da trilha, não julgamento. Ex.: *"o M4 pede
  4 casos; a trilha mostra `cache_hit: true` em 1 e `gate_acionado: true` em 2, e o gate por
  confiança baixa não aparece"*.
- Se este é um re-run do mesmo script: o que mudou em relação à execução anterior, em números.
- Se o exit code não é 0: a última linha de erro e a causa provável no código. Não conserte aqui;
  isso é `/arq-implementa`.

## O que esta skill deliberadamente NÃO faz

**Não escolhe limiar a partir da calibração.** Ela grava a tabela de similaridades. A escolha, com
folga, é do usuário (M4 Passo 2, M5 Passo 2).

**Não altera `src/` para fazer um caso aparecer.** Se o gate por confiança baixa não disparou, a
pergunta de teste ou o limiar é que estão errados, e as duas coisas são decisão do usuário.
