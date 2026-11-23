import { Navigate, NavLink, Route, Routes } from 'react-router';

import { HistoryPage } from '../features/history/HistoryPage';
import { MembersPage } from '../features/members/MembersPage';
import { RoundPage } from '../features/round/RoundPage';
import styles from './App.module.css';

const TABS = [
  { to: '/', label: 'Rodada' },
  { to: '/membros', label: 'Membros' },
  { to: '/historico', label: 'Histórico' },
];

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Clube do Livro</h1>
        <nav aria-label="Abas do clube">
          <ul className={styles.tabs}>
            {TABS.map((tab) => (
              <li key={tab.to}>
                <NavLink to={tab.to} end className={styles.tab}>
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<RoundPage />} />
          <Route path="/membros" element={<MembersPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
