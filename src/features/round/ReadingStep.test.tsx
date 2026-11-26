import { screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('meter', { name: 'Torto Arado — Itamar Vieira Junior' })).toBeVisible();
  });

  it('permite concluir a leitura mesmo sem capa e libera a próxima rodada (R12)', async () => {
    const { user } = renderReading();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Concluir leitura' }));
    const dialog = screen.getByRole('dialog', { name: 'Concluir a leitura?' });
    await user.click(within(dialog).getByRole('button', { name: 'Concluir' }));

    expect(screen.getByRole('heading', { name: 'Nenhuma rodada em andamento' })).toBeVisible();
  });

  it('pede confirmação e continua na leitura quando a pessoa cancela', async () => {
    const { user } = renderReading();

    await user.click(screen.getByRole('button', { name: 'Concluir leitura' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rodada 1: leitura' })).toBeVisible();
  });
});
