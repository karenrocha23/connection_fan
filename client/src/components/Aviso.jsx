import { CircleAlert, CircleCheck } from 'lucide-react';

const tons = {
  sucesso: { classe: 'bg-emerald-50 text-emerald-900 ring-emerald-200', Icone: CircleCheck },
  erro: { classe: 'bg-red-50 text-red-900 ring-red-200', Icone: CircleAlert },
};

export default function Aviso({ tipo = 'erro', children }) {
  const { classe, Icone } = tons[tipo];
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg p-3 text-sm ring-1 ${classe}`}>
      <Icone size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
