// AI-USAGE SUMMARY
// Tools: ChatGPT
// Overall AI Contribution: ~25%
// AI-Assisted Areas: Jest setup cleanup and controlled console noise during expected error-path tests
// Human Contributions: Decided to keep test output readable, reviewed impact, and verified test results
// Notes: This setup only affects test runtime and does not change application behavior.
// Runs before each test file , to silences noisy logs during tests.
beforeAll(() => {
    if (!process.env.DEBUG_LOGS) {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      }
});

afterAll(() => {
    jest.restoreAllMocks();
})
