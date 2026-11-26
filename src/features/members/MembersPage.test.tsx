import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { aClub, aMember } from '../../test/factories';
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
});
