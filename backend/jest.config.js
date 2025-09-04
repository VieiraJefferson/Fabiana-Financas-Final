module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Arquivos de teste
  testMatch: [
    '**/test*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configurações de cobertura
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Timeout para testes
  testTimeout: 30000,
  
  // Configurações de setup
  setupFilesAfterEnv: [],
  
  // Variáveis de ambiente para testes
  setupFiles: ['<rootDir>/test-setup.js'],
  
  // Configurações de verbose
  verbose: true,
  
  // Configurações de watch
  watch: false,
  watchAll: false,
  
  // Configurações de bail
  bail: false,
  
  // Configurações de maxWorkers
  maxWorkers: 1,
  
  // Configurações de forceExit
  forceExit: true,
  
  // Configurações de detectOpenHandles
  detectOpenHandles: true,
  
  // Configurações de clearMocks
  clearMocks: true,
  
  // Configurações de restoreMocks
  restoreMocks: true,
  
  // Configurações de resetMocks
  resetMocks: true,
  
  // Configurações de testSequencer
  testSequencer: '<rootDir>/test-sequencer.js'
};
