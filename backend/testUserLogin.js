require('dotenv').config();
const request = require('supertest');
const app = require('./server.js');
const connectDB = require('./config/db.js');
const { User } = require('./models/userModel.js');

describe('User Auth - Testes de Fumaça', () => {
  beforeAll(async () => {
    // Conectar ao banco de dados
    await connectDB();
    
    // Limpar usuários de teste anteriores
    await User.deleteMany({ email: { $regex: /test\d+@x\.com/ } });
  });

  afterAll(async () => {
    // Limpar dados de teste
    await User.deleteMany({ email: { $regex: /test\d+@x\.com/ } });
    
    // Fechar conexão do banco
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });

  describe('Registro e Autenticação de Usuário', () => {
    it('deve registrar um novo usuário e permitir acesso ao perfil', async () => {
      const email = `test${Date.now()}@x.com`;
      const userData = {
        name: 'Usuário Teste',
        email,
        password: '123456'
      };

      // 1. Registrar usuário
      console.log('📝 Testando registro de usuário...');
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user.email).toBe(email);
      expect(registerResponse.body.user.name).toBe(userData.name);
      expect(registerResponse.body.user).toHaveProperty('id');
      expect(registerResponse.body.user).not.toHaveProperty('password');

      // Verificar se cookies foram definidos
      const cookies = registerResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);

      // Verificar se access_token está presente
      const hasAccessToken = cookies.some(cookie => cookie.includes('access_token'));
      expect(hasAccessToken).toBe(true);

      console.log('✅ Usuário registrado com sucesso');

      // 2. Acessar perfil com cookies
      console.log('🔐 Testando acesso ao perfil...');
      const profileResponse = await request(app)
        .get('/api/users/me')
        .set('Cookie', cookies)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('user');
      expect(profileResponse.body.user.email).toBe(email);
      expect(profileResponse.body.user.name).toBe(userData.name);

      console.log('✅ Perfil acessado com sucesso');
    });

    it('deve fazer login e renovar tokens', async () => {
      const email = `test${Date.now()}@x.com`;
      const userData = {
        name: 'Usuário Login',
        email,
        password: '123456'
      };

      // 1. Registrar usuário
      console.log('📝 Criando usuário para teste de login...');
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const cookies = registerResponse.headers['set-cookie'];

      // 2. Fazer logout primeiro
      console.log('🚪 Testando logout...');
      await request(app)
        .post('/api/users/logout')
        .set('Cookie', cookies)
        .expect(200);

      // 3. Fazer login
      console.log('🔑 Testando login...');
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.email).toBe(email);

      const loginCookies = loginResponse.headers['set-cookie'];
      expect(loginCookies).toBeDefined();

      // 4. Acessar perfil após login
      console.log('👤 Testando acesso ao perfil após login...');
      const profileResponse = await request(app)
        .get('/api/users/me')
        .set('Cookie', loginCookies)
        .expect(200);

      expect(profileResponse.body.user.email).toBe(email);

      // 5. Testar renovação de token
      console.log('🔄 Testando renovação de token...');
      const refreshResponse = await request(app)
        .post('/api/users/refresh')
        .set('Cookie', loginCookies)
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('message');
      expect(refreshResponse.body.message).toContain('Token renovado');

      const newCookies = refreshResponse.headers['set-cookie'];
      expect(newCookies).toBeDefined();

      // 6. Verificar se novo token funciona
      console.log('✅ Verificando novo token...');
      const finalProfileResponse = await request(app)
        .get('/api/users/me')
        .set('Cookie', newCookies)
        .expect(200);

      expect(finalProfileResponse.body.user.email).toBe(email);

      console.log('✅ Teste de login e renovação concluído');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      console.log('❌ Testando rejeição de credenciais inválidas...');

      // Tentar login com email inexistente
      const invalidEmailResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'inexistente@x.com',
          password: '123456'
        })
        .expect(401);

      expect(invalidEmailResponse.body).toHaveProperty('error');

      // Tentar login com senha incorreta
      const email = `test${Date.now()}@x.com`;
      await request(app)
        .post('/api/users/register')
        .send({
          name: 'Usuário Teste',
          email,
          password: '123456'
        });

      const invalidPasswordResponse = await request(app)
        .post('/api/users/login')
        .send({
          email,
          password: 'senhaerrada'
        })
        .expect(401);

      expect(invalidPasswordResponse.body).toHaveProperty('error');

      console.log('✅ Credenciais inválidas rejeitadas corretamente');
    });

    it('deve fazer logout e invalidar sessão', async () => {
      const email = `test${Date.now()}@x.com`;
      
      // 1. Registrar e fazer login
      console.log('📝 Preparando usuário para teste de logout...');
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Usuário Logout',
          email,
          password: '123456'
        });

      const cookies = registerResponse.headers['set-cookie'];

      // 2. Verificar que está autenticado
      await request(app)
        .get('/api/users/me')
        .set('Cookie', cookies)
        .expect(200);

      // 3. Fazer logout
      console.log('🚪 Testando logout...');
      await request(app)
        .post('/api/users/logout')
        .set('Cookie', cookies)
        .expect(200);

      // 4. Verificar que não consegue mais acessar perfil
      console.log('🔒 Verificando que sessão foi invalidada...');
      await request(app)
        .get('/api/users/me')
        .set('Cookie', cookies)
        .expect(401);

      console.log('✅ Logout funcionando corretamente');
    });
  });

  describe('Logout de Todas as Sessões', () => {
    it('deve fazer logout de todas as sessões', async () => {
      const email = `test${Date.now()}@x.com`;
      
      // 1. Registrar usuário
      console.log('📝 Preparando usuário para teste de logout-all...');
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Usuário Multi-Sessão',
          email,
          password: '123456'
        });

      const cookies = registerResponse.headers['set-cookie'];

      // 2. Fazer logout de todas as sessões
      console.log('🗑️ Testando logout de todas as sessões...');
      await request(app)
        .post('/api/users/logout-all')
        .set('Cookie', cookies)
        .expect(200);

      // 3. Verificar que não consegue mais acessar perfil
      console.log('🔒 Verificando que todas as sessões foram invalidadas...');
      await request(app)
        .get('/api/users/me')
        .set('Cookie', cookies)
        .expect(401);

      console.log('✅ Logout de todas as sessões funcionando');
    });
  });

  describe('Estados de Sessão', () => {
    it('deve obter estatísticas de sessões', async () => {
      const email = `test${Date.now()}@x.com`;
      
      // 1. Registrar usuário
      console.log('📝 Preparando usuário para teste de estatísticas...');
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Usuário Estatísticas',
          email,
          password: '123456'
        });

      const cookies = registerResponse.headers['set-cookie'];

      // 2. Obter estatísticas de sessões
      console.log('📊 Testando obtenção de estatísticas de sessões...');
      const statsResponse = await request(app)
        .get('/api/users/sessions')
        .set('Cookie', cookies)
        .expect(200);

      expect(statsResponse.body).toHaveProperty('activeTokens');
      expect(statsResponse.body).toHaveProperty('recentSessions');
      expect(Array.isArray(statsResponse.body.activeTokens)).toBe(true);
      expect(Array.isArray(statsResponse.body.recentSessions)).toBe(true);

      console.log('✅ Estatísticas de sessões obtidas com sucesso');
    });
  });
});
