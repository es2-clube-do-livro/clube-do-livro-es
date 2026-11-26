import type { Book } from '../domain/types';

export const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const TIMEOUT_MS = 5000;

/** O pedaço da resposta do Google Livros que interessa; tudo pode faltar. */
interface VolumesResponse {
  items?: { volumeInfo?: { imageLinks?: { thumbnail?: string; smallThumbnail?: string } } }[];
}

export function coverSearchUrl({ title, author }: Pick<Book, 'title' | 'author'>): string {
  const query = `intitle:${title} inauthor:${author}`;
  return `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=1&printType=books`;
}

/** A capa do primeiro resultado, trocando http por https. */
function thumbnailOf(data: VolumesResponse): string | null {
  const links = data.items?.[0]?.volumeInfo?.imageLinks;
  const link = links?.thumbnail ?? links?.smallThumbnail;
  return link ? link.replace(/^http:/, 'https:') : null;
}

/**
 * R15: a capa do primeiro resultado, em https. Se não achar, se a busca falhar ou se demorar
 * mais que o tempo-limite, devolve null e a indicação segue sem capa.
 */
export async function findCover(
  book: Pick<Book, 'title' | 'author'>,
  fetcher: typeof fetch = fetch,
  timeoutMs = TIMEOUT_MS,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetcher(coverSearchUrl(book), { signal: controller.signal });
    if (!response.ok) return null;
    // Todos os campos são opcionais: uma resposta diferente só resulta em "sem capa".
    return thumbnailOf((await response.json()) as VolumesResponse);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
