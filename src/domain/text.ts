/** Tira os espaços das pontas e junta os espaços repetidos. */
export function cleanSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * A forma de comparar nomes e títulos: sem acentos, sem maiúsculas, sem pontuação e sem
 * espaços extras. "  Dom  Casmurro!" e "dom casmurro" ficam iguais.
 */
export function normalizeText(text: string): string {
  const withoutAccents = text.normalize('NFD').replace(/\p{M}/gu, '');
  return cleanSpaces(withoutAccents.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' '));
}
