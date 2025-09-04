const request = require('supertest');
const app = require('./server.js');
const connectDB = require('./config/db.js');
const { User } = require('./models/userModel.js');
const bcrypt = require('bcryptjs');

describe('Admin Auth - Testes de Fumaça', () => {
  let adminUser;
  let adminCookies;

  beforeAll(async () => {
    // Conectar ao banco de dados
    await connectDB();
    
    // Limpar usuários de teste anteriores
    await User.deleteMany({ email: { $regex: /test\d+@x\.com/ } });
    
    // Criar usuário admin para testes
    console.log('👑 Criando usuário admin para testes...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    adminUser = await User.create({
      name: 'Admin Teste',
      email: 'testadmin@x.com',
      password: hashedPassword,
      role: 'admin',
      isAdmin: true
    });

    console.log('✅ Usuário admin criado:', adminUser.email);
  });

  afterAll(async () => {
    // Limpar dados de teste
    await User.deleteMany({ email: { $regex: /test\d+@x\.com/ } });
    
    // Fechar conexão do banco
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });

  describe('Autenticação de Administrador', () => {
    it('deve fazer login como admin e acessar perfil', async () => {
      console.log('🔑 Testando login de admin...');
      
      // 1. Fazer login como admin
      const loginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('admin');
      expect(loginResponse.body.admin.email).toBe('testadmin@x.com');
      expect(loginResponse.body.admin.role).toBe('admin');
      expect(loginResponse.body.admin.isAdmin).toBe(true);

      // Verificar se cookies foram definidos
      adminCookies = loginResponse.headers['set-cookie'];
      expect(adminCookies).toBeDefined();
      expect(adminCookies.length).toBeGreaterThan(0);

      // Verificar se access_token está presente
      const hasAccessToken = adminCookies.some(cookie => cookie.includes('access_token'));
      expect(hasAccessToken).toBe(true);

      console.log('✅ Login de admin bem-sucedido');

      // 2. Acessar perfil de admin
      console.log('👑 Testando acesso ao perfil de admin...');
      const profileResponse = await request(app)
        .get('/api/admin/me')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('admin');
      expect(profileResponse.body.admin.email).toBe('testadmin@x.com');
      expect(profileResponse.body.admin.role).toBe('admin');

      console.log('✅ Perfil de admin acessado com sucesso');
    });

    it('deve rejeitar login de admin com credenciais inválidas', async () => {
      console.log('❌ Testando rejeição de credenciais inválidas de admin...');

      // Tentar login com senha incorreta
      const invalidPasswordResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'senhaerrada'
        })
        .expect(401);

      expect(invalidPasswordResponse.body).toHaveProperty('error');

      // Tentar login com email inexistente
      const invalidEmailResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admininexistente@x.com',
          password: 'admin123'
        })
        .expect(401);

      expect(invalidEmailResponse.body).toHaveProperty('error');

      console.log('✅ Credenciais inválidas de admin rejeitadas corretamente');
    });

    it('deve fazer logout de admin e invalidar sessão', async () => {
      console.log('🚪 Testando logout de admin...');
      
      // 1. Verificar que está autenticado
      await request(app)
        .get('/api/admin/me')
        .set('Cookie', adminCookies)
        .expect(200);

      // 2. Fazer logout
      const logoutResponse = await request(app)
        .post('/api/admin/logout')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(logoutResponse.body).toHaveProperty('message');
      expect(logoutResponse.body.message).toContain('Logout realizado');

      // 3. Verificar que não consegue mais acessar perfil
      console.log('🔒 Verificando que sessão de admin foi invalidada...');
      await request(app)
        .get('/api/admin/me')
        .set('Cookie', adminCookies)
        .expect(401);

      console.log('✅ Logout de admin funcionando corretamente');
    });
  });

  describe('Gerenciamento de Usuários (Admin)', () => {
    let testUser;
    let testUserCookies;

    beforeEach(async () => {
      // Criar usuário comum para testes
      console.log('👤 Criando usuário comum para testes de admin...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      testUser = await User.create({
        name: 'Usuário Comum',
        email: 'testuser@x.com',
        password: hashedPassword,
        role: 'user',
        isAdmin: false
      });

      // Fazer login como usuário comum para obter cookies
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@x.com',
          password: '123456'
        });

      testUserCookies = loginResponse.headers['set-cookie'];
    });

    afterEach(async () => {
      // Limpar usuário de teste
      await User.findByIdAndDelete(testUser._id);
    });

    it('deve listar usuários (apenas admin)', async () => {
      // Fazer login como admin novamente
      console.log('🔑 Fazendo login como admin para testes...');
      const adminLoginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        });

      const adminCookies = adminLoginResponse.headers['set-cookie'];

      // 1. Admin deve conseguir listar usuários
      console.log('📋 Testando listagem de usuários por admin...');
      const listResponse = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(listResponse.body).toHaveProperty('users');
      expect(Array.isArray(listResponse.body.users)).toBe(true);
      expect(listResponse.body.users.length).toBeGreaterThan(0);

      // Verificar se o usuário de teste está na lista
      const foundUser = listResponse.body.users.find(u => u.email === 'testuser@x.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe('Usuário Comum');

      console.log('✅ Listagem de usuários funcionando para admin');

      // 2. Usuário comum NÃO deve conseguir listar usuários
      console.log('🚫 Verificando que usuário comum não pode listar usuários...');
      await request(app)
        .get('/api/admin/users')
        .set('Cookie', testUserCookies)
        .expect(403);

      console.log('✅ Acesso restrito funcionando corretamente');
    });

    it('deve obter detalhes de usuário específico (apenas admin)', async () => {
      // Fazer login como admin
      const adminLoginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        });

      const adminCookies = adminLoginResponse.headers['set-cookie'];

      // 1. Admin deve conseguir obter detalhes do usuário
      console.log('👤 Testando obtenção de detalhes de usuário por admin...');
      const userDetailsResponse = await request(app)
        .get(`/api/admin/users/${testUser._id}`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(userDetailsResponse.body).toHaveProperty('user');
      expect(userDetailsResponse.body.user.email).toBe('testuser@x.com');
      expect(userDetailsResponse.body.user.name).toBe('Usuário Comum');
      expect(userDetailsResponse.body.user.role).toBe('user');

      console.log('✅ Detalhes de usuário obtidos com sucesso');

      // 2. Usuário comum NÃO deve conseguir obter detalhes de outros usuários
      console.log('🚫 Verificando que usuário comum não pode acessar detalhes...');
      await request(app)
        .get(`/api/admin/users/${testUser._id}`)
        .set('Cookie', testUserCookies)
        .expect(403);

      console.log('✅ Acesso restrito funcionando corretamente');
    });

    it('deve ativar/desativar usuário (apenas admin)', async () => {
      // Fazer login como admin
      const adminLoginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        });

      const adminCookies = adminLoginResponse.headers['set-cookie'];

      // 1. Verificar estado inicial
      console.log('📊 Verificando estado inicial do usuário...');
      const initialUser = await User.findById(testUser._id);
      expect(initialUser.isActive).toBe(true);

      // 2. Desativar usuário
      console.log('🚫 Testando desativação de usuário...');
      const deactivateResponse = await request(app)
        .patch(`/api/admin/users/${testUser._id}/toggle-status`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(deactivateResponse.body).toHaveProperty('message');
      expect(deactivateResponse.body.message).toContain('desativado');

      // Verificar se foi desativado
      const deactivatedUser = await User.findById(testUser._id);
      expect(deactivatedUser.isActive).toBe(false);

      console.log('✅ Usuário desativado com sucesso');

      // 3. Reativar usuário
      console.log('✅ Testando reativação de usuário...');
      const reactivateResponse = await request(app)
        .patch(`/api/admin/users/${testUser._id}/toggle-status`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(reactivateResponse.body).toHaveProperty('message');
      expect(reactivateResponse.body.message).toContain('ativado');

      // Verificar se foi reativado
      const reactivatedUser = await User.findById(testUser._id);
      expect(reactivatedUser.isActive).toBe(true);

      console.log('✅ Usuário reativado com sucesso');
    });

    it('deve revogar sessões de usuário (apenas admin)', async () => {
      // Fazer login como admin
      const adminLoginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        });

      const adminCookies = adminLoginResponse.headers['set-cookie'];

      // 1. Verificar que usuário pode acessar perfil
      console.log('🔐 Verificando acesso do usuário antes da revogação...');
      await request(app)
        .get('/api/users/me')
        .set('Cookie', testUserCookies)
        .expect(200);

      // 2. Revogar todas as sessões do usuário
      console.log('🗑️ Testando revogação de sessões por admin...');
      const revokeResponse = await request(app)
        .post(`/api/admin/users/${testUser._id}/revoke-sessions`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(revokeResponse.body).toHaveProperty('message');
      expect(revokeResponse.body.message).toContain('sessões revogadas');

      // 3. Verificar que usuário não consegue mais acessar perfil
      console.log('🔒 Verificando que sessões foram revogadas...');
      await request(app)
        .get('/api/users/me')
        .set('Cookie', testUserCookies)
        .expect(401);

      console.log('✅ Revogação de sessões funcionando corretamente');
    });
  });

  describe('Estatísticas do Sistema (Admin)', () => {
    it('deve obter estatísticas do sistema (apenas admin)', async () => {
      // Fazer login como admin
      console.log('🔑 Fazendo login como admin para estatísticas...');
      const adminLoginResponse = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'testadmin@x.com',
          password: 'admin123'
        });

      const adminCookies = adminLoginResponse.headers['set-cookie'];

      // 1. Admin deve conseguir obter estatísticas
      console.log('📊 Testando obtenção de estatísticas do sistema...');
      const statsResponse = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(statsResponse.body).toHaveProperty('stats');
      expect(statsResponse.body.stats).toHaveProperty('totalUsers');
      expect(statsResponse.body.stats).toHaveProperty('activeUsers');
      expect(statsResponse.body.stats).toHaveProperty('totalTokens');
      expect(statsResponse.body.stats).toHaveProperty('validTokens');

      console.log('✅ Estatísticas do sistema obtidas com sucesso');

      // 2. Usuário comum NÃO deve conseguir obter estatísticas
      console.log('🚫 Verificando que usuário comum não pode acessar estatísticas...');
      await request(app)
        .get('/api/admin/stats')
        .set('Cookie', testUserCookies)
        .expect(403);

      console.log('✅ Acesso restrito funcionando corretamente');
    });
  });
});
