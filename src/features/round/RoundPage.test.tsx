import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aClub, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { RoundPage } from './RoundPage';

describe('RoundPage', () => {
  it('convida a começar quando não há rodada em andamento', () => {
    renderWithClub(<RoundPage />, { state: aClub({ rounds: [aRound({ status: 'finished' })] }) });

    expect(screen.getByRole('heading', { name: 'Nenhuma rodada em andamento' })).toBeVisible();
  });

  it.each([
    ['nominating', 'Rodada 2: indicações'],
    ['voting', 'Rodada 2: votação'],
    ['reading', 'Rodada 2: leitura'],
  ] as const)('mostra a etapa da rodada em %s', (status, heading) => {
    renderWithClub(<RoundPage />, { state: aClub({ rounds: [aRound({ number: 2, status })] }) });

    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
  });
});
