import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PackageMinus, PackagePlus } from 'lucide-react';
import { api } from '../services/api.js';
import { calcularStatus, lerQuantidade, mensagemEstoqueInsuficiente } from '../utils/estoque.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Variacao from '../components/Variacao.jsx';
import Campo from '../components/Campo.jsx';
import Aviso from '../components/Aviso.jsx';

// Entrada e saída usam a mesma tela; só mudam os textos e a operação.
const CONFIG = {
  entrada: {
    titulo: 'Registrar entrada',
    descricao: 'Lance as mercadorias recebidas para somar ao estoque.',
    Icone: PackagePlus,
    rotuloQuantidade: 'Quantidade recebida',
    rotuloOperacao: 'Entrada',
    botao: 'Confirmar entrada',
    cor: 'text-emerald-700',
    sinal: '+',
    registrar: (dados) => api.registrarEntrada(dados),
  },
  saida: {
    titulo: 'Registrar saída',
    descricao: 'Lance os produtos retirados para descontar do estoque.',
    Icone: PackageMinus,
    rotuloQuantidade: 'Quantidade retirada',
    rotuloOperacao: 'Saída',
    botao: 'Confirmar saída',
    cor: 'text-red-700',
    sinal: '−',
    registrar: (dados) => api.registrarSaida(dados),
  },
};

const unidades = (n) => `${n} ${n === 1 ? 'unidade' : 'unidades'}`;

const nomeNaLista = (p) => [p.nome, p.cor, p.tamanho].filter(Boolean).join(' – ');

export default function RegistrarMovimentacao({ tipo }) {
  const cfg = CONFIG[tipo];
  const [params] = useSearchParams();

  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [erroProduto, setErroProduto] = useState('');
  const [erroQuantidade, setErroQuantidade] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregarProdutos = () =>
    api.listarProdutos().then(setProdutos).catch((e) => setErroGeral(e.message));

  // Carrega os produtos e, se vier de um produto específico (?produto=ID), já o seleciona
  useEffect(() => {
    api
      .listarProdutos()
      .then((lista) => {
        setProdutos(lista);
        const pre = params.get('produto');
        if (pre && lista.some((p) => String(p.id) === pre)) setProdutoId(pre);
      })
      .catch((e) => setErroGeral(e.message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const produto = produtos.find((p) => String(p.id) === produtoId);
  const lida = lerQuantidade(quantidade);

  // Validação ao vivo, enquanto digita
  let erroAoVivo = lida.erro ?? '';
  if (!erroAoVivo && lida.valor && produto && tipo === 'saida' && lida.valor > produto.quantidade_estoque) {
    erroAoVivo = mensagemEstoqueInsuficiente(produto.quantidade_estoque);
  }
  const erroExibido = erroQuantidade || erroAoVivo;

  // Prévia do resultado
  const quantidadeValida = lida.valor !== undefined && !erroAoVivo;
  const novoEstoque =
    produto && quantidadeValida
      ? tipo === 'entrada' ? produto.quantidade_estoque + lida.valor : produto.quantidade_estoque - lida.valor
      : null;

  const limparMensagens = () => {
    setSucesso('');
    setErroGeral('');
    setErroQuantidade('');
  };

  async function confirmar(evento) {
    evento.preventDefault();
    limparMensagens();
    setErroProduto('');

    if (!produto) return setErroProduto('Selecione um produto.');
    if (lida.vazio) return setErroQuantidade('Informe a quantidade.');
    if (erroAoVivo) return document.getElementById('quantidade')?.focus();

    setEnviando(true);
    try {
      const { produto: atualizado } = await cfg.registrar({ produto_id: produto.id, quantidade: lida.valor });
      setSucesso(
        `${cfg.rotuloOperacao} registrada: ${unidades(lida.valor)} de ${atualizado.nome}. ` +
          `Novo estoque: ${atualizado.quantidade_estoque}.`
      );
      setQuantidade('');
      await carregarProdutos();
      document.getElementById('quantidade')?.focus();
    } catch (e) {
      if (e.erros?.quantidade) setErroQuantidade(e.erros.quantidade);
      else if (e.erros?.produto_id) setErroProduto(e.erros.produto_id);
      else setErroGeral(e.message);
      // O estoque pode ter mudado desde que a tela foi aberta: atualiza os números
      if (e.status === 409 || e.status === 404) carregarProdutos();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="max-w-5xl">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-lg bg-mar-100 text-mar-700">
          <cfg.Icone size={22} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{cfg.titulo}</h1>
          <p className="text-tinta/60">{cfg.descricao}</p>
        </div>
      </header>

      <div className="mt-5 space-y-3">
        {sucesso && (
          <Aviso tipo="sucesso">
            {sucesso}{' '}
            <Link to="/historico" className="font-semibold underline">Ver histórico</Link>
          </Aviso>
        )}
        {erroGeral && <Aviso>{erroGeral}</Aviso>}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <form onSubmit={confirmar} noValidate className="card space-y-5 p-5 lg:col-span-3">
          <div>
            <label htmlFor="produto" className="mb-1 block text-sm font-semibold">Produto</label>
            <select
              id="produto"
              className="campo"
              value={produtoId}
              disabled={carregando}
              aria-invalid={erroProduto ? 'true' : 'false'}
              aria-describedby={erroProduto ? 'produto-erro' : undefined}
              onChange={(e) => {
                setProdutoId(e.target.value);
                setErroProduto('');
                limparMensagens();
              }}
            >
              <option value="">{carregando ? 'Carregando produtos…' : 'Selecione um produto'}</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{nomeNaLista(p)}</option>
              ))}
            </select>
            {erroProduto && <p id="produto-erro" role="alert" className="mt-1 text-sm text-red-700">{erroProduto}</p>}
            {!carregando && produtos.length === 0 && !erroGeral && (
              <p className="mt-1 text-sm text-tinta/60">
                Nenhum produto cadastrado. <Link to="/produtos/novo" className="font-semibold text-mar-700 underline">Cadastrar produto</Link>
              </p>
            )}
          </div>

          <Campo
            id="quantidade"
            rotulo={cfg.rotuloQuantidade}
            obrigatorio
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex.: 10"
            value={quantidade}
            erro={erroExibido}
            onChange={(e) => {
              setQuantidade(e.target.value);
              limparMensagens();
            }}
          />

          <button type="submit" className="btn btn-primario w-full sm:w-auto" disabled={enviando}>
            <cfg.Icone size={18} aria-hidden="true" />
            {enviando ? 'Registrando…' : cfg.botao}
          </button>
        </form>

        <aside className="card p-5 lg:col-span-2" aria-live="polite">
          <h2 className="font-bold">Resumo da operação</h2>

          {!produto ? (
            <p className="mt-3 text-sm text-tinta/60">Selecione um produto para ver o estoque atual.</p>
          ) : (
            <>
              <div className="mt-3">
                <p className="font-semibold">{produto.nome}</p>
                <p className="text-xs text-tinta/60">{produto.codigo}</p>
                <div className="mt-2"><Variacao produto={produto} /></div>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-tinta/70">Estoque atual</dt>
                  <dd className="text-lg font-bold">{produto.quantidade_estoque}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-tinta/70">{cfg.rotuloOperacao}</dt>
                  <dd className={`text-lg font-bold ${cfg.cor}`}>
                    {quantidadeValida ? `${cfg.sinal}${lida.valor}` : '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-areia-200 pt-3">
                  <dt className="font-semibold">Novo estoque</dt>
                  <dd className="text-2xl font-bold">{novoEstoque ?? '—'}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2 border-t border-areia-200 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-tinta/70">Status atual</span>
                  <StatusBadge status={produto.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-tinta/70">Status após a operação</span>
                  {novoEstoque === null ? (
                    <span className="text-tinta/40">—</span>
                  ) : (
                    <StatusBadge status={calcularStatus(novoEstoque, produto.estoque_minimo)} />
                  )}
                </div>
                <p className="pt-1 text-xs text-tinta/60">Estoque mínimo: {produto.estoque_minimo}</p>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
