import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { History, PackageMinus, PackagePlus, X } from 'lucide-react';
import { api } from '../services/api.js';
import { dataCurta, hora } from '../utils/formatar.js';
import TipoBadge from '../components/TipoBadge.jsx';
import ResumoCard from '../components/ResumoCard.jsx';
import Segmentado from '../components/Segmentado.jsx';
import Aviso from '../components/Aviso.jsx';

const TIPOS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'entrada', rotulo: 'Entradas' },
  { valor: 'saida', rotulo: 'Saídas' },
];

const unidades = (n) => `${n} ${n === 1 ? 'unidade' : 'unidades'}`;

// Quantidade com sinal: +20 (entrada) ou −2 (saída)
function Quantidade({ mov }) {
  const entrada = mov.tipo === 'entrada';
  return (
    <span className={`font-bold ${entrada ? 'text-emerald-700' : 'text-red-700'}`}>
      {entrada ? '+' : '−'}{mov.quantidade}
    </span>
  );
}

export default function Historico() {
  const [params] = useSearchParams();

  const [tipo, setTipo] = useState('');
  const [produtoId, setProdutoId] = useState(params.get('produto') ?? '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [produtos, setProdutos] = useState([]);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const periodoInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);
  const filtrando = Boolean(tipo || produtoId || dataInicio || dataFim);

  useEffect(() => {
    api.listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  // Busca de novo sempre que um filtro muda
  useEffect(() => {
    if (periodoInvalido) return undefined;
    let ativo = true;
    setCarregando(true);
    api
      .listarMovimentacoes({ produtoId, tipo, dataInicio, dataFim })
      .then((dados) => {
        if (!ativo) return;
        setLista(dados);
        setErro('');
      })
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [produtoId, tipo, dataInicio, dataFim, periodoInvalido]);

  const limparFiltros = () => {
    setTipo('');
    setProdutoId('');
    setDataInicio('');
    setDataFim('');
  };

  const entradas = lista.filter((m) => m.tipo === 'entrada').reduce((soma, m) => soma + m.quantidade, 0);
  const saidas = lista.filter((m) => m.tipo === 'saida').reduce((soma, m) => soma + m.quantidade, 0);

  return (
    <section>
      <header>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="mt-1 text-tinta/60">Todas as entradas e saídas de estoque, da mais recente para a mais antiga.</p>
      </header>

      {/* Filtros */}
      <div className="card mt-6 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="mb-1 text-sm font-semibold">Tipo</p>
            <Segmentado rotulo="Filtrar por tipo" opcoes={TIPOS} valor={tipo} onChange={setTipo} />
          </div>

          <div className="min-w-48 flex-1 sm:max-w-xs">
            <label htmlFor="filtro-produto" className="mb-1 block text-sm font-semibold">Produto</label>
            <select id="filtro-produto" className="campo" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
              <option value="">Todos os produtos</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{[p.nome, p.cor, p.tamanho].filter(Boolean).join(' – ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="data-inicio" className="mb-1 block text-sm font-semibold">De</label>
            <input
              id="data-inicio"
              type="date"
              className="campo"
              value={dataInicio}
              max={dataFim || undefined}
              aria-invalid={periodoInvalido ? 'true' : 'false'}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="data-fim" className="mb-1 block text-sm font-semibold">Até</label>
            <input
              id="data-fim"
              type="date"
              className="campo"
              value={dataFim}
              min={dataInicio || undefined}
              aria-invalid={periodoInvalido ? 'true' : 'false'}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          {filtrando && (
            <button type="button" onClick={limparFiltros} className="btn btn-secundario">
              <X size={16} aria-hidden="true" /> Limpar filtros
            </button>
          )}
        </div>
        {periodoInvalido && (
          <p role="alert" className="mt-3 text-sm text-red-700">A data inicial não pode ser depois da data final.</p>
        )}
      </div>

      {erro && <div className="mt-4"><Aviso>{erro}</Aviso></div>}

      {!periodoInvalido && !erro && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ResumoCard titulo="Movimentações" valor={lista.length} Icone={History} />
            <ResumoCard titulo="Entradas" valor={`+${entradas}`} Icone={PackagePlus} tom="bg-emerald-100 text-emerald-700" />
            <ResumoCard titulo="Saídas" valor={`−${saidas}`} Icone={PackageMinus} tom="bg-red-100 text-red-700" />
          </div>

          {carregando && lista.length === 0 ? (
            <p className="mt-4 text-tinta/60">Carregando…</p>
          ) : lista.length === 0 ? (
            <div className="card mt-4 px-6 py-12 text-center">
              <p className="font-semibold">
                {filtrando ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação registrada'}
              </p>
              <p className="mt-1 text-sm text-tinta/60">
                {filtrando
                  ? 'Ajuste ou limpe os filtros para ver outros registros.'
                  : 'As entradas e saídas aparecerão aqui assim que forem lançadas.'}
              </p>
            </div>
          ) : (
            <>
              {/* Tabela (telas médias e grandes) */}
              <div className="card mt-4 hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-areia-200 bg-areia-50 text-tinta/70">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Produto</th>
                      <th className="px-4 py-3 text-right font-semibold">Quantidade</th>
                      <th className="px-4 py-3 text-right font-semibold">Estoque (antes → depois)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((m) => (
                      <tr key={m.id} className="border-b border-areia-200 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3">
                          <p>{dataCurta(m.data)}</p>
                          <p className="text-xs text-tinta/60">{hora(m.data)}</p>
                        </td>
                        <td className="px-4 py-3"><TipoBadge tipo={m.tipo} /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{m.produto_nome}</p>
                          <p className="text-xs text-tinta/60">{m.produto_codigo}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-base"><Quantidade mov={m} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <span className="text-tinta/60">{m.estoque_anterior}</span>
                          <span className="mx-2 text-tinta/40" aria-label="para">→</span>
                          <span className="font-bold">{m.estoque_posterior}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cartões (celular) */}
              <ul className="mt-4 space-y-3 md:hidden">
                {lista.map((m) => (
                  <li key={m.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <TipoBadge tipo={m.tipo} />
                      <p className="text-right text-xs text-tinta/60">{dataCurta(m.data)} às {hora(m.data)}</p>
                    </div>
                    <p className="mt-3 font-semibold">{m.produto_nome}</p>
                    <p className="text-xs text-tinta/60">{m.produto_codigo}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-tinta/60">Quantidade</dt>
                        <dd className="text-lg"><Quantidade mov={m} /></dd>
                      </div>
                      <div>
                        <dt className="text-tinta/60">Estoque</dt>
                        <dd className="text-lg">
                          <span className="text-tinta/60">{m.estoque_anterior}</span>
                          <span className="mx-1.5 text-tinta/40" aria-label="para">→</span>
                          <span className="font-bold">{m.estoque_posterior}</span>
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
