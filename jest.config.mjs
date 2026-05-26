export default {
  testEnvironment: 'node',
  testMatch: ['**/backend/__tests__/**/*.test.js'],
  transform: {},
  globalSetup: './backend/__tests__/globalSetup.js',
  globalTeardown: './backend/__tests__/globalTeardown.js',
  setupFiles: ['./backend/__tests__/jestSetup.js'],
  testTimeout: 30000,
};
