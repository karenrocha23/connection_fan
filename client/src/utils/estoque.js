// Regras de estoque usadas na PRÉVIA da tela. Quem decide de verdade é o servidor.

export const QUANTIDADE_MAXIMA = 1_000_000;

// Mesma regra do servidor: > mínimo = normal | 1..mínimo = baixo | 0 = sem estoque
export function calcularStatus(quantidade, minimo) {
  if (quantidade === 0) return 'sem_estoque';
  if (quantidade <= minimo) return 'estoque_baixo';
  return 'normal';
}

export const mensagemEstoqueInsuficiente = (disponivel) =>
  `Estoque insuficiente. Há apenas ${disponivel} ${disponivel === 1 ? 'unidade disponível' : 'unidades disponíveis'}.`;

// Lê o texto digitado. Retorna { vazio } | { erro } | { valor }
export function lerQuantidade(texto) {
  const t = String(texto).trim();
  if (t === '') return { vazio: true };
  if (!/^-?\d+$/.test(t)) return { erro: 'Informe a quantidade com um número inteiro, como 5.' };

  const n = Number(t);
  if (n <= 0) return { erro: 'A quantidade deve ser maior que zero.' };
  if (n > QUANTIDADE_MAXIMA) return { erro: `A quantidade máxima por operação é ${QUANTIDADE_MAXIMA.toLocaleString('pt-BR')}.` };
  return { valor: n };
}
