import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aBook, aClub, aMember, aNomination, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { RoundPage } from './RoundPage';

const club = aClub({
  members: [aMember('Ana'), aMember('Bia'), aMember('Caio')],
  rounds: [
    aRound({
      status: 'voting',
      voters: ['bia'],
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
    }),
  ],
});

describe('VotingStep', () => {
  it('mostra o andamento e só quem ainda não votou', () => {
    renderWithClub(<RoundPage />, { state: club });

    expect(screen.getByText('1 de 3 já votaram.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Votar como Ana' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Votar como Bia' })).not.toBeInTheDocument();
  });

  it('abre a cédula de quem foi escolhido e volta para a lista', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Votar como Ana' }));
    expect(screen.getByRole('heading', { name: 'Cédula de Ana' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: 'Votar como Ana' })).toBeVisible();
  });
});
