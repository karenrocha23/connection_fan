import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Produtos from './pages/Produtos.jsx';
import ProdutoForm from './pages/ProdutoForm.jsx';
import ProdutoDetalhe from './pages/ProdutoDetalhe.jsx';
import RegistrarMovimentacao from './pages/RegistrarMovimentacao.jsx';
import EstoqueBaixo from './pages/EstoqueBaixo.jsx';
import Historico from './pages/Historico.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/novo" element={<ProdutoForm />} />
        <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
        <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
        <Route path="/entrada" element={<RegistrarMovimentacao key="entrada" tipo="entrada" />} />
        <Route path="/saida" element={<RegistrarMovimentacao key="saida" tipo="saida" />} />
        <Route path="/estoque-baixo" element={<EstoqueBaixo />} />
        <Route path="/historico" element={<Historico />} />
        {/* Endereço antigo do histórico */}
        <Route path="/movimentacoes" element={<Navigate to="/historico" replace />} />
      </Route>
    </Routes>
  );
}
