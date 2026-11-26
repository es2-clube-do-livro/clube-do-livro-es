import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Round } from '../../domain/types';
import { aBook, aMember, aNomination, aRound } from '../../test/factories';
import { Ballot } from './Ballot';

const round = aRound({
  status: 'voting',
  nominations: [
    aNomination({ id: 'livro-ana', memberId: 'ana', book: aBook({ title: 'Dom Casmurro' }) }),
    aNomination({
      id: 'livro-bia',
      memberId: 'bia',
      book: aBook({ title: 'Torto Arado', author: 'Itamar Vieira Junior' }),
    }),
    aNomination({
      id: 'livro-caio',
      memberId: 'caio',
      book: aBook({ title: 'Vidas Secas', author: 'Graciliano Ramos' }),
    }),
  ],
});

function renderBallot(ballotRound: Round = round) {
  const onSubmit = vi.fn();
  render(
    <Ballot round={ballotRound} voter={aMember('Ana')} onSubmit={onSubmit} onCancel={vi.fn()} />,
  );
  return { user: userEvent.setup(), onSubmit };
}

const group = (name: string) => within(screen.getByRole('group', { name }));

describe('Ballot', () => {
  it('desabilita o livro que a própria pessoa indicou (R8)', () => {
    renderBallot();

    expect(group('1ª opção').getByRole('radio', { name: /Dom Casmurro/ })).toBeDisabled();
    expect(group('1ª opção').getByRole('radio', { name: /Torto Arado/ })).toBeEnabled();
  });

  it('não deixa escolher na 2ª opção o livro da 1ª', async () => {
    const { user } = renderBallot();

    await user.click(group('1ª opção').getByRole('radio', { name: /Torto Arado/ }));

    expect(group('2ª opção').getByRole('radio', { name: /Torto Arado/ })).toBeDisabled();
  });

  it('só confirma com as duas opções marcadas', async () => {
    const { user } = renderBallot();

    await user.click(group('1ª opção').getByRole('radio', { name: /Vidas Secas/ }));

    expect(screen.getByRole('button', { name: 'Confirmar voto' })).toBeDisabled();
  });

  it('envia as escolhas com a 1ª opção primeiro', async () => {
    const { user, onSubmit } = renderBallot();

    await user.click(group('1ª opção').getByRole('radio', { name: /Vidas Secas/ }));
    await user.click(group('2ª opção').getByRole('radio', { name: /Torto Arado/ }));
    await user.click(screen.getByRole('button', { name: 'Confirmar voto' }));

    expect(onSubmit).toHaveBeenCalledWith(['livro-caio', 'livro-bia']);
  });

  it('desmarca a 2ª opção quando ela vira a 1ª', async () => {
    const { user } = renderBallot();

    await user.click(group('2ª opção').getByRole('radio', { name: /Vidas Secas/ }));
    await user.click(group('1ª opção').getByRole('radio', { name: /Vidas Secas/ }));

    expect(group('2ª opção').getByRole('radio', { name: /Vidas Secas/ })).not.toBeChecked();
  });

  it('pede uma opção só quando sobra um livro para a pessoa', async () => {
    const twoBooks = { ...round, nominations: round.nominations.slice(0, 2) };
    const { user, onSubmit } = renderBallot(twoBooks);

    await user.click(group('Sua opção').getByRole('radio', { name: /Torto Arado/ }));
    await user.click(screen.getByRole('button', { name: 'Confirmar voto' }));

    expect(screen.queryByRole('group', { name: '2ª opção' })).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(['livro-bia']);
  });
});
