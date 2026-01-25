// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // This is important for handling ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)',
  ],
  // Force exit after tests to handle any hanging connections
  forceExit: true,
  // Increase timeout for tests that might be slower
  testTimeout: 10000,
};