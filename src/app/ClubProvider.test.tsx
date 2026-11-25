import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { err, ok } from '../domain/result';
import type { ClubState } from '../domain/types';
import { aClub, aMember } from '../test/factories';
import { useClub, type ClubChange } from './club-context';
import { ClubProvider } from './ClubProvider';

const addAna: ClubChange<never> = (club, env) =>
  ok({ ...club, members: [...club.members, aMember('Ana', { id: env.newId() })] });

const refuse: ClubChange<'refused'> = () => err('refused');

function MemberCount({ change }: { change: ClubChange<string> }) {
  const { state, apply } = useClub();
  return (
    <>
      <p>{state.members.length} membros</p>
      <button type="button" onClick={() => apply(change)}>
        Mudar
      </button>
    </>
  );
}

function renderProvider(change: ClubChange<string>, onChange = vi.fn<(club: ClubState) => void>()) {
  render(
    <ClubProvider initialState={aClub()} onChange={onChange} environment={{ newId: () => 'id-1' }}>
      <MemberCount change={change} />
    </ClubProvider>,
  );
  return { user: userEvent.setup(), onChange };
}

describe('ClubProvider', () => {
  it('guarda o novo estado quando a mudança dá certo', async () => {
    const { user, onChange } = renderProvider(addAna);

    await user.click(screen.getByRole('button', { name: 'Mudar' }));

    expect(screen.getByText('1 membros')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(aClub({ members: [aMember('Ana', { id: 'id-1' })] }));
  });

  it('mantém o estado quando a mudança é recusada', async () => {
    const { user, onChange } = renderProvider(refuse);

    await user.click(screen.getByRole('button', { name: 'Mudar' }));

    expect(screen.getByText('0 membros')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('começa com o clube vazio quando não recebe um estado', () => {
    const { result } = renderHook(() => useClub(), {
      wrapper: ({ children }) => <ClubProvider>{children}</ClubProvider>,
    });

    expect(result.current.state).toEqual(aClub());
  });

  it('avisa quando useClub é usado fora do provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useClub())).toThrow('dentro de um ClubProvider');
  });
});
