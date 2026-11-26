import { describe, expect, it } from 'vitest';

import { coverSearchUrl, findCover } from './google-books';

const book = { title: 'Dom Casmurro', author: 'Machado de Assis' };

/** Um fetch falso que responde sempre o mesmo corpo. */
function respondWith(body: unknown, status = 200): typeof fetch {
  return () => Promise.resolve(new Response(JSON.stringify(body), { status }));
}

function volume(imageLinks: Record<string, string>) {
  return { items: [{ volumeInfo: { imageLinks } }] };
}

describe('coverSearchUrl', () => {
  it('busca pelo título e pelo autor', () => {
    const url = new URL(coverSearchUrl(book));

    expect(url.searchParams.get('q')).toBe('intitle:Dom Casmurro inauthor:Machado de Assis');
    expect(url.searchParams.get('maxResults')).toBe('1');
  });
});

describe('findCover', () => {
  it('devolve a capa do primeiro resultado em https (R15)', async () => {
    const fetcher = respondWith(volume({ thumbnail: 'http://books.google.com/capa.jpg' }));

    await expect(findCover(book, fetcher)).resolves.toBe('https://books.google.com/capa.jpg');
  });

  it('usa a miniatura menor quando é a única', async () => {
    const fetcher = respondWith(volume({ smallThumbnail: 'https://books.google.com/mini.jpg' }));

    await expect(findCover(book, fetcher)).resolves.toBe('https://books.google.com/mini.jpg');
  });

  it('devolve null quando não acha o livro', async () => {
    await expect(findCover(book, respondWith({ totalItems: 0 }))).resolves.toBeNull();
  });

  it('devolve null quando o Google Livros responde com erro', async () => {
    await expect(findCover(book, respondWith({}, 503))).resolves.toBeNull();
  });

  it('devolve null quando a rede falha', async () => {
    const offline: typeof fetch = () => Promise.reject(new TypeError('Failed to fetch'));

    await expect(findCover(book, offline)).resolves.toBeNull();
  });

  it('desiste depois do tempo-limite', async () => {
    const neverAnswers: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new Error('cancelada'));
        });
      });

    await expect(findCover(book, neverAnswers, 10)).resolves.toBeNull();
  });
});
