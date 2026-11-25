import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import type { ClubEnvironment } from '../app/club-context';
import { ClubProvider } from '../app/ClubProvider';
import type { ClubState } from '../domain/types';
import { aClub } from './factories';

/** Ids "id-1", "id-2"…, hora fixa e sorteio que sempre cai no primeiro empatado. */
export function testEnvironment(): ClubEnvironment {
  let count = 0;
  return {
    newId: () => {
      count += 1;
      return `id-${String(count)}`;
    },
    now: () => '2026-03-08T19:00:00.000Z',
    random: () => 0,
  };
}

interface RenderOptions {
  state?: ClubState;
  route?: string;
  environment?: ClubEnvironment;
}

/** Renderiza uma tela com o clube, as rotas e um `user` do user-event. */
export function renderWithClub(
  ui: ReactElement,
  { state = aClub(), route = '/', environment = testEnvironment() }: RenderOptions = {},
) {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <ClubProvider initialState={state} environment={environment}>
        {ui}
      </ClubProvider>
    </MemoryRouter>,
  );
  return { user, ...view };
}
