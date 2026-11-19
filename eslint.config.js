import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'tests/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'max-lines': ['error', { max: 200, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: false, skipComments: false }],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'max-lines-per-function': ['error', { max: 90, skipBlankLines: false, skipComments: false }],
    },
  },
  {
    files: ['src/**/*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'ExportDefaultDeclaration is forbidden in src; use named exports.',
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Domain layer cannot access window' },
        { name: 'document', message: 'Domain layer cannot access document' },
        { name: 'fetch', message: 'Domain layer cannot access fetch' },
        { name: 'localStorage', message: 'Domain layer cannot access localStorage' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'zustand',
                'zod',
                '**/features/**',
                '**/ai/**',
                '**/data/**',
                '**/state/**',
                '**/app/**',
              ],
              message:
                'Domain layer is pure TypeScript and imports nothing outside domain and config',
            },
            {
              group: ['**/shared/**', '!**/shared/result*', '!**/shared/ports*'],
              message: 'Domain layer cannot import UI or framework shared modules',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '!./**'],
              message: 'Features must not import other features',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '**/app/**'],
              message: 'Shared layer cannot import features or app',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/state/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '**/app/**'],
              message: 'State layer imports domain and config only',
            },
          ],
        },
      ],
    },
  },
);
