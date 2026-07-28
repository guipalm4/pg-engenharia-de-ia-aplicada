import cypress from 'eslint-plugin-cypress/flat';
import playwright from 'eslint-plugin-playwright';
import baseConfig from '../eslint.config.mjs';

export default [
  cypress.configs['recommended'],
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
  {
    // Override or add rules here
    rules: {},
  },
];
