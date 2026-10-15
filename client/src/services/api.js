// Camada de acesso à API. As páginas nunca chamam fetch diretamente.

export class ApiError extends Error {
  constructor(mensagem, status = 0, erros = {}) {
    super(mensagem);
    this.status = status;
    this.erros = erros; // erros por campo, ex.: { codigo: 'Já existe...' }
  }
}

async function requisitar(caminho, { method = 'GET', corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor está rodando.');
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ApiError(dados?.erro ?? 'Algo deu errado. Tente novamente.', resposta.status, dados?.erros);
  }
  return dados;
}

export const api = {
  listarProdutos: ({ busca = '', status = '' } = {}) => {
    const params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (status) params.set('status', status);
    return requisitar(`/produtos?${params}`);
  },
  buscarProduto: (id) => requisitar(`/produtos/${id}`),
  criarProduto: (dados) => requisitar('/produtos', { method: 'POST', corpo: dados }),
  atualizarProduto: (id, dados) => requisitar(`/produtos/${id}`, { method: 'PUT', corpo: dados }),
  listarCategorias: () => requisitar('/produtos/categorias'),
  listarProdutosParaRepor: () => requisitar('/produtos/reposicao'),
  obterDashboard: () => requisitar('/dashboard'),
  resumoEstoque: () => requisitar('/produtos/resumo'),
  registrarEntrada: (dados) => requisitar('/movimentacoes/entrada', { method: 'POST', corpo: dados }),
  registrarSaida: (dados) => requisitar('/movimentacoes/saida', { method: 'POST', corpo: dados }),
  listarMovimentacoes: ({ produtoId, tipo, dataInicio, dataFim } = {}) => {
    const params = new URLSearchParams();
    if (produtoId) params.set('produtoId', produtoId);
    if (tipo) params.set('tipo', tipo);
    if (dataInicio) params.set('dataInicio', dataInicio);
    if (dataFim) params.set('dataFim', dataFim);
    const texto = params.toString();
    return requisitar(`/movimentacoes${texto ? `?${texto}` : ''}`);
  },
};
