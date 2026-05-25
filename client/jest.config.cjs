module.exports = {
    testEnvironment: 'jsdom',
  
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  
    moduleFileExtensions: ['js', 'jsx'],
  
    setupFiles: ['./jest.setup.js'],
  
    globals: {
      'import.meta': { env: {} },
    },
  };