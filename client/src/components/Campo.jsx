// Campo de formulário com rótulo, dica e mensagem de erro.
export default function Campo({ id, rotulo, obrigatorio = false, erro, dica, prefixo, className = '', ...entrada }) {
  const descricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {rotulo}
        {!obrigatorio && <span className="ml-1.5 font-normal text-tinta/50">(opcional)</span>}
      </label>

      <div className="relative">
        {prefixo && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-tinta/60">
            {prefixo}
          </span>
        )}
        <input
          id={id}
          name={id}
          className={`campo ${prefixo ? 'pl-9' : ''}`}
          aria-invalid={erro ? 'true' : 'false'}
          aria-describedby={descricao}
          {...entrada}
        />
      </div>

      {erro ? (
        <p id={`${id}-erro`} role="alert" className="mt-1 text-sm text-red-700">{erro}</p>
      ) : (
        dica && <p id={`${id}-dica`} className="mt-1 text-sm text-tinta/60">{dica}</p>
      )}
    </div>
  );
}
