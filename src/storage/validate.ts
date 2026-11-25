import type { ClubState, Winner } from '../domain/types';

type Fields = Record<string, unknown>;

function isObject(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isList(value: unknown, accepts: (item: unknown) => boolean): boolean {
  return Array.isArray(value) && value.every(accepts);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDate(value: unknown): boolean {
  return isText(value) && Number.isFinite(Date.parse(value));
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isMember(value: unknown): boolean {
  return isObject(value) && isText(value.id) && isText(value.name);
}

function isBook(value: unknown): boolean {
  if (!isObject(value) || !isText(value.title) || !isText(value.author)) return false;
  const cover = value.coverUrl;
  return (
    cover === null || (isText(cover) && URL.canParse(cover) && new URL(cover).protocol === 'https:')
  );
}

function isNomination(value: unknown): boolean {
  return isObject(value) && isText(value.id) && isText(value.memberId) && isBook(value.book);
}

function isTally(value: unknown): boolean {
  return isObject(value) && Object.values(value).every(isCount);
}

function isResults(value: unknown): boolean {
  return isObject(value) && isTally(value.votes) && isTally(value.firsts);
}

function isWinner(value: unknown): value is Winner {
  if (!isObject(value) || !isText(value.nominationId)) return false;
  return value.method === 'votes' || value.method === 'first-choices' || value.method === 'draw';
}

function hasResult(round: Fields): boolean {
  const winner = round.winner;
  return (
    isWinner(winner) &&
    isDate(round.closedAt) &&
    Array.isArray(round.nominations) &&
    round.nominations.some((item: unknown) => isObject(item) && item.id === winner.nominationId)
  );
}

function hasValidStage(round: Fields): boolean {
  switch (round.status) {
    case 'nominating':
    case 'voting':
      return round.winner === null && round.closedAt === null && round.finishedAt === null;
    case 'reading':
      return hasResult(round) && round.finishedAt === null;
    case 'finished':
      return hasResult(round) && isDate(round.finishedAt);
    default:
      return false;
  }
}

function isRound(value: unknown): boolean {
  if (!isObject(value) || !isText(value.id) || !isCount(value.number) || value.number < 1)
    return false;
  return (
    isDate(value.startedAt) &&
    hasValidStage(value) &&
    isList(value.nominations, isNomination) &&
    isList(value.voters, isText) &&
    isResults(value.results)
  );
}

export function isClubState(value: unknown): value is ClubState {
  return (
    isObject(value) &&
    value.version === 1 &&
    isList(value.members, isMember) &&
    isList(value.rounds, isRound)
  );
}
