/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require('./jest.config'),
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '!**/__test.e2e__/*'],
};