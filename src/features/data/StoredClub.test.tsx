import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { useClub } from '../../app/club-context';
import { ok } from '../../domain/result';
import { createLocalStorageRepository } from '../../storage/local-storage';
import { createMemoryRepository } from '../../storage/memory';
import type { ClubRepository } from '../../storage/repository';
import { aMember } from '../../test/factories';
import { StoredClub } from './StoredClub';

function Members() {
  const { state, apply } = useClub();
  return (
    <>
      <p>{state.members.length} membros</p>
      <button onClick={() => apply((club) => ok({ ...club, members: [aMember()] }))}>
        Adicionar
      </button>
    </>
  );
}

function openClub(repository: ClubRepository) {
  return render(
    <StoredClub repository={repository} initial={repository.load()}>
      <Members />
    </StoredClub>,
  );
}

it('R14: avisa quando descarta dados inválidos e restaura a próxima mudança ao reabrir', async () => {
  localStorage.setItem('clube-do-livro-es', '{');
  const repository = createLocalStorageRepository();
  const view = openClub(repository);
  expect(screen.getByRole('alert')).toHaveTextContent('O clube recomeçou vazio');
  expect(screen.getByText('0 membros')).toBeVisible();

  await userEvent.setup().click(screen.getByRole('button', { name: 'Adicionar' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  view.unmount();
  openClub(repository);
  expect(screen.getByText('1 membros')).toBeVisible();
  localStorage.removeItem('clube-do-livro-es');
});

it('R14: mantém a mudança na tela quando não consegue salvá-la e tenta gravar na próxima mudança', async () => {
  const repository = createMemoryRepository();
  vi.spyOn(repository, 'save').mockReturnValueOnce(false);
  const user = userEvent.setup();
  openClub(repository);

  await user.click(screen.getByRole('button', { name: 'Adicionar' }));
  expect(screen.getByText('1 membros')).toBeVisible();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'armazenamento do navegador está indisponível',
  );
  await user.click(screen.getByRole('button', { name: 'Adicionar' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(repository.load().state.members).toEqual([aMember()]);
});
