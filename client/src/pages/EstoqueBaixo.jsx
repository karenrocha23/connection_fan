import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Eye, PackagePlus, PackageX, TriangleAlert } from 'lucide-react';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ResumoCard from '../components/ResumoCard.jsx';
import Variacao from '../components/Variacao.jsx';
import Segmentado from '../components/Segmentado.jsx';
import Aviso from '../components/Aviso.jsx';

// Destaque de cada status: fundo da linha, faixa lateral e cor do número
const destaque = {
  sem_estoque: { linha: 'bg-red-50/70', faixa: 'border-l-red-500', numero: 'text-red-700' },
  estoque_baixo: { linha: 'bg-amber-50/70', faixa: 'border-l-amber-500', numero: 'text-amber-700' },
};

function Acoes({ produto }) {
  return (
    <div className="flex justify-end gap-2">
      <Link to={`/entrada?produto=${produto.id}`} className="btn btn-primario btn-sm" aria-label={`Registrar entrada de ${produto.nome}`}>
        <PackagePlus size={16} aria-hidden="true" /> Registrar entrada
      </Link>
      <Link to={`/produtos/${produto.id}`} className="btn btn-secundario btn-sm" aria-label={`Visualizar ${produto.nome}`}>
        <Eye size={16} aria-hidden="true" /> Ver
      </Link>
    </div>
  );
}

export default function EstoqueBaixo() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api
      .listarProdutosParaRepor()
      .then(setProdutos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const semEstoque = produtos.filter((p) => p.status === 'sem_estoque').length;
  const baixo = produtos.filter((p) => p.status === 'estoque_baixo').length;
  const visiveis = filtro ? produtos.filter((p) => p.status === filtro) : produtos;

  return (
    <section>
      <header>
        <h1 className="text-2xl font-bold">Estoque Baixo</h1>
        <p className="mt-1 text-tinta/60">Produtos sem estoque ou no mínimo, para você saber o que repor primeiro.</p>
      </header>

      {erro && <div className="mt-4"><Aviso>{erro}</Aviso></div>}

      {!carregando && !erro && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ResumoCard titulo="Precisam de reposição" valor={produtos.length} Icone={TriangleAlert} />
            <ResumoCard titulo="Sem estoque" valor={semEstoque} Icone={PackageX} tom="bg-red-100 text-red-700" />
            <ResumoCard titulo="Estoque baixo" valor={baixo} Icone={TriangleAlert} tom="bg-amber-100 text-amber-700" />
          </div>

          {produtos.length === 0 ? (
            <div className="card mt-6 px-6 py-12 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CircleCheck size={26} aria-hidden="true" />
              </span>
              <p className="mt-3 font-semibold">Nenhum produto precisa de reposição</p>
              <p className="mt-1 text-sm text-tinta/60">Todos os produtos estão acima do estoque mínimo.</p>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <Segmentado
                  rotulo="Filtrar por situação"
                  valor={filtro}
                  onChange={setFiltro}
                  opcoes={[
                    { valor: '', rotulo: 'Todos', contagem: produtos.length },
                    { valor: 'sem_estoque', rotulo: 'Sem estoque', contagem: semEstoque },
                    { valor: 'estoque_baixo', rotulo: 'Estoque baixo', contagem: baixo },
                  ]}
                />
              </div>

              {visiveis.length === 0 ? (
                <div className="card mt-4 px-6 py-10 text-center text-sm text-tinta/60">
                  Nenhum produto nesta situação.
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
                          <th className="px-4 py-3 text-right font-semibold">Estoque atual</th>
                          <th className="px-4 py-3 text-right font-semibold">Estoque mínimo</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiveis.map((p) => {
                          const d = destaque[p.status];
                          return (
                            <tr key={p.id} className={`border-b border-areia-200 last:border-0 ${d.linha}`}>
                              <td className={`border-l-4 px-4 py-3 ${d.faixa}`}>
                                <p className="font-medium">{p.nome}</p>
                                <p className="text-xs text-tinta/60">{p.codigo}</p>
                              </td>
                              <td className="px-4 py-3">{p.categoria}</td>
                              <td className="px-4 py-3"><Variacao produto={p} /></td>
                              <td className={`px-4 py-3 text-right text-xl font-bold ${d.numero}`}>{p.quantidade_estoque}</td>
                              <td className="px-4 py-3 text-right">{p.estoque_minimo}</td>
                              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                              <td className="px-4 py-3"><Acoes produto={p} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cartões (celular) */}
                  <ul className="mt-4 space-y-3 md:hidden">
                    {visiveis.map((p) => {
                      const d = destaque[p.status];
                      return (
                        <li key={p.id} className={`card border-l-4 p-4 ${d.faixa} ${d.linha}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{p.nome}</p>
                              <p className="text-xs text-tinta/60">{p.categoria}</p>
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                          <div className="mt-3"><Variacao produto={p} /></div>
                          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <dt className="text-tinta/60">Estoque atual</dt>
                              <dd className={`text-xl font-bold ${d.numero}`}>{p.quantidade_estoque}</dd>
                            </div>
                            <div>
                              <dt className="text-tinta/60">Estoque mínimo</dt>
                              <dd className="text-xl font-bold">{p.estoque_minimo}</dd>
                            </div>
                          </dl>
                          <div className="mt-3"><Acoes produto={p} /></div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
