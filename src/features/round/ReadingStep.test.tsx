import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aBook, aClub, aNomination, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { RoundPage } from './RoundPage';

function renderReading(coverUrl: string | null = null) {
  const winningBook = aBook({ title: 'Torto Arado', author: 'Itamar Vieira Junior', coverUrl });
  const round = aRound({
    status: 'reading',
    nominations: [aNomination(), aNomination({ id: 'n2', memberId: 'bia', book: winningBook })],
    winner: { nominationId: 'n2', method: 'votes' },
    closedAt: '2026-03-04T19:00:00.000Z',
  });
  return renderWithClub(<RoundPage />, { state: aClub({ rounds: [round] }) });
}

describe('etapa de leitura', () => {
  it('mostra o título, o autor e a capa do livro escolhido (R12)', () => {
    const cover = 'https://example.org/torto-arado.jpg';
    renderReading(cover);

    expect(screen.getByRole('heading', { name: 'Torto Arado' })).toBeVisible();
    expect(screen.getByText('Itamar Vieira Junior')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Capa de Torto Arado' })).toHaveAttribute('src', cover);
  });

  it('permite concluir a leitura mesmo sem capa e libera a próxima rodada (R12)', async () => {
    const { user } = renderReading();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Concluir leitura' }));

    expect(screen.getByRole('heading', { name: 'Nenhuma rodada em andamento' })).toBeVisible();
  });
});
