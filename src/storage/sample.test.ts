import { expect, it } from 'vitest';

import { activeRound } from '../domain/club';
import { testEnvironment } from '../test/render';
import { sampleClub } from './sample';
import { isClubState } from './validate';

it('R14: monta quatro membros e três indicações distintas numa rodada aberta', () => {
  const env = testEnvironment();
  const club = sampleClub(env);
  const round = activeRound(club);
  expect(isClubState(club)).toBe(true);
  expect(club.members).toHaveLength(4);
  expect(club.rounds).toHaveLength(1);
  expect(round).toMatchObject({
    number: 1,
    status: 'nominating',
    startedAt: env.now(),
    voters: [],
    winner: null,
  });
  const nominations = club.rounds.flatMap((item) => item.nominations);
  expect(nominations).toHaveLength(3);
  expect(new Set(nominations.map((item) => item.memberId)).size).toBe(3);
  expect(club.members.map((member) => member.id)).toEqual(
    expect.arrayContaining(nominations.map((item) => item.memberId)),
  );
  expect(new Set(nominations.map((item) => item.book.title)).size).toBe(3);
});
