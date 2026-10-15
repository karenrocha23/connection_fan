import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, CircleCheck, PackageMinus, PackagePlus, PackageX, Package, Plus, TriangleAlert } from 'lucide-react';
import { api } from '../services/api.js';
import { dataCurta, hora, numero, unidades } from '../utils/formatar.js';
import ResumoCard from '../components/ResumoCard.jsx';
import TipoBadge from '../components/TipoBadge.jsx';
import Aviso from '../components/Aviso.jsx';

// Ex.: "Havaianas Top Preto 37/38"
const nomeCompleto = (p) => [p.nome, p.cor, p.tamanho].filter(Boolean).join(' ');

// Bloco com a lista resumida de produtos (estoque baixo ou sem estoque)
function ListaProdutos({ titulo, subtitulo, Icone, tom, corNumero, total, produtos, vazio }) {
  return (
    <section className="card flex flex-col">
      <header className="flex items-center gap-3 border-b border-areia-200 px-5 py-4">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tom}`}>
          <Icone size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{titulo}</h2>
          <p className="text-sm text-tinta/60">{subtitulo}</p>
        </div>
        {total > 0 && (
          <Link to="/estoque-baixo" className="shrink-0 text-sm font-medium text-mar-700 hover:underline">
            Ver todos ({total})
          </Link>
        )}
      </header>

      {produtos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CircleCheck size={22} aria-hidden="true" />
          </span>
          <p className="mt-2 text-sm text-tinta/70">{vazio}</p>
        </div>
      ) : (
        <ul className="divide-y divide-areia-200">
          {produtos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
              <div className="min-w-0">
                <Link to={`/produtos/${p.id}`} className="font-medium hover:underline">
                  {nomeCompleto(p)}
                </Link>
                <p className="text-xs text-tinta/60">{p.categoria}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-bold ${corNumero}`}>{unidades(p.quantidade_estoque)}</p>
                  <p className="text-xs text-tinta/60">Mínimo: {p.estoque_minimo}</p>
                </div>
                <Link
                  to={`/entrada?produto=${p.id}`}
                  className="btn btn-secundario btn-sm"
                  aria-label={`Registrar entrada de ${nomeCompleto(p)}`}
                >
                  <PackagePlus size={16} aria-hidden="true" /> Repor
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.obterDashboard().then(setDados).catch((e) => setErro(e.message));
  }, []);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <section>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-tinta/60">Situação do estoque em {hoje}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/entrada" className="btn btn-primario">
            <PackagePlus size={18} aria-hidden="true" /> Registrar entrada
          </Link>
          <Link to="/saida" className="btn btn-secundario">
            <PackageMinus size={18} aria-hidden="true" /> Registrar saída
          </Link>
          <Link to="/produtos/novo" className="btn btn-secundario">
            <Plus size={18} aria-hidden="true" /> Novo produto
          </Link>
        </div>
      </header>

      {erro && <div className="mt-4"><Aviso>{erro}</Aviso></div>}
      {!dados && !erro && <p className="mt-6 text-tinta/60">Carregando…</p>}

      {dados && (
        <>
          {/* Cards principais */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResumoCard titulo="Total de produtos" valor={numero(dados.resumo.total_produtos)} Icone={Boxes} para="/produtos" />
            <ResumoCard titulo="Itens em estoque" valor={numero(dados.resumo.total_unidades)} Icone={Package} para="/produtos" />
            <ResumoCard titulo="Estoque baixo" valor={numero(dados.resumo.estoque_baixo)} Icone={TriangleAlert} tom="bg-amber-100 text-amber-700" para="/estoque-baixo" />
            <ResumoCard titulo="Sem estoque" valor={numero(dados.resumo.sem_estoque)} Icone={PackageX} tom="bg-red-100 text-red-700" para="/estoque-baixo" />
          </div>

          {/* Reposição */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ListaProdutos
              titulo="Estoque baixo"
              subtitulo="Precisam de reposição"
              Icone={TriangleAlert}
              tom="bg-amber-100 text-amber-700"
              corNumero="text-amber-700"
              total={dados.resumo.estoque_baixo}
              produtos={dados.estoque_baixo}
              vazio="Nenhum produto com estoque baixo."
            />
            <ListaProdutos
              titulo="Sem estoque"
              subtitulo="Quantidade zerada"
              Icone={PackageX}
              tom="bg-red-100 text-red-700"
              corNumero="text-red-700"
              total={dados.resumo.sem_estoque}
              produtos={dados.sem_estoque}
              vazio="Nenhum produto sem estoque."
            />
          </div>

          {/* Últimas movimentações */}
          <section className="card mt-6">
            <header className="flex items-center justify-between gap-3 px-5 py-4">
              <h2 className="font-bold">Últimas movimentações</h2>
              <Link to="/historico" className="text-sm font-medium text-mar-700 hover:underline">Ver histórico</Link>
            </header>

            {dados.ultimas_movimentacoes.length === 0 ? (
              <p className="border-t border-areia-200 px-5 py-8 text-center text-sm text-tinta/60">
                Nenhuma movimentação registrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-y border-areia-200 bg-areia-50 text-tinta/70">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">Produto</th>
                      <th className="px-5 py-2.5 font-semibold">Tipo</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Quantidade</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.ultimas_movimentacoes.map((m) => (
                      <tr key={m.id} className="border-b border-areia-200 last:border-0">
                        <td className="px-5 py-3 font-medium">{m.produto_nome}</td>
                        <td className="px-5 py-3"><TipoBadge tipo={m.tipo} /></td>
                        <td className={`px-5 py-3 text-right font-bold ${m.tipo === 'entrada' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {m.tipo === 'entrada' ? '+' : '−'}{m.quantidade}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <p>{dataCurta(m.data)}</p>
                          <p className="text-xs text-tinta/60">{hora(m.data)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
