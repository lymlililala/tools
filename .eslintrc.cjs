/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ['@antfu', './.eslintrc-auto-import.json', '@unocss'],

  rules: {
    'curly': ['error', 'all'],
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-use-before-define': ['error', { allowNamedExports: true, functions: false }],
    'vue/no-empty-component-block': ['error'],
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@vueuse/core',
        importNames: ['useClipboard'],
        message: 'Please use local useCopy from src/composable/copy.ts instead of useClipboard.',
      }],
    }],
  },

  overrides: [
    {
      // Generated/DB-maintained article content; bodies embed code blocks
      // (e.g. Makefiles) where literal tabs are intentional and significant.
      files: ['src/pages/articles/articles.data.ts'],
      rules: {
        'no-tabs': 'off',
      },
    },
  ],
};
