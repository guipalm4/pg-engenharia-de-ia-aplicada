'use strict';

// Cliente mínimo do OpenRouter com fetch nativo: chat e embeddings pela mesma chave.
// Timeout por chamada e retry só no que é transitório (rede, 429, 5xx). Erro 4xx é
// configuração ou payload errado: repetir não resolve e só gasta tempo.

const URL_BASE = 'https://openrouter.ai/api/v1';
const TIMEOUT_MS = 30_000;
const TENTATIVAS = 3;

function chave() {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) {
    console.error('OPENROUTER_API_KEY ausente: defina a variável antes de rodar.');
    process.exit(1);
  }
  return k;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(caminho, corpo) {
  let ultimoErro;
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(URL_BASE + caminho, {
        method: 'POST',
        headers: { Authorization: `Bearer ${chave()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (resp.status === 429 || resp.status >= 500) {
        ultimoErro = new Error(`OpenRouter HTTP ${resp.status}`);
      } else {
        const json = await resp.json();
        if (!resp.ok) {
          const erro = new Error(`OpenRouter HTTP ${resp.status}: ${json.error?.message || 'erro'}`);
          erro.terminal = true;
          throw erro;
        }
        return json;
      }
    } catch (erro) {
      if (erro.terminal) throw erro;
      ultimoErro = erro;
    }
    if (tentativa < TENTATIVAS) {
      console.log(`[OpenRouter] falha transitória (${ultimoErro.message}), tentativa ${tentativa}/${TENTATIVAS}`);
      await esperar(500 * 2 ** (tentativa - 1));
    }
  }
  throw ultimoErro;
}

async function chat({ modelo, mensagens, tools, extra = {} }) {
  const json = await post('/chat/completions', {
    model: modelo,
    messages: mensagens,
    ...(tools ? { tools } : {}),
    usage: { include: true },
    ...extra,
  });
  return { mensagem: json.choices[0].message, usage: json.usage || {} };
}

async function embed({ modelo, textos }) {
  const json = await post('/embeddings', { model: modelo, input: textos });
  return { vetores: json.data.map((d) => d.embedding), usage: json.usage || {} };
}

module.exports = { chat, embed };
