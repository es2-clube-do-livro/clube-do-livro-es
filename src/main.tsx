import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './app/App';
import { StoredClub } from './features/data/StoredClub';
import { createLocalStorageRepository } from './storage/local-storage';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html.');

const repository = createLocalStorageRepository();
const initial = repository.load();

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <StoredClub repository={repository} initial={initial}>
        <App />
      </StoredClub>
    </BrowserRouter>
  </StrictMode>,
);
