import type { Book } from '../domain/types';

export const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const TIMEOUT_MS = 5000;

/** O pedaço da resposta do Google Livros que interessa; tudo pode faltar. */
interface VolumesResponse {
  items?: { volumeInfo?: { imageLinks?: { thumbnail?: string; smallThumbnail?: string } } }[];
}

/** Com a chave do projeto, a busca usa a cota dele; sem ela, a cota pública, que pode acabar. */
export function coverSearchUrl(
  { title, author }: Pick<Book, 'title' | 'author'>,
  apiKey?: string,
): string {
  const query = `intitle:${title} inauthor:${author}`;
  const key = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
  return `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=1&printType=books${key}`;
}

/** Só um endereço absoluto em https serve de capa; http vira https e o resto é descartado. */
export function httpsCover(link: unknown): string | null {
  if (typeof link !== 'string' || !URL.canParse(link)) return null;
  const url = new URL(link);
  if (url.protocol === 'http:') url.protocol = 'https:';
  return url.protocol === 'https:' ? url.href : null;
}

/** A capa do primeiro resultado: a miniatura maior ou, se ela não servir, a menor. */
function thumbnailOf(data: VolumesResponse): string | null {
  const links = data.items?.[0]?.volumeInfo?.imageLinks;
  return httpsCover(links?.thumbnail) ?? httpsCover(links?.smallThumbnail);
}

/**
 * R15: a capa do primeiro resultado, em https. Se não achar, se a busca falhar ou se demorar
 * mais que o tempo-limite, devolve null e a indicação segue sem capa.
 */
export async function findCover(
  book: Pick<Book, 'title' | 'author'>,
  fetcher: typeof fetch = fetch,
  timeoutMs = TIMEOUT_MS,
  apiKey?: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetcher(coverSearchUrl(book, apiKey), { signal: controller.signal });
    if (!response.ok) return null;
    // Todos os campos são opcionais: uma resposta diferente só resulta em "sem capa".
    return thumbnailOf((await response.json()) as VolumesResponse);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
