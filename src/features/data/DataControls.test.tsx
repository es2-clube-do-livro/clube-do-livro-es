import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';

import { App } from '../../app/App';
import type { CoverFinder } from '../../services/cover-finder';
import { createMemoryRepository } from '../../storage/memory';
import { aClub, aMember } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { StoredClub } from './StoredClub';

function openClub(repository = createMemoryRepository()) {
  render(
    <MemoryRouter>
      <StoredClub repository={repository} initial={repository.load()}>
        <App />
      </StoredClub>
    </MemoryRouter>,
  );
  return { repository, user: userEvent.setup() };
}

it('R14: carrega e salva o exemplo pelo botão do clube vazio', async () => {
  const { user, repository } = openClub();
  await user.click(screen.getByRole('button', { name: 'Carregar exemplo' }));
  expect(screen.getByRole('heading', { name: 'Rodada 1: indicações' })).toBeVisible();
  expect(repository.load().state.members).toHaveLength(4);
  expect(screen.queryByRole('button', { name: 'Carregar exemplo' })).not.toBeInTheDocument();
});

it('R14: cancelar preserva os dados e confirmar remove todo o clube', async () => {
  const repository = createMemoryRepository();
  const state = aClub({ members: [aMember()] });
  repository.save(state);
  const { user } = openClub(repository);
  await user.click(screen.getByRole('button', { name: 'Apagar todos os dados' }));
  expect(repository.load().state).toEqual(state);
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(repository.load().state).toEqual(state);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Apagar todos os dados' })).toHaveFocus();

  await user.click(screen.getByRole('button', { name: 'Apagar todos os dados' }));
  const dialog = screen.getByRole('dialog', { name: 'Apagar todos os dados?' });
  await user.click(within(dialog).getByRole('button', { name: 'Apagar' }));
  expect(repository.load().state).toEqual(aClub());
  expect(screen.getByRole('button', { name: 'Carregar exemplo' })).toBeVisible();
});

it('R15: busca a capa de cada livro do exemplo e mostra as que encontrar', async () => {
  const findCover = vi.fn<CoverFinder>(({ title }) =>
    Promise.resolve(title === 'Dom Casmurro' ? 'https://example.org/dom-casmurro.jpg' : null),
  );
  const { user } = renderWithClub(<App />, { findCover });

  await user.click(screen.getByRole('button', { name: 'Carregar exemplo' }));

  expect(await screen.findByRole('img', { name: 'Capa de Dom Casmurro' })).toHaveAttribute(
    'src',
    'https://example.org/dom-casmurro.jpg',
  );
  expect(findCover).toHaveBeenCalledTimes(3);
  expect(screen.getAllByRole('img')).toHaveLength(1);
});
