import { Link } from 'react-router-dom';

export default function ResumoCard({ titulo, valor, Icone, tom = 'bg-mar-100 text-mar-700', para }) {
  const conteudo = (
    <>
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${tom}`}>
        <Icone size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-tinta/60">{titulo}</p>
        <p className="text-2xl font-bold leading-tight">{valor}</p>
      </div>
    </>
  );

  const base = 'card flex items-center gap-4 px-5 py-4';

  if (para) {
    return (
      <Link
        to={para}
        className={`${base} transition-colors hover:bg-areia-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mar-700`}
      >
        {conteudo}
      </Link>
    );
  }
  return <div className={base}>{conteudo}</div>;
}
