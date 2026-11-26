import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aBook, aClub, aMember, aNomination, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { RoundPage } from './RoundPage';

const members = [aMember('Ana'), aMember('Bia'), aMember('Caio')];
const club = aClub({ members, rounds: [aRound({ status: 'nominating' })] });

describe('NominationStep', () => {
  it('indica um livro e tira a pessoa da lista de quem falta indicar', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    const select = screen.getByLabelText('Quem está indicando');
    expect(within(select).queryByRole('option', { name: 'Ana' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });

  it('mostra no campo o erro do título vazio (R4)', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription(
      'Escreva o título do livro.',
    );
  });

  it('recusa um livro já indicado na rodada (R6)', async () => {
    const withBook = aClub({
      members,
      rounds: [aRound({ nominations: [aNomination({ memberId: 'ana', book: aBook() })] })],
    });
    const { user } = renderWithClub(<RoundPage />, { state: withBook });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Bia');
    await user.type(screen.getByLabelText('Título'), 'dom casmurro');
    await user.type(screen.getByLabelText('Autor'), 'machado de assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription(
      'Este livro já foi indicado nesta rodada.',
    );
  });

  it('pede para escolher quem está indicando', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha quem está indicando.');
  });

  it('avisa quando todos os membros já indicaram', () => {
    const nominations = members.map((member, index) =>
      aNomination({
        id: `n${String(index)}`,
        memberId: member.id,
        book: aBook({ title: member.name }),
      }),
    );
    const everyone = aClub({ members, rounds: [aRound({ nominations })] });
    renderWithClub(<RoundPage />, { state: everyone });

    expect(screen.getByText('Todos os membros já indicaram.')).toBeVisible();
  });
});
