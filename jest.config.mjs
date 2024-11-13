// jest.config.mjs

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: [
    'src/**/*.ts',    
    '!src/**/app.ts' 
  ],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true // Enable ESM support in ts-jest
      }
    ]
  },
  moduleFileExtensions: ["ts", "js"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1" // Map paths to handle TypeScript/ESM resolution
  },
  testTimeout: 20000,
};

export default config;
