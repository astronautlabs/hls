/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
      "src/"
    ],
    testMatch: [ "**/*.test.ts" ],
    watchman: false,
  };
  