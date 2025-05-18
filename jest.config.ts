import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/backend/tests',
    '<rootDir>/frontend/src/__tests__',
    '<rootDir>/tests'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    '<rootDir>/frontend/src/__tests__/setup.ts',
    '<rootDir>/tests/utils/setup-performance.ts'
  ],
  reporters: [
    'default',
    ['<rootDir>/tests/utils/test-reporter.ts', {}]
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/app/**/*.py',
    'frontend/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/test_*.py'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': 'jest-transform-stub'
  },
  globalSetup: '<rootDir>/tests/utils/global-setup.ts',
  globalTeardown: '<rootDir>/tests/utils/global-teardown.ts',
  testTimeout: 30000,
  maxWorkers: '50%',
  verbose: true
}

export default config;