/**
 * O vocabulário do clube. Uma rodada é um ciclo de indicação → votação → leitura e escolhe
 * um livro.
 */

export type MemberId = string;
export type NominationId = string;
export type RoundId = string;

export interface Member {
  id: MemberId;
  name: string;
}

export interface Book {
  title: string;
  author: string;
  /** Endereço https da capa encontrada no Google Livros, ou null. */
  coverUrl: string | null;
}

/** `memberId` existe só para barrar o voto no próprio livro; a tela nunca o mostra. */
export interface Nomination {
  id: NominationId;
  memberId: MemberId;
  book: Book;
}

export type RoundStatus = 'nominating' | 'voting' | 'reading' | 'finished';

export type Tally = Readonly<Record<NominationId, number>>;

/** Somas por indicação: nunca as cédulas, para o voto continuar secreto. */
export interface Results {
  /** Todos os votos, de 1ª e de 2ª opção. */
  votes: Tally;
  /** Só os votos de 1ª opção, que desempatam. */
  firsts: Tally;
}

/** O que decidiu a rodada: mais votos, mais votos de 1ª opção ou sorteio. */
export type DecisionMethod = 'votes' | 'first-choices' | 'draw';

export interface Winner {
  nominationId: NominationId;
  method: DecisionMethod;
}

export interface Round {
  id: RoundId;
  number: number;
  status: RoundStatus;
  nominations: readonly Nomination[];
  /** Quem já votou, sem o que escolheu. */
  voters: readonly MemberId[];
  results: Results;
  winner: Winner | null;
  /** Datas em ISO 8601, para caberem no JSON salvo no navegador. */
  startedAt: string;
  closedAt: string | null;
  finishedAt: string | null;
}

export interface ClubState {
  version: 1;
  members: readonly Member[];
  rounds: readonly Round[];
}
