// Validação e limpeza dos dados de produto (usada no cadastro e na edição).

export class ErroValidacao extends Error {
  constructor(erros, status = 400, mensagem = 'Verifique os campos informados.') {
    super(mensagem);
    this.erros = erros; // { campo: 'mensagem' }
    this.status = status;
  }
}

// Texto opcional: remove espaços e transforma vazio em null
const texto = (v) => {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === '' ? null : t;
};

const numero = (v) =>
  v === null || v === undefined || (typeof v === 'string' && v.trim() === '') ? NaN : Number(v);

const LIMITES = { nome: 100, categoria: 50, codigo: 40, cor: 30, tamanho: 20, modelo: 50 };

export function validarProduto(dados = {}, { criacao }) {
  const erros = {};

  const nome = texto(dados.nome);
  const categoria = texto(dados.categoria);
  const codigo = texto(dados.codigo);
  const cor = texto(dados.cor);
  const tamanho = texto(dados.tamanho);
  const modelo = texto(dados.modelo);

  if (!nome) erros.nome = 'Informe o nome do produto.';
  if (!categoria) erros.categoria = 'Informe a categoria.';
  if (!codigo) erros.codigo = 'Informe o código do produto.';

  for (const [campo, max] of Object.entries(LIMITES)) {
    const valor = { nome, categoria, codigo, cor, tamanho, modelo }[campo];
    if (valor && valor.length > max && !erros[campo]) {
      erros[campo] = `Use no máximo ${max} caracteres.`;
    }
  }

  const preco = numero(dados.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    erros.preco = 'Informe um preço válido, como 49,90.';
  }

  const estoqueMinimo = numero(dados.estoque_minimo);
  if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) {
    erros.estoque_minimo = 'Informe um número inteiro igual ou maior que zero.';
  }

  let estoqueInicial = 0;
  if (criacao) {
    estoqueInicial = numero(dados.estoque_inicial);
    if (!Number.isInteger(estoqueInicial) || estoqueInicial < 0) {
      erros.estoque_inicial = 'Informe um número inteiro igual ou maior que zero.';
    }
  }

  if (Object.keys(erros).length > 0) throw new ErroValidacao(erros);

  return {
    nome,
    categoria,
    codigo,
    cor,
    tamanho,
    modelo,
    preco: Math.round(preco * 100) / 100,
    estoque_minimo: estoqueMinimo,
    estoque_inicial: estoqueInicial,
  };
}
