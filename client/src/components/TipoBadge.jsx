import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function TipoBadge({ tipo }) {
  const entrada = tipo === 'entrada';
  const Icone = entrada ? ArrowDownToLine : ArrowUpFromLine;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        entrada ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <Icone size={14} aria-hidden="true" />
      {entrada ? 'Entrada' : 'Saída'}
    </span>
  );
}
