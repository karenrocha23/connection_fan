import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  listarCategorias,
  listarProdutosParaRepor,
  resumoEstoque,
  criarProduto,
  atualizarProduto,
} from '../services/produtos.service.js';

const router = Router();

const lerId = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};
const naoEncontrado = (res) => res.status(404).json({ erro: 'Produto não encontrado.' });

// GET /api/produtos?busca=havaianas&status=estoque_baixo
router.get('/', (req, res) => {
  const { busca, status } = req.query;
  res.json(listarProdutos({ busca: busca?.trim(), status }));
});

// Rotas fixas ficam ANTES de /:id
router.get('/resumo', (_req, res) => res.json(resumoEstoque()));
router.get('/reposicao', (_req, res) => res.json(listarProdutosParaRepor()));
router.get('/categorias', (_req, res) => res.json(listarCategorias()));

// POST /api/produtos
router.post('/', (req, res) => {
  res.status(201).json(criarProduto(req.body));
});

// GET /api/produtos/:id
router.get('/:id', (req, res) => {
  const id = lerId(req);
  const produto = id && buscarProdutoPorId(id);
  if (!produto) return naoEncontrado(res);
  res.json(produto);
});

// PUT /api/produtos/:id
router.put('/:id', (req, res) => {
  const id = lerId(req);
  const produto = id && atualizarProduto(id, req.body);
  if (!produto) return naoEncontrado(res);
  res.json(produto);
});

export default router;
