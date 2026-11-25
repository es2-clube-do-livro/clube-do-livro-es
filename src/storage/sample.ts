import type { ClubEnvironment } from '../app/club-context';
import type { ClubState, Member, Nomination } from '../domain/types';

const BOOKS = [
  { name: 'Ana', title: 'Dom Casmurro', author: 'Machado de Assis' },
  { name: 'Bruno', title: 'Quarto de despejo', author: 'Carolina Maria de Jesus' },
  { name: 'Clara', title: 'A hora da estrela', author: 'Clarice Lispector' },
];

export function sampleClub(env: Pick<ClubEnvironment, 'newId' | 'now'>): ClubState {
  const members: Member[] = [];
  const nominations: Nomination[] = [];
  for (const { name, title, author } of BOOKS) {
    const memberId = env.newId();
    members.push({ id: memberId, name });
    nominations.push({ id: env.newId(), memberId, book: { title, author, coverUrl: null } });
  }
  members.push({ id: env.newId(), name: 'Diego' });
  return {
    version: 1,
    members,
    rounds: [
      {
        id: env.newId(),
        number: 1,
        status: 'nominating',
        nominations,
        voters: [],
        results: { votes: {}, firsts: {} },
        winner: null,
        startedAt: env.now(),
        closedAt: null,
        finishedAt: null,
      },
    ],
  };
}
