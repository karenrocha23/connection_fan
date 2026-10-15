import db from '../database/db.js';
import { ErroValidacao } from './produtos.validacao.js';
import { buscarProdutoPorId } from './produtos.service.js';

const QUANTIDADE_MAXIMA = 1_000_000;

const SELECT_MOVIMENTACAO = `
  SELECT m.id, m.produto_id, p.nome AS produto_nome, p.codigo AS produto_codigo,
         m.tipo, m.quantidade, m.estoque_anterior, m.estoque_posterior, m.data
  FROM movimentacoes m
  JOIN produtos p ON p.id = m.produto_id
`;

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

// Aceita só datas reais no formato AAAA-MM-DD (rejeita, por exemplo, 2026-02-31)
function dataValida(texto) {
  if (typeof texto !== 'string' || !DATA_ISO.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

// Valida e limpa os filtros que chegam pela URL
export function lerFiltros(query = {}) {
  const { produtoId, tipo, dataInicio, dataFim } = query;
  const filtros = {};
  const erros = {};

  if (produtoId) {
    const id = Number(produtoId);
    if (Number.isInteger(id) && id > 0) filtros.produtoId = id;
    else erros.produtoId = 'Produto inválido.';
  }
  if (tipo) {
    if (tipo === 'entrada' || tipo === 'saida') filtros.tipo = tipo;
    else erros.tipo = 'Tipo inválido. Use entrada ou saida.';
  }
  if (dataInicio) {
    if (dataValida(dataInicio)) filtros.dataInicio = dataInicio;
    else erros.dataInicio = 'Data inicial inválida.';
  }
  if (dataFim) {
    if (dataValida(dataFim)) filtros.dataFim = dataFim;
    else erros.dataFim = 'Data final inválida.';
  }
  if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
    erros.dataFim = 'A data final não pode ser anterior à data inicial.';
  }

  if (Object.keys(erros).length > 0) throw new ErroValidacao(erros);
  return filtros;
}

export function listarMovimentacoes({ produtoId, tipo, dataInicio, dataFim, limite } = {}) {
  let sql = `${SELECT_MOVIMENTACAO} WHERE 1 = 1`;
  const params = [];

  if (produtoId) {
    sql += ' AND m.produto_id = ?';
    params.push(produtoId);
  }
  if (tipo) {
    sql += ' AND m.tipo = ?';
    params.push(tipo);
  }

  // Período inclusivo: do começo do primeiro dia ao fim do último
  if (dataInicio) {
    sql += ' AND date(m.data) >= ?';
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += ' AND date(m.data) <= ?';
    params.push(dataFim);
  }

  sql += ' ORDER BY m.data DESC, m.id DESC';
  if (limite) {
    sql += ' LIMIT ?';
    params.push(limite);
  }
  return db.prepare(sql).all(...params);
}

export const mensagemEstoqueInsuficiente = (disponivel) =>
  `Estoque insuficiente. Há apenas ${disponivel} ${disponivel === 1 ? 'unidade disponível' : 'unidades disponíveis'}.`;

function validarEntrada({ produtoId, quantidade }) {
  const erros = {};

  const id = Number(produtoId);
  if (produtoId === undefined || produtoId === null || produtoId === '' || !Number.isInteger(id) || id <= 0) {
    erros.produto_id = 'Selecione um produto.';
  }

  const vazia = quantidade === undefined || quantidade === null || (typeof quantidade === 'string' && quantidade.trim() === '');
  const q = vazia ? NaN : Number(quantidade);
  if (vazia) erros.quantidade = 'Informe a quantidade.';
  else if (!Number.isInteger(q)) erros.quantidade = 'Informe a quantidade com um número inteiro, como 5.';
  else if (q <= 0) erros.quantidade = 'A quantidade deve ser maior que zero.';
  else if (q > QUANTIDADE_MAXIMA) erros.quantidade = `A quantidade máxima por operação é ${QUANTIDADE_MAXIMA.toLocaleString('pt-BR')}.`;

  if (Object.keys(erros).length > 0) throw new ErroValidacao(erros);
  return { id, quantidade: q };
}

/**
 * Registra uma entrada ou saída.
 * Tudo acontece em UMA transação: se qualquer passo falhar, nada é gravado
 * (o estoque e o histórico nunca ficam inconsistentes).
 */
export function registrarMovimentacao({ tipo, produtoId, quantidade }) {
  const { id, quantidade: qtd } = validarEntrada({ produtoId, quantidade });

  const executar = db.transaction(() => {
    const atual = db.prepare('SELECT quantidade_estoque FROM produtos WHERE id = ?').get(id);
    if (!atual) throw new ErroValidacao({ produto_id: 'Produto não encontrado.' }, 404, 'Produto não encontrado.');

    const anterior = atual.quantidade_estoque;
    const posterior = tipo === 'entrada' ? anterior + qtd : anterior - qtd;

    // Nunca permite estoque negativo
    if (posterior < 0) {
      const mensagem = mensagemEstoqueInsuficiente(anterior);
      throw new ErroValidacao({ quantidade: mensagem }, 409, mensagem);
    }

    db.prepare('UPDATE produtos SET quantidade_estoque = ? WHERE id = ?').run(posterior, id);

    // A data é gravada pelo banco (padrão: data e hora locais atuais)
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO movimentacoes (produto_id, tipo, quantidade, estoque_anterior, estoque_posterior)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, tipo, qtd, anterior, posterior);

    return Number(lastInsertRowid);
  });

  const movimentacaoId = executar();
  return {
    movimentacao: db.prepare(`${SELECT_MOVIMENTACAO} WHERE m.id = ?`).get(movimentacaoId),
    produto: buscarProdutoPorId(id), // já com o status recalculado
  };
}
