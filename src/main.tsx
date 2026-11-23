import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './app/App';
import { ClubProvider } from './app/ClubProvider';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ClubProvider>
        <App />
      </ClubProvider>
    </BrowserRouter>
  </StrictMode>,
);
