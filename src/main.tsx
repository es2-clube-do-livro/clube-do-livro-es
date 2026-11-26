import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './app/App';
import { StoredClub } from './features/data/StoredClub';
import { CoverFinderContext, firstCover } from './services/cover-finder';
import { findCover } from './services/google-books';
import { findOpenLibraryCover } from './services/open-library';
import { createLocalStorageRepository } from './storage/local-storage';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html.');

const repository = createLocalStorageRepository();
const initial = repository.load();

// R15: primeiro o Google Livros (com a chave do projeto, se o build tiver uma); sem resultado,
// a Open Library.
const googleBooksKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const findBookCover = firstCover(
  (book) => findCover(book, fetch, undefined, googleBooksKey),
  (book) => findOpenLibraryCover(book),
);

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <StoredClub repository={repository} initial={initial}>
        <CoverFinderContext value={findBookCover}>
          <App />
        </CoverFinderContext>
      </StoredClub>
    </BrowserRouter>
  </StrictMode>,
);
