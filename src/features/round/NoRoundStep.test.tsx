import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aClub, aMember, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { RoundPage } from './RoundPage';

describe('NoRoundStep', () => {
  it('inicia a rodada e passa para as indicações', async () => {
    const club = aClub({ members: [aMember('Ana'), aMember('Bia')] });
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Iniciar rodada' }));

    expect(screen.getByRole('heading', { name: 'Rodada 1: indicações' })).toBeVisible();
  });

  it('numera a rodada nova depois das anteriores', async () => {
    const club = aClub({
      members: [aMember('Ana'), aMember('Bia')],
      rounds: [aRound({ number: 1, status: 'finished' })],
    });
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Iniciar rodada' }));

    expect(screen.getByRole('heading', { name: 'Rodada 2: indicações' })).toBeVisible();
  });

  it('pede pelo menos 2 membros (R3)', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: aClub({ members: [aMember('Ana')] }) });

    await user.click(screen.getByRole('button', { name: 'Iniciar rodada' }));

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 2 membros');
  });
});
