import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../services/api.js';
import { lerPreco, precoParaCampo } from '../utils/formatar.js';
import Campo from '../components/Campo.jsx';
import Aviso from '../components/Aviso.jsx';

const vazio = {
  nome: '', categoria: '', codigo: '', cor: '', tamanho: '', modelo: '',
  preco: '', estoque_inicial: '0', estoque_minimo: '0',
};

// Ordem dos campos na tela (usada para focar o primeiro erro)
const ORDEM = ['nome', 'categoria', 'codigo', 'cor', 'tamanho', 'modelo', 'preco', 'estoque_inicial', 'estoque_minimo'];
const inteiroValido = (texto) => /^\d+$/.test(String(texto).trim());

function validar(v, editando) {
  const e = {};
  if (!v.nome.trim()) e.nome = 'Informe o nome do produto.';
  if (!v.categoria.trim()) e.categoria = 'Informe a categoria.';
  if (!v.codigo.trim()) e.codigo = 'Informe o código do produto.';
  const preco = lerPreco(v.preco);
  if (!Number.isFinite(preco) || preco < 0) e.preco = 'Informe um preço válido, como 49,90.';
  if (!inteiroValido(v.estoque_minimo)) e.estoque_minimo = 'Informe um número inteiro igual ou maior que zero.';
  if (!editando && !inteiroValido(v.estoque_inicial)) e.estoque_inicial = 'Informe um número inteiro igual ou maior que zero.';
  return e;
}

export default function ProdutoForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [valores, setValores] = useState(vazio);
  const [estoqueAtual, setEstoqueAtual] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editando) return;
    api
      .buscarProduto(id)
      .then((p) => {
        setValores({
          nome: p.nome, categoria: p.categoria, codigo: p.codigo,
          cor: p.cor ?? '', tamanho: p.tamanho ?? '', modelo: p.modelo ?? '',
          preco: precoParaCampo(p.preco), estoque_inicial: '0', estoque_minimo: String(p.estoque_minimo),
        });
        setEstoqueAtual(p.quantidade_estoque);
      })
      .catch((e) => setErroGeral(e.message))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  const alterar = (campo) => (evento) => {
    setValores((v) => ({ ...v, [campo]: evento.target.value }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const mostrarErros = (lista) => {
    setErros(lista);
    const primeiro = ORDEM.find((campo) => lista[campo]);
    if (primeiro) document.getElementById(primeiro)?.focus();
  };

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');

    const locais = validar(valores, editando);
    if (Object.keys(locais).length > 0) return mostrarErros(locais);

    const corpo = {
      nome: valores.nome, categoria: valores.categoria, codigo: valores.codigo,
      cor: valores.cor, tamanho: valores.tamanho, modelo: valores.modelo,
      preco: lerPreco(valores.preco),
      estoque_minimo: Number(valores.estoque_minimo),
      ...(editando ? {} : { estoque_inicial: Number(valores.estoque_inicial) }),
    };

    setSalvando(true);
    try {
      const salvo = editando ? await api.atualizarProduto(id, corpo) : await api.criarProduto(corpo);
      navigate(`/produtos/${salvo.id}`, {
        state: { aviso: editando ? 'Alterações salvas.' : 'Produto cadastrado com sucesso.' },
      });
    } catch (e) {
      if (e.erros && Object.keys(e.erros).length > 0) mostrarErros(e.erros);
      else setErroGeral(e.message);
      setSalvando(false);
    }
  }

  if (carregando) return <p className="text-tinta/60">Carregando…</p>;

  if (editando && estoqueAtual === null) {
    return (
      <section className="space-y-4">
        <Aviso>{erroGeral || 'Produto não encontrado.'}</Aviso>
        <Link to="/produtos" className="btn btn-secundario">Voltar para produtos</Link>
      </section>
    );
  }

  return (
    <section className="max-w-3xl">
      <Link to={editando ? `/produtos/${id}` : '/produtos'} className="inline-flex items-center gap-1.5 text-sm font-medium text-mar-700 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{editando ? 'Editar produto' : 'Novo produto'}</h1>
      <p className="mt-1 text-tinta/60">Campos sem “opcional” são obrigatórios.</p>

      <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
        {erroGeral && <Aviso>{erroGeral}</Aviso>}

        <div className="card p-5">
          <h2 className="font-bold">Identificação</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo id="nome" rotulo="Nome" obrigatorio className="sm:col-span-2" value={valores.nome} onChange={alterar('nome')} erro={erros.nome} placeholder="Ex.: Havaianas Top" maxLength={100} />
            <Campo id="categoria" rotulo="Categoria" obrigatorio value={valores.categoria} onChange={alterar('categoria')} erro={erros.categoria} list="lista-categorias" placeholder="Ex.: Chinelos" maxLength={50} autoComplete="off" />
            <datalist id="lista-categorias">
              {categorias.map((c) => <option key={c} value={c} />)}
            </datalist>
            <Campo id="codigo" rotulo="Código" obrigatorio value={valores.codigo} onChange={alterar('codigo')} erro={erros.codigo} dica="Precisa ser único." placeholder="Ex.: HAV-TOP-PT-3738" maxLength={40} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Variação</h2>
          <p className="mt-1 text-sm text-tinta/60">Preencha só o que se aplica ao produto.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Campo id="cor" rotulo="Cor" value={valores.cor} onChange={alterar('cor')} erro={erros.cor} placeholder="Ex.: Preto" maxLength={30} />
            <Campo id="tamanho" rotulo="Tamanho" value={valores.tamanho} onChange={alterar('tamanho')} erro={erros.tamanho} placeholder="Ex.: 37/38" maxLength={20} />
            <Campo id="modelo" rotulo="Modelo" value={valores.modelo} onChange={alterar('modelo')} erro={erros.modelo} placeholder="Ex.: Trucker" maxLength={50} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Preço e estoque</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Campo id="preco" rotulo="Preço" obrigatorio prefixo="R$" inputMode="decimal" value={valores.preco} onChange={alterar('preco')} erro={erros.preco} placeholder="49,90" />

            {editando ? (
              <Campo id="estoque_atual" rotulo="Estoque atual" obrigatorio disabled value={estoqueAtual} readOnly dica="Muda apenas com entradas e saídas." />
            ) : (
              <Campo id="estoque_inicial" rotulo="Estoque inicial" obrigatorio inputMode="numeric" value={valores.estoque_inicial} onChange={alterar('estoque_inicial')} erro={erros.estoque_inicial} />
            )}

            <Campo id="estoque_minimo" rotulo="Estoque mínimo" obrigatorio inputMode="numeric" value={valores.estoque_minimo} onChange={alterar('estoque_minimo')} erro={erros.estoque_minimo} dica="Abaixo disso, o produto aparece como estoque baixo." />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to={editando ? `/produtos/${id}` : '/produtos'} className="btn btn-secundario">Cancelar</Link>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            <Save size={18} aria-hidden="true" />
            {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </div>
      </form>
    </section>
  );
}
