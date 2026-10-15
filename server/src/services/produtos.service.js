import db from '../database/db.js';
import { validarProduto, ErroValidacao } from './produtos.validacao.js';

// Status calculado direto no SQL, para ficar sempre consistente:
//   sem_estoque   -> quantidade = 0
//   estoque_baixo -> 0 < quantidade <= estoque mínimo
//   normal        -> quantidade > estoque mínimo
const COLUNAS = `
  id, nome, categoria, codigo, cor, tamanho, modelo, preco,
  quantidade_estoque, estoque_minimo, criado_em,
  CASE
    WHEN quantidade_estoque = 0 THEN 'sem_estoque'
    WHEN quantidade_estoque <= estoque_minimo THEN 'estoque_baixo'
    ELSE 'normal'
  END AS status
`;

export function listarProdutos({ busca, status } = {}) {
  let sql = `SELECT * FROM (SELECT ${COLUNAS} FROM produtos) WHERE 1 = 1`;
  const params = [];

  if (busca) {
    const termo = `%${busca}%`;
    sql += ` AND (nome LIKE ? OR codigo LIKE ? OR categoria LIKE ?
                  OR cor LIKE ? OR tamanho LIKE ? OR modelo LIKE ?)`;
    params.push(termo, termo, termo, termo, termo, termo);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY nome COLLATE NOCASE';
  return db.prepare(sql).all(...params);
}

// Produtos que precisam ser repostos: sem estoque ou com estoque <= mínimo.
// Ordem: primeiro os sem estoque; depois os de menor quantidade.
export function listarProdutosParaRepor() {
  return db.prepare(`
    SELECT * FROM (SELECT ${COLUNAS} FROM produtos)
    WHERE status != 'normal'
    ORDER BY CASE status WHEN 'sem_estoque' THEN 0 ELSE 1 END,
             quantidade_estoque,
             nome COLLATE NOCASE
  `).all();
}

export function buscarProdutoPorId(id) {
  return db.prepare(`SELECT ${COLUNAS} FROM produtos WHERE id = ?`).get(id);
}

export function listarCategorias() {
  return db
    .prepare('SELECT DISTINCT categoria FROM produtos ORDER BY categoria COLLATE NOCASE')
    .all()
    .map((l) => l.categoria);
}

export function resumoEstoque() {
  return db.prepare(`
    SELECT
      COUNT(*)                                                                          AS total_produtos,
      COALESCE(SUM(quantidade_estoque), 0)                                              AS total_unidades,
      COALESCE(SUM(quantidade_estoque > 0 AND quantidade_estoque <= estoque_minimo), 0) AS estoque_baixo,
      COALESCE(SUM(quantidade_estoque = 0), 0)                                          AS sem_estoque
    FROM produtos
  `).get();
}

// Código é único, sem diferenciar maiúsculas de minúsculas
function codigoEmUso(codigo, ignorarId = 0) {
  return Boolean(
    db.prepare('SELECT 1 FROM produtos WHERE lower(codigo) = lower(?) AND id != ?').get(codigo, ignorarId)
  );
}

const CODIGO_DUPLICADO = { codigo: 'Já existe um produto com este código.' };

export function criarProduto(dados) {
  const p = validarProduto(dados, { criacao: true });
  if (codigoEmUso(p.codigo)) throw new ErroValidacao(CODIGO_DUPLICADO, 409);

  const inserirProduto = db.prepare(`
    INSERT INTO produtos (nome, categoria, codigo, cor, tamanho, modelo, preco, quantidade_estoque, estoque_minimo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const inserirMov = db.prepare(`
    INSERT INTO movimentacoes (produto_id, tipo, quantidade, estoque_anterior, estoque_posterior)
    VALUES (?, 'entrada', ?, 0, ?)
  `);

  // Produto + registro do estoque inicial na mesma transação
  const salvar = db.transaction(() => {
    const { lastInsertRowid } = inserirProduto.run(
      p.nome, p.categoria, p.codigo, p.cor, p.tamanho, p.modelo, p.preco, p.estoque_inicial, p.estoque_minimo
    );
    const id = Number(lastInsertRowid);
    if (p.estoque_inicial > 0) inserirMov.run(id, p.estoque_inicial, p.estoque_inicial);
    return id;
  });

  return buscarProdutoPorId(salvar());
}

// A quantidade em estoque NÃO é editável aqui: ela só muda por entradas e saídas.
export function atualizarProduto(id, dados) {
  if (!buscarProdutoPorId(id)) return null;

  const p = validarProduto(dados, { criacao: false });
  if (codigoEmUso(p.codigo, id)) throw new ErroValidacao(CODIGO_DUPLICADO, 409);

  db.prepare(`
    UPDATE produtos
    SET nome = ?, categoria = ?, codigo = ?, cor = ?, tamanho = ?, modelo = ?, preco = ?, estoque_minimo = ?
    WHERE id = ?
  `).run(p.nome, p.categoria, p.codigo, p.cor, p.tamanho, p.modelo, p.preco, p.estoque_minimo, id);

  return buscarProdutoPorId(id);
}
