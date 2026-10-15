// Grupo de botões para escolher uma opção (usado como filtro).
export default function Segmentado({ rotulo, opcoes, valor, onChange }) {
  return (
    <div role="group" aria-label={rotulo} className="inline-flex flex-wrap gap-1 rounded-lg bg-areia-200/60 p-1">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(o.valor)}
            className={
              'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mar-700 ' +
              (ativo ? 'bg-white shadow-sm' : 'text-tinta/70 hover:text-tinta')
            }
          >
            {o.rotulo}
            {o.contagem !== undefined && <span className="ml-1.5 font-normal text-tinta/60">{o.contagem}</span>}
          </button>
        );
      })}
    </div>
  );
}
