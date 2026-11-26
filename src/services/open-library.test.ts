import { describe, expect, it, vi } from 'vitest';

import { findOpenLibraryCover, openLibrarySearchUrl } from './open-library';

const book = { title: 'Dom Casmurro', author: 'Machado de Assis' };

/** Um fetch falso que responde sempre o mesmo corpo. */
function respondWith(body: unknown, status = 200): typeof fetch {
  return () => Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe('openLibrarySearchUrl', () => {
  it('busca pelo título e pelo autor e pede só o número da capa', () => {
    const url = new URL(openLibrarySearchUrl({ title: 'Ação & Reação', author: 'Ana Sá' }));

    expect(url.origin + url.pathname).toBe('https://openlibrary.org/search.json');
    expect(url.searchParams.get('title')).toBe('Ação & Reação');
    expect(url.searchParams.get('author')).toBe('Ana Sá');
    expect(url.searchParams.get('limit')).toBe('1');
    expect(url.searchParams.get('fields')).toBe('cover_i');
  });
});

describe('findOpenLibraryCover', () => {
  it('devolve a capa média do primeiro resultado (R15)', async () => {
    const fetcher = respondWith({ docs: [{ cover_i: 647501 }] });

    await expect(findOpenLibraryCover(book, fetcher)).resolves.toBe(
      'https://covers.openlibrary.org/b/id/647501-M.jpg',
    );
  });

  it.each([
    ['sem resultados', { docs: [] }],
    ['sem número de capa', { docs: [{}] }],
    ['com um número de capa inválido', { docs: [{ cover_i: -1 }] }],
    ['com um número de capa em texto', { docs: [{ cover_i: '647501' }] }],
    ['num formato inesperado', { erro: 'qualquer' }],
  ])('devolve null para uma resposta %s', async (_case, body) => {
    await expect(findOpenLibraryCover(book, respondWith(body))).resolves.toBeNull();
  });

  it('devolve null quando a Open Library responde com erro', async () => {
    await expect(findOpenLibraryCover(book, respondWith({}, 503))).resolves.toBeNull();
  });

  it('devolve null quando a rede falha', async () => {
    const fetcher: typeof fetch = () => Promise.reject(new TypeError('Failed to fetch'));

    await expect(findOpenLibraryCover(book, fetcher)).resolves.toBeNull();
  });

  it('desiste depois do tempo-limite (R15)', async () => {
    vi.useFakeTimers();
    try {
      const fetcher: typeof fetch = (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      const search = findOpenLibraryCover(book, fetcher, 1000);

      await vi.advanceTimersByTimeAsync(1000);

      await expect(search).resolves.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
