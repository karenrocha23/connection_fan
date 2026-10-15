export const moeda = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Datas do SQLite chegam como "2026-10-05 14:30:00"
export const dataHora = (iso) =>
  new Date(iso.replace(' ', 'T')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// Aceita "49,90", "49.90" e "1.299,90". Retorna NaN se não for número.
export function lerPreco(texto) {
  const t = String(texto).trim().replace(/^R\$\s*/, '');
  if (!t) return NaN;
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  return Number(normal);
}

export const precoParaCampo = (numero) => Number(numero).toFixed(2).replace('.', ',');

export const dataCurta = (iso) => new Date(iso.replace(' ', 'T')).toLocaleDateString('pt-BR');

export const hora = (iso) =>
  new Date(iso.replace(' ', 'T')).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const unidades = (n) => `${n} ${n === 1 ? 'unidade' : 'unidades'}`;

export const numero = (n) => Number(n).toLocaleString('pt-BR');
