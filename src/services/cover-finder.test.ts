import { describe, expect, it, vi } from 'vitest';

import { firstCover, type CoverFinder } from './cover-finder';

const book = { title: 'Dom Casmurro', author: 'Machado de Assis' };

const finds = (cover: string | null) => vi.fn<CoverFinder>(() => Promise.resolve(cover));

describe('firstCover', () => {
  it('fica com a capa da primeira busca e não chama as seguintes', async () => {
    const google = finds('https://books.google.com/capa.jpg');
    const openLibrary = finds('https://covers.openlibrary.org/b/id/1-M.jpg');

    await expect(firstCover(google, openLibrary)(book)).resolves.toBe(
      'https://books.google.com/capa.jpg',
    );
    expect(google).toHaveBeenCalledWith(book);
    expect(openLibrary).not.toHaveBeenCalled();
  });

  it('tenta a próxima busca quando a anterior não acha capa (R15)', async () => {
    const google = finds(null);
    const openLibrary = finds('https://covers.openlibrary.org/b/id/1-M.jpg');

    await expect(firstCover(google, openLibrary)(book)).resolves.toBe(
      'https://covers.openlibrary.org/b/id/1-M.jpg',
    );
    expect(openLibrary).toHaveBeenCalledWith(book);
  });

  it('devolve null quando nenhuma busca acha capa', async () => {
    await expect(firstCover(finds(null), finds(null))(book)).resolves.toBeNull();
  });
});
