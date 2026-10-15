// Mostra cor, tamanho e modelo como pequenas etiquetas. Campos vazios não aparecem.
export default function Variacao({ produto }) {
  const itens = [produto.cor, produto.tamanho, produto.modelo].filter(Boolean);
  if (itens.length === 0) return <span className="text-tinta/40">Sem variação</span>;

  return (
    <span className="flex flex-wrap gap-1.5">
      {itens.map((item) => (
        <span key={item} className="rounded-md bg-areia-50 px-2 py-0.5 text-xs font-medium ring-1 ring-areia-200">
          {item}
        </span>
      ))}
    </span>
  );
}
