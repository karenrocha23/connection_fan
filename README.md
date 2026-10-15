# Controle de Estoque (MVP acadêmico)

Stack: React + Vite + Tailwind CSS (client) · Node.js + Express + SQLite/better-sqlite3 (server).

## Como executar

Requisito: Node.js 18 ou superior.

```bash
npm run install:all   # instala dependências da raiz, do server e do client
npm run seed          # cria o banco e insere os dados de teste
npm run dev           # sobe API (3001) e site (5173) juntos
```

Abra http://localhost:5173

## Estrutura

```
server/src
  database/   schema.sql, db.js (conexão), seed.js (dados fictícios)
  routes/     rotas HTTP
  services/   consultas ao banco, validação e dashboard.service.js
client/src
  components/ Layout, StatusBadge, TipoBadge, ResumoCard, Variacao, Campo, Aviso, Segmentado
  pages/      Dashboard, Produtos, ProdutoForm, ProdutoDetalhe, EstoqueBaixo, RegistrarMovimentacao (entrada e saída), Historico
  services/   api.js (chamadas à API)
  utils/      formatar.js (moeda, datas, preço), estoque.js (status e quantidade)
  styles/     index.css (Tailwind, paleta e classes .btn, .campo, .card)
```

## Telas

- `/` Dashboard (tela inicial): cards, reposição e últimas movimentações
- `/produtos` lista com busca, filtro por status e cartões de resumo
- `/produtos/novo` cadastro
- `/produtos/:id` visualização
- `/produtos/:id/editar` edição
- `/estoque-baixo` produtos sem estoque ou no mínimo, para repor
- `/entrada` registrar entrada de mercadorias
- `/saida` registrar saída de produtos
- `/historico` todas as movimentações, com filtros por tipo, produto e período

## Status do estoque

- estoque > mínimo: normal
- 0 < estoque <= mínimo: baixo
- estoque = 0: sem estoque

## Endpoints

- GET  /api/dashboard   (resumo, estoque baixo, sem estoque e últimas movimentações)
- GET  /api/produtos?busca=&status=normal|estoque_baixo|sem_estoque
- POST /api/produtos
- GET  /api/produtos/:id
- PUT  /api/produtos/:id  (não altera a quantidade em estoque)
- GET  /api/produtos/categorias
- GET  /api/produtos/resumo
- GET  /api/produtos/reposicao   (sem estoque ou estoque <= mínimo; sem estoque primeiro)
- GET  /api/movimentacoes?produtoId=&tipo=entrada|saida&dataInicio=AAAA-MM-DD&dataFim=AAAA-MM-DD
- POST /api/movimentacoes/entrada   corpo: { "produto_id": 1, "quantidade": 20 }
- POST /api/movimentacoes/saida     corpo: { "produto_id": 1, "quantidade": 2 }

## Regras de movimentação

- Quantidade deve ser um inteiro maior que zero.
- Saída maior que o estoque é recusada (HTTP 409): "Estoque insuficiente. Há apenas X unidades disponíveis."
- Estoque, histórico e data são gravados juntos, em uma única transação: se algo falhar, nada é salvo.
- O status do produto é calculado a cada consulta, então muda sozinho após cada movimentação.
