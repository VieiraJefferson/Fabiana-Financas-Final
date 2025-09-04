require('dotenv').config();
const connectDB = require('./config/db.js');
const { User, comparePassword } = require('./models/userModel.js');
const RefreshToken = require('./models/refreshTokenModel.js');
const { 
  generateTokenPair, 
  setAuthCookies, 
  clearAuthCookies,
  rotateTokens,
  generateJTI
} = require('./utils/tokenManager.js');

const testNewAuth = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🧪 Testando novo sistema de autenticação com JTI...');
    
    // Buscar usuário admin
    const user = await User.findOne({ email: 'admin@test.com' });
    
    if (!user) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role
    });
    
    // Testar senha
    const passwordMatch = await comparePassword('admin123', user.password);
    console.log('🔐 Senha correta:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login funcionando!');
      
      // Testar geração de tokens com JTI
      console.log('\n🔄 Testando geração de tokens com JTI...');
      const { accessToken, refreshToken, jti } = generateTokenPair(user._id);
      
      console.log('✅ Access Token gerado:', accessToken.substring(0, 50) + '...');
      console.log('✅ Refresh Token gerado:', refreshToken.substring(0, 50) + '...');
      console.log('✅ JTI gerado:', jti);
      
      // Testar rotação de tokens
      console.log('\n🔄 Testando rotação de tokens...');
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, jti: newJti } = rotateTokens(user._id);
      
      console.log('✅ Novos tokens gerados:');
      console.log('   Access Token:', newAccessToken.substring(0, 50) + '...');
      console.log('   Refresh Token:', newRefreshToken.substring(0, 50) + '...');
      console.log('   Novo JTI:', newJti);
      
      // Testar modelo de refresh token
      console.log('\n🔄 Testando modelo de refresh token...');
      
      // Criar refresh token no banco
      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 14);
      
      const refreshTokenDoc = await RefreshToken.create({
        jti,
        userId: user._id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
        userAgent: 'Test Script',
        ipAddress: '127.0.0.1',
        deviceId: 'test-device'
      });
      
      console.log('✅ Refresh token criado no banco:', refreshTokenDoc._id);
      
      // Verificar se é válido
      const isValid = refreshTokenDoc.isValid();
      console.log('✅ Token é válido:', isValid);
      
      // Buscar por JTI
      const foundToken = await RefreshToken.findValidByJTI(jti);
      console.log('✅ Token encontrado por JTI:', !!foundToken);
      
      // Buscar tokens válidos do usuário
      const userTokens = await RefreshToken.findValidByUserId(user._id);
      console.log('✅ Tokens válidos do usuário:', userTokens.length);
      
      // Revogar token
      await refreshTokenDoc.revoke();
      console.log('✅ Token revogado');
      
      // Verificar se ainda é válido
      const stillValid = refreshTokenDoc.isValid();
      console.log('✅ Token ainda é válido após revogação:', stillValid);
      
      // Incrementar sessões ativas
      await user.incrementActiveSessions();
      console.log('✅ Sessões ativas incrementadas:', user.activeSessions);
      
      // Limpar todas as sessões
      await user.clearAllSessions();
      console.log('✅ Todas as sessões limpas');
      
      // Limpar tokens expirados
      const cleanedCount = await RefreshToken.cleanExpired();
      console.log('✅ Tokens expirados limpos:', cleanedCount);
      
      console.log('\n🎉 Todos os testes passaram! Sistema funcionando perfeitamente.');
      
    } else {
      console.log('❌ Senha incorreta');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
};

testNewAuth();
