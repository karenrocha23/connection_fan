const estilos = {
  normal: { texto: 'Estoque normal', fundo: 'bg-emerald-100 text-emerald-800', ponto: 'bg-emerald-500' },
  estoque_baixo: { texto: 'Estoque baixo', fundo: 'bg-amber-100 text-amber-900', ponto: 'bg-amber-500' },
  sem_estoque: { texto: 'Sem estoque', fundo: 'bg-red-100 text-red-800', ponto: 'bg-red-500' },
};

export default function StatusBadge({ status }) {
  const e = estilos[status] ?? estilos.normal;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${e.fundo}`}>
      <span className={`size-2 rounded-full ${e.ponto}`} aria-hidden="true" />
      {e.texto}
    </span>
  );
}
