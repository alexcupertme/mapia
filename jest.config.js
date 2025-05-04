const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

let prettierPath;

try {
  // for work with jest snapshot
  prettierPath = require.resolve('jest-prettier');
} catch { }

/** @type {import('ts-jest').JestConfigWithTsJest} */
let config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).e2e.[jt]s?(x)',
    ],
  moduleNameMapper: compilerOptions.paths ? pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }) : {},
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};
if (prettierPath) {
  config.prettierPath = prettierPath;
}

module.exports = config;