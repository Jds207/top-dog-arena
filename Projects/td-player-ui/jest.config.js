module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/projects/**/*.(test|spec).ts'],
  collectCoverageFrom: [
    'projects/**/*.ts',
    '!projects/**/*.spec.ts',
    '!projects/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/projects/$1',
  },
};
