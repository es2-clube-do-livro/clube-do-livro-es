/**
 * Conventional Commits, com a descrição em português: `tipo(escopo): descrição no presente`.
 * Os escopos são as áreas do sistema (veja CONTRIBUTING.md).
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'subject-case': [0],
    'scope-enum': [
      2,
      'always',
      [
        'dominio',
        'app',
        'ui',
        'membros',
        'indicacoes',
        'rodada',
        'votacao',
        'apuracao',
        'leitura',
        'historico',
        'dados',
        'e2e',
        'deps',
      ],
    ],
  },
};
