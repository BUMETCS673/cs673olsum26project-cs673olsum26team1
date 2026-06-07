module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/../../testing/servertest'],
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/../../testing/servertest/setup.js'],
  modulePaths: ['<rootDir>/node_modules'],
};