import globals from 'globals';

export default [
  {
    files: ['app/scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      quotes: ['error', 'single'],
    },
  },
];
