import { createContext, useContext } from 'react';

import type { Book } from '../domain/types';

/** Busca a capa de um livro; devolve null quando não há capa. */
export type CoverFinder = (book: Pick<Book, 'title' | 'author'>) => Promise<string | null>;

const noCover: CoverFinder = () => Promise.resolve(null);

/**
 * O site usa a busca no Google Livros (veja main.tsx). Sem provider, nenhuma capa é buscada:
 * é assim que os testes de tela rodam sem internet.
 */
export const CoverFinderContext = createContext<CoverFinder>(noCover);

export function useCoverFinder(): CoverFinder {
  return useContext(CoverFinderContext);
}
