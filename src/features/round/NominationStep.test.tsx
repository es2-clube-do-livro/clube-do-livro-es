import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { CoverFinderContext, type CoverFinder } from '../../services/cover-finder';
import { findCover as findGoogleCover } from '../../services/google-books';
import { createLocalStorageRepository } from '../../storage/local-storage';
import { aBook, aClub, aMember, aNomination, aRound } from '../../test/factories';
import { renderWithClub } from '../../test/render';
import { StoredClub } from '../data/StoredClub';
import { RoundPage } from './RoundPage';

const members = [aMember('Ana'), aMember('Bia'), aMember('Caio')];
const club = aClub({ members, rounds: [aRound({ status: 'nominating' })] });

describe('NominationStep', () => {
  it('indica um livro e tira a pessoa da lista de quem falta indicar', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    const select = screen.getByLabelText('Quem está indicando');
    expect(within(select).queryByRole('option', { name: 'Ana' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });

  it('mostra no campo o erro do título vazio (R4)', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription(
      'Escreva o título do livro.',
    );
  });

  it('recusa um livro já indicado na rodada (R6)', async () => {
    const withBook = aClub({
      members,
      rounds: [aRound({ nominations: [aNomination({ memberId: 'ana', book: aBook() })] })],
    });
    const { user } = renderWithClub(<RoundPage />, { state: withBook });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Bia');
    await user.type(screen.getByLabelText('Título'), 'dom casmurro');
    await user.type(screen.getByLabelText('Autor'), 'machado de assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription(
      'Este livro já foi indicado nesta rodada.',
    );
  });

  it('pede para escolher quem está indicando', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha quem está indicando.');
  });

  it('avisa quando todos os membros já indicaram', () => {
    const nominations = members.map((member, index) =>
      aNomination({
        id: `n${String(index)}`,
        memberId: member.id,
        book: aBook({ title: member.name }),
      }),
    );
    const everyone = aClub({ members, rounds: [aRound({ nominations })] });
    renderWithClub(<RoundPage />, { state: everyone });

    expect(screen.getByText('Todos os membros já indicaram.')).toBeVisible();
  });

  it('lista os livros indicados sem dizer quem indicou', () => {
    const withBooks = aClub({
      members,
      rounds: [
        aRound({
          nominations: [
            aNomination({ id: 'n1', memberId: 'ana', book: aBook() }),
            aNomination({ id: 'n2', memberId: 'bia', book: aBook({ title: 'Torto Arado' }) }),
          ],
        }),
      ],
    });
    renderWithClub(<RoundPage />, { state: withBooks });

    const list = within(screen.getByRole('list', { name: 'Indicações da rodada' }));
    expect(list.getByText('Dom Casmurro')).toBeVisible();
    expect(list.getByText('Torto Arado')).toBeVisible();
    expect(list.queryByText(/Ana|Bia/)).not.toBeInTheDocument();
  });

  it('abre a votação com pelo menos dois livros (R7)', async () => {
    const withBooks = aClub({
      members,
      rounds: [
        aRound({
          nominations: [
            aNomination({ id: 'n1', memberId: 'ana', book: aBook() }),
            aNomination({ id: 'n2', memberId: 'bia', book: aBook({ title: 'Torto Arado' }) }),
          ],
        }),
      ],
    });
    const { user } = renderWithClub(<RoundPage />, { state: withBooks });

    await user.click(screen.getByRole('button', { name: 'Abrir votação' }));

    expect(screen.getByRole('heading', { name: 'Rodada 1: votação' })).toBeVisible();
  });

  it('não abre a votação com menos de dois livros (R7)', async () => {
    const { user } = renderWithClub(<RoundPage />, { state: club });

    await user.click(screen.getByRole('button', { name: 'Abrir votação' }));

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 2 livros');
  });

  it('busca a capa pelo título e pelo autor ao indicar (R15)', async () => {
    const findCover = vi.fn<CoverFinder>(() => Promise.resolve(null));
    const { user } = renderWithClub(<RoundPage />, { state: club, findCover });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(findCover).toHaveBeenCalledWith({ title: 'Dom Casmurro', author: 'Machado de Assis' });
    expect(await screen.findByText('Dom Casmurro')).toBeVisible();
  });

  it('mostra a capa encontrada na lista de indicações', async () => {
    const findCover: CoverFinder = () => Promise.resolve('https://capas.exemplo/dom-casmurro.jpg');
    const { user } = renderWithClub(<RoundPage />, { state: club, findCover });

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));

    expect(await screen.findByRole('img', { name: 'Capa de Dom Casmurro' })).toHaveAttribute(
      'src',
      'https://capas.exemplo/dom-casmurro.jpg',
    );
  });

  it('mantém o clube salvo quando o Google Livros devolve uma capa inválida (R14 e R15)', async () => {
    const storage = window.localStorage;
    storage.clear();
    const repository = createLocalStorageRepository(storage);
    repository.save(club);
    const relativeCover: typeof fetch = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({ items: [{ volumeInfo: { imageLinks: { thumbnail: '/capa.jpg' } } }] }),
        ),
      );
    const findCover: CoverFinder = (book) => findGoogleCover(book, relativeCover);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StoredClub repository={repository} initial={repository.load()}>
          <CoverFinderContext value={findCover}>
            <RoundPage />
          </CoverFinderContext>
        </StoredClub>
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText('Quem está indicando'), 'Ana');
    await user.type(screen.getByLabelText('Título'), 'Dom Casmurro');
    await user.type(screen.getByLabelText('Autor'), 'Machado de Assis');
    await user.click(screen.getByRole('button', { name: 'Indicar' }));
    await screen.findByText('Dom Casmurro');

    const reloaded = repository.load();
    expect(reloaded.status).toBe('ready');
    expect(reloaded.state.members).toHaveLength(3);
    expect(reloaded.state.rounds[0]?.nominations[0]?.book).toEqual({
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      coverUrl: null,
    });
    storage.clear();
  });
});
