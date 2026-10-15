'use strict';

/**
 * Fila de mensagens do Anotaí (Missão #03): pagamento de fatura informado ao bot, passando por
 * Recepção → Extrator → Orquestrador → Dono (Handoff) → Orquestrador, por EventEmitter.
 *
 * Sem chamada de modelo: o enunciado avalia a comunicação assíncrona, e o Extrator devolve uma
 * proposta fixa (SIMULADA) no contrato do PRD §10. O que se mostra aqui é que as partes concordam
 * sobre o mesmo estado: reentrega não vira segunda mensagem, e toque repetido não vira segundo
 * pagamento.
 *
 * Uso: echo s | node fila.js   (a resposta do Confirmar vem pelo stdin)
 */

const { EventEmitter } = require('node:events');
const fs = require('node:fs');

// Sem TTY, lê o stdin inteiro ANTES do primeiro await: um readline recriado a cada pergunta
// perde respostas vindas de pipe.
const respostas = process.stdin.isTTY ? [] : fs.readFileSync(0, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);

const fila = new EventEmitter();
const log = (componente, texto) => console.log(`[${componente}] ${texto}`);

// Estado compartilhado (o "Postgres" do protótipo). As chaves únicas são as da RN-14.
const db = {
  mensagens: new Map(), // `${canal}:${id_externo}` → mensagem
  extracoes: new Map(), // mensagem_id → extracao válida
  pendencias: new Map(), // interacao_id → { status, ... }
  pagamentos: [],
  faturas: [
    { id: 'fat-ago', cartao: 'Nubank', periodo_fim: '2026-08-28', valor_total: 150000, valor_pago: 0 },
    { id: 'fat-set', cartao: 'Nubank', periodo_fim: '2026-09-28', valor_total: 180000, valor_pago: 0 },
  ],
};
const reais = (c) => `R$ ${(c / 100).toFixed(2).replace('.', ',')}`;
const saldo = (f) => f.valor_total - f.valor_pago;

// ---------- Recepção (Gateway): grava antes de qualquer IA; reentrega é descartada ----------
function recepcao({ canal, id_externo, texto }) {
  const chave = `${canal}:${id_externo}`;
  if (db.mensagens.has(chave)) {
    log('Recepção', `reentrega de ${chave} descartada (RN-14)`);
    return;
  }
  const mensagem = { id: `msg-${db.mensagens.size + 1}`, texto, status: 'enfileirada' };
  db.mensagens.set(chave, mensagem);
  log('Recepção', `gravou ${mensagem.id} "${texto}" e enfileirou`);
  fila.emit('mensagem:recebida', { mensagem_id: mensagem.id, texto });
}

// ---------- Extrator (SIMULADO): uma proposta no contrato do PRD §10 ----------
fila.on('mensagem:recebida', ({ mensagem_id, texto }) => {
  if (db.extracoes.has(mensagem_id)) {
    log('Agente:Extrator', `${mensagem_id} já tem Extracao válida; não chama a IA de novo (RN-14)`);
  } else {
    const proposta = { intencao: 'pagar_fatura', operacao: { cartao_apelido: 'Nubank', valor: 2000 } };
    db.extracoes.set(mensagem_id, { id: `ext-${mensagem_id}`, proposta });
    log('Agente:Extrator', `proposta para "${texto}": ${JSON.stringify(proposta)}`);
  }
  const extracao = db.extracoes.get(mensagem_id);
  fila.emit('extracao:valida', { mensagem_id, extracao_id: extracao.id, proposta: extracao.proposta });
});

// ---------- Orquestrador: acha o alvo por regra e passa a decisão ao dono (Handoff) ----------
fila.on('extracao:valida', ({ mensagem_id, proposta }) => {
  const { cartao_apelido, valor } = proposta.operacao;
  const alvo = db.faturas.filter((f) => f.cartao === cartao_apelido && saldo(f) > 0);
  if (alvo.length === 0) {
    log('Orquestrador', `sem Fatura fechada com saldo no ${cartao_apelido}; nada grava`);
    return;
  }
  const interacao_id = `int-${mensagem_id}`;
  const centavos = Math.round(valor * 100);
  db.pendencias.set(interacao_id, { status: 'aberta', mensagem_id, cartao_apelido, centavos });
  const resumo = `Pagar ${reais(centavos)} no ${cartao_apelido}: ` + alvo.map((f) => `fatura ${f.periodo_fim} saldo ${reais(saldo(f))}`).join(' · ');
  fila.emit('confirmacao:pedida', { interacao_id, resumo });
});

// ---------- Dono (Approval Gate humano): responde pelo stdin ----------
fila.on('confirmacao:pedida', ({ interacao_id, resumo }) => {
  log('Approval Gate', `${resumo}. Confirmar? (s/n)`);
  const resposta = respostas.shift() || 'n';
  log('Dono', `respondeu "${resposta}"`);
  fila.emit('confirmacao:respondida', { interacao_id, decisao: resposta === 's' ? 'confirmar' : 'cancelar' });
});

// ---------- Orquestrador: executa a RN-26 só com a pendência aberta ----------
fila.on('confirmacao:respondida', ({ interacao_id, decisao }) => {
  const pendencia = db.pendencias.get(interacao_id);
  // Revalida no toque (RN-23): pendência já concluída não executa de novo.
  if (!pendencia || pendencia.status !== 'aberta') {
    log('Orquestrador', `${interacao_id} já está ${pendencia?.status}; toque repetido ignorado`);
    return;
  }
  if (decisao !== 'confirmar') {
    pendencia.status = 'cancelada';
    log('Orquestrador', `${interacao_id} cancelada; nada grava`);
    return;
  }
  // RN-26: da Fatura fechada mais antiga para a mais nova, cada uma até o seu saldo.
  let restante = pendencia.centavos;
  for (const f of db.faturas.filter((x) => x.cartao === pendencia.cartao_apelido && saldo(x) > 0)) {
    const aplicado = Math.min(restante, saldo(f));
    f.valor_pago += aplicado;
    restante -= aplicado;
    db.pagamentos.push({ fatura_id: f.id, valor: aplicado, mensagem_id: pendencia.mensagem_id });
    log('Orquestrador', `PagamentoFatura ${reais(aplicado)} na fatura ${f.periodo_fim} → ${saldo(f) === 0 ? 'paga' : `paga_parcial, saldo ${reais(saldo(f))}`}`);
    if (restante === 0) break;
  }
  pendencia.status = 'concluida';
  db.mensagens.forEach((m) => { if (m.id === pendencia.mensagem_id) m.status = 'processada'; });
});

// ---------- Demonstração ----------
const update = { canal: 'telegram', id_externo: '12345:678', texto: 'paguei a fatura do Nubank, 2 mil' };
recepcao(update);
recepcao(update); // o Telegram reentrega a mesma atualização
fila.emit('confirmacao:respondida', { interacao_id: 'int-msg-1', decisao: 'confirmar' }); // toque repetido

console.log(`\n[Estado] mensagens=${db.mensagens.size} · pagamentos=${db.pagamentos.length} · ` +
  db.faturas.map((f) => `${f.id} pago ${reais(f.valor_pago)} de ${reais(f.valor_total)}`).join(' · '));
console.log('[Custo] total: US$ 0.000000');
