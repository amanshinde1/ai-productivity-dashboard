module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': [
      'warn',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^(set|clear)',
        'caughtErrorsIgnorePattern': '^_',
      },
    ],
  },
};
