import type { Book } from '../domain/types';

export const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
/** A Open Library às vezes demora; a indicação não espera por ela, então o limite é folgado. */
const TIMEOUT_MS = 10_000;

/** O pedaço da resposta da Open Library que interessa; tudo pode faltar. */
interface SearchResponse {
  docs?: { cover_i?: unknown }[];
}

export function openLibrarySearchUrl({ title, author }: Pick<Book, 'title' | 'author'>): string {
  const params = new URLSearchParams({ title, author, limit: '1', fields: 'cover_i' });
  return `${OPEN_LIBRARY_SEARCH_URL}?${params.toString()}`;
}

/** A capa média do primeiro resultado, pelo número da capa na Open Library. */
function coverOf(data: SearchResponse): string | null {
  const id = data.docs?.[0]?.cover_i;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) return null;
  return `https://covers.openlibrary.org/b/id/${String(id)}-M.jpg`;
}

/**
 * R15, a reserva do Google Livros: a capa do primeiro resultado da Open Library, que não usa
 * chave. Se não achar, se a busca falhar ou se demorar mais que o tempo-limite, devolve null.
 */
export async function findOpenLibraryCover(
  book: Pick<Book, 'title' | 'author'>,
  fetcher: typeof fetch = fetch,
  timeoutMs = TIMEOUT_MS,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetcher(openLibrarySearchUrl(book), { signal: controller.signal });
    if (!response.ok) return null;
    return coverOf((await response.json()) as SearchResponse);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
