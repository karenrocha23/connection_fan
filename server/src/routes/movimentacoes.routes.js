import { Router } from 'express';
import { listarMovimentacoes, lerFiltros, registrarMovimentacao } from '../services/movimentacoes.service.js';

const router = Router();

// GET /api/movimentacoes?produtoId=1&tipo=entrada&dataInicio=2026-10-01&dataFim=2026-10-05
router.get('/', (req, res) => {
  res.json(listarMovimentacoes(lerFiltros(req.query)));
});

// O tipo vem da rota, e não do corpo da requisição.
// Corpo esperado: { "produto_id": 1, "quantidade": 20 }
const registrar = (tipo) => (req, res) => {
  const { produto_id, quantidade } = req.body ?? {};
  res.status(201).json(registrarMovimentacao({ tipo, produtoId: produto_id, quantidade }));
};

router.post('/entrada', registrar('entrada'));
router.post('/saida', registrar('saida'));

export default router;
