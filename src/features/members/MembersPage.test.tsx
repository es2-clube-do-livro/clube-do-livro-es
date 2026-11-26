import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aClub, aMember, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { MembersPage } from './MembersPage';

const club = aClub({ members: [aMember('Ana'), aMember('Bia')] });

describe('MembersPage', () => {
  it('convida a adicionar quando o clube não tem membros', () => {
    renderWithClub(<MembersPage />);

    expect(screen.getByText('Nenhum membro ainda')).toBeVisible();
  });

  it('lista os membros do clube', () => {
    renderWithClub(<MembersPage />, { state: club });

    const list = within(screen.getByRole('list'));
    expect(list.getByText('Ana')).toBeVisible();
    expect(list.getByText('Bia')).toBeVisible();
  });

  it('adiciona um membro pelo formulário e limpa o campo', async () => {
    const { user } = renderWithClub(<MembersPage />, { state: club });

    await user.type(screen.getByLabelText('Nome'), '  Caio ');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(within(screen.getByRole('list')).getByText('Caio')).toBeVisible();
    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('mostra o erro de nome repetido (R1)', async () => {
    const { user } = renderWithClub(<MembersPage />, { state: club });

    await user.type(screen.getByLabelText('Nome'), 'ana');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription(
      'Já existe um membro com esse nome.',
    );
  });

  it('remove um membro depois de confirmar', async () => {
    const { user } = renderWithClub(<MembersPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Remover Ana' }));
    await user.click(screen.getByRole('button', { name: 'Remover' }));

    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });

  it('mantém o membro quando a pessoa cancela', async () => {
    const { user } = renderWithClub(<MembersPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Remover Ana' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('Ana')).toBeVisible();
  });

  it('trava a lista durante a indicação e a votação (R2)', () => {
    const open = aClub({ ...club, rounds: [aRound({ status: 'nominating' })] });
    renderWithClub(<MembersPage />, { state: open });

    expect(screen.getByRole('status')).toHaveTextContent('a lista de membros não muda');
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover Ana' })).toBeDisabled();
  });
});
