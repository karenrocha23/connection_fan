import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, PackageMinus, PackagePlus, Pencil } from 'lucide-react';
import { api } from '../services/api.js';
import { dataHora, moeda } from '../utils/formatar.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Aviso from '../components/Aviso.jsx';

const mensagemStatus = {
  normal: 'O estoque está acima do mínimo.',
  estoque_baixo: 'O estoque está no mínimo ou abaixo dele. Planeje a reposição.',
  sem_estoque: 'Produto esgotado.',
};

function Item({ rotulo, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta/60">{rotulo}</dt>
      <dd className="mt-0.5 font-medium">{children || <span className="text-tinta/40">Não informado</span>}</dd>
    </div>
  );
}

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const { state } = useLocation();
  const [produto, setProduto] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setProduto(null);
    setErro('');
    api.buscarProduto(id).then(setProduto).catch((e) => setErro(e.message));
    api.listarMovimentacoes({ produtoId: id }).then(setMovimentacoes).catch(() => {});
  }, [id]);

  if (erro) {
    return (
      <section className="space-y-4">
        <Aviso>{erro}</Aviso>
        <Link to="/produtos" className="btn btn-secundario">Voltar para produtos</Link>
      </section>
    );
  }
  if (!produto) return <p className="text-tinta/60">Carregando…</p>;

  return (
    <section>
      <Link to="/produtos" className="inline-flex items-center gap-1.5 text-sm font-medium text-mar-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para produtos
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          <p className="mt-1 text-tinta/60">{produto.codigo}</p>
        </div>
        <Link to={`/produtos/${produto.id}/editar`} className="btn btn-primario">
          <Pencil size={18} aria-hidden="true" /> Editar produto
        </Link>
      </header>

      {state?.aviso && <div className="mt-4"><Aviso tipo="sucesso">{state.aviso}</Aviso></div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold">Dados do produto</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Item rotulo="Categoria">{produto.categoria}</Item>
            <Item rotulo="Preço">{moeda(produto.preco)}</Item>
            <Item rotulo="Cor">{produto.cor}</Item>
            <Item rotulo="Tamanho">{produto.tamanho}</Item>
            <Item rotulo="Modelo">{produto.modelo}</Item>
            <Item rotulo="Cadastrado em">{dataHora(produto.criado_em)}</Item>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Estoque</h2>
          <p className="mt-4 text-5xl font-bold leading-none">{produto.quantidade_estoque}</p>
          <p className="mt-1 text-sm text-tinta/60">unidades disponíveis</p>
          <div className="mt-4"><StatusBadge status={produto.status} /></div>
          <p className="mt-3 text-sm">{mensagemStatus[produto.status]}</p>
          <p className="mt-3 border-t border-areia-200 pt-3 text-sm text-tinta/70">
            Estoque mínimo: <span className="font-semibold text-tinta">{produto.estoque_minimo}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/entrada?produto=${produto.id}`} className="btn btn-secundario btn-sm">
              <PackagePlus size={16} aria-hidden="true" /> Registrar entrada
            </Link>
            <Link to={`/saida?produto=${produto.id}`} className="btn btn-secundario btn-sm">
              <PackageMinus size={16} aria-hidden="true" /> Registrar saída
            </Link>
          </div>
        </div>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="font-bold">Últimas movimentações</h2>
          <Link to={`/historico?produto=${produto.id}`} className="text-sm font-medium text-mar-700 hover:underline">
            Ver todas
          </Link>
        </div>
        {movimentacoes.length === 0 ? (
          <p className="px-5 pb-5 pt-2 text-sm text-tinta/60">Este produto ainda não tem movimentações.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-y border-areia-200 bg-areia-50 text-tinta/70">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Data</th>
                <th className="px-5 py-2.5 font-semibold">Tipo</th>
                <th className="px-5 py-2.5 text-right font-semibold">Quantidade</th>
                <th className="px-5 py-2.5 text-right font-semibold">Estoque após</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.slice(0, 5).map((m) => (
                <tr key={m.id} className="border-b border-areia-200 last:border-0">
                  <td className="px-5 py-2.5 text-tinta/70">{dataHora(m.data)}</td>
                  <td className={`px-5 py-2.5 font-semibold ${m.tipo === 'entrada' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </td>
                  <td className="px-5 py-2.5 text-right">{m.quantidade}</td>
                  <td className="px-5 py-2.5 text-right font-semibold">{m.estoque_posterior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
