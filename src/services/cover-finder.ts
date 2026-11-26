import { createContext, useContext } from 'react';

import type { Book } from '../domain/types';

/** Busca a capa de um livro; devolve null quando não há capa. */
export type CoverFinder = (book: Pick<Book, 'title' | 'author'>) => Promise<string | null>;

const noCover: CoverFinder = () => Promise.resolve(null);

/** Tenta cada busca na ordem e fica com a primeira capa encontrada; as seguintes nem rodam. */
export function firstCover(...finders: readonly CoverFinder[]): CoverFinder {
  return (book) =>
    finders.reduce<Promise<string | null>>(
      (found, find) => found.then((cover) => cover ?? find(book)),
      Promise.resolve(null),
    );
}

/**
 * O site busca no Google Livros e, sem resultado, na Open Library (veja main.tsx). Sem provider,
 * nenhuma capa é buscada: é assim que os testes de tela rodam sem internet.
 */
export const CoverFinderContext = createContext<CoverFinder>(noCover);

export function useCoverFinder(): CoverFinder {
  return useContext(CoverFinderContext);
}
