// AI-USAGE SUMMARY
// Tools: ChatGPT
// Overall AI Contribution: ~10%
// AI-Assisted Areas: Jest configuration for Node/Express backend tests -- verification
// Human Contributions: Confirmed project folder structure and verified tests run successfully
// Notes: Configuration supports isolated backend authentication testing using Jest and Supertest.
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 15000,
};
