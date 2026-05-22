// Runs before each test file , to silences noisy logs during tests.
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
})