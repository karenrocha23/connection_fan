import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import movimentacoesRoutes from './routes/movimentacoes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { ErroValidacao } from './services/produtos.validacao.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/saude', (_req, res) => res.json({ ok: true }));
app.use('/api/produtos', produtosRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Tratamento de erros
app.use((err, _req, res, _next) => {
  if (err instanceof ErroValidacao) {
    return res.status(err.status).json({ erro: err.message, erros: err.erros });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Os dados enviados são inválidos.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

export default app;
