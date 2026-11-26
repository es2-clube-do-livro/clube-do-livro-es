/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave de API do Google Livros, restrita ao site. Sem ela, a busca usa a cota pública. */
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string;
}
