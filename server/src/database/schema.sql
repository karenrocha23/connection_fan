-- Controle de Estoque - esquema do banco (SQLite)

CREATE TABLE IF NOT EXISTS produtos (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nome               TEXT    NOT NULL,
  categoria          TEXT    NOT NULL,
  codigo             TEXT    NOT NULL UNIQUE,
  cor                TEXT,
  tamanho            TEXT,
  modelo             TEXT,
  preco              REAL    NOT NULL CHECK (preco >= 0),
  quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
  estoque_minimo     INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  criado_em          TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id        INTEGER NOT NULL,
  tipo              TEXT    NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade        INTEGER NOT NULL CHECK (quantidade > 0),
  estoque_anterior  INTEGER NOT NULL CHECK (estoque_anterior >= 0),
  estoque_posterior INTEGER NOT NULL CHECK (estoque_posterior >= 0),
  data              TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes (produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data    ON movimentacoes (data);
