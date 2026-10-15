import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Eye, PackageX, Pencil, Plus, Search, TriangleAlert, Package } from 'lucide-react';
import { api } from '../services/api.js';
import { moeda } from '../utils/formatar.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ResumoCard from '../components/ResumoCard.jsx';
import Variacao from '../components/Variacao.jsx';
import Aviso from '../components/Aviso.jsx';

function Acoes({ produto }) {
  return (
    <div className="flex justify-end gap-2">
      <Link to={`/produtos/${produto.id}`} className="btn btn-secundario btn-sm" aria-label={`Visualizar ${produto.nome}`}>
        <Eye size={16} aria-hidden="true" /> Ver
      </Link>
      <Link to={`/produtos/${produto.id}/editar`} className="btn btn-secundario btn-sm" aria-label={`Editar ${produto.nome}`}>
        <Pencil size={16} aria-hidden="true" /> Editar
      </Link>
    </div>
  );
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.resumoEstoque().then(setResumo).catch((e) => setErro(e.message));
  }, []);

  // Busca com pequena espera, para não consultar a cada tecla digitada
  useEffect(() => {
    let ativo = true;
    const espera = setTimeout(() => {
      api
        .listarProdutos({ busca: busca.trim(), status })
        .then((lista) => {
          if (!ativo) return;
          setProdutos(lista);
          setErro('');
        })
        .catch((e) => ativo && setErro(e.message))
        .finally(() => ativo && setCarregando(false));
    }, 250);
    return () => {
      ativo = false;
      clearTimeout(espera);
    };
  }, [busca, status]);

  const filtrando = busca.trim() !== '' || status !== '';

  return (
    <section>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="mt-1 text-tinta/60">Consulte o estoque e mantenha o cadastro em dia.</p>
        </div>
        <Link to="/produtos/novo" className="btn btn-primario">
          <Plus size={18} aria-hidden="true" /> Novo produto
        </Link>
      </header>

      {erro && <div className="mt-4"><Aviso>{erro}</Aviso></div>}

      {resumo && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumoCard titulo="Produtos cadastrados" valor={resumo.total_produtos} Icone={Boxes} />
          <ResumoCard titulo="Unidades em estoque" valor={resumo.total_unidades} Icone={Package} />
          <ResumoCard titulo="Estoque baixo" valor={resumo.estoque_baixo} Icone={TriangleAlert} tom="bg-amber-100 text-amber-700" />
          <ResumoCard titulo="Sem estoque" valor={resumo.sem_estoque} Icone={PackageX} tom="bg-red-100 text-red-700" />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta/50" aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, código, cor ou tamanho"
            aria-label="Buscar produtos"
            className="campo pl-10"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status" className="campo sm:w-52">
          <option value="">Todos os status</option>
          <option value="normal">Estoque normal</option>
          <option value="estoque_baixo">Estoque baixo</option>
          <option value="sem_estoque">Sem estoque</option>
        </select>
      </div>

      {!carregando && produtos.length === 0 && !erro ? (
        <div className="card mt-4 px-6 py-12 text-center">
          <p className="font-semibold">{filtrando ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
          <p className="mt-1 text-sm text-tinta/60">
            {filtrando ? 'Ajuste a busca ou o filtro para ver outros produtos.' : 'Cadastre o primeiro produto para começar.'}
          </p>
          {!filtrando && (
            <Link to="/produtos/novo" className="btn btn-primario mt-4">
              <Plus size={18} aria-hidden="true" /> Novo produto
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tabela (telas médias e grandes) */}
          <div className="card mt-4 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-areia-200 bg-areia-50 text-tinta/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Variação</th>
                  <th className="px-4 py-3 text-right font-semibold">Preço</th>
                  <th className="px-4 py-3 text-right font-semibold">Estoque</th>
                  <th className="px-4 py-3 text-right font-semibold">Mínimo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id} className="border-b border-areia-200 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.nome}</p>
                      <p className="text-xs text-tinta/60">{p.codigo}</p>
                    </td>
                    <td className="px-4 py-3">{p.categoria}</td>
                    <td className="px-4 py-3"><Variacao produto={p} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">{moeda(p.preco)}</td>
                    <td className="px-4 py-3 text-right text-base font-bold">{p.quantidade_estoque}</td>
                    <td className="px-4 py-3 text-right">{p.estoque_minimo}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><Acoes produto={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões (celular) */}
          <ul className="mt-4 space-y-3 md:hidden">
            {produtos.map((p) => (
              <li key={p.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-xs text-tinta/60">{p.categoria} · {p.codigo}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3"><Variacao produto={p} /></div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="text-tinta/60">Preço</dt><dd className="font-semibold">{moeda(p.preco)}</dd></div>
                  <div><dt className="text-tinta/60">Estoque</dt><dd className="font-semibold">{p.quantidade_estoque}</dd></div>
                  <div><dt className="text-tinta/60">Mínimo</dt><dd className="font-semibold">{p.estoque_minimo}</dd></div>
                </dl>
                <div className="mt-3"><Acoes produto={p} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
