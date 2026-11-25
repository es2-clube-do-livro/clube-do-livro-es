/**
 * O resultado de uma regra: o novo valor ou o código do erro. A tela escolhe a mensagem, e o
 * teste confere o código.
 */
export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}

export function err<E extends string>(error: E): { ok: false; error: E } {
  return { ok: false, error };
}
