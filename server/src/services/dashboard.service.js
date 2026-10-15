import { resumoEstoque, listarProdutosParaRepor } from './produtos.service.js';
import { listarMovimentacoes } from './movimentacoes.service.js';

// Quantos itens cada bloco do dashboard mostra (é um resumo; a lista completa fica nas outras páginas)
const LIMITE_PRODUTOS = 5;
const LIMITE_MOVIMENTACOES = 8;

// Tudo vem do banco, reaproveitando as mesmas consultas das outras telas,
// para os números do dashboard nunca divergirem das demais páginas.
export function obterDashboard() {
  const paraRepor = listarProdutosParaRepor();

  return {
    resumo: resumoEstoque(),
    estoque_baixo: paraRepor.filter((p) => p.status === 'estoque_baixo').slice(0, LIMITE_PRODUTOS),
    sem_estoque: paraRepor.filter((p) => p.status === 'sem_estoque').slice(0, LIMITE_PRODUTOS),
    ultimas_movimentacoes: listarMovimentacoes({ limite: LIMITE_MOVIMENTACOES }),
  };
}
