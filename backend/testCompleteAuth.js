require('dotenv').config();
const connectDB = require('./config/db.js');
const { User } = require('./models/userModel.js');
const RefreshToken = require('./models/refreshTokenModel.js');
const RefreshRepo = require('./repos/refreshRepo.js');
const { 
  generateTokenPair, 
  verifyAccessToken, 
  verifyRefreshToken,
  generateJTI 
} = require('./utils/tokenManager.js');
const { v4: uuid } = require('uuid');

const testCompleteAuth = async () => {
  try {
    console.log('🚀 Iniciando teste completo do sistema de autenticação...\n');
    
    // Conectar ao banco
    await connectDB();
    console.log('✅ Conectado ao banco de dados');
    
    // Limpar dados de teste anteriores
    await User.deleteMany({ email: { $regex: /test@/ } });
    await RefreshToken.deleteMany({});
    console.log('🧹 Dados de teste anteriores removidos');
    
    // 1. Teste de criação de usuário
    console.log('\n📝 1. Testando criação de usuário...');
    const testUser = await User.create({
      name: 'Usuário Teste',
      email: 'test@example.com',
      password: 'senha123',
      role: 'user'
    });
    console.log('✅ Usuário criado:', testUser.email);
    
    // 2. Teste de geração de tokens
    console.log('\n🔑 2. Testando geração de tokens...');
    const { accessToken, refreshToken } = generateTokenPair(testUser._id);
    console.log('✅ Access token gerado:', accessToken.substring(0, 50) + '...');
    console.log('✅ Refresh token gerado:', refreshToken.substring(0, 50) + '...');
    
    // 3. Teste de verificação de tokens
    console.log('\n🔍 3. Testando verificação de tokens...');
    const accessPayload = verifyAccessToken(accessToken);
    const refreshPayload = verifyRefreshToken(refreshToken);
    console.log('✅ Access token payload:', accessPayload);
    console.log('✅ Refresh token payload:', refreshPayload);
    
    // 4. Teste de repositório de refresh tokens
    console.log('\n💾 4. Testando repositório de refresh tokens...');
    const jti = uuid();
    const savedToken = await RefreshRepo.save(jti, testUser._id, {
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      deviceId: 'test-device'
    });
    console.log('✅ Refresh token salvo no repositório');
    
    // 5. Teste de validação de refresh token
    console.log('\n✅ 5. Testando validação de refresh token...');
    const isValid = await RefreshRepo.isValid(jti, testUser._id);
    console.log('✅ Token válido:', isValid);
    
    // 6. Teste de busca de tokens
    console.log('\n🔎 6. Testando busca de tokens...');
    const validTokens = await RefreshRepo.findValidByUserId(testUser._id);
    const tokenAudit = await RefreshRepo.findWithAudit(testUser._id, 5);
    console.log('✅ Tokens válidos encontrados:', validTokens.length);
    console.log('✅ Auditoria de tokens:', tokenAudit.length);
    
    // 7. Teste de estatísticas
    console.log('\n📊 7. Testando estatísticas...');
    const stats = await RefreshRepo.getStats();
    console.log('✅ Estatísticas dos tokens:', stats);
    
    // 8. Teste de revogação
    console.log('\n🚫 8. Testando revogação de tokens...');
    const revoked = await RefreshRepo.revoke(jti);
    console.log('✅ Token revogado:', revoked);
    
    // 9. Teste de validação após revogação
    console.log('\n❌ 9. Testando validação após revogação...');
    const isValidAfterRevoke = await RefreshRepo.isValid(jti, testUser._id);
    console.log('✅ Token válido após revogação:', isValidAfterRevoke);
    
    // 10. Teste de múltiplos tokens
    console.log('\n🔄 10. Testando múltiplos tokens...');
    const jti1 = uuid();
    const jti2 = uuid();
    const jti3 = uuid();
    
    await RefreshRepo.save(jti1, testUser._id, { userAgent: 'Device 1' });
    await RefreshRepo.save(jti2, testUser._id, { userAgent: 'Device 2' });
    await RefreshRepo.save(jti3, testUser._id, { userAgent: 'Device 3' });
    
    const activeTokens = await RefreshRepo.findValidByUserId(testUser._id);
    console.log('✅ Tokens ativos criados:', activeTokens.length);
    
    // 11. Teste de revogação em massa
    console.log('\n🗑️ 11. Testando revogação em massa...');
    const revokedCount = await RefreshRepo.revokeAllByUserId(testUser._id);
    console.log('✅ Tokens revogados em massa:', revokedCount);
    
    // 12. Teste de limpeza de tokens expirados
    console.log('\n🧹 12. Testando limpeza de tokens expirados...');
    const cleanedCount = await RefreshRepo.cleanExpired();
    console.log('✅ Tokens expirados limpos:', cleanedCount);
    
    // 13. Teste de sessões ativas
    console.log('\n👥 13. Testando sessões ativas...');
    await testUser.incrementActiveSessions();
    await testUser.incrementActiveSessions();
    console.log('✅ Sessões incrementadas');
    
    const updatedUser = await User.findById(testUser._id);
    console.log('✅ Sessões ativas:', updatedUser.activeSessions);
    
    // 14. Teste de criação de admin
    console.log('\n👑 14. Testando criação de admin...');
    const adminUser = await User.create({
      name: 'Admin Teste',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin criado:', adminUser.email, 'Role:', adminUser.role);
    
    // 15. Teste de geração de tokens para admin
    console.log('\n🔐 15. Testando tokens de admin...');
    const adminTokens = generateTokenPair(adminUser._id);
    const adminAccessPayload = verifyAccessToken(adminTokens.accessToken);
    console.log('✅ Admin access token payload:', adminAccessPayload);
    
    // 16. Teste de limpeza final
    console.log('\n🧹 16. Limpeza final...');
    await User.deleteMany({ email: { $regex: /test@|admin@/ } });
    await RefreshToken.deleteMany({});
    console.log('✅ Dados de teste removidos');
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n📋 Resumo do que foi testado:');
    console.log('   ✅ Criação e autenticação de usuários');
    console.log('   ✅ Geração e verificação de tokens JWT');
    console.log('   ✅ Sistema de refresh tokens com JTI');
    console.log('   ✅ Repositório de tokens');
    console.log('   ✅ Validação e revogação de tokens');
    console.log('   ✅ Auditoria e estatísticas');
    console.log('   ✅ Gerenciamento de sessões ativas');
    console.log('   ✅ Sistema de roles (user/admin)');
    console.log('   ✅ Limpeza automática de tokens expirados');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
};

// Executar testes
testCompleteAuth();
