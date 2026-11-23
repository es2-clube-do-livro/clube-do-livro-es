import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithClub } from '../test/render';
import { App } from './App';

describe('App', () => {
  it('abre na aba Rodada', () => {
    renderWithClub(<App />);

    expect(screen.getByRole('link', { name: 'Rodada' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Nenhuma rodada em andamento' })).toBeVisible();
  });

  it('troca de aba pela navegação', async () => {
    const { user } = renderWithClub(<App />);

    await user.click(screen.getByRole('link', { name: 'Membros' }));
    expect(screen.getByRole('heading', { name: 'Membros' })).toBeVisible();

    await user.click(screen.getByRole('link', { name: 'Histórico' }));
    expect(screen.getByRole('heading', { name: 'Histórico' })).toBeVisible();
  });

  it('leva um endereço desconhecido para a aba Rodada', () => {
    renderWithClub(<App />, { route: '/nao-existe' });

    expect(screen.getByRole('link', { name: 'Rodada' })).toHaveAttribute('aria-current', 'page');
  });
});
