// Configuração de ambiente para testes
process.env.NODE_ENV = 'test';

// Configurações específicas para testes
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';

// Configurações de banco para testes
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fabiana-financas-test';

// Configurações de CORS para testes
process.env.FRONTEND_URL = 'http://localhost:3000';

// Configurações de cookies para testes
process.env.COOKIE_SECRET = 'test-cookie-secret';

// Configurações de porta para testes
process.env.PORT = 5001;

// Configurações de timeout para testes
process.env.TEST_TIMEOUT = '30000';

console.log('🧪 Ambiente de teste configurado');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🗄️ MONGODB_URI:', process.env.MONGODB_URI);
console.log('🔐 JWT_SECRET configurado');
console.log('🍪 COOKIE_SECRET configurado');
console.log('⏱️ TEST_TIMEOUT:', process.env.TEST_TIMEOUT);
