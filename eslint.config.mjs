import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Базовые рекомендации ESLint
  js.configs.recommended,

  // Наши настройки под Node/CommonJS
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Отключаем правила, конфликтующие с Prettier — держим последним
  eslintConfigPrettier,
];
