import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { aBook, aNomination, aRound } from '../../test/factories';
import { ResultChart } from './ResultChart';

const nominations = [
  aNomination({ id: 'n1', book: aBook({ title: 'Mar', author: 'Lia' }) }),
  aNomination({ id: 'n2', book: aBook({ title: 'Mar', author: 'Rui' }) }),
  aNomination({ id: 'n3', book: aBook({ title: 'Sol', author: 'Eva' }) }),
];

it('mostra uma barra por livro em ordem de votos, incluindo o livro sem votos (R11)', () => {
  const round = aRound({
    nominations,
    results: { votes: { n1: 1, n2: 2, n3: 0 }, firsts: { n2: 1 } },
    winner: { nominationId: 'n2', method: 'votes' },
  });
  render(<ResultChart round={round} />);

  const rows = screen.getAllByRole('listitem');
  expect(rows).toHaveLength(3);
  expect(rows[0]).toHaveTextContent('Mar — Rui');
  expect(rows[0]).toHaveTextContent('2 votos (66,7%)');
  expect(rows[1]).toHaveTextContent('Mar — Lia');
  expect(rows[1]).toHaveTextContent('1 voto (33,3%)');
  expect(rows[2]).toHaveTextContent('0 votos (0%)');
  const bar = screen.getByRole('meter', { name: 'Mar — Rui' });
  expect(bar).toHaveProperty('value', 2 / 3);
  expect(bar).toHaveAttribute('aria-valuetext', '66,7%');
});

it('reserva o resultado para depois da apuração', () => {
  render(<ResultChart round={aRound({ nominations, status: 'voting' })} />);

  expect(screen.queryByRole('meter')).not.toBeInTheDocument();
});

it.each([
  ['votes', 'Venceu pelo total de votos.'],
  ['first-choices', 'Desempate pelos votos de 1ª opção.'],
  ['draw', 'Desempate por sorteio entre os livros empatados.'],
] as const)('explica o critério %s registrado pela apuração (R11)', (method, message) => {
  const round = aRound({ nominations, winner: { nominationId: 'n1', method } });
  render(<ResultChart round={round} />);

  expect(screen.getByText(message)).toBeVisible();
});
