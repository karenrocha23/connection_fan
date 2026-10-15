import db from './db.js';

// Cada produto tem: dados + entrada e saída iniciais.
// Estoque final = entrada - saída (assim o histórico fica coerente).
const produtos = [
  { nome: 'Havaianas Top',     categoria: 'Chinelos', codigo: 'HAV-TOP-PT-3738', cor: 'Preto',  tamanho: '37/38', modelo: 'Top',         preco: 54.9,  minimo: 5, entrada: 30, saida: 5 },  // 25 normal
  { nome: 'Havaianas Slim',    categoria: 'Chinelos', codigo: 'HAV-SLM-BR-3536', cor: 'Branco', tamanho: '35/36', modelo: 'Slim',        preco: 59.9,  minimo: 5, entrada: 10, saida: 6 },  // 4 baixo
  { nome: 'Bolsa Transversal', categoria: 'Bolsas',   codigo: 'BOL-TRV-PT',      cor: 'Preta',  tamanho: null,    modelo: 'Transversal', preco: 89.9,  minimo: 3, entrada: 15, saida: 3 },  // 12 normal
  { nome: 'Bolsa Casual',      categoria: 'Bolsas',   codigo: 'BOL-CAS-MR',      cor: 'Marrom', tamanho: null,    modelo: 'Casual',      preco: 119.9, minimo: 3, entrada: 8,  saida: 6 },  // 2 baixo
  { nome: 'Boné Trucker',      categoria: 'Bonés',    codigo: 'BON-TRK-PT',      cor: 'Preto',  tamanho: null,    modelo: 'Trucker',     preco: 49.9,  minimo: 4, entrada: 10, saida: 10 }, // 0 zerado
  { nome: 'Boné Básico',       categoria: 'Bonés',    codigo: 'BON-BAS-AZ',      cor: 'Azul',   tamanho: null,    modelo: 'Básico',      preco: 39.9,  minimo: 5, entrada: 20, saida: 5 },  // 15 normal
  { nome: 'Mochila Casual',    categoria: 'Mochilas', codigo: 'MOC-CAS-PT',      cor: 'Preta',  tamanho: null,    modelo: 'Casual',      preco: 149.9, minimo: 3, entrada: 8,  saida: 5 },  // 3 baixo (= mínimo)
  { nome: 'Mochila Escolar',   categoria: 'Mochilas', codigo: 'MOC-ESC-AZ',      cor: 'Azul',   tamanho: null,    modelo: 'Escolar',     preco: 129.9, minimo: 4, entrada: 12, saida: 3 },  // 9 normal
];

const inserirProduto = db.prepare(`
  INSERT INTO produtos (nome, categoria, codigo, cor, tamanho, modelo, preco, quantidade_estoque, estoque_minimo)
  VALUES (@nome, @categoria, @codigo, @cor, @tamanho, @modelo, @preco, @estoque, @minimo)
`);

const inserirMov = db.prepare(`
  INSERT INTO movimentacoes (produto_id, tipo, quantidade, estoque_anterior, estoque_posterior, data)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const popular = db.transaction(() => {
  // Recomeça do zero
  db.exec("DELETE FROM movimentacoes; DELETE FROM produtos; DELETE FROM sqlite_sequence;");

  produtos.forEach((p, i) => {
    const estoqueFinal = p.entrada - p.saida;
    const { lastInsertRowid: id } = inserirProduto.run({
      nome: p.nome, categoria: p.categoria, codigo: p.codigo, cor: p.cor, tamanho: p.tamanho,
      modelo: p.modelo, preco: p.preco, estoque: estoqueFinal, minimo: p.minimo,
    });

    // Datas diferentes para cada produto: entrada há ~20 dias, saída há ~5 dias
    const dataEm = (diasAtras) =>
      db.prepare("SELECT datetime('now','localtime', ?) AS d").get(`-${diasAtras} days`).d;
    const ajuste = (iso) =>
      db.prepare("SELECT datetime(?, ?) AS d").get(iso, `-${i} hours`).d;

    inserirMov.run(id, 'entrada', p.entrada, 0, p.entrada, ajuste(dataEm(20)));
    inserirMov.run(id, 'saida', p.saida, p.entrada, estoqueFinal, ajuste(dataEm(5)));
  });
});

popular();
console.log(`Banco populado: ${produtos.length} produtos e ${produtos.length * 2} movimentações.`);
